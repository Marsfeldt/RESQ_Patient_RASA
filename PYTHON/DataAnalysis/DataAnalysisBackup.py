from statsmodels.stats.proportion import proportions_ztest

# List to store results
#results = []

# Iterate over each stage
#for stage, participants in raw_data.items():
#    # Count of people who left their phone number and returned
#    left_and_returned = participants['Left Number For Reminder']['Yes']
#    
#    # Count of people who left their phone number
#    left_count = sum(participants['Left Number For Reminder'].values())
#    
#    # Count of people who returned
#    returned_count = sum(participants['Returned Next Day'].values())
#    
#    # Total count
#    total_count = sum([left_count, returned_count])
#    
#    # Create arrays of counts
#    count = np.array([left_and_returned, returned_count])
#    nobs = np.array([left_count, total_count])
#    
#    # Calculate z-score and p-value
#    z_score, p_value = proportions_ztest(count, nobs)
#    
#    # Store results
#    results.append({'Stage': stage, 'Z-score': z_score, 'p-value': p_value})

# Convert results to DataFrame
#results_df = pd.DataFrame(results)

#print(results_df)