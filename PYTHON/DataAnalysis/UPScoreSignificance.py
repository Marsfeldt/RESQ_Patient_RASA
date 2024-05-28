import numpy as np
from scipy.stats import t, shapiro
import pandas as pd

# Sample data
u_scores = [4.166667, 5.000000, 4.833333]
p_scores = [4.525, 4.225, 4.200]

# Assumed values
n = 10  # sample size for each group
s = 0.5  # assumed common standard deviation

# Calculate standard error
SE = s / np.sqrt(n)

# Pairwise mean differences
mean_diffs = [
    (u_scores[0] - u_scores[1], "STR1", "STR2"),
    (u_scores[0] - u_scores[2], "STR1", "STR3"),
    (u_scores[1] - u_scores[2], "STR2", "STR3"),
    (p_scores[0] - p_scores[1], "STR1", "STR2"),
    (p_scores[0] - p_scores[2], "STR1", "STR3"),
    (p_scores[1] - p_scores[2], "STR2", "STR3"),
]

# Perform t-tests and Shapiro-Wilk tests
alpha = 0.05
df = 2 * (n - 1)  # degrees of freedom for two-sample t-test

results = []
for diff, group1, group2 in mean_diffs:
    # Shapiro-Wilk test for normality
    _, p_shapiro_group1 = shapiro(u_scores if group1.startswith("STR") else p_scores)
    _, p_shapiro_group2 = shapiro(u_scores if group2.startswith("STR") else p_scores)
    
    # T-test
    t_value = diff / SE
    p_value = 2 * (1 - t.cdf(abs(t_value), df))  # two-tailed p-value
    reject_null = p_value < alpha
    
    results.append((group1, group2, diff, t_value, p_value, reject_null, p_shapiro_group1, p_shapiro_group2))

# Print results
print("Pairwise t-test and Shapiro-Wilk test results:")
print(f"{'Group1':<5} {'Group2':<5} {'MeanDiff':<8} {'t-value':<8} {'p-value':<8} {'Reject Null':<12} {'Shapiro-Wilk p-value Group1':<25} {'Shapiro-Wilk p-value Group2':<25}")
for res in results:
    print(f"{res[0]:<5} {res[1]:<5} {res[2]:<8.3f} {res[3]:<8.3f} {res[4]:<8.3f} {res[5]:<12} {res[6]:<25} {res[7]:<25}")
