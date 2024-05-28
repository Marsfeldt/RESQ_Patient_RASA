# Load necessary libraries
library(readxl)
library(dplyr)

# Import the Excel file
data <- read_excel("Raw_data_MED10_2024.xlsx")

# View the first few rows of the data
head(data)

# Ensure the column is correct type:
data <- data %>%
  mutate(across(c(ID, Strategy, Stage, Stage_agreement_bi, Left_number_bi, Returned_bi), as.factor))


# Perform logistic regression
# Assuming you want to predict 'Returned' using other columns as predictors
# You should adjust the predictors (e.g., Stage, PhoneLeft, etc.) according to your data
modelStrategy <- glm(Returned_bi ~ Strategy, data = data, family = binomial)
summary(modelStrategy)

modelStage <- glm(Returned_bi ~ Stage, data = data, family = binomial)
summary(modelStage)

modelAgreed <- glm(Returned_bi ~ Stage_agreement_bi, data = data, family = binomial)
summary(modelAgreed)

modelLeft <- glm(Returned_bi ~ Left_number_bi, data = data, family = binomial)
summary(modelLeft)

modelRank <- glm(Returned_bi ~ Stategy_Ranking, data = data, family = binomial)
summary(modelRank)

modelStrategyStage <- glm(Returned_bi ~ Strategy + Stage, data = data, family = binomial)
summary(modelStrategyStage)

modelStrategyStageAgree <- glm(Returned_bi ~ Strategy + Stage + Stage_agreement_bi, data = data, family = binomial)
summary(modelStrategyStageAgree)

modelStrategyStageLeft <- glm(Returned_bi ~ Strategy + Stage + Left_number_bi + Stategy_Ranking, data = data, family = binomial)
summary(modelStrategyStageLeft)

modelStageLeft <- glm(Returned_bi ~ Stage + Left_number_bi, data = data, family = binomial)
summary(modelStageLeft)

modelStageUscore <- glm(Returned_bi ~ Strategy + U_score, data = data, family = binomial)
summary(modelStageUscore)

modelStagePscore <- glm(Returned_bi ~ Strategy + P_score, data = data, family = binomial)
summary(modelStagePscore)

modelStageUscorePscore <- glm(Returned_bi ~ Strategy + Stage + Stage_agreement_bi + Left_number_bi + U_score + P_score + Stategy_Ranking, data = data, family = binomial)
summary(modelStageUscorePscore)

modelLeftU <- glm(Left_number_bi ~ Stategy_Ranking + U_score + P_score, data = data, family = binomial)
summary(modelLeftU)
