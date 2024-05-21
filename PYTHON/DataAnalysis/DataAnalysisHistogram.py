import seaborn as sns
import matplotlib.pyplot as plt
from scipy.stats import chi2_contingency


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

# Create histogram with Seaborn
plt.figure(figsize=(8, 6))
ax = sns.histplot(stages, bins=5, color='#3d5a80', discrete=True)

# Add title and labels
plt.title('Distribution of Stages')
plt.xlabel('Stage')
plt.ylabel('Count')

#plt.savefig("PYTHON/DataAnalysis/Graphs/stage_distribution_histogram.png")

# Show plot
#plt.show()

# Count occurrences of each stage
stage_counts = {stage: stages.count(stage) for stage in set(stages)}

# Observed frequencies
observed_freq = list(stage_counts.values())

# Expected frequencies (assuming uniform distribution)
total_obs = len(stages)
expected_freq = [total_obs / len(set(stages))] * len(set(stages))

# Perform chi-square test
chi2, p_value = chi2_contingency([observed_freq, expected_freq])[:2]

print("Chi-square statistic:", chi2)
print("p-value:", p_value)

if p_value < 0.05:
    print("There is a significant difference between the distribution of stages.")
else:
    print("There is no significant difference between the distribution of stages.")