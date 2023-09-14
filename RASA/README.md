# MED10CA
`rasa run --model models --enable-api --cors "*"`

`select * from logs`


# Other RASA commands
- `rasa init` - Creates the bot
- `rasa train` - trains the bot (done after changing any yml files or action.py)
- `rasa run` - runs the RASA bot without the action.py files
- `rasa run actions` - runs the Rasa SDK
- `rasa interactive` - chat with the bot to generate test data
- `rasa visualize` - graph of your stories
- `rasa shell` - command line interaction.


# For Veronika
## In pycharm
- `conda activate rasatest` - mac shit
- `rasa train` - optional if next command fails (deserialization error)
- `rasa run --model models --enable-api --cors "*"` - start RASA server
- run Data Collection - start the API proxy server
- `rasa run actions` - runs action sdk

## In VSCode
- npm start
- r - in terminal to refresh app
