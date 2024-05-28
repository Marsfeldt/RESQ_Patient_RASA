import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

# Data
participants = [
    'testa1', 'testa2', 'testa3', 'testa4', 'testa5', 'testa6', 'testa7', 'testa8', 'testa9', 'testa10',
    'testb1', 'testb2', 'testb3', 'testb4', 'testb5', 'testb6', 'testb7', 'testb8', 'testb9', 'testb10',
    'testc1', 'testc2', 'testc3', 'testc4', 'testc5', 'testc6', 'testc7', 'testc8', 'testc9', 'testc10'
]

# Extract stages
stages = [
    'Pre-Contemplation', 'Pre-Contemplation', 'Preparation', 'Maintenance', 'Preparation',
    'Action', 'Maintenance', 'Maintenance', 'Maintenance', 'Action',
    'Contemplation', 'Preparation', 'Action', 'Maintenance', 'Preparation',
    'Pre-Contemplation', 'Maintenance', 'Maintenance', 'Preparation', 'Maintenance',
    'Maintenance', 'Maintenance', 'Maintenance', 'Action', 'Contemplation',
    'Maintenance', 'Preparation', 'Pre-Contemplation', 'Maintenance', 'Maintenance'
]

# Define the desired order of stages
order = ['Pre-Contemplation', 'Contemplation', 'Preparation', 'Action', 'Maintenance']

# Convert stages to a Pandas Series
stages_series = pd.Series(stages)

# Convert the Series to a categorical type with the specified order
stages_series = pd.Categorical(stages_series, categories=order, ordered=True)

# Create histogram with Seaborn
plt.figure(figsize=(8, 6))
ax = sns.histplot(stages_series, bins=len(order), color='#3d5a80', discrete=True)

# Add title and labels
plt.title('Distribution of Stages')
plt.xlabel('Stage')
plt.ylabel('Participants')

# Ensure the color of the bars is correct
for patch in ax.patches:
    patch.set_facecolor('#3d5a80')

plt.savefig("PYTHON/DataAnalysis/NewGraphs/stage_distribution.png")


# Show plot
plt.show()
