# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

from typing import Any, Text, Dict, List
import threading
import time
import re

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
import pandas as pd

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
#DF[Rows:  questions, Columns: context[1-5], Reflective Questions[6], EXAMPLE[7]
#print(df.at[49, 7])
df = pd.read_csv("manuscript.csv", header=None)
df.drop(0, axis=1, inplace=True)
df.drop(0, axis=0, inplace=True)


class ConditionController:
    # 1 == reflective question else == example
    conditionAB = 1 #AB
    conditionBA = 2 #BA

    startCondition = conditionAB
    endCondition = conditionBA

answers = []

answer_svær = "\n" + "1: Kunne slet ikke" + "\n" + "2: Meget besvær" + "\n" + "3: En del besvær" + "\n" +"4: Lidt besvær" + "\n" + "5: Intet besvær"

answer_enig = "\n" + "1: Helt enig" + "\n" + "2: Delvist enig" + "\n" + "3: Hverken enig eller uenig" + "\n" + "4: Delvist uenig" + "\n" + "5: Helt uenig"

questions = ["Har De haft besvær med at tilberede et måltid?",
             "Har De haft besvær med at spise?",
             "Har De haft besvær med at tage tøj på?",
             "Har De haft besvær med at tage bad?",
             "Har De haft besvær med at gå på toilettet?",
             "Har De haft besvær med at se fjernsyn tydeligt nok?",
             "Har De haft besvær med at række ud efter ting på grund af dårligt syn?",
             "Har De haft besvær med at se ting til den ene side?",
             "Har De haft besvær med at tale?",
             "Har De haft besvær med at tale klart og tydeligt i telefon?",
             "Har andre mennesker haft besvær med at forstå, hvad De sagde?",
             "Har De haft besvær med at finde de ord, De gerne ville sige?",
             "Har De været nødt til at gentage Dem selv for at andre kunne forstå, hvad De sagde?",
             "Har De haft besvær med at gå?",
             "Har De haft besvær med at holde balancen, når De lænede Dem frem eller rakte ud efter noget?",
             "Har De haft besvær med at gå op ad trapper?",
             "Har De haft besvær, fordi De var nødt til at holde pause, mens De gik eller kørte i kørestol?",
             "Har De haft besvær med at stå oprejst?",
             "Har De haft besvær med at komme op fra en stol?",
             "Har De haft besvær med at klare de daglige gøremål i hjemmet?",
             "Har De haft besvær med at gøre det færdigt, som De var begyndt på?",
             "Har De haft besvær med at udføre De opgaver, De plejer?",
             "Har De haft besvær med at skrive i hånden eller på maskine?",
             "Har De haft besvær med at tage strømper på?",
             "Har De haft besvær med at knappe knapper?",
             "Har De haft besvær med at åbne en mælkekarton?",
             "Har De haft besvær med at åbne glas med skruelåg?",
             "Jeg har haft svært ved at koncentrere mig.",
             "Jeg har haft svært ved at huske ting.",
             "Jeg har været nødt til at skrive ting ned for at huske dem.",
             "Jeg har været irritabel.",
             "Jeg har været utålmodig over for andre.",
             "Min personlighed har ændret sig.",
             "Jeg har følt mig modløs med hensyn til fremtiden",
             "Jeg har været uinteresseret i andre mennesker eller aktiviteter.",
             "Jeg har deltaget mindre i fornøjelser med min familie",
             "Jeg har følt, at jeg var en byrde for min familie.",
             "Min fysiske tilstand har påvirket mit familieliv.",
             "Jeg er gået mindre i byen end jeg gerne ville.",
             "Jeg har beskæftiget mig med mine fritidsinteresser i kortere perioder, end jeg gerne ville.",
             "Jeg har været sammen med færre af mine venner end jeg gerne ville.",
             "Jeg har dyrket mindre sex end jeg gerne ville",
             "Min fysiske tilstand har påvirket mit sociale liv",
             "Jeg har følt mig isoleret fra andre mennesker.",
             "Min selvtillid har været lille",
             "Jeg har været uinteresseret i mad",
             "Jeg har følt mig træt det meste af tiden.",
             "Jeg har følt mig træt det meste af tiden.",
             "Jeg har været for træt til at gøre det, jeg gerne ville."]



SSQOLAnswerOptionsSvær = [
    "Kunne slet ikke",
    "Meget besvær",
    "En del besvær",
    "Lidt besvær",
    "Intet besvær"
]

SSQOLAnswerOptionsEnig = [
    "Helt enig",
    "Delvist enig",
    "Hverken enig eller uenig",
    "Delvist uenig",
    "Helt uenig"
]


class ValidationOfAnswer(Action):
    currentQuestionNumber = 1
    manipulationCondition = ConditionController.startCondition
    def name(self) -> Text:
        return "ValidationOfAnswer"

    def answerToInt(self, expression, type):
        cases = {}
        if type == "besvær":
            cases = {
                "Kunne slet ikke": 1,
                "Meget besvær": 2,
                "En del besvær": 3,
                "Lidt besvær": 4,
                "Intet besvær": 5 
                # key : value
                }
        elif type == "enig":
            cases = {
                "Helt enig": 1,
                "Delvist enig": 2,
                "Hverken enig eller uenig": 3,
                "Delvist uenig": 4,
                "Helt uenig": 5}
        for key, value in cases.items():
            if re.match(key, expression):
                return value
        return "Invalid case"

    def giveHelpPer5thQuestion(self, q_number, setCondition):
        if ((q_number + 1) % 5 == 0 or q_number == 23 or q_number == 48) and q_number != 24 and q_number != 49:
            help_type = setCondition
            if help_type is 1:  # reflective question
                return "Her er noget hjælp til det næste spørgsmål: " + df.at[(q_number+1), 6]
            else:  # example
                return "Her er noget hjælp til det næste spørgsmål: " + df.at[(q_number + 1), 7]
        else:
            return ""

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        q_answer = next(tracker.get_latest_entity_values('Q_answer'), None)
        q_number = next(tracker.get_latest_entity_values('question_num'), None)
        ValidationOfAnswer.currentQuestionNumber = int(q_number)  # what question the user is answering currently
        entityQNumber = int(q_number) # this one is used to get the correct question from the dataframe that starts at 1 instead of 0
        q_number = int(q_number) - 1 # used to call the array that starts at 0 instead of 1
        answers.append(q_answer)
        if entityQNumber > 24: self.manipulationCondition = ConditionController.endCondition
        # print(df.at[49, 7])
        if q_number < 26:  # svær
            answerCaseBesvær = self.answerToInt(q_answer, "besvær")
            dispatcher.utter_message(text="Du har svaret at du har: " + q_answer + ". " + "\n" + df.at[entityQNumber, answerCaseBesvær])
        else: #enig
            answerCaseEnig = self.answerToInt(q_answer, "enig")
            dispatcher.utter_message(text="Du har svaret at du er: " + q_answer + ". " + "\n" + df.at[entityQNumber, answerCaseEnig])
        addManipulation = self.giveHelpPer5thQuestion(entityQNumber, self.manipulationCondition)
        if addManipulation != "":
            dispatcher.utter_message(text=addManipulation)

        if entityQNumber > 48:
            dispatcher.utter_message(text="Tillykke du har gennemført spørgeskemaet. Tak for din time!" + "\n" + "Du kan nu se dine svar ved at skrive på 'Se alle svar'")

        return []

class AskForNewAnswer(Action):
    questionNumberToBeChanged = 0

    def name(self) -> Text:
        return "AskForNewAnswer"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        if (len(answers) == 0):
            dispatcher.utter_message(text="Du har ikke svaret på nogle spørgsmål endnu.")
            return []

        question_number = next(tracker.get_latest_entity_values('get_number'), None)
        question_number_index = int(question_number) - 1
        dispatcher.utter_message(text="Mener du spørgsmål: " + questions[question_number_index])
        dispatcher.utter_message(text="Dit nuværende svar er: " + answers[question_number_index])
        AskForNewAnswer.questionNumberToBeChanged = question_number_index
        # print("questionNumberToBeChanged " + str(AskForNewAnswer.questionNumberToBeChanged))

        if int(question_number) > 26:
            dispatcher.utter_message(
                text="Hvad vil du gerne ændre dit svar til? Skriv venligst et nummer imellem 1 og 5: " + answer_enig)
        else:
            dispatcher.utter_message(
                text="Hvad vil du gerne ændre dit svar til? Skriv venligst et nummer imellem 1 og 5: " + answer_svær)
        # print("AskForNewAnswer: " + question_number)
        return []


class ChangeAnswer(Action):

    def name(self) -> Text:
        return "ChangeAnswer"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        if (len(answers) == 0):
            dispatcher.utter_message(text="Du har ikke svaret på nogle spørgsmål endnu.")
            return []

        new_answer = next(tracker.get_latest_entity_values('get_number'), None)
        index = int(new_answer) - 1
        if index < 0 or index > 4:
            dispatcher.utter_message(text="Du skal skrive et nummer imellem 1 og 5")
            return []
        saved_answer = ''

        print(answers)
        if AskForNewAnswer.questionNumberToBeChanged > 26:  # enig
            answers[AskForNewAnswer.questionNumberToBeChanged] = SSQOLAnswerOptionsEnig[index]
            saved_answer = SSQOLAnswerOptionsEnig[index]

        else:  # svær
            answers[AskForNewAnswer.questionNumberToBeChanged] = SSQOLAnswerOptionsSvær[index]
            saved_answer = SSQOLAnswerOptionsSvær[index]

        dispatcher.utter_message(text="Dit svar er ændret til: " + saved_answer)

        # print("new_answer: " + new_answer)
        # print("question_number: " + question_number)
        # print("questionNumberToBeChanged: " + int(questionNumberToBeChanged))
        print("Updated answers: " + str(answers))

        return []


class GiveHelp(Action):

    def name(self) -> Text:
        return "GiveHelp"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        help_type = ConditionController.startCondition
        current = ValidationOfAnswer.currentQuestionNumber
        if current > 24: help_type = ConditionController.endCondition

        if help_type is 1:  # reflective question
            dispatcher.utter_message(text="Her er noget hjælp: " + df.at[current, 6])
        else:  # example
            dispatcher.utter_message(text="Her er noget hjælp: " + df.at[current, 7])

        return []

class AnswerOverview(Action):

    def name(self) -> Text:
         return "AnswerOverview"

    def concat_lists(self, list1, list2):
        k = ""
        for index in range(len(list2)):
            s = "".join("\n" + str(index + 1) + " - " + list1[index] + "\n" + "Dit svar: " + list2[index] + "." + "\n")
            k += s
        return k

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        if (len(answers) == 0):
            dispatcher.utter_message(text="Du har ikke svaret på nogle spørgsmål endnu.")
            return []

        overview = self.concat_lists(questions, answers)
        dispatcher.utter_message(text="Her er alle dine svar: " + overview)

        return []

class ListOfFunctions(Action):

    def name(self) -> Text:
        return "ListOfFunctions"

    def run(self, dispatcher: CollectingDispatcher,
             tracker: Tracker,
             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        #change answer, help, answer overview
        dispatcher.utter_message(text="Jeg kan hjælpe dig med følgende: " + "\n" + "- Ændre et svar." + "\n" + "- Få hjælp til et spørgsmål." + "\n" + "- Se alle dine svar.""\n" + "- Se all RASA funktioner.")

        return []