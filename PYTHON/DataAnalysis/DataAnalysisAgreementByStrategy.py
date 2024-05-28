import seaborn as sns
import matplotlib.pyplot as plt

# Data
strategies = ['Control Strategy', 'Empathetic Strategy', 'Extended Conversation Strategy']
agreements = [60.0, 80.0, 100.0]

# Find the index of the strategy with the highest agreement
max_index = agreements.index(max(agreements))

# Create bar chart with Seaborn
plt.figure(figsize=(8, 6))
ax = sns.barplot(x=strategies, y=agreements, color='#3d5a80')

# Add percentages on top of bars in bold
for i, v in enumerate(agreements):
    ax.text(i, v + 5, f'{v:.1f}%', ha='center', va='bottom', fontweight='bold')

# Add a marker on the bar with the highest agreement
ax.patches[max_index].set_facecolor('#ee6c4d')

# Increase the maximum value of the y-axis
plt.ylim(0, 110)

# Add title and labels
plt.title('Stage Assessment Agreement Amongst Strategies')
plt.xlabel('Strategy')
plt.ylabel('Agreement (%)')

plt.savefig("PYTHON/DataAnalysis/NewGraphs/strategy_agreement.png")

# Show plot
plt.show()
