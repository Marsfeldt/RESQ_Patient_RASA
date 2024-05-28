import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import textwrap

# Data
data = {
    'Strategy': ['Control Strategy'] * 10 + ['Empathetic Strategy'] * 10 + ['Extended Conversation Strategy'] * 10,
    'Left Number For Reminder': ['Yes', 'No', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'No'] +
                                 ['Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'No', 'Yes', 'Yes', 'Yes'] +
                                 ['Yes', 'No', 'Yes', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Yes', 'Yes'],
    'Returned Next Day': ['Yes', 'No', 'Yes', 'Yes', 'No', 'No', 'Yes', 'No', 'Yes', 'No'] +
                          ['Yes', 'No', 'No', 'Yes', 'No', 'Yes', 'No', 'Yes', 'No', 'Yes'] +
                          ['Yes', 'No', 'No', 'No', 'Yes', 'No', 'No', 'No', 'No', 'Yes']
}

# Convert to DataFrame
df = pd.DataFrame(data)

# Aggregate data
agg_data = df.groupby('Strategy').agg({
    'Left Number For Reminder': lambda x: (x == 'Yes').sum(),
    'Returned Next Day': lambda x: (x == 'Yes').sum()
}).reset_index()

# Plot
plt.figure(figsize=(10, 6))

# Set width of bars
bar_width = 0.35

# Space for each strategy
space = np.arange(len(agg_data['Strategy']))

# Left Number For Reminder
plt.bar(space - bar_width/2, agg_data['Left Number For Reminder'], color='#3d5a80', width=bar_width, label='Left Number For Reminder')

# Returned Next Day
plt.bar(space + bar_width/2, agg_data['Returned Next Day'], color='#ff7f0e', width=bar_width, label='Returned Next Day', alpha=0.6)

# Add counts on top of bars
for i, value in enumerate(agg_data['Left Number For Reminder']):
    plt.text(i - bar_width/2, value + 0.1, str(value), ha='center', va='bottom', fontweight='bold')

for i, value in enumerate(agg_data['Returned Next Day']):
    plt.text(i + bar_width/2, value + 0.1, str(value), ha='center', va='bottom', fontweight='bold')

# Set y-axis limit
plt.ylim(0, 10)

# Add title and labels
plt.title('Aggregation of Left Number For Reminder and Returned Next Day by Strategy')
plt.xlabel('Strategy')
plt.ylabel('Participants')
plt.legend()

# Set x-axis ticks with centered text on two lines
plt.xticks(space, [textwrap.fill(label, 12) for label in agg_data['Strategy']], ha='center')

plt.tight_layout()

plt.savefig("PYTHON/DataAnalysis/NewGraphs/aggregation_graph_strategy.png")

plt.show()
