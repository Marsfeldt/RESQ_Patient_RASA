# RESQ_RASA_PROJECT - SETUP GUIDE

**INTRO**
-----
In this README you will be introduced to the whole system: How to install and run it, how to utilize some of the generic functions, as well as how to further implement new functionality into the system.

**STEP 1:** IDE / Code Editor
-----
In terms of what IDE to use, I would recommend using either PyCharm (Free with GitHub Student Program) or Visual Studio Code as this is what the guide is based on. Furthermore, to ensure full compatibility with the guide you should be using the Windows Operating System and an Android Device, as more steps might be needed to set everything up to work with iOS.

**STEP 2:** Installation of RASA
-----
You will need to have Python installed in order to run RASA, you can get that here if you do not have it already
https://www.python.org/downloads/ - RASA States to use either version 3.7 or 3.8 (I would recommend 3.8).

Once Python is installed ensure that you are able to use the PIP package manager by opening a command prompt and typing "pip".
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
Link to Chocolatey Package Manager (Windwos) - https://chocolatey.org/
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
1. Open powershell
2. Copy and paste Get-ChildItem -Path Env:\ into powershell
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

Now you need to setup a virtual device to develop the mobile application, which you can do by following these instructions:
If you are running an intel processor you need "HAXM"
```
https://github.com/intel/haxm/wiki/Installation-Instructions-on-Windows
```
If you are running an AMD processor you need to enable SVM - Virtualization in your bios settings and enable these windows features
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

Remakrs & Bugs
-----
- The app will automatically save the messages to the phones local storage depending on which user is logged in. Therefore signing in on multiple accounts interferes with the loading of previous chat history which results in the messages appearing incorrectly in the chat window. Although we are assuming that people will not utilize multiple accounts on the same phone.

