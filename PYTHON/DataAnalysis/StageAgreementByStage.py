import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np

# Data
stages = ['Pre-Contemplation', 'Contemplation', 'Preparation', 'Action', 'Maintenance']
total_in_stage = [3, 2, 6, 5, 14]
agreed_in_stage = [3, 2, 6, 1, 12]

# Create a figure and axis
plt.figure(figsize=(10, 6))

# Set the width of the bars
bar_width = 0.35

# Create bar positions
r1 = np.arange(len(stages))
r2 = [x + bar_width for x in r1]

# Create bar chart
plt.bar(r1, total_in_stage, color='#3d5a80', width=bar_width, edgecolor='grey', label='Total in Stage')
plt.bar(r2, agreed_in_stage, color='#ee6c4d', width=bar_width, edgecolor='grey', label='Agreed in Stage')

# Add numbers on top of bars in bold
for i in range(len(stages)):
    plt.text(r1[i], total_in_stage[i] + 0.2, f'{total_in_stage[i]}', ha='center', va='bottom', fontweight='bold')
    plt.text(r2[i], agreed_in_stage[i] + 0.2, f'{agreed_in_stage[i]}', ha='center', va='bottom', fontweight='bold')

# Increase the maximum value of the y-axis
plt.ylim(0, max(total_in_stage) + 5)

# Add title and labels
plt.title('Stage Assessment Agreement Amongst Stages')
plt.xlabel('Stage')
plt.ylabel('Number of Participants')

# Add legend
plt.legend()

# Set the position of the x ticks
plt.xticks([r + bar_width/2 for r in range(len(stages))], stages)

# Ensure y-axis shows integer ticks only
plt.gca().yaxis.set_major_locator(plt.MaxNLocator(integer=True))

# Save and show plot
plt.savefig("PYTHON/DataAnalysis/Graphs/stage_agreement_by_stage.png")
plt.show()
