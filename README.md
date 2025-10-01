# Volunteam App

## Running the App

1. Install dependencies:
   ```bash
   npm install

1-Start Expo:
npx expo start
Scan the QR code with Expo Go (on your phone) or press a to open the Android emulator.

2- Login:

For grading/demo: press Log in (login is mocked, no backend required).

You will see the Events Map screen with markers.


3-Fake API (Optional – json-server)

If you want to test real login with data from db.json:

a-Find your computer’s IP (ipconfig on Windows).

b-Edit src/services/api.ts → set baseURL:
export const api = axios.create({
  baseURL: 'http://<YOUR_IP>:3333',
});

c-Run json-server with auth:
npx json-server --watch db.json --port 3333 --host <YOUR_IP> -m ./node_modules/json-server-auth


(Optional) Hosted API 

Instead of running json-server, you can point your baseURL to Typicode:
https://my-json-server.typicode.com/<your-github-username>/<your-forked-repo>

This works in read-only mode.



Project Structure

App.tsx
db.json                # fake API data
src/
 ├── pages             # Login, EventsMap
 ├── routes            # AppStack.tsx (navigation)
 ├── components        # BigButton, Spacer
 ├── constants         # MapSettings
 ├── context           # AuthenticationContext
 ├── services          # api.ts, imageApi.ts
 └── types             # type declarations


















                                //original readme file
<!-- # Volunteam App

## Setting up the fake API (json-server)

Update the file `src/services/api.ts`.

Before running your 'json-server', get your computer's IP address and update your baseURL to `http://your_ip_address_here:3333` and then run:

```
npx json-server --watch db.json --port 3333 --host your_ip_address_here -m ./node_modules/json-server-auth
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
``` -->
