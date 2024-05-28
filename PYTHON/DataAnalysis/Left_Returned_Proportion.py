import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

# Data
stages = ['Pre-Contemplation', 'Contemplation', 'Preparation', 'Action', 'Maintenance']
proportion_in_stage = [0.10, 0.067, 0.20, 0.167, 0.467]
proportion_left_phone = [0.067, 0.067, 0.20, 0.10, 0.333]
proportion_returned = [0.033, 0.067, 0.033, 0.033, 0.267]

# Create a DataFrame
data = pd.DataFrame({
    'Stage': stages * 3,
    'Proportion': proportion_in_stage + proportion_left_phone + proportion_returned,
    'Type': ['Proportion in Stage'] * len(stages) + ['Proportion Left Phone Number'] * len(stages) + ['Proportion Returned'] * len(stages)
})

# Plot using Seaborn
plt.figure(figsize=(10, 6))
sns.barplot(data=data, x='Stage', y='Proportion', hue='Type')
plt.title('Normalized Proportions by Stage')
plt.ylabel('Proportions')
plt.xlabel('Stage')
plt.xticks()
plt.tight_layout()
plt.legend(title='Proportion Type')
plt.savefig("PYTHON/DataAnalysis/Graphs/normalized_proportion_graph_by_stage.png")
plt.show()



import numpy as np
from scipy.stats import chi2_contingency, chi2

# Data
stages = ['pc', 'co', 'pr', 'a', 'm']
proportion_left_phone = [0.067, 0.067, 0.200, 0.100, 0.333]
proportion_returned = [0.033, 0.067, 0.033, 0.033, 0.267]

# Function to perform chi-squared test between two stages
def chi_squared_test(stage1, stage2):
    # Get indices of stages
    idx1 = stages.index(stage1)
    idx2 = stages.index(stage2)

    # Calculate drop between Left Number and Returned for each stage
    drop1 = proportion_left_phone[idx1] - proportion_returned[idx1]
    drop2 = proportion_left_phone[idx2] - proportion_returned[idx2]

    # Add smoothing to avoid zero elements
    smoothing = 0.01
    drop1 += smoothing
    drop2 += smoothing

    # Create contingency table
    contingency_table = np.array([[drop1, drop2]])

    # Calculate degrees of freedom
    df = len(contingency_table) - 1

    # Perform chi-squared test
    _, p_value, _, _ = chi2_contingency(contingency_table)

    # Print the results
    print(f'Chi-squared test for {stage1} vs {stage2}:')
    print(f'Drop for {stage1}: {drop1 - smoothing}')  # Subtract smoothing for printing
    print(f'Drop for {stage2}: {drop2 - smoothing}')  # Subtract smoothing for printing
    print(f'p-value: {p_value}')

    # Check significance
    alpha = 0.05
    if p_value < alpha:
        print(f"There is a significant difference between {stage1} and {stage2}.")
    else:
        print(f"There is no significant difference between {stage1} and {stage2}.")

# Perform chi-squared test for Pre-Contemplation vs Contemplation
chi_squared_test('a', 'm')




