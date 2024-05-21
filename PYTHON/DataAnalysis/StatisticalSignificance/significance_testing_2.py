from scipy.stats import shapiro, chi2_contingency


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

# Contemplation (Percentage Data)
c_pct_data_leftnumber = [1.00, 0.01, 2]
c_pct_data_returned = [1.00, 0.00, 2]

# Preparation (Percentage Data)
p_pct_data_leftnumber = [1.00, 0.00, 6]
p_pct_data_returned = [0.17, 0.83, 6]

# Action (Percentage Data)
a_pct_data_leftnumber = [0.60, 0.40, 5]
a_pct_data_returned = [0.20, 0.80, 5]

# Maintenance (Percentage Data)
m_pct_data_leftnumber = [0.71, 0.29, 14]
m_pct_data_returned = [0.57, 0.43, 14] 

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



#Pre-Contemplation Comparisons (left number)
pc_pct_data_leftnumber_vs_c_pct_data_leftnumber = chi_square_test(pc_pct_data_leftnumber, c_pct_data_leftnumber)
pc_pct_data_leftnumber_vs_p_pct_data_leftnumber = chi_square_test(pc_pct_data_leftnumber, p_pct_data_leftnumber)
pc_pct_data_leftnumber_vs_a_pct_data_leftnumber = chi_square_test(pc_pct_data_leftnumber, a_pct_data_leftnumber)
pc_pct_data_leftnumber_vs_m_pct_data_leftnumber = chi_square_test(pc_pct_data_leftnumber, m_pct_data_leftnumber)

#Pre-Contemplation Comparisons (Returned)
pc_pct_data_returned_vs_c_pct_data_returned = chi_square_test(pc_pct_data_returned, c_pct_data_returned)
pc_pct_data_returned_vs_p_pct_data_returned = chi_square_test(pc_pct_data_returned, p_pct_data_returned)
pc_pct_data_returned_vs_a_pct_data_returned = chi_square_test(pc_pct_data_returned, a_pct_data_returned)
pc_pct_data_returned_vs_m_pct_data_returned = chi_square_test(pc_pct_data_returned, m_pct_data_returned)

print(f"Pre-Contemplation vs. Contemplation (left_number) | P-value: {pc_pct_data_leftnumber_vs_c_pct_data_leftnumber}")
print(f"Pre-Contemplation vs. Preparation (left_number) | P-value: {pc_pct_data_leftnumber_vs_p_pct_data_leftnumber}")
print(f"Pre-Contemplation vs. Action (left_number) | P-value: {pc_pct_data_leftnumber_vs_a_pct_data_leftnumber}")
print(f"Pre-Contemplation vs. Maintenance (left_number) | P-value: {pc_pct_data_leftnumber_vs_m_pct_data_leftnumber}")

print(f"Pre-Contemplation vs. Contemplation (returned) | P-value: {pc_pct_data_returned_vs_c_pct_data_returned}")
print(f"Pre-Contemplation vs. Preparation (returned) | P-value: {pc_pct_data_returned_vs_p_pct_data_returned}")
print(f"Pre-Contemplation vs. Action (returned) | P-value: {pc_pct_data_returned_vs_a_pct_data_returned}")
print(f"Pre-Contemplation vs. Maintenance (returned) | P-value: {pc_pct_data_returned_vs_m_pct_data_returned}")

print("------------------------------------------------------")

#Pre-Contemplation Comparisons (left number)
pc_pr_data_leftnumber_vs_c_pr_data_leftnumber = chi_square_test(pc_pr_data_leftnumber, c_pr_data_leftnumber)
pc_pr_data_leftnumber_vs_p_pr_data_leftnumber = chi_square_test(pc_pr_data_leftnumber, p_pr_data_leftnumber)
pc_pr_data_leftnumber_vs_a_pr_data_leftnumber = chi_square_test(pc_pr_data_leftnumber, a_pr_data_leftnumber)
pc_pr_data_leftnumber_vs_m_pr_data_leftnumber = chi_square_test(pc_pr_data_leftnumber, m_pr_data_leftnumber)

#Pre-Contemplation Comparisons (Returned)
pc_pr_data_returned_vs_c_pr_data_returned = chi_square_test(pc_pr_data_returned, c_pr_data_returned)
pc_pr_data_returned_vs_p_pr_data_returned = chi_square_test(pc_pr_data_returned, p_pr_data_returned)
pc_pr_data_returned_vs_a_pr_data_returned = chi_square_test(pc_pr_data_returned, a_pr_data_returned)
pc_pr_data_returned_vs_m_pr_data_returned = chi_square_test(pc_pr_data_returned, m_pr_data_returned)

print(f"Pre-Contemplation vs. Contemplation (left_number) | P-value: {pc_pr_data_leftnumber_vs_c_pr_data_leftnumber}")
print(f"Pre-Contemplation vs. Preparation (left_number) | P-value: {pc_pr_data_leftnumber_vs_p_pr_data_leftnumber}")
print(f"Pre-Contemplation vs. Arion (left_number) | P-value: {pc_pr_data_leftnumber_vs_a_pr_data_leftnumber}")
print(f"Pre-Contemplation vs. Maintenance (left_number) | P-value: {pc_pr_data_leftnumber_vs_m_pr_data_leftnumber}")

print(f"Pre-Contemplation vs. Contemplation (returned) | P-value: {pc_pr_data_returned_vs_c_pr_data_returned}")
print(f"Pre-Contemplation vs. Preparation (returned) | P-value: {pc_pr_data_returned_vs_p_pr_data_returned}")
print(f"Pre-Contemplation vs. Arion (returned) | P-value: {pc_pr_data_returned_vs_a_pr_data_returned}")
print(f"Pre-Contemplation vs. Maintenance (returned) | P-value: {pc_pr_data_returned_vs_m_pr_data_returned}")