import pandas as pd

# Read the CSV file
data = pd.read_csv("PYTHON/toast.csv")

# Calculate U-Score and P-Score for each participant
data['U-Score'] = (data['I understand what the system should do.'] + 
                   data['I understand the limitations of the system.'] + 
                   data['I understand the capabilities of the system.']) / 3

data['P-Score'] = (data['The system performs consistently.'] + 
                   data['The system performs the way it should.'] + 
                   data['I feel comfortable relying on the information provided by the system.'] + 
                   data['I am rarely surprised by how the system responds.']) / 4

# Assign strategies based on participant IDs
data['Strategy'] = data['Participant ID'].apply(lambda x: x[4])

# Calculate summary statistics for each strategy
summary = data.groupby('Strategy').agg({'U-Score': 'mean', 'P-Score': 'mean'})

# Print individual participant scores and summary statistics
print("Individual Participant Scores:")
print(data[['Participant ID', 'U-Score', 'P-Score', 'Strategy']])
print("\nSummary Statistics by Strategy:")
print(summary)