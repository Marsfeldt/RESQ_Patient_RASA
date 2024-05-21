import matplotlib.pyplot as plt
import numpy as np
 
# Data
stages = ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5']
proportion_in_stage = [0.10, 0.067, 0.20, 0.167, 0.467]
proportion_left_phone = [0.067, 0.067, 0.20, 0.10, 0.333]
proportion_returned = [0.033, 0.067, 0.033, 0.033, 0.267]
 
x = np.arange(len(stages))  # the label locations
width = 0.25  # the width of the bars
 
fig, ax = plt.subplots()
rects1 = ax.bar(x - width, proportion_in_stage, width, label='Proportion in Stage')
rects2 = ax.bar(x, proportion_left_phone, width, label='Proportion Left Phone Number')
rects3 = ax.bar(x + width, proportion_returned, width, label='Proportion Returned')
 
# Add some text for labels, title and custom x-axis tick labels, etc.
ax.set_ylabel('Proportions')
ax.set_title('Normalized Proportions by Stage')
ax.set_xticks(x)
ax.set_xticklabels(stages)
ax.legend()
 
fig.tight_layout()
 
plt.show()