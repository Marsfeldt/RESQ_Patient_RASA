def readiness_to_change_questionnaire(username, stage, stage_def):
    questionnaire = [
        "Do you currently engage in regular physical activity?",
        "Do you intend to engage in regular physical activity in the next 6 months?",
        "Do you intend to engage in regular physical activity in the next 30 days?",
        "Have you been regularly physically active for the past six months?",
        f'Thank you {username}, very much for your answers. From my assessment you belong in {stage}, with the following definition: “{stage_def}”. Do you agree with this assessment, please choose “YES” or “NO”'
    ]
    return questionnaire


username = "Milo"
stage = "Pre-contemplation"
stage_def = "you lazy fuck, get going idiot you have a problem"

next_question = readiness_to_change_questionnaire(username="LMAO1", stage="LMAO2", stage_def="LMAO3")[0]
length = len(readiness_to_change_questionnaire(username="LMAO1", stage="LMAO2", stage_def="LMAO3"))

# Function to match user score sequence with scoring sequences
def match_sequence(user_sequence, scoring_sequences):
    for stage, sequence in scoring_sequences.items():
        if user_sequence == sequence:
            return stage
    return None

def determine_stage():
        # Scoring Conditions
        # if Q1 = NO and Q2 = NO = Precontemplation
        # if Q1 = NO and Q2 = YES and Q3 = NO = Contemplation
        # if Q1 = NO and Q2 = YES and Q3 = YES = Preparation
        # if Q1 = YES and Q4 = NO = Action
        # if Q1 = YES and Q4 = YES = Maintenance
        scoring_sequences = {
            "Pre-Contemplation": ["no", "no"],
            "Contemplation": ["no", "yes", "no"],
            "Preparation": ["no", "yes", "yes"],
            "Action": ["yes", "no"],
            "Maintenance": ["yes", "yes"],
        }

        user_score_sequence = ["yes", "no"]

        # Find matching stage
        matched_stage = match_sequence(user_score_sequence, scoring_sequences)

        # Print result
        if matched_stage:
            print("User's score sequence matches with the stage:", matched_stage)
        else:
            print("No matching stage found for the user's score sequence.")





determine_stage()