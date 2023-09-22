# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

from typing import Any, Text, Dict, List
#
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
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

class ActionSetUserStageToOne(Action):
    def name(self):
        return "action_change_user_stage_to_1"

    def run(self, dispatcher, tracker, domain):
        userStage = 1
        response_message = f"Hello, you are in stage {userStage}"
        dispatcher.utter_message(response_message)
        return [SlotSet("userStage", userStage)]
    
class ActionSetUserStageToTwo(Action):
    def name(self):
        return "action_change_user_stage_to_2"

    def run(self, dispatcher, tracker, domain):
        userStage = 2
        response_message = f"Hello, you are in stage {userStage}"
        dispatcher.utter_message(response_message)
        return [SlotSet("userStage", userStage)]
    
class ActionSetUserStageToThree(Action):
    def name(self):
        return "action_change_user_stage_to_3"

    def run(self, dispatcher, tracker, domain):
        userStage = 3
        response_message = f"Hello, you are in stage {userStage}"
        dispatcher.utter_message(response_message)
        return [SlotSet("userStage", userStage)]
    
class ActionSetUserStageToFour(Action):
    def name(self):
        return "action_change_user_stage_to_4"

    def run(self, dispatcher, tracker, domain):
        userStage = 4
        response_message = f"Hello, you are in stage {userStage}"
        dispatcher.utter_message(response_message)
        return [SlotSet("userStage", userStage)]
    
class ActionSetUserStageToFive(Action):
    def name(self):
        return "action_change_user_stage_to_5"

    def run(self, dispatcher, tracker, domain):
        userStage = 5
        response_message = f"Hello, you are in stage {userStage}"
        dispatcher.utter_message(response_message)
        return [SlotSet("userStage", userStage)]