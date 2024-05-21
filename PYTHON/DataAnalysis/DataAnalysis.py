import pandas as pd
from scipy.stats import f_oneway

# Read data from CSV file
df = pd.read_csv("PYTHON/toast.csv")

# Calculate U-Score
df['U-Score'] = (df.iloc[:, 4:7].sum(axis=1)) / 3

# Calculate P-Score
df['P-Score'] = (df.iloc[:, 7:11].sum(axis=1)) / 4

# Extract strategy prefixes from Participant ID
df['Strategy'] = df['Participant ID'].str.extract(r'(\D+)')

# Group data by strategy
strategy_groups = [group for name, group in df.groupby("Strategy")]

# Perform ANOVA for U-Score and P-Score for each comparison
for i in range(len(strategy_groups)):
    for j in range(i+1, len(strategy_groups)):
        strategy1 = strategy_groups[i]['U-Score']
        strategy2 = strategy_groups[j]['U-Score']
        anova_U = f_oneway(strategy1, strategy2)
        print(f"\nANOVA results for Strategy {i+1} U-Score compared with Strategy {j+1} U-Score:")
        print("F-statistic:", anova_U.statistic)
        print("p-value:", anova_U.pvalue)
        
        strategy1 = strategy_groups[i]['P-Score']
        strategy2 = strategy_groups[j]['P-Score']
        anova_P = f_oneway(strategy1, strategy2)
        print(f"\nANOVA results for Strategy {i+1} P-Score compared with Strategy {j+1} P-Score:")
        print("F-statistic:", anova_P.statistic)
        print("p-value:", anova_P.pvalue)