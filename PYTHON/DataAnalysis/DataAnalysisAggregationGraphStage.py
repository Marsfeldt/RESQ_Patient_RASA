import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import scipy.stats as stats
from statsmodels.stats.proportion import proportions_ztest

# Raw data
raw_data = {
    'Pre-Contemplation': {'Left Number For Reminder': {'Yes': 0, 'No': 0}, 'Returned Next Day': {'Yes': 0, 'No': 0}},
    'Contemplation': {'Left Number For Reminder': {'Yes': 0, 'No': 0}, 'Returned Next Day': {'Yes': 0, 'No': 0}},
    'Preparation': {'Left Number For Reminder': {'Yes': 0, 'No': 0}, 'Returned Next Day': {'Yes': 0, 'No': 0}},
    'Action': {'Left Number For Reminder': {'Yes': 0, 'No': 0}, 'Returned Next Day': {'Yes': 0, 'No': 0}},
    'Maintenance': {'Left Number For Reminder': {'Yes': 0, 'No': 0}, 'Returned Next Day': {'Yes': 0, 'No': 0}}
}

# Participants data
participants_data = {
    'Pre-Contemplation': [('testa2', 'No', 'No'), ('testb6', 'Yes', 'Yes'), ('testc8', 'Yes', 'No')],
    'Contemplation': [('testb1', 'Yes', 'Yes'), ('testc5', 'Yes', 'Yes')],
    'Preparation': [('testa3', 'Yes', 'Yes'), ('testa5', 'Yes', 'No'), ('testb2', 'Yes', 'No'), ('testb5', 'Yes', 'No'), ('testb9', 'Yes', 'No'), ('testc7', 'Yes', 'No')],
    'Action': [('testa1', 'Yes', 'Yes'), ('testa6', 'Yes', 'No'), ('testa10', 'No', 'No'), ('testb3', 'Yes', 'No'), ('testc4', 'No', 'No')],
    'Maintenance': [('testa4', 'Yes', 'Yes'), ('testa7', 'Yes', 'Yes'), ('testa8', 'Yes', 'No'), ('testa9', 'Yes', 'Yes'),
                    ('testb4', 'Yes', 'Yes'), ('testb7', 'No', 'No'), ('testb8', 'Yes', 'Yes'), ('testb10', 'Yes', 'Yes'),
                    ('testc1', 'Yes', 'Yes'), ('testc2', 'No', 'No'), ('testc3', 'Yes', 'No'), ('testc6', 'No', 'No'),
                    ('testc9', 'Yes', 'No'), ('testc10', 'Yes', 'Yes')]
}

# Populate raw data
for stage, participants in participants_data.items():
    for participant in participants:
        left_number, returned = participant[1], participant[2]
        raw_data[stage]['Left Number For Reminder'][left_number] += 1
        raw_data[stage]['Returned Next Day'][returned] += 1

# Print raw data
print("Raw Data:")
print(raw_data)

# Calculate percentages
percentages = {}
for stage, participants in raw_data.items():
    percentages[stage] = {
        'Left Number For Reminder': participants['Left Number For Reminder']['Yes'] / sum(participants['Left Number For Reminder'].values()) * 100,
        'Returned Next Day': participants['Returned Next Day']['Yes'] / sum(participants['Returned Next Day'].values()) * 100
    }

# Print percentages
print("\nPercentages:")
print(percentages)

# Create DataFrame
df = pd.DataFrame(percentages)

# Plot
fig, ax = plt.subplots(figsize=(10, 6))

# Bar width
bar_width = 0.35

# X axis positions
x = np.arange(len(df.columns))

# Left Number For Reminder bars
left_bars = ax.bar(x - bar_width/2, df.loc['Left Number For Reminder'], bar_width, label='Left Number For Reminder')

# Returned Next Day bars
returned_bars = ax.bar(x + bar_width/2, df.loc['Returned Next Day'], bar_width, label='Returned Next Day', alpha=0.6)

# Add percentages on top of bars
for bars in [left_bars, returned_bars]:
    for bar in bars:
        height = bar.get_height()
        ax.annotate(f'{height:.1f}%', xy=(bar.get_x() + bar.get_width() / 2, height), xytext=(0, 3),
                    textcoords="offset points", ha='center', va='bottom', fontweight='bold')

# Set labels, title, and legend
ax.set_xlabel('Stage')
ax.set_ylabel('Percentage')
ax.set_title('Percentage of Participants Who Left Number For Reminder and Returned Next Day by Stage')
ax.set_xticks(x)
ax.set_xticklabels(df.columns)
ax.legend()

# Show plot
plt.tight_layout()

#plt.savefig("PYTHON/DataAnalysis/Graphs/aggregation_graph_stage.png")
#plt.show()

# Function to perform z-test and print results
def perform_z_test(stage1, stage2, column):
    count = np.array([raw_data[stage1][column]['Yes'], raw_data[stage2][column]['Yes']])
    nobs = np.array([sum(raw_data[stage1][column].values()), sum(raw_data[stage2][column].values())])
    z_score, p_value = proportions_ztest(count, nobs)
    print(f"Comparison between {stage1} and {stage2} for '{column}':")
    print(f"Z-score: {z_score:.2f}")
    print(f"P-value: {p_value:.4f}")
    if p_value < 0.05:
        print("Statistically significant at alpha = 0.05")
    else:
        print("Not statistically significant at alpha = 0.05")
    print()

# Perform z-test for each pair of stages and each column
for stage1 in raw_data.keys():
    for stage2 in raw_data.keys():
        if stage1 != stage2:
            perform_z_test(stage1, stage2, 'Left Number For Reminder')
            perform_z_test(stage1, stage2, 'Returned Next Day')


# Example of performing z-test for "left phone number" between "Pre-Contemplation" and "Contemplation"
perform_z_test("Pre-Contemplation", "Contemplation", "Left Number For Reminder")

