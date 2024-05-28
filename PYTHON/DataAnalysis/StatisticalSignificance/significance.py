from scipy.stats import chi2_contingency

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


# Stage abbreviations
# Pre-contemplation - pc
# Contemplation - c
# Preparation - p
# Action - a
# Maintenance - m


# Left Number Metric
# Index 0: Amount of people who left their number | Index 1: Amount of People who did not leave their number | Index 2: How many people in the stage
# Returned Metric
# Index 0: Amount of people who returned | Index 1: Amount of People who did not return | Index 2: How many people in the stage

# Pre-Contemplation (Percentage Data)
pc_pct_data_leftnumber = [0.67, 0.33, 3]
pc_pct_data_returned = [0.33, 0.67, 3]
#pc_pct_data_leftnumber = [66.67, 33.33, 3] # Index 0: How many left number | Index 1: How many did not leave number
#pc_pct_data_returned = [33.33, 66.67, 3]

# Contemplation (Percentage Data)
c_pct_data_leftnumber = [1.00, 0.01, 2]
c_pct_data_returned = [1.00, 0.00, 2]
#c_pct_data_leftnumber = [100, 0.01, 2]
#c_pct_data_returned = [100, 0, 2]

# Preparation (Percentage Data)
p_pct_data_leftnumber = [1.00, 0.00, 6]
p_pct_data_returned = [0.17, 0.83, 6]
#p_pct_data_leftnumber = [100, 0, 6]
#p_pct_data_returned = [16.67, 83.33, 6]

# Action (Percentage Data)
a_pct_data_leftnumber = [0.60, 0.40, 5]
a_pct_data_returned = [0.20, 0.80, 5]
#a_pct_data_leftnumber = [60, 40, 5]
#a_pct_data_returned = [20, 80, 5]

# Maintenance (Percentage Data)
m_pct_data_leftnumber = [0.71, 0.29, 14]
m_pct_data_returned = [0.57, 0.43, 14]
#m_pct_data_leftnumber = [71.43, 28.57, 14]
#m_pct_data_returned = [57.14, 42.86, 14]

# Pre-Contemplation (Proportionate Data)
pc_pr_data_leftnumber = [0.067, 0.033, 30]
pc_pr_data_returned = [0.033, 0.067, 30]

# Contemplation (Proportionate Data)
c_pr_data_leftnumber = [0.067, 0.001, 30]
c_pr_data_returned = [0.067, 0.000, 30]

# Preparation (Proportionate Data)
p_pr_data_leftnumber = [0.200, 0.000, 30]
p_pr_data_returned = [0.033, 0.167, 30]

# Action (Proportionate Data)
a_pr_data_leftnumber = [0.100, 0.067, 30]
a_pr_data_returned = [0.033, 0.133, 30]

# Maintenance (Proportionate Data)
m_pr_data_leftnumber = [0.333, 0.133, 30]
m_pr_data_returned = [0.267, 0.200, 30] 


# Define the data for each stage and metric
stages = {'pc': 'precontemplation', 'c': 'contemplation', 'p': 'preparation', 'a': 'action', 'm': 'maintenance'}
metrics = ['leftnumber', 'returned']

run = False

if run:
    # Nested loop to iterate over each combination of stages and metrics
    for stage1_abbr, stage1_name in stages.items():
        for stage2_abbr, stage2_name in stages.items():
            if stage1_abbr != stage2_abbr:  # Avoid comparing the same stage with itself
                for metric in metrics:
                    # Construct variable names dynamically using string formatting
                    data1 = globals()[f"{stage1_abbr}_pr_data_{metric}"]
                    data2 = globals()[f"{stage2_abbr}_pr_data_{metric}"]
                    
                    # Perform chi-square test
                    p_value = chi_square_test(data1, data2)
                    
                    # Print the results
                    print(f"{stage1_name.capitalize()} vs. {stage2_name.capitalize()} ({metric}) | P-value: {p_value}")


p = chi_square_test(a_pct_data_leftnumber, m_pct_data_returned)
print(p)