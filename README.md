# Volunteam App

A React Native application built with Expo-Go functionality for easier cross-platform development.

Languages:
- Typescript for Application
- Javascript for MyJSON DB


## Setting Up Development environment

- In VS Code, Clone this repo locally and save to a folder e.g 'Assignment-Task2'
- Open a terminal in the project folder and pull the latest from main to ensure you're up to date
```
git pull origin main
```
- Create your own branch for local development
```
git checkout -b <BranchName>
```
- You're now ready to develop locally.

### Installing Dependencies

- In terminal enter 
```
npm i 
``` 
This will install the necessary dependencies that allow the application to run
- Assuming the install happened without errors, enter the following to start the application
```
npx expo start
```
*** Important ***
You'll be presented with a menu to run the mobile app in different environments. It's important to note the following:
- If you're developing on an android simulator, You'll need to have Android Studio installed. For more information visit
```
https://developer.android.com/studio/install
```
- If you're developing on an IOS simulator, you'll need to install XCode. 
```
https://apps.apple.com/us/app/xcode/id497799835?mt=12
```
**<ins>Before Proceeding, review fake API set up below</ins>**

## Setting up the fake API (json-server)

Update the file `src/services/api.ts`.

Before running your 'json-server', get your computer's IP address and update your baseURL to `http://your_ip_address_here:3333` and then run:

```
npx json-server --watch db.json --port 3333 --host 192.168.0.20 -m ./node_modules/json-server-auth
```

To access your server online without running json-server locally, you can set your baseURL to:

```
https://my-json-server.typicode.com/<your-github-username>/<your-github-repo>
```

To use `my-json-server`, make sure your `db.json` is located at the repo root.

## Setting up the image upload API

Update the file `src/services/imageApi.ts`.

You can use any hosting service of your preference. In this case, we will use ImgBB API: https://api.imgbb.com/.
Sign up for free at https://imgbb.com/signup, get your API key and add it to the .env file in your root folder.

To run the app in your local environment, you will need to set the IMGBB_API_KEY when starting the app using:

```
IMGBB_API_KEY="insert_your_api_key_here" npx expo start
```

When creating your app build or publishing, import your secret values to EAS running:

```
eas secret:push
```

## Application Navigation

### Login Screen ###
<img src="screenshots/Login%20Splash%20Screen.png" alt="Login Screen" width="209" height="454">

- In Development, credentials are stored in the myJSON file which are accessed locally through the fake API. See above instructions for clarification

### Map Screen ###
<img src="screenshots/Main%20Map%20Screen.png" alt="Map Screen" width="209" height="454">

- Grey Icons show events that are full.
- Orange Icons show events that have spaces available.

To view each event, the user presses on the Volunteam placemarker 

### Event Screen ###
Example screens for each case 

**Event full**

<img src="screenshots/Example%20Event.png" alt="Event Screen" width="209" height="454">

**Available Spots**

<img src="screenshots/Available%20Spots.png" alt="Event Screen" width="209" height="454">

### Logging Out ##

To log out the user simply presses the log out button circled in red, below.
<img src="screenshots/Logout.png" alt="Event Screen" width=50% height=50%>
