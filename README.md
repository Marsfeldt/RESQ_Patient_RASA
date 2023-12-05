# RESQ_RASA_PROJECT - SETUP GUIDE

**INTRO**
-----
In this README you will be introduced to the whole system: How to install and run it, how to utilize some of the generic functions, as well as how to further implement new functionality into the system.

**STEP 1:** IDE / Code Editor
-----
In terms of what IDE to use, I would recommend using either PyCharm (Free with GitHub Student Program) or Visual Studio Code as this is what the guide is based on. Furthermore, to ensure full compatibility with the guide you should be using the Windows Operating System and an Android Device, as more steps might be needed to set everything up to work with iOS.

**STEP 2:** Installation of RASA
-----
You will need to have Python installed to run RASA, you can get that here if you do not have it already
https://www.python.org/downloads/ - RASA States to use either version 3.7 or 3.8 (I would recommend 3.8).

Once Python is installed ensure that you can use the PIP package manager by opening a command prompt and typing "pip".
If that works you are ready to install RASA, do that by typing:
```
pip3 install rasa[full]
```
This installs RASA together with all the machine learning-related dependencies needed to run RASA.

**STEP 3:** Installation of Android Studio, Emulator, React, NPM and Expo
-----
To run the application I would recommend getting yourself a virtual device to edit code and seeing the changes in instantaneous.

Link to Android Studio - https://developer.android.com/studio
Link to Node.js - https://nodejs.org/en/download/current
Link to Chocolatey Package Manager (Windows) - https://chocolatey.org/
Once all of the above is installed you can open a cmd terminal and install the Java SE Development Kit (JDK)
```
choco install -y nodejs-lts microsoft-openjdk11
```
For React Native you need a specific Android SDK 'Android 13 (Tiramisu)'
The SDK Manager can be found within the Android Studio "Preferences" dialog, under Appearance & Behavior → System Settings → Android SDK.
Select the "SDK Platforms" tab from within the SDK Manager, then check the box next to "Show Package Details" in the bottom right corner. Look for and expand the Android 13 (Tiramisu) entry, then make sure the following items are checked:
* Android SDK Platform 33
* Intel x86 Atom_64 System Image or Google APIs Intel x86 Atom System Image
<br />
Next, select the "SDK Tools" tab and check the box next to "Show Package Details" here as well. Look for and expand the Android SDK Build-Tools entry, then make sure that 33.0.0 is selected.
Finally, click "Apply" to download and install the Android SDK and related build tools.

Now you need to configure the ANDROID_HOME environment variable

1. Open the Windows Control Panel.
2. Click on User Accounts, then click User Accounts again
3. Click on Change my environment variables
4. Click on New... to create a new ANDROID_HOME user variable that points to the path to your Android SDK:

The default path of the Android SDK is located here
```
%LOCALAPPDATA%\Android\Sdk
```
To verify that ANDROID_HOME is configured correctly do the following:
1. Open PowerShell
2. Copy and paste Get-ChildItem -Path Env:\ into PowerShell
3. Verify ANDROID_HOME has been added

Now you need to add the Platform-Tools environment variable

1. Open the Windows Control Panel.
2. Click on User Accounts, then click User Accounts again
3. Click on Change my environment variables
4. Select the Path variable.
5. Click Edit.
6. Click New and add the path to platform-tools to the list.

The default location location for this folder is:
```
%LOCALAPPDATA%\Android\Sdk\platform-tools
```

Now you need to set up a virtual device to develop the mobile application, which you can do by following these instructions:
If you are running an intel processor you need "HAXM"
```
https://github.com/intel/haxm/wiki/Installation-Instructions-on-Windows
```
If you are running an AMD processor you need to enable SVM - Virtualization in your bios settings and enable these Windows features
```
Hyper-V
Virtual Machine Platform
Windows Hypervisor Platform
```

```
https://developer.android.com/studio/run/managing-avds
```

**STEP 4:** Running the RASA Servers and the React Mobile Application
-----

1. Open the folder for the RASA Main project
2. Open a new terminal and paste the following command to run the RASA Server
```
python -m rasa run --model models --enable-api --cors "*"
```
3. After the server has started it should say "Rasa server running..."
4. Open a new terminal and start the RASA Action Server by pasting this command
```
python -m rasa run actions
```
5. Next head over to the "Data Collection.py" script which is where the Proxy server is located and run this script

Now you should have 3 Terminals with 3 servers running.

6. Open the folder for the React Native Mobile Application, then open a terminal and type this command:
```
npm start
```
Once you see this: <br />
![image](https://github.com/ThomasST4/RESQ_RASA_PROJECT/assets/143821225/93d06880-4453-42ea-b442-2fbe09196fa2)
```
You can then click 'a'
```
Then once it is done installing the application and launching the emulator you should see the virtual device with the app launched.

**Current functionality and how it works** Socket.io, server and events
-----
**Servers** - RASA and the Backend Server
<br />
We have 3 servers that run the project. The RASA and RASA Actions are basically the same server, although run independently in 2 terminals. Then there is a Python flask backend server which is responsible for anything that needs to interact with the database through the front end: Login, account creation, saving information to the database, and so forth. The Python server utilizes socket.io and this allows us to create events that can communicate between the front-end and the back-end. One such example

```
@socketio.on("create_account")
def handle_account_creation(data):
    """
    Handles account creation from the react front-end signup screen
    """
    # Data values for account creation
    # Universally Unique Identifier to separate different users
    uuid = data.get('uuid')
    username = data.get('username')  # Account Username
    email = data.get('email')  # Account Email
    # Account Password - Hashed through the front-end
    password = data.get('password')
    dateOfBirth = data.get('dateOfBirth')  # Account date of birth
    accountCreatedTime = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # Account creation time
    accountToCreate = {'UUID': uuid, 'Username': username, 'Email': email, 'Password': password, 'DateOfBirth': dateOfBirth, 'AccountCreatedTime': accountCreatedTime}
    userDB.create_user_account('users', accountToCreate)
    print(f'User Account: \n {uuid} , {username} , {email} , {password} , {dateOfBirth} , {accountCreatedTime} \n Created Successfully!')
```
This event is called 'create_account' and this one is emitted from the mobile application, on the signup screen whenever a user presses the button to register an account. The code from the front end can be seen below.

```
const onRegisterPressed = () => {
        if (pythonServerSocket) {
            // Hash the password before sending it
            hash(password, 5, (hashErr, hashedPassword) => {
                if (hashErr) {
                    console.error('Error hashing password:', hashErr);
                } else {
                    console.log("pass " + password)
                    // Send the account data to the Python Server
                    pythonServerSocket.emit('create_account', {
                        uuid: pythonServerSocket.id,
                        username: username,
                        email: email,
                        password: hashedPassword, // Send the hashed password
                        dateOfBirth: dateOfBirth
                    });
                }
            });
        } else {
            console.error('Socket is not available.');
        }
    }
```
Anything new that you might implement that requires some communication with the database or the backend should always be through sockets to and from the backend as having methods to write and read directly in the front-end can have security risks. To create an event and functionality you can do the following:
```
@socketio.on("event_name")
def generic_function(data): <- Note having an argument here is only required if your emit is going to send some data from/to the front-end
  # Add your own functionality here

If you need to send something to the front-end you can also use emits here using this line of code
socketio.emit('event_name', data) <- Note you need an event listener on the front end if you need to send information from the back end (Furhter examples of this are also present in the SocketServer.py script which hosts the backend server)

# React Native on event
pythonServerSocket.on('event_name', (data) => {
  console.log(data + 'Some data send from the front-end');
});
```

**Current functionality and how it works** Databasehandler generic functions
-----
**Database** - Sqlite3
<br />
To manage the database, a python script 'Databasehandler.py' has been made to control all the reads/writes to the database into a single class that can be easily expanded upon. Currently we have the following functions 
1. insert_data(self, tableName, data) <- Function to insert data into a specific database
2. retrieve_password_from_username(self, tableName, username) <- Retrieves a password from a specific user *requires their username*
3. fetch_information_from_user(self, tableName, username) <- fetches their username and their uuid to distinguish users when they log in
```
Example usage of the insert_data function

db = DatabaseHandler("./PYTHON/DATABASE/TestDatabase.db")

dataToSend = {
    'UID': uuid, 
    'UserName': "YoWhaddup",
    'PromScore': 20, 
    'AnotherPromScore': 40, 
    'Timestamp': timestamp
}

db.insert_data('userData', dataToSend)

Inserts dataToSend into the table 'userData' in the database located under 'PYTHON/DATABASE/TestDatabase.db'
```

Remarks & Bugs
-----
- The app will automatically save the messages to the phone's local storage depending on which user is logged in. Therefore signing in on multiple accounts interferes with the loading of previous chat history which results in the messages appearing incorrectly in the chat window. Although we are assuming that people will not utilize multiple accounts on the same phone.
- create_user_account functio in database handler can be replacted with just the insert_data one which already exists

