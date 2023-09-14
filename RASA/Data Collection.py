from flask import Flask, request, json
import sqlite3
import datetime
import requests
from pprint import pprint
import re
app = Flask(__name__)

USER_INDEX = 99

DATABASE_NAME = 'rasaDatabase.db'
INTERACTIONLOG_DATABASE_NAME = "interactionsDatabase.db"

SSQOLAnswerOptions1 = [
    "Kunne slet ikke",
    "Meget besvær",
    "En del besvær",
    "Lidt besvær",
    "Intet besvær"
]

SSQOLAnswerOptions2 = [
    "Helt enig",
    "Delvist enig",
    "Hverken enig eller uenig",
    "Delvist uenig",
    "Helt uenig"
]

def get_text_or_image(el):
    try:
        return el["text"]
    except:
        try:
            el["image"]
        except:
            return ""
    # This should never happen, but we gotta plan for the worst
    return ""

def is_an_answer(message):
    pattern = r'Q[0-9]+(\s\w+)'
    return not not re.search(pattern, message)

def get_question_answer(message):
    question, answer = message.split(" ", 1)

    scale1 = SSQOLAnswerOptions1.index(answer)
    if scale1 is not None:
        return question, scale1 + 1

    scale2 = SSQOLAnswerOptions2.index(answer)
    if scale2 is not None:
        return question, scale2 + 1

    return question, 0


@app.route("/dataLogging", methods=['POST'])
def dataLogging():
    interaction = request.get_json()["interactionType"]
    interactionOutput = request.get_json()["interactionOutput"]
    dataResponse = json.dumps(interaction)
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    db = sqlite3.connect(INTERACTIONLOG_DATABASE_NAME)
    c = db.cursor()
    c.execute("INSERT INTO interactionLogs (interactionType, interactionOutput ,timestamp) VALUES (?, ?, ?)", (dataResponse, interactionOutput, timestamp))
    db.commit()
    db.close()
    return dataResponse

@app.route('/api', methods=['POST'])
def api():
    # get the message data from the request
    message_data = request.get_json()['message']
    response = RASAthunction(message_data)

    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    log_message = f'Request received: {message_data}, Response: {response}'
    #print(log_message)

    conn = sqlite3.connect(DATABASE_NAME)
    c = conn.cursor()
    if is_an_answer(message_data):
        question, answer = get_question_answer(message_data)
        print(question, answer)
        c.execute("INSERT INTO logs (user_id ,timestamp, message, question, answer) VALUES (?, ?, ?, ?, ?)", (USER_INDEX, timestamp, message_data, question, answer))
    else:
        c.execute("INSERT INTO logs (user_id ,timestamp, message) VALUES (?, ?, ?)", (USER_INDEX, timestamp, message_data))

    for r in [get_text_or_image(el) for el in response]:
        c.execute("INSERT INTO logs (user_id ,timestamp, message) VALUES (?, ?, ?)", (0, timestamp, r))
    conn.commit()
    conn.close()


    # return a response
    response_data = json.dumps(response)
    return response_data


def RASAthunction(message: str) -> [str]:
    """
    Sends a message to RASA and returns the RASA response
    """
    rasa_msg = []
    r = requests.post('http://localhost:5005/webhooks/rest/webhook', json={"message": message})

    for res in r.json():
        rasa_msg.append(res)

    return rasa_msg

# run the app
if __name__ == '__main__':
    conn = sqlite3.connect(DATABASE_NAME)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS logs
                     (id INTEGER PRIMARY KEY AUTOINCREMENT , user_id INT NOT NULL, timestamp TEXT NOT NULL, message TEXT NOT NULL, question INTEGER, answer INTEGER)''')
    conn.close()
    app.run(host='localhost', port=6969, debug=True)
