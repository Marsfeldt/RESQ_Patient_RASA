import pandas as pd
from scipy.stats import shapiro, chi2_contingency
from scipy.stats import ttest_ind
from scipy.stats import ttest_1samp
from scipy.stats import mannwhitneyu
from scipy.stats import f_oneway


# Define a function to perform Shapiro-Wilk test for normality
def test_normality(dataframe):
    # Select only numerical columns
    numerical_columns = dataframe.select_dtypes(include=['float64', 'int64'])
    
    # Perform Shapiro-Wilk test for each numerical column
    normality_results = {}
    for column in numerical_columns:
        statistic, p_value = shapiro(dataframe[column])
        normality_results[column] = {'Test Statistic': statistic, 'p-value': p_value}
    
    return normality_results

def chi_square_test(observed, expected):
    # Create the contingency table
    contingency_table = [observed, expected]
    
    try:
        # Perform chi-square test
        chi2, p, _, _ = chi2_contingency(contingency_table)
        return p
    except ValueError as e:
        print("Error occurred during chi-square test:")
        print(e)
        print("Contingency Table:")
        print(contingency_table)
        return None

# Define a function to perform t-test for two independent samples
def t_test(data1, data2):
    # Perform t-test
    t_statistic, p_value = ttest_ind(data1, data2)
    return p_value

def ttest_1samp_test(data1, data2):
    # Perform t-test for a single sample
    t_statistic, p_value = ttest_1samp(data1, data2)
    
    return p_value

# Perform Mann-Whitney U test between two data sets
def mann_whitney_test(data1, data2):
    statistic, p_value = mannwhitneyu(data1, data2)
    return p_value


df = pd.read_csv("PYTHON/DataAnalysis/StatisticalSignificance/data.csv")

# Group the data by the "Stage" column
grouped = df.groupby("Stage")

# The _data variables shows "left number" on the first index and "returned" on the second index of the array

# Create separate DataFrames for each stage
df_precontemplation = grouped.get_group("Pre-Contemplation")
#precontemplation_data_leftnumber = 66.67
#precontemplation_data_returned = 33.33
precontemplation_data_leftnumber = [66.67, 33.33, 3] # Index 0: How many left number | Index 1: How many did not leave number
precontemplation_data_returned = [33.33, 66.67, 3]


df_contemplation = grouped.get_group("Contemplation")
#contemplation_data_leftnumber = 100
#contemplation_data_returned = 100
contemplation_data_leftnumber = [100, 0.01, 2]
contemplation_data_returned = [100, 0, 2]

df_preparation = grouped.get_group("Preparation")
#preparation_data_leftnumber = 100
#preparation_data_returned = 16.67
preparation_data_leftnumber = [100, 0, 6]
preparation_data_returned = [16.67, 83.33, 6]

df_action = grouped.get_group("Action")
#action_data_leftnumber = 60
#action_data_returned = 20
action_data_leftnumber = [60, 40, 5]
action_data_returned = [20, 80, 5]

df_maintenance = grouped.get_group("Maintenance")
#maintenance_data_leftnumber = 71.43
#maintenance_data_returned = 57.14
maintenance_data_leftnumber = [71.43, 28.57, 14]
maintenance_data_returned = [57.14, 42.86, 14]


# Strategy Stats
strategy_1_data_leftnumber = [8, 2, 10]
strategy_1_data_returned = [5,5, 10]

strategy_2_data_leftnumber = [9,1, 10]
strategy_2_data_returned = [5,5, 10]

strategy_3_data_leftnumber = [7,3, 10]
strategy_3_data_returned = [3,7, 10]



do_normal_test = False
do_significance_test = True

# Normality Test
if do_normal_test: 
    print(test_normality(df))

# Stage Controls
do_precontemplation = False
do_contemplation = False
do_preparation = False
do_action = False
do_maintenance = False
do_strategy_1 = False
do_strategy_2 = False
do_strategy_3 = True


# Chi-Square Test between two DataFrames
if do_significance_test:
    # Significance Test between precontemplation_data and other groups
    
    if do_precontemplation:
        #Pre-Contemplation Comparisons (left number)
        precontemplation_vs_contemplation_leftnumber = chi_square_test(precontemplation_data_leftnumber, contemplation_data_leftnumber)
        precontemplation_vs_preparation_leftnumber = chi_square_test(precontemplation_data_leftnumber, preparation_data_leftnumber)
        precontemplation_vs_actio_leftnumbern = chi_square_test(precontemplation_data_leftnumber, action_data_leftnumber)
        precontemplation_vs_maintenance_leftnumber = chi_square_test(precontemplation_data_leftnumber, maintenance_data_leftnumber)

        #Pre-Contemplation Comparisons (Returned)
        precontemplation_vs_contemplation_returned = chi_square_test(precontemplation_data_returned, contemplation_data_returned)
        precontemplation_vs_preparation_returned = chi_square_test(precontemplation_data_returned, preparation_data_returned)
        precontemplation_vs_action_returned = chi_square_test(precontemplation_data_returned, action_data_returned)
        precontemplation_vs_maintenance_returned = chi_square_test(precontemplation_data_returned, maintenance_data_returned)

        print(f"Pre-Contemplation vs. Contemplation (left_number) | P-value: {precontemplation_vs_contemplation_leftnumber}")
        print(f"Pre-Contemplation vs. Preparation (left_number) | P-value: {precontemplation_vs_preparation_leftnumber}")
        print(f"Pre-Contemplation vs. Action (left_number) | P-value: {precontemplation_vs_actio_leftnumbern}")
        print(f"Pre-Contemplation vs. Maintenance (left_number) | P-value: {precontemplation_vs_maintenance_leftnumber}")

        print(f"Pre-Contemplation vs. Contemplation (returned) | P-value: {precontemplation_vs_contemplation_returned}")
        print(f"Pre-Contemplation vs. Preparation (returned) | P-value: {precontemplation_vs_preparation_returned}")
        print(f"Pre-Contemplation vs. Action (returned) | P-value: {precontemplation_vs_action_returned}")
        print(f"Pre-Contemplation vs. Maintenance (returned) | P-value: {precontemplation_vs_maintenance_returned}")

    if do_contemplation:
        #Contemplation Comparisons (left number)
        contemplation_vs_precontemplation_leftnumber = chi_square_test(contemplation_data_leftnumber, precontemplation_data_leftnumber)
        contemplation_vs_preparation_leftnumber = chi_square_test(contemplation_data_leftnumber, preparation_data_leftnumber)
        contemplation_vs_actio_leftnumbern = chi_square_test(contemplation_data_leftnumber, action_data_leftnumber)
        contemplation_vs_maintenance_leftnumber = chi_square_test(contemplation_data_leftnumber, maintenance_data_leftnumber)

        #Contemplation Comparisons (Returned)
        contemplation_vs_precontemplation_returned = chi_square_test(contemplation_data_returned, precontemplation_data_returned)
        contemplation_vs_preparation_returned = chi_square_test(contemplation_data_returned, preparation_data_returned)
        contemplation_vs_action_returned = chi_square_test(contemplation_data_returned, action_data_returned)
        contemplation_vs_maintenance_returned = chi_square_test(contemplation_data_returned, maintenance_data_returned)

        print(f"Contemplation vs. Pre-Contemplation (left_number) | P-value: {contemplation_vs_precontemplation_leftnumber}")
        print(f"Contemplation vs. Preparation (left_number) | P-value: {contemplation_vs_preparation_leftnumber}")
        print(f"Contemplation vs. Action (left_number) | P-value: {contemplation_vs_actio_leftnumbern}")
        print(f"Contemplation vs. Maintenance (left_number) | P-value: {contemplation_vs_maintenance_leftnumber}")

        print(f"Contemplation vs. Pre-Contemplation (returned) | P-value: {contemplation_vs_precontemplation_returned}")
        print(f"Contemplation vs. Preparation (returned) | P-value: {contemplation_vs_preparation_returned}")
        print(f"Contemplation vs. Action (returned) | P-value: {contemplation_vs_action_returned}")
        print(f"Contemplation vs. Maintenance (returned) | P-value: {contemplation_vs_maintenance_returned}")
    
    if do_preparation:
        #Contemplation Comparisons (left number)
        preparation_vs_precontemplation_leftnumber = chi_square_test(preparation_data_leftnumber, precontemplation_data_leftnumber)
        preparation_vs_contemplation_leftnumber = chi_square_test(preparation_data_leftnumber, contemplation_data_leftnumber)
        preparation_vs_actio_leftnumbern = chi_square_test(preparation_data_leftnumber, action_data_leftnumber)
        preparation_vs_maintenance_leftnumber = chi_square_test(preparation_data_leftnumber, maintenance_data_leftnumber)

        #Contemplation Comparisons (Returned)
        preparation_vs_precontemplation_returned = chi_square_test(preparation_data_returned, precontemplation_data_returned)
        preparation_vs_contemplation_returned = chi_square_test(preparation_data_returned, contemplation_data_returned)
        preparation_vs_action_returned = chi_square_test(preparation_data_returned, action_data_returned)
        preparation_vs_maintenance_returned = chi_square_test(preparation_data_returned, maintenance_data_returned)

        print(f"Preparation vs. Pre-Contemplation (left_number) | P-value: {preparation_vs_precontemplation_leftnumber}")
        print(f"Preparation vs. Contemplation (left_number) | P-value: {preparation_vs_contemplation_leftnumber}")
        print(f"Preparation vs. Action (left_number) | P-value: {preparation_vs_actio_leftnumbern}")
        print(f"Preparation vs. Maintenance (left_number) | P-value: {preparation_vs_maintenance_leftnumber}")

        print(f"Preparation vs. Pre-Contemplation (returned) | P-value: {preparation_vs_precontemplation_returned}")
        print(f"Preparation vs. Contemplation (returned) | P-value: {preparation_vs_contemplation_returned}")
        print(f"Preparation vs. Action (returned) | P-value: {preparation_vs_action_returned}")
        print(f"Preparation vs. Maintenance (returned) | P-value: {preparation_vs_maintenance_returned}")
        
    if do_action:
        #Contemplation Comparisons (left number)
        action_vs_precontemplation_leftnumber = chi_square_test(action_data_leftnumber, precontemplation_data_leftnumber)
        action_vs_contemplation_leftnumber = chi_square_test(action_data_leftnumber, contemplation_data_leftnumber)
        action_vs_preparation_leftnumbern = chi_square_test(action_data_leftnumber, preparation_data_leftnumber)
        action_vs_maintenance_leftnumber = chi_square_test(action_data_leftnumber, maintenance_data_leftnumber)

        #Contemplation Comparisons (Returned)
        action_vs_precontemplation_returned = chi_square_test(action_data_returned, precontemplation_data_returned)
        action_vs_contemplation_returned = chi_square_test(action_data_returned, contemplation_data_returned)
        action_vs_preparation_returned = chi_square_test(action_data_returned, preparation_data_returned)
        action_vs_maintenance_returned = chi_square_test(action_data_returned, maintenance_data_returned)

        print(f"Action vs. Pre-Contemplation (left_number) | P-value: {action_vs_precontemplation_leftnumber}")
        print(f"Action vs. Contemplation (left_number) | P-value: {action_vs_contemplation_leftnumber}")
        print(f"Action vs. Preparation (left_number) | P-value: {action_vs_preparation_leftnumbern}")
        print(f"Action vs. Maintenance (left_number) | P-value: {action_vs_maintenance_leftnumber}")

        print(f"Action vs. Pre-Contemplation (returned) | P-value: {action_vs_precontemplation_returned}")
        print(f"Action vs. Contemplation (returned) | P-value: {action_vs_contemplation_returned}")
        print(f"Action vs. Preparation (returned) | P-value: {action_vs_preparation_returned}")
        print(f"Action vs. Maintenance (returned) | P-value: {action_vs_maintenance_returned}")

    if do_maintenance:
        #Contemplation Comparisons (left number)
        maintenance_vs_precontemplation_leftnumber = chi_square_test(maintenance_data_leftnumber, precontemplation_data_leftnumber)
        maintenance_vs_contemplation_leftnumber = chi_square_test(maintenance_data_leftnumber, contemplation_data_leftnumber)
        maintenance_vs_preparation_leftnumber = chi_square_test(maintenance_data_leftnumber, preparation_data_leftnumber)
        maintenance_vs_action_leftnumber = chi_square_test(maintenance_data_leftnumber, action_data_leftnumber)

        #Contemplation Comparisons (Returned)
        maintenance_vs_precontemplation_returned = chi_square_test(maintenance_data_returned, precontemplation_data_returned)
        maintenance_vs_contemplation_returned = chi_square_test(maintenance_data_returned, contemplation_data_returned)
        maintenance_vs_preparation_returned = chi_square_test(maintenance_data_returned, preparation_data_returned)
        maintenance_vs_action_returned = chi_square_test(maintenance_data_returned, action_data_returned)

        print(f"Maintenance vs. Pre-Contemplation (left_number) | P-value: {maintenance_vs_precontemplation_leftnumber}")
        print(f"Maintenance vs. Contemplation (left_number) | P-value: {maintenance_vs_contemplation_leftnumber}")
        print(f"Maintenance vs. Preparation (left_number) | P-value: {maintenance_vs_preparation_leftnumber}")
        print(f"Maintenance vs. Action (left_number) | P-value: {maintenance_vs_action_leftnumber}")

        print(f"Maintenance vs. Pre-Contemplation (returned) | P-value: {maintenance_vs_precontemplation_returned}")
        print(f"Maintenance vs. Contemplation (returned) | P-value: {maintenance_vs_contemplation_returned}")
        print(f"Maintenance vs. Preparation (returned) | P-value: {maintenance_vs_preparation_returned}")
        print(f"Maintenance vs. Action (returned) | P-value: {maintenance_vs_action_returned}")

    if do_strategy_1:
        #Pre-Contemplation Comparisons (left number)
        strat1_vs_strat2_leftnumber = chi_square_test(strategy_1_data_leftnumber, strategy_2_data_leftnumber)
        strat1_vs_strat3_leftnumber = chi_square_test(strategy_1_data_leftnumber, strategy_3_data_leftnumber)

        #Pre-Contemplation Comparisons (Returned)
        strat1_vs_strat2_returned = chi_square_test(strategy_1_data_returned, strategy_2_data_returned)
        strat1_vs_strat3_returned = chi_square_test(strategy_1_data_returned, strategy_3_data_returned)

        print(f"Strategy 1 vs. Strategy 2 (left_number) | P-value: {strat1_vs_strat2_leftnumber}")
        print(f"Strategy 1 vs. Strategy 3 (left_number) | P-value: {strat1_vs_strat3_leftnumber}")

        print(f"Strategy 1 vs. Strategy 2 (returned) | P-value: {strat1_vs_strat2_returned}")
        print(f"Strategy 1 vs. Strategy 3 (returned) | P-value: {strat1_vs_strat3_returned}")
    
    if do_strategy_2:
        #Pre-Contemplation Comparisons (left number)
        strat2_vs_strat1_leftnumber = chi_square_test(strategy_2_data_leftnumber, strategy_1_data_leftnumber)
        strat2_vs_strat3_leftnumber = chi_square_test(strategy_2_data_leftnumber, strategy_3_data_leftnumber)

        #Pre-Contemplation Comparisons (Returned)
        strat2_vs_strat1_returned = chi_square_test(strategy_2_data_returned, strategy_1_data_returned)
        strat2_vs_strat3_returned = chi_square_test(strategy_2_data_returned, strategy_3_data_returned)

        print(f"Strategy 2 vs. Strategy 1 (left_number) | P-value: {strat2_vs_strat1_leftnumber}")
        print(f"Strategy 2 vs. Strategy 3 (left_number) | P-value: {strat2_vs_strat3_leftnumber}")

        print(f"Strategy 2 vs. Strategy 1 (returned) | P-value: {strat2_vs_strat1_returned}")
        print(f"Strategy 2 vs. Strategy 3 (returned) | P-value: {strat2_vs_strat3_returned}")

    if do_strategy_3:
        #Pre-Contemplation Comparisons (left number)
        strat3_vs_strat1_leftnumber = chi_square_test(strategy_3_data_leftnumber, strategy_1_data_leftnumber)
        strat3_vs_strat2_leftnumber = chi_square_test(strategy_3_data_leftnumber, strategy_2_data_leftnumber)

        #Pre-Contemplation Comparisons (Returned)
        strat3_vs_strat1_returned = chi_square_test(strategy_3_data_returned, strategy_1_data_returned)
        strat3_vs_strat2_returned = chi_square_test(strategy_3_data_returned, strategy_2_data_returned)

        print(f"Strategy 3 vs. Strategy 1 (left_number) | P-value: {strat3_vs_strat1_leftnumber}")
        print(f"Strategy 3 vs. Strategy 2 (left_number) | P-value: {strat3_vs_strat2_leftnumber}")

        print(f"Strategy 3 vs. Strategy 1 (returned) | P-value: {strat3_vs_strat1_returned}")
        print(f"Strategy 3 vs. Strategy 2 (returned) | P-value: {strat3_vs_strat2_returned}")
