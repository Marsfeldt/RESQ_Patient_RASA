# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

from typing import Any, Coroutine, Text, Dict, List, Optional
import sys
sys.path.append('../')
#
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import sqlite3

from rasa_sdk.types import DomainDict
from rasa.core.channels.socketio import SocketIOInput
from DatabaseHandler import *


userDB = DatabaseHandler("../PYTHON/DATABASE/Users.db")
questionnaireDatabase1 = DatabaseHandler("../PYTHON/QUESTIONNAIRE_DATABASES/Questionnaire_Name.db")

# Generic Functions

def acquire_user_strategy(tracker: Tracker):
    strategy = userDB.fetch_variable_from_uuid('Users', 'Strategy', tracker.sender_id)
    print(f"{tracker.sender_id} is using Strategy {strategy}")
    return strategy

def acquire_user_identification_variables(tracker: Tracker):
    username, stage = userDB.fetch_user_identification_variables('Users', tracker.sender_id)
    # Now you can use username and stage as needed
    return username, int(stage)

def match_sequence(user_sequence, scoring_sequences):
    print("User sequence before matching:", user_sequence)
    for stage, sequence in scoring_sequences.items():
        print("Checking sequence for stage:", stage)
        print("Expected sequence:", sequence)
        print("User sequence:", user_sequence)
        if len(user_sequence) == len(sequence) and all(user_seq == exp_seq for user_seq, exp_seq in zip(user_sequence, sequence)):
            print("Matching sequence found for stage:", stage)
            return stage
    print("No matching sequence found.")
    return None

def determine_stage(tracker: Tracker):
    # Scoring Conditions
    scoring_sequences = {
        "Pre-Contemplation": ['no', 'no'],
        "Contemplation": ['no', 'yes', 'no'],
        "Preparation": ['no', 'yes', 'yes'],
        "Action": ['yes', 'no'],
        "Maintenance": ['yes', 'yes'],
    }

    user_score_sequence = questionnaireDatabase1.fetch_user_responses('QuestionnaireName1', tracker.sender_id)

    print("User Score Sequence:", user_score_sequence)

    # Find matching stage
    matched_stage = match_sequence(user_score_sequence, scoring_sequences)

    print("Stage:", matched_stage)

    # Define stage definitions
    stage_definitions = [
        "I do not intend to be more physically active in the foreseeable future (~6 Months)",
        "I do intend to be more physically active in the next 6 months",
        "I do intend to be more physically active already in the upcoming month",
        "I am already physically active and have been for the past 6 months",
        "I am currently in a regular routine of being physically active and intend to continue"
    ]

    # Get the definition of the matched stage
    matched_stage_definition = stage_definitions[list(scoring_sequences.keys()).index(matched_stage)] if matched_stage else None

    print("Stage Definition:", matched_stage_definition)

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
        # Get the user id
        user_id = tracker.sender_id

        # Check if the user exists in the database
        stage = userDB.fetch_userStage_from_uuid('Users', user_id)

        # Set the user's stage as a slot
        return [SlotSet("userStage", stage)]

    def shutdown(self):
        # Close the database connection when the action server is stopped
        self.conn.close()

class ActionStartQuestionnaire(Action):
    def name(self) -> Text:
        return "action_start_questionnaire"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        dispatcher.utter_message(text="Alright let's get started! When answering my questions, keep in mind that for exercise to be regular it should be done for approximately 150 minutes with moderate intensity per week, which includes walking, cycling, swimming or dancing")
        matched_stage, matched_stage_definition = determine_stage(tracker)

        username, stage = acquire_user_identification_variables(tracker)
        strategy = acquire_user_strategy(tracker)  # Assuming this function retrieves the user's strategy

        # Set the current question index in the tracker
        current_question_index = 0
        next_question = readiness_to_change_questionnaire(username=username, stage=matched_stage, stage_def=matched_stage_definition)[current_question_index]
        dispatcher.utter_message(text=next_question)
        
        return [SlotSet("current_question_index", current_question_index), SlotSet("strategy", strategy)]

class ActionAskNextQuestion(Action):
    def name(self) -> Text:
        return "action_ask_next_question"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        matched_stage, matched_stage_definition = determine_stage(tracker)
        current_question_index = tracker.get_slot('current_question_index')
        user_response = tracker.latest_message["text"].lower()
        username, stage = acquire_user_identification_variables(tracker)
        strategy = tracker.get_slot("strategy")

        if current_question_index is not None:
            if current_question_index == 0:  # First question
                if user_response == "yes":
                    next_question_index = 3  # Go to Question 4 directly
                else:
                    next_question_index = 1  # Go to Question 2
            elif current_question_index == 1:  # Second question
                if user_response == "yes":
                    next_question_index = 2  # Go to Question 3
                else:
                    next_question_index = None  # Finish questionnaire
            elif current_question_index == 2:  # Third question
                next_question_index = None  # Finish questionnaire
            elif current_question_index == 3:  # Fourth question
                next_question_index = None  # Finish questionnaire

            # Process user response based on strategy
            #if strategy == 1:  # Strategy 1
            #    if next_question_index is not None:
                    #next_question_type = readiness_to_change_questionnaire(username=username, stage=stages[stage-1], stage_def=stage_definitions[stage-1])[next_question_index]
                    #dispatcher.utter_message(text=next_question_type)
            if strategy == 2:  # Strategy 2
                response_key = f"Q{current_question_index + 1}_{user_response.upper()}_R"
                response_message = strategy_responses[response_key]
                dispatcher.utter_message(text=response_message)

            # Ask the next question if there is one
            if next_question_index is not None:
                next_question = readiness_to_change_questionnaire(username=username, stage=matched_stage, stage_def=matched_stage_definition)[next_question_index]
                dispatcher.utter_message(text=next_question)
                return [SlotSet('current_question_index', next_question_index)]
            else:
                # No more questions, end the conversation
                summary_message = readiness_to_change_questionnaire(username=username, stage=matched_stage, stage_def=matched_stage_definition)[4]
                dispatcher.utter_message(text=summary_message)
                userDB.update_tutorial_completion('Users', tracker.sender_id, 1)
                return [SlotSet('current_question_index', None)]
        else:
            return []

class ActionProcessAnswer(Action):
    def name(self) -> Text:
        return "action_process_answer"

    def run( 
        self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict
    ) -> List[Dict[Text, Any]]:
        user_answer = tracker.latest_message["text"].lower()
        username, stage = acquire_user_identification_variables(tracker)
        matched_stage, matched_stage_definition = determine_stage(tracker)
        try:
            current_question_index = tracker.get_slot("current_question_index")

            if user_answer == "yes" or user_answer == "no":

                #if user_answer == "yes":
                #    below_or_eq_3_message = "User answered Yes"
                #    #dispatcher.utter_message(text=positive_below_natural_responses[current_question_index])
                #    dispatcher.utter_message(text=below_or_eq_3_message)
                #    print("User rating was below or equal to 3")
                #elif user_answer == "no":
                #    #dispatcher.utter_message(text=positive_above_natural_responses[current_question_index])
                #    above_3_message = "RUser answered No"
                #    dispatcher.utter_message(text=above_3_message)
                #else:
                #    print("Error Occured on Yes-No Check")

                if (
                    current_question_index is not None
                    and current_question_index < len(readiness_to_change_questionnaire(username=username, stage=matched_stage, stage_def=matched_stage_definition)) - 1
                ):
                    next_question_index = current_question_index + 1

                    return [
                        SlotSet("current_question_index", next_question_index),
                        {"event": "user", "timestamp": None, "metadata": None,
                         "text": readiness_to_change_questionnaire(username=username, stage=matched_stage, stage_def=matched_stage_definition)[next_question_index]}
                    ]
                else:
                    dispatcher.utter_message(
                        text="Thank you very much for your time. I will begin preparations to create your customized exercise plan for you. If you return tomorrow, I will have the plan ready for you. Have a great day!")
                    return [SlotSet("current_question_index", None)]
            else:
                dispatcher.utter_message(
                    text="Please respond with either 'YES' or 'NO'")
        except ValueError:
            dispatcher.utter_message(
                text="Please respond with either 'YES' or 'NO'"
            )

        return [SlotSet('current_question_index', None)]


class ActionDefaultFallback(Action):
    def name(self) -> Text:
        return "action_default_fallback"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        dispatcher.utter_message("I'm sorry, I didn't quite understand that. Can you please try to rephrase the question?")
        return []