import seaborn as sns
import matplotlib.pyplot as plt

# Data
strategies = ['Control Strategy', 'Empathetic Strategy', 'Extended Conversation Strategy']
u_scores = [4.166667, 5.000000, 4.833333]
p_scores = [4.525, 4.225, 4.200]

# Combine data into a single list for easier plotting
data = {'Strategy': strategies * 2,
        'Score': u_scores + p_scores,
        'Type': ['U-Score'] * len(strategies) + ['P-Score'] * len(strategies)}

# Create bar chart with Seaborn
plt.figure(figsize=(8, 6))
ax = sns.barplot(x='Strategy', y='Score', hue='Type', data=data, palette=['#3d5a80', '#ee6c4d'])

# Add values on top of bars in bold for both U-Score and P-Score
for i, (u, p) in enumerate(zip(u_scores, p_scores)):
    ax.text(i - 0.2, u + 0.05, f'U: {u:.2f}', ha='center', va='bottom', fontweight='bold')
    ax.text(i + 0.2, p + 0.05, f'P: {p:.2f}', ha='center', va='bottom', fontweight='bold')

# Set y-axis limit to go up to 6
plt.ylim(0, 6)

# Add title and labels
plt.title('U-Score & P-Score by Strategy')
plt.xlabel('Strategy')
plt.ylabel('Score')

plt.savefig("PYTHON/DataAnalysis/NewGraphs/strategy_uscore_pscore.png")

# Show plot
plt.show()