from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import yaml
import json
from text_to_num import text2num
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Helper function to load the questionnaire from a YAML file
def load_questionnaire(file_path: Text) -> Dict:
    with open(file_path, 'r') as file:
        questionnaire = yaml.safe_load(file)
    return questionnaire

class ActionLoadQuestionnaire(Action):
    def name(self) -> Text:
        return "action_load_questionnaire"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        current_question_id = tracker.get_slot("current_question")
        if current_question_id and current_question_id != "end":
            dispatcher.utter_message(text="You're already in the middle of a questionnaire. Please continue.")
            return []

        # Load the questionnaire from the YAML file
        #file_path = "data/questionnaires/onboarding_questionnaire.yml"
        #file_path = "data/questionnaires/modified_rankin_scale.yml"
        file_path = "data/questionnaires/nadl.yml"
        #file_path = "data/questionnaires/sf-sis.yml"
        #file_path = "data/questionnaires/new_structure.yml"
        #file_path = "data/questionnaires/phq-9.yml"
        #file_path = "data/questionnaires/test.yml"
        try:
            questionnaire = load_questionnaire(file_path)
        except FileNotFoundError:
            logger.error(f"Sorry, I couldn't find the questionnaire '{file_path}'.")
            return []

        # Load external multiple-choice options
        options_file_path = "data/questionnaires/multiple_choice_options.yml"  # Path to external options file
        try:
            options_data = load_questionnaire(options_file_path)
        except FileNotFoundError:
            logger.error(f"Sorry, I couldn't find the options file '{options_file_path}'.")
            return []

        # Process questions and replace options_type with options from options file
        for question in questionnaire['questions']:
            if question.get('type') == "multiple_choice":
                if 'options_type' in question:
                    options_type = question['options_type']
                    if options_type in options_data:
                        question['options'] = options_data[options_type]
                    else:
                        logger.error(f"Options type '{options_type}' not found in '{options_file_path}'.")
                        return []

        # Reset the score for the questionnaire
        updated_scores = self._reset_questionnaire_score(tracker, questionnaire['name'])

        first_question = questionnaire['questions'][0]['id']
        first_question_text = questionnaire['questions'][0]['question_text']

        logger.info(f"Starting the {questionnaire['name']}.")
        dispatcher.utter_message(text=first_question_text)

        return [SlotSet("current_questionnaire", questionnaire), SlotSet("current_question", first_question), SlotSet("questionnaire_scores", updated_scores)]

    def _reset_questionnaire_score(self, tracker, questionnaire_name):
        # Reset the total score for the current questionnaire
        current_scores = tracker.get_slot('questionnaire_scores') or []
        updated_scores = [item for item in current_scores if item['name'] != questionnaire_name]
        updated_scores.append({"name": questionnaire_name, "score": 0})
        return updated_scores


class ActionAskNextQuestion(Action):
    def name(self) -> Text:
        return "action_ask_next_question"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        questionnaire = tracker.get_slot("current_questionnaire")
        current_question_id = tracker.get_slot("current_question")
        user_intent = tracker.latest_message['intent']['name']
        user_response = tracker.latest_message['text']  # Capture user response as text

        user_response = self._normalize_response(user_response, user_intent)

        if not questionnaire or not current_question_id:
            logger.error("Error: No current questionnaire or question found.")
            return []

        current_question = next((q for q in questionnaire['questions'] if q['id'] == current_question_id), None)
        if not current_question:
            logger.error(f"Error: Question '{current_question_id}' not found.")
            return []

        # Handle scoring for multiple_choice type
        if current_question['type'] == "multiple_choice":
            score = self._get_score_from_multiple_choice(current_question, user_intent)
        # Handle scoring for intent-based (yes_no) questions
        elif current_question['type'] == "yes_no":
            score = self._get_score_from_intent(current_question, user_intent)
        else:
            score = 0  # Default case if no score is applicable

        # Update the total score for the active questionnaire
        updated_scores = self._update_total_score(tracker, questionnaire['name'], score)

        # Dispatch the current score for this question
        #dispatcher.utter_message(text=f"Score for this question: {score}.")
        logger.info(f"Score for this question: '{score}'")
        logger.info(f"Updated total score for {questionnaire['name']}: {self._get_current_total_score(updated_scores, questionnaire['name'])}.")

        # Store the updated scores in the slot
        events = [SlotSet("questionnaire_scores", updated_scores)]

        # Proceed to the next question or finish questionnaire
        next_question_id = self._get_next_question_id(current_question, user_intent)
        if next_question_id == "end":
            # Ensure final score is displayed correctly before ending
            events += self._finalize_score(dispatcher, tracker, questionnaire['name'], updated_scores)
            return events
        else:
            next_question_events = self._proceed_to_next_question(dispatcher, tracker, current_question_id, next_question_id)
            return events + next_question_events

    def _normalize_response(self, response: Text, intent: Text) -> Any:
        # Check if the intent is 'provide_number' before converting text to number
        if intent == "provide_number":
            try:
                # Convert word-form numbers to integer
                converted_number = text2num(response, lang='en')
                logger.info(f"Converted '{response}' to {converted_number}")  # Debug message to show conversion
                return converted_number
            except ValueError:
                try:
                    return int(response)
                except ValueError:
                    return response  # Return original response if not a number
        return response  # Return original response if intent is not 'provide_number'

    def _get_score_from_multiple_choice(self, question, user_intent):
        # Look up the score based on user's response text
        for option in question.get('options', []):
            logger.info(f"option: {option}")
            if option['response'] == user_intent:
                logger.info(option['score'])
                return option['score']
        return 0

    def _get_score_from_intent(self, question, user_intent):
        # Look up the score based on the user's intent (e.g., affirm/deny for yes/no)
        return question.get('scores', {}).get(user_intent, 0)

    def _update_total_score(self, tracker, questionnaire_name, score):
        # Update the total score for the current questionnaire
        current_scores = tracker.get_slot('questionnaire_scores') or []
        current_total = next((item['score'] for item in current_scores if item['name'] == questionnaire_name), 0)

        # Increment the total score
        updated_total = current_total + score
        updated_scores = [item for item in current_scores if item['name'] != questionnaire_name]
        updated_scores.append({"name": questionnaire_name, "score": updated_total})

        return updated_scores  # Return the updated scores list

    def _get_current_total_score(self, scores, questionnaire_name):
        # Retrieve the current total score from the scores list
        return next((item['score'] for item in scores if item['name'] == questionnaire_name), 0)

    def _get_next_question_id(self, current_question, user_intent):
        # For multiple_choice questions, determine next question based on user intent matching one of the option intents
        if current_question.get('type') == "multiple_choice":
            # Check if user's intent matches any of the options' intents
            options = current_question.get('options', [])
            valid_intents = [option['response'] for option in options]

            if user_intent in valid_intents:
                return current_question['next'].get('valid_response')
            else:
                return current_question['next'].get('invalid_response')

        # For other types, use the existing logic based on 'next' mappings
        if isinstance(current_question['next'], dict):
            return current_question['next'].get(user_intent)
        return current_question['next']

    def _proceed_to_next_question(self, dispatcher, tracker, current_question_id, next_question_id):
        responses = tracker.get_slot("responses")
        responses_dict = json.loads(responses) if responses else {}
        responses_dict[current_question_id] = tracker.latest_message['text']
        events = [SlotSet("responses", json.dumps(responses_dict)), SlotSet("attempts", 0)]  # Reset attempts

        questionnaire = tracker.get_slot("current_questionnaire")
        next_question = next((q for q in questionnaire['questions'] if q['id'] == next_question_id), None)
        if next_question:
            dispatcher.utter_message(text=next_question['question_text'])
            events.append(SlotSet("current_question", next_question_id))
        else:
            logger.error(f"Error: Next question '{next_question_id}' not found.")

        return events

    def _finalize_score(self, dispatcher, tracker, questionnaire_name, updated_scores):
        # Final score at the end of the questionnaire
        final_score = self._get_current_total_score(updated_scores, questionnaire_name)

        dispatcher.utter_message(text=f"Thank you for completing the questionnaire.")
        logger.info(f"Your total score for {questionnaire_name} is {final_score}.")
        logger.info(f"All scores: {updated_scores}")

        return [SlotSet("current_question", "end")]

class ActionStopQuestionnaire(Action):
    def name(self) -> Text:
        return "action_stop_questionnaire"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        dispatcher.utter_message(text="You've chosen to stop the questionnaire. Thank you for your time.")
        return [SlotSet("current_question", "end")]
