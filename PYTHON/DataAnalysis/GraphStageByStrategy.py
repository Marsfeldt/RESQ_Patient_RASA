import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

# Create the data
data = {
    'Stage': ['Pre-Contemplation', 'Pre-Contemplation', 'Pre-Contemplation', 
              'Contemplation', 'Contemplation', 'Contemplation', 
              'Preparation', 'Preparation', 'Preparation', 
              'Action', 'Action', 'Action', 
              'Maintenance', 'Maintenance', 'Maintenance'],
    'Strategy': ['Control Strategy', 'Empathetic Strategy', 'Extended Conversation Strategy'] * 5,
    'Count': [1, 1, 1, 0, 1, 1, 2, 3, 1, 3, 1, 1, 4, 4, 6]
}

# Convert the data to a DataFrame
df = pd.DataFrame(data)

# Plot the data using Seaborn
plt.figure(figsize=(10, 6))
barplot = sns.barplot(x='Stage', y='Count', hue='Strategy', data=df, palette='viridis')

# Annotate each bar with the count value
for p in barplot.patches:
    if p.get_height() > 0:  # Only annotate bars with a height greater than 0
        barplot.annotate(format(int(p.get_height()), 'd'), 
                         (p.get_x() + p.get_width() / 2., p.get_height()), 
                         ha='center', va='center', 
                         xytext=(0, 9), 
                         textcoords='offset points')

# Customize the plot
plt.title('Distribution of Strategies Across Stages')
plt.xlabel('Stage')
plt.ylabel('Participants')
plt.legend(title='Strategy')
plt.xticks()
plt.tight_layout()

plt.savefig("PYTHON/DataAnalysis/NewGraphs/stage_distribution_by_strategy.png")

# Show the plot
plt.show()
