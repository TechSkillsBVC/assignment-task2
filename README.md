# Volunteam App

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
```


## Project 1.2 — Event details

### Run locally

1. Install Node.js and run `npm install --legacy-peer-deps` in the project folder.
2. Run `npm run api` in one terminal. For a physical phone, find the computer's LAN IPv4 address with `ipconfig`; keep both devices on the same Wi-Fi.
3. In a second PowerShell terminal, set `$env:EXPO_PUBLIC_API_URL="http://YOUR_LAN_IP:3333"`, then run `npx expo start --clear`. Android emulator users can use `http://10.0.2.2:3333`.
4. This starter uses Expo SDK 47. Use a compatible Android emulator/client or development build. Current Expo Go may require an SDK upgrade; this assessment preserves the starter dependency versions.
5. Sign in with a supplied test account. If its password is unknown, create a test account through the local json-server-auth `/register` endpoint. The new user can volunteer for the open skating event. Do not use personal passwords.

Example PowerShell test registration (while the API is running):

```powershell
$body = @{ email = "student@example.com"; password = "Demo123456"; name = @{ first = "Demo"; last = "Student" }; mobile = "4035550100" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3333/register" -Method Post -ContentType "application/json" -Body $body
```

### Implementation and design

- Typed stack navigation passes an event ID as a route param. Details read the latest event from shared React context, rather than a stale copy from navigation.
- Presentational `EventStatus`, `EventActions`, and `EventMarker` components receive props and event callbacks. The existing `BigButton` is reused and now honors its disabled state.
- Blue means volunteered; orange means available; grey means full. Applied status takes precedence even when the team becomes full. Contact actions appear only for volunteers; share remains available for them after the team fills.
- Volunteering is saved in AsyncStorage before the UI updates, so failures can be retried. Storage is device-local demo data, not a multi-user backend. Clear app data to reset registrations.
- The main map fits upcoming events and the granted device location on load and every return. Denied location permission still allows viewing events. The footer reflects total upcoming events and those the current user can join.
- The footer crosshair recenters the map. Event creation is a later task and is outside Project 1.2.
- Call and text open the organizer's phone/SMS apps; share opens the native share sheet; directions opens Google Maps directions. Fixture phone numbers are sample data.
- Original 2023 sample event dates have been moved to January/February 2027 to keep three events visible for this assessment. The explicit past-event fixture stays unchanged and is excluded.
- No third-party dependencies were added. Existing navigation, maps, location, AsyncStorage, icons, and fonts are reused; native Linking and Share handle actions with no new bundle dependency.

### Validation

Verified in this workspace: TypeScript checks, event-state tests, and Android Metro export (2.19 MB JavaScript bundle) passed. Native device and visual checks remain outstanding. Run `npm run typecheck` and `npm test`. Tests cover availability, applied/full precedence, last-place registration, duplicate registration, capacity limits, immutable updates, and past-event filtering.

On a device, verify these cases:

1. Tap each marker and return to confirm map fitting.
2. With Ulla (`EF-BZ00`), skating and programming are volunteered; live music is full.
3. With Yasemin (`Q5bVHgP`), programming is volunteered, skating is open, and live music is full.
4. Volunteer for skating: status and marker turn blue, Call/Text appear, and Volunteer disappears. Restart the app to check persistence.
5. Verify native Share, Call, Text, and Directions on a phone; cancel each native action if appropriate.
6. Deny location permission and confirm the event map still loads.

### Submit a pull request

Fork https://github.com/TechSkillsBVC/assignment-task2 into your GitHub account. Copy this project's files into your cloned fork, create a branch, commit and push:

```bash
git switch -c project-1-2-event-details
git add .
git commit -m "Implement Project 1.2 event details and state handling"
git push -u origin project-1-2-event-details
```

On GitHub, open a pull request targeting `TechSkillsBVC/assignment-task2`, base branch `main`, from your fork's `project-1-2-event-details` branch. Paste the PR URL into the D2L submission comments.

The screenshots supplied with the assessment show the overall design at low zoom; colors, Nunito typography, layout, status boxes, and actions follow the available reference. Final visual and native action checks must be performed on a device.
