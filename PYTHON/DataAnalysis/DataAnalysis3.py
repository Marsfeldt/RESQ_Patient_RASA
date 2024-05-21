import seaborn as sns
import matplotlib.pyplot as plt

# Data
categories = ['Returned (With Reminder)', 'Returned (Without Reminder)', 'Did not Return']
counts = [13, 0, 17]

# Find the index of the category with the highest count
max_index = counts.index(max(counts))

# Create bar chart with Seaborn
plt.figure(figsize=(8, 6))
ax = sns.barplot(x=categories, y=counts, color='#3d5a80')

# Add numbers on top of bars in bold
for i, v in enumerate(counts):
    ax.text(i, v + 0.1, f'{v}', ha='center', va='bottom', fontweight='bold')

# Add a marker on the bar with the highest count
ax.patches[max_index].set_facecolor('#ee6c4d')

# Increase the maximum value of the y-axis
plt.ylim(0, max(counts) + 5)

# Add title and labels
plt.title('Retention Rate Amongst Participants')
plt.xlabel('Reminder Status')
plt.ylabel('Amount')

plt.savefig("PYTHON/DataAnalysis/Graphs/retention_rate.png")

# Show plot
#plt.show()