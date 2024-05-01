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

def readiness_to_change_questionnaire(username, stage, stage_def):
    questionnaire = [
        "Do you currently engage in regular physical activity?",
        "Do you intend to engage in regular physical activity in the next 6 months?",
        "Do you intend to engage in regular physical activity in the next 30 days?",
        "Have you been regularly physically active for the past six months?",
        f'Thank you {username}, very much for your answers. From my assessment you belong in {stage}, with the following definition: “{stage_def}”. Do you agree with this assessment, please choose “YES” or “NO”'
    ]
    return questionnaire

positive_below_natural_responses = [
    "Achknowledging that is the first step, remember good change takes time",
    "Changing habits can be difficult, try and take small steps towards change",
    "That happens sometimes, but you can always come back stronger next time",
    "Seems like you have it all under control, great job!",
    "Remember changing habits for the better is a lengthy process, you can do it!",
    "No one expects you to improve over night, one step at a time!",
    "Getting help from friends and family, can help you during your process, don't forget to reach out!",
    "Nothing wrong with having fun now and then!",
    "That sounds great, keep it up!",
    "Achknowledging the problem is half the battle, that's really couragous!",
    "There is no need for making major changes, start with small changes",
    "You aren't the only one that struggles, remember to reach out to others!"
]

positive_above_natural_responses = [
    "That's fantastic progress, keep it up!",
    "Looks like you're well on your way to positive changes, great work!",
    "You're already doing so well, keep pushing forward!",
    "It's great to see you're motivated to make positive changes!",
    "Your determination is inspiring, keep going!",
    "You're ahead of the game, keep up the good work!",
    "You're on the right track, keep moving forward!",
    "Amazing! Keep making those positive changes!",
    "That's a strong commitment to improvement, keep it going!",
    "You're showing real dedication, keep it up!",
    "Your progress is commendable, keep striving for better!"
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
        next_question = readiness_to_change_questionnaire(username="LMAO1", stage="LMAO2", stage_def="LMAO3")[current_question_index]
        next_question_type = readiness_to_change_questionnaire(username="LMAO1", stage="LMAO2", stage_def="LMAO3")[current_question_index]
        print('QuestionType:', next_question_type)
        dispatcher.utter_message(text=next_question)
        
        return [SlotSet("current_question_index", current_question_index)]

class ActionAskNextQuestion(Action):
    def name(self) -> Text:
        return "action_ask_next_question"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        current_question_index = tracker.get_slot('current_question_index')
        user_rating = tracker.latest_message["text"].lower()


        if current_question_index is not None and current_question_index < len(readiness_to_change_questionnaire(username="LMAO1", stage="LMAO2", stage_def="LMAO3")) - 1:
            # Ask the next question
            next_question_index = current_question_index + 1
            next_question = readiness_to_change_questionnaire(username="LMAO1", stage="LMAO2", stage_def="LMAO3")[next_question_index]
            next_question_type = readiness_to_change_questionnaire(username="LMAO1", stage="LMAO2", stage_def="LMAO3")[next_question_index]
            print('QuestionType:', next_question_type)

            if user_rating == "yes":
                below_or_eq_3_message = "User Answered Yes"
                #dispatcher.utter_message(text=positive_below_natural_responses[current_question_index])
                dispatcher.utter_message(text=below_or_eq_3_message)
                print(positive_below_natural_responses[current_question_index])
                print("User Answered Yes")
            elif user_rating == "no":
                #dispatcher.utter_message(text=positive_above_natural_responses[current_question_index])
                above_3_message = "User Answered No"
                dispatcher.utter_message(text=above_3_message)
            else:
                print("Yes-No Check Failed")

            dispatcher.utter_message(text=next_question)

            return [SlotSet('current_question_index', next_question_index)]
        else:
            # No more questions, end the conversation or take appropriate action
            return [SlotSet('current_question_index', None)]


class ActionProcessAnswer(Action):
    def name(self) -> Text:
        return "action_process_answer"

    def run( 
        self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict
    ) -> List[Dict[Text, Any]]:
        user_answer = tracker.latest_message["text"].lower()

        try:
            print(f"123123123 userrating {user_answer}")

            print("Rating check successful")
            current_question_index = tracker.get_slot("current_question_index")

            if user_answer == "yes" or user_answer == "no":

                if user_answer == "yes":
                    below_or_eq_3_message = "User answered Yes"
                    #dispatcher.utter_message(text=positive_below_natural_responses[current_question_index])
                    dispatcher.utter_message(text=below_or_eq_3_message)
                    print(positive_below_natural_responses[current_question_index])
                    print("User rating was below or equal to 3")
                elif user_answer == "no":
                    #dispatcher.utter_message(text=positive_above_natural_responses[current_question_index])
                    above_3_message = "RUser answered No"
                    dispatcher.utter_message(text=above_3_message)
                else:
                    print("Error Occured on Yes-No Check")

                if (
                    current_question_index is not None
                    and current_question_index < len(readiness_to_change_questionnaire(username="LMAO1", stage="LMAO2", stage_def="LMAO3")) - 1
                ):
                    next_question_index = current_question_index + 1

                    return [
                        SlotSet("current_question_index", next_question_index),
                        {"event": "user", "timestamp": None, "metadata": None,
                         "text": readiness_to_change_questionnaire(username="LMAO1", stage="LMAO2", stage_def="LMAO3")[next_question_index]}
                    ]
                else:
                    dispatcher.utter_message(
                        text="Tak for dine svar! Undersøgelsen er nu afsluttet.")
                    return [SlotSet("current_question_index", None)]
            else:
                dispatcher.utter_message(
                    text="Vælg venligst enten 'YES' eller 'NO'")
        except ValueError:
            dispatcher.utter_message(
                text="Vælg venligst enten 'YES' eller 'NO'"
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
