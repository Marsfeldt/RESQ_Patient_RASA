from typing import Any, Text, Dict, List
import sys
import logging

import sys
sys.path.append('C:/Users/jorda/Documents/Cesi/A4/MI_WORK/Project_RESQ_Patient_RASA/Project')

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
from DatabaseHandler import DatabaseHandler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

userDB = DatabaseHandler("../PYTHON/DATABASE/Users.db")
questionnaireDatabase1 = DatabaseHandler("../PYTHON/QUESTIONNAIRE_DATABASES/Questionnaire_Name.db")



def acquire_user_strategy(tracker: Tracker):
    strategy = userDB.fetch_variable_from_uuid('Users', 'Strategy', tracker.sender_id)
    return strategy

def acquire_user_identification_variables(tracker: Tracker):
    username, stage = userDB.fetch_user_identification_variables('Users', tracker.sender_id)
    return username, int(stage)


def match_sequence(user_sequence, scoring_sequences):
    try:
        for stage, sequence in scoring_sequences.items():
            if len(user_sequence) == len(sequence) and all(
                    user_seq == exp_seq for user_seq, exp_seq in zip(user_sequence, sequence)):
                return stage
        return None
    except Exception as e:
        logger.error(f"Error matching sequence: {e}")
        return None


def determine_stage(tracker: Tracker):
    # Conditions de scoring
    scoring_sequences = {
        "Pre-Contemplation": ['no', 'no'],
        "Contemplation": ['no', 'yes', 'no'],
        "Preparation": ['no', 'yes', 'yes'],
        "Action": ['yes', 'no'],
        "Maintenance": ['yes', 'yes'],
    }

    stage_mapping = {
        "Pre-Contemplation": 1,
        "Contemplation": 2,
        "Preparation": 3,
        "Action": 4,
        "Maintenance": 5
    }

    user_score_sequence = questionnaireDatabase1.fetch_user_responses('QuestionnaireName1', tracker.sender_id)

    matched_stage = match_sequence(user_score_sequence, scoring_sequences)

    stage_definitions = [
        "I do not intend to be more physically active in the foreseeable future, around 6 Months",
        "I do intend to be more physically active in the next 6 months",
        "I do intend to be more physically active already in the upcoming month",
        "I am already physically active and have been for the past 6 months",
        "I am currently in a regular routine of being physically active and intend to continue"
    ]

    matched_stage_definition = stage_definitions[
        list(scoring_sequences.keys()).index(matched_stage)] if matched_stage else None

    if matched_stage:
        new_stage = stage_mapping[matched_stage]
        userDB.transition_user_stage('Users', tracker.sender_id, new_stage)

    return matched_stage, matched_stage_definition


def readiness_to_change_questionnaire(username, stage, stage_def):
    questionnaire = [
        "Do you currently engage in regular physical activity?",
        "Do you intend to engage in regular physical activity in the next 6 months?",
        "Do you intend to engage in regular physical activity in the next 30 days?",
        "Have you been regularly physically active for the past six months?",
        f'Thank you {username}, very much for your answers. From my assessment you belong in {stage}, with the following definition: “{stage_def}”. Do you agree with this assessment?'
    ]
    return questionnaire


def readiness_to_change_questionnaire_strat3(username, stage, stage_def):
    questionnaire = [
        "Do you currently engage in regular physical activity?",
        "Do you intend to engage in regular physical activity in the next 6 months?",
        "Do you intend to engage in regular physical activity in the next 30 days?",
        "Have you been regularly physically active for the past six months?",
        "Have you ever done cardio?",
        "Have you ever tried strength training?",
        "Have you participated in any group fitness classes before?",
        "Do you like outdoor activites like biking?",
        f'Thank you {username}, very much for your answers. From my assessment you belong in {stage}, with the following definition: “{stage_def}”. Do you agree with this assessment?'
    ]
    return questionnaire


strategy_responses = {
    "Q1_YES_R": "That's wonderful to hear! Taking care of your physical health is important, and it's great to know you're making it a priority.",
    "Q1_NO_R": "That's okay! It's never too late to start incorporating physical activity into your routine. Whenever you're ready, I'm here to offer support and guidance.",
    "Q2_YES_R": "That's fantastic! Setting goals for your future health shows real dedication. I'm here to cheer you on through every step of the way.",
    "Q2_NO_R": "No problem at all! Sometimes it takes time to plan out our goals. Whenever you're ready to take that step, I'm here to assist you in any way I can.",
    "Q3_YES_R": "That's fantastic! Making short-term goals is a great way to kickstart your journey to a healthier lifestyle. I'm here to support you as you work towards achieving them.",
    "Q3_NO_R": "No worries! It's important to move at a pace that feels comfortable for you. Whenever you're ready to start incorporating physical activity into your routine, I'm here to help you get started.",
    "Q4_YES_R": "That's amazing dedication! Consistency is key when it comes to maintaining a healthy lifestyle, and it sounds like you've been doing a fantastic job.",
    "Q4_NO_R": "That's okay! Sometimes life gets busy, and our priorities shift. Whenever you're ready to get back into a regular routine, I'm here to support you every step of the way."
}

strategy_3_responses = {
    "Q1_R_S3": "Have you ever done cardio?",
    "Q2_R_S3": "Have you ever tried strength training?",
    "Q3_R_S3": "Have you participated in any group fitness classes before?",
    "Q4_R_S3": "Do you like outdoor activites like biking?",
}

stages = [
    "pre-contemplation",
    "contemplation",
    "preparation",
    "action",
    "maintenance"
]



class ActionInitializeUserStage(Action):
    def name(self):
        return "action_initialize_user_stage"

    def run(self, dispatcher, tracker, domain):
        try:
            user_id = tracker.sender_id
            stage = userDB.fetch_userStage_from_uuid('Users', user_id)
            return [SlotSet("userStage", stage)]
        except Exception as e:
            logger.error(f"Error initializing user stage: {e}")
            return []

    def shutdown(self):
        try:
            self.conn.close()
        except Exception as e:
            logger.error(f"Error during shutdown: {e}")


class ActionStartQuestionnaire(Action):
    def name(self) -> Text:
        return "action_start_questionnaire"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        try:
            dispatcher.utter_message(
                text="Alright let's get started! When answering my questions, keep in mind that for exercise to be regular it should be done for approximately 150 minutes with moderate intensity per week, which includes walking, cycling, swimming or dancing")
            matched_stage, matched_stage_definition = determine_stage(tracker)
            username, stage = acquire_user_identification_variables(tracker)
            strategy = acquire_user_strategy(tracker)

            current_question_index = 0
            next_question = readiness_to_change_questionnaire(username=username, stage=matched_stage,
                                                              stage_def=matched_stage_definition)[
                current_question_index]
            dispatcher.utter_message(text=next_question)

            return [SlotSet("current_question_index", current_question_index), SlotSet("strategy", strategy)]
        except Exception as e:
            logger.error(f"Error starting questionnaire: {e}")
            return []


class ActionAskNextQuestion(Action):
    def name(self) -> Text:
        return "action_ask_next_question"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        try:
            matched_stage, matched_stage_definition = determine_stage(tracker)
            current_question_index = tracker.get_slot('current_question_index')
            user_response = tracker.latest_message["text"].lower()
            username, stage = acquire_user_identification_variables(tracker)
            strategy = tracker.get_slot("strategy")

            if strategy != 3:
                next_question_index = self.get_next_question_index(current_question_index, user_response)
                response_message = self.get_response_message(current_question_index, user_response, strategy)
                if response_message:
                    dispatcher.utter_message(text=response_message)

                if next_question_index is not None:
                    next_question = readiness_to_change_questionnaire(username=username, stage=matched_stage,
                                                                      stage_def=matched_stage_definition)[
                        next_question_index]
                    dispatcher.utter_message(text=next_question)
                    return [SlotSet('current_question_index', next_question_index)]
                else:
                    summary_message = readiness_to_change_questionnaire(username=username, stage=matched_stage,
                                                                        stage_def=matched_stage_definition)[4]
                    dispatcher.utter_message(text=summary_message)
                    userDB.update_tutorial_completion('Users', tracker.sender_id, 1)
                    return [SlotSet('current_question_index', None)]
            else:
                next_question_index = self.get_next_question_index(current_question_index, user_response, strategy)
                if next_question_index is not None:
                    next_question = readiness_to_change_questionnaire_strat3(username=username, stage=matched_stage,
                                                                             stage_def=matched_stage_definition)[
                        next_question_index]
                    dispatcher.utter_message(text=next_question)
                    return [SlotSet('current_question_index', next_question_index)]
                else:
                    summary_message = readiness_to_change_questionnaire(username=username, stage=matched_stage,
                                                                        stage_def=matched_stage_definition)[4]
                    dispatcher.utter_message(text=summary_message)
                    userDB.update_tutorial_completion('Users', tracker.sender_id, 1)
                    return [SlotSet('current_question_index', None)]
        except Exception as e:
            logger.error(f"Error asking next question: {e}")
            return []

    def get_next_question_index(self, current_question_index, user_response, strategy=None):
        try:
            if current_question_index == 0:
                return 3 if user_response == "yes" else 1
            elif current_question_index == 1:
                return 2 if user_response == "yes" else (None if strategy != 3 else 4)
            elif current_question_index == 2:
                return None if strategy != 3 else 4
            elif current_question_index == 3:
                return None if strategy != 3 else 4
            elif current_question_index in [4, 5, 6, 7]:
                return current_question_index + 1
            else:
                return None
        except Exception as e:
            logger.error(f"Error determining next question index: {e}")
            return None

    def get_response_message(self, current_question_index, user_response, strategy):
        try:
            if strategy == 2:
                response_key = f"Q{current_question_index + 1}_{user_response.upper()}_R"
                return strategy_responses.get(response_key, "")
            return ""
        except Exception as e:
            logger.error(f"Error generating response message: {e}")
            return ""


class ActionProcessAnswer(Action):
    def name(self) -> Text:
        return "action_process_answer"

    def run(
            self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict
    ) -> List[Dict[Text, Any]]:
        try:
            user_answer = tracker.latest_message["text"].lower()
            username, stage = acquire_user_identification_variables(tracker)
            matched_stage, matched_stage_definition = determine_stage(tracker)
            strategy = tracker.get_slot("strategy")
            current_question_index = tracker.get_slot("current_question_index")

            if user_answer in ["yes", "no"]:
                if current_question_index is not None and current_question_index < len(
                        readiness_to_change_questionnaire(username=username, stage=matched_stage,
                                                          stage_def=matched_stage_definition)) - 1 and strategy != 3:
                    next_question_index = current_question_index + 1
                    return [
                        SlotSet("current_question_index", next_question_index),
                        {"event": "user", "timestamp": None, "metadata": None,
                         "text": readiness_to_change_questionnaire(username=username, stage=matched_stage,
                                                                   stage_def=matched_stage_definition)[
                             next_question_index]}
                    ]
                elif current_question_index is not None and current_question_index < len(
                        readiness_to_change_questionnaire_strat3(username=username, stage=matched_stage,
                                                                 stage_def=matched_stage_definition)) - 1 and strategy == 3:
                    next_question_index = current_question_index + 1
                    return [
                        SlotSet("current_question_index", next_question_index),
                        {"event": "user", "timestamp": None, "metadata": None,
                         "text": readiness_to_change_questionnaire_strat3(username=username, stage=matched_stage,
                                                                          stage_def=matched_stage_definition)[
                             next_question_index]}
                    ]
                else:
                    dispatcher.utter_message(
                        text="Thank you very much for your time. I will begin preparations to create your customized exercise plan for you. If you return tomorrow, I will have the plan ready for you. If you would like a reminder for when the plan is ready you can provide your phone number.")
                    return [SlotSet("current_question_index", None)]
            else:
                dispatcher.utter_message(
                    text="Please respond with either 'YES' or 'NO'")
        except Exception as e:
            logger.error(f"Error processing answer: {e}")

        return [SlotSet('current_question_index', None)]


class ActionDefaultFallback(Action):
    def name(self) -> Text:
        return "action_default_fallback"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        dispatcher.utter_message(
            "I'm sorry, I didn't quite understand that. Can you please try to rephrase the question?")
        return []
