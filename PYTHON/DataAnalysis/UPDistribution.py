import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.stats import probplot, shapiro

# Data
u_scores = [4.166667, 5.000000, 4.833333]
p_scores = [4.525, 4.225, 4.200]

# Combine data
all_scores = u_scores + p_scores

# Plot histogram
plt.figure(figsize=(10, 5))
sns.histplot(all_scores, bins=5, kde=True, color='skyblue')
plt.title('Histogram of U-Scores and P-Scores')
plt.xlabel('Scores')
plt.ylabel('Frequency')
plt.show()

# Q-Q plot
plt.figure(figsize=(6, 6))
probplot(all_scores, dist="norm", plot=plt)
plt.title('Q-Q Plot')
plt.xlabel('Theoretical Quantiles')
plt.ylabel('Ordered Values')
plt.show()

# Shapiro-Wilk test
statistic, p_value = shapiro(all_scores)
print("Shapiro-Wilk test for normality:")
print(f"Statistic: {statistic}, p-value: {p_value}")
if p_value > 0.05:
    print("The data follows a normal distribution (fail to reject H0)")
else:
    print("The data does not follow a normal distribution (reject H0)")
