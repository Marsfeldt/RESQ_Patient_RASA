# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

from typing import Any, Text, Dict, List
import sys
#
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import sqlite3
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

class ActionInformStageUser(Action):
    def name(self):
        return "action_inform_stage_user"

    def run(self, dispatcher, tracker, domain):
        userStage = tracker.get_slot("userStage")
        response_message = f"Hello, you are in stage {userStage}"
        dispatcher.utter_message(response_message)
        return [SlotSet("userStage", userStage)]
    
class TrainsitionUserToStage(Action):
    def name(self) -> Text:
        return "action_transition_user_stage"
    
    def run(self, dispatcher, tracker, domain):
        userStage = 4

        connection = sqlite3.connect("../PYTHON/DATABASE/TestDatabase.db")
        cursor = connection.cursor()

        user_id = "the_coolest_of_ids"
        cursor.execute("SELECT PromScore FROM userData WHERE UID = ?", (user_id,))
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