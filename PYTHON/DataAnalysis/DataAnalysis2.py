import seaborn as sns
import matplotlib.pyplot as plt

# Data
strategies = ['Strategy 1', 'Strategy 2', 'Strategy 3']
ratings = [3.1, 3.1, 3.4]

# Find the index of the strategy with the highest rating
max_index = ratings.index(max(ratings))

# Create bar chart with Seaborn
plt.figure(figsize=(8, 6))
ax = sns.barplot(x=strategies, y=ratings, color='#3d5a80')

# Add numbers on top of bars in bold
for i, v in enumerate(ratings):
    ax.text(i, v + 0.1, f'{v:.1f}', ha='center', va='bottom', fontweight='bold')

# Add a marker on the bar with the highest rating
ax.patches[max_index].set_facecolor('#ee6c4d')

# Increase the maximum value of the y-axis
plt.ylim(0, max(ratings) + 0.5)

# Add title and labels
plt.title('Strategy Ratings (Likert Scale 1-5)')
plt.xlabel('Strategy')
plt.ylabel('Rating')

plt.savefig("PYTHON/DataAnalysis/Graphs/strategy_ratings_likert.png")

# Show plot
#plt.show()
