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

#
#
# class ActionHelloWorld(Action):
#
#     def name(self) -> Text:
#         return "action_hello_world"
#
#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#         dispatcher.utter_message(text="Hello World!")
#
#         return []

questionnaireCompleted = False

questionnaire_question_types = [
    'LikertScale 1-5',
    'LikertScale 1-5',
    'LikertScale 1-5'
]

questionnaire_questions = [
    "Hvad vil du give Pizza på en skala fra 1 (Dårlig) - 5 (God)",
    "Hvad vil du give Burger på en skala fra 1 (Dårlig) - 5 (God)",
    "Hvad vil du give Burritos på en skala fra 1 (Dårlig) - 5 (God)"
    #"Hvad vil du give Tacos på en skal fra 1 (Dårlig) - 5 (God)",
    #"Hvad vil du give Nachos på en skala fra 1 (Dårlig) - 5 (God)",
    #"Hvad vil du give Burger King på en skala fra 1 (Dårlig) - 5 (God)",
    #"Hvad vil du give McDonalds på en skala fra 1 (Dårlig) - 5 (God)",
    #"Hvad vil du give Flæskesteg på en skala fra 1 (Dårlig) - 5 (God)"
]

stages = [
    "pre-contemplation",
    "contemplation",
    "preparation",
    "action",
    "maintenance"
]

userDB = DatabaseHandler("../PYTHON/DATABASE/Users.db")

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
        dispatcher.utter_message(
            text="Velkommen til spørgeskemaet, lad os komme igang!")

        # Set the current question index in the tracker
        current_question_index = 0
        next_question = questionnaire_questions[current_question_index]
        next_question_type = questionnaire_question_types[current_question_index]
        print('QuestionType:', next_question_type)
        dispatcher.utter_message(text=next_question)

        return [SlotSet("current_question_index", current_question_index)]



class ActionAskNextQuestion(Action):
    def name(self) -> Text:
        return "action_ask_next_question"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        current_question_index = tracker.get_slot('current_question_index')

        if current_question_index is not None and current_question_index < len(questionnaire_questions) - 1:
            next_question_index = current_question_index + 1
            next_question = questionnaire_questions[next_question_index]
            next_question_type = questionnaire_question_types[next_question_index]
            print('QuestionType:', next_question_type)
            dispatcher.utter_message(text=next_question)

            return [SlotSet('current_question_index', next_question_index)]
        else:
            return [SlotSet('current_question_index', None)]


class ActionProcessAnswer(Action):
    def name(self) -> Text:
        return "action_process_answer"

    def run(
        self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict
    ) -> List[Dict[Text, Any]]:
        user_answer = tracker.latest_message["text"]

        try:
            user_rating = int(user_answer)

            if 1 <= user_rating <= 5:
                dispatcher.utter_message(
                    text=f"Din vurdering er registreret: {user_rating}")

                current_question_index = tracker.get_slot(
                    "current_question_index")

                if (
                    current_question_index is not None
                    and current_question_index < len(questionnaire_questions) - 1
                ):
                    next_question_index = current_question_index + 1

                    return [
                        SlotSet("current_question_index", next_question_index),
                        {"event": "user", "timestamp": None, "metadata": None,
                         "text": questionnaire_questions[next_question_index]}
                    ]
                else:
                    dispatcher.utter_message(
                        text="Tak for dine svar! Undersøgelsen er nu afsluttet.")
                    return [SlotSet("current_question_index", None)]
            else:
                dispatcher.utter_message(
                    text="Venligst vælg en vurdering mellem 1 og 5.")
        except ValueError:
            dispatcher.utter_message(
                text="Venligst indtast et gyldigt tal mellem 1 og 5 for din vurdering."
            )

        return [SlotSet('current_question_index', None)]


class ActionCalculateStageTransitionScore(Action):
    def name(self):
        return "action_calculate_stage_transition_score"
    
    def run(self, dispatcher, tracker, domain):
        userStage = tracker.get_slot("userStage")

        print("Calculating score...")



class ActionInformStageUser(Action):
    def name(self):
        return "action_inform_stage_user"

    def run(self, dispatcher, tracker, domain):
        # Get the user id
        user_id = tracker.sender_id

        # Check if the user exists in the database
        stage = userDB.fetch_userStage_from_uuid('Users', user_id)
        response_message = f"Hello, you are in stage {stage} , {tracker.sender_id}"
        dispatcher.utter_message(response_message)
        return [SlotSet("userStage", stage)]


class TrainsitionUserToStage(Action):
    def name(self) -> Text:
        return "action_transition_user_stage"

    def run(self, dispatcher, tracker, domain):
        userStage = 4

        connection = sqlite3.connect("../PYTHON/DATABASE/TestDatabase.db")
        cursor = connection.cursor()

        user_id = "the_coolest_of_ids"
        cursor.execute(
            "SELECT PromScore FROM userData WHERE UID = ?", (user_id,))
        result = cursor.fetchone()

        if (result[0] > 20):
            userStage = 1
            response_message = f"Hello, you are in stage {userStage}, because value > 20"
        elif (result[0] < 20):
            userStage = 2
            response_message = f"Hello, you are in stage {userStage}, because value < 20"
        else:
            userStage = 3
            response_message = f"Hello, you are in stage {userStage}, because something failed"

        dispatcher.utter_message(response_message)
        return [SlotSet("userStage", userStage)]


class AdviseHelpBasedOnStage(Action):
    def name(self) -> Text:
        return "action_advise_help_based_on_stage"

    def run(self, dispatcher, tracker, domain):
        userStage = tracker.get_slot("userStage")

        if userStage == 1:
            response_message = f"Stage 1: Eksempel for hjælp til folk i stadie 1"
        elif userStage == 2:
            response_message = f"Stage 2: Eksempel for hjælp til folk i stadie 2"
        elif userStage == 3:
            response_message = f"Stage 3: Eksempel for hjælp til folk i stadie 3"
        elif userStage == 4:
            response_message = f"Stage 4: Eksempel for hjælp til folk i stadie 4"
        elif userStage == 5:
            response_message = f"Stage 5: Eksempel for hjælp til folk i stadie 5"
        elif userStage == 6:
            response_message = f"Stage 6: Eksempel for hjælp til folk i stadie 6"
        elif userStage == 7:
            response_message = f"Stage 7: Eksempel for hjælp til folk i stadie 7"

        dispatcher.utter_message(response_message)
        return [SlotSet("userStage", userStage)]
