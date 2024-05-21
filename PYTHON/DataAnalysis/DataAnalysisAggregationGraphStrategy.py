import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

# Data
data = {
    'Strategy': ['Strategy 1/A'] * 10 + ['Strategy 2/B'] * 10 + ['Strategy 3/C'] * 10,
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

# Add title and labels
plt.title('Aggregation of Left Number For Reminder and Returned Next Day by Strategy')
plt.xlabel('Strategy')
plt.ylabel('Count')
plt.legend()

plt.xticks(space, agg_data['Strategy'], rotation=45, ha='right')  # Set x-axis ticks

plt.tight_layout()

#plt.savefig("PYTHON/DataAnalysis/Graphs/aggregation_graph_strategy.png")

#lt.show()

import scipy.stats as stats

# List to store results
results = []

# Iterate over each strategy
for strategy in df['Strategy'].unique():
    # Filter data for the current strategy
    strategy_data = df[df['Strategy'] == strategy]
    
    # Count of people who left their phone number and returned
    left_and_returned = strategy_data[(strategy_data['Left Number For Reminder'] == 'Yes') & (strategy_data['Returned Next Day'] == 'Yes')].shape[0]
    
    # Count of people who left their phone number
    left_count = strategy_data[strategy_data['Left Number For Reminder'] == 'Yes'].shape[0]
    
    # Count of people who returned
    returned_count = strategy_data[strategy_data['Returned Next Day'] == 'Yes'].shape[0]
    
    # Total count
    total_count = strategy_data.shape[0]
    
    # Calculate proportions
    p_left = left_count / total_count
    p_returned = returned_count / total_count
    
    # Calculate standard errors
    se_left = np.sqrt(p_left * (1 - p_left) / total_count)
    se_returned = np.sqrt(p_returned * (1 - p_returned) / total_count)
    
    # Calculate z-score
    z_score = (p_left - p_returned) / np.sqrt(se_left**2 + se_returned**2)
    
    # Calculate p-value
    p_value = stats.norm.sf(abs(z_score)) * 2  # two-tailed test
    
    # Store results
    results.append({'Strategy': strategy, 'Z-score': z_score, 'p-value': p_value})

# Convert results to DataFrame
results_df = pd.DataFrame(results)

print(results_df)

