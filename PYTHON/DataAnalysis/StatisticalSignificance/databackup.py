
import scipy.stats as stats

# List to store results
results = []

# Iterate over each strategy
for strategy in df['Strategy'].unique():
    # Filter data for the current strategy
    strategy_data = df[df['Strategy'] == strategy]
    
    # Count of people who left their phone number and returned
    left_and_returned = strategy_data[(strategy_data['Left Number For Reminder'] == 'Yes') & (strategy_data['Returned Next Day'] == 'Yes')].shape[0]
    
    # Count of people who left their phone number
    left_count = strategy_data[strategy_data['Left Number For Reminder'] == 'Yes'].shape[0]
    
    # Count of people who returned
    returned_count = strategy_data[strategy_data['Returned Next Day'] == 'Yes'].shape[0]
    
    # Total count
    total_count = strategy_data.shape[0]
    
    # Calculate proportions
    p_left = left_count / total_count
    p_returned = returned_count / total_count
    
    # Calculate standard errors
    se_left = np.sqrt(p_left * (1 - p_left) / total_count)
    se_returned = np.sqrt(p_returned * (1 - p_returned) / total_count)
    
    # Calculate z-score
    z_score = (p_left - p_returned) / np.sqrt(se_left**2 + se_returned**2)
    
    # Calculate p-value
    p_value = stats.norm.sf(abs(z_score)) * 2  # two-tailed test
    
    # Store results
    results.append({'Strategy': strategy, 'Z-score': z_score, 'p-value': p_value})

# Convert results to DataFrame
results_df = pd.DataFrame(results)

print(results_df)