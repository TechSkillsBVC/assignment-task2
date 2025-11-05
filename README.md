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



// PLEASE USE THIS ONE!!!!

# Voluntam - Volunteer Event Management App

A React Native mobile application for managing volunteer events in Calgary. Users can browse events on a map, view event details, and volunteer for opportunities.

## 📱 Features

- **Interactive Map**: View volunteer events on an interactive Google Maps interface
- **Event Discovery**: Browse upcoming volunteer opportunities
- **Dynamic Status**: Real-time event status (available, volunteered, full)
- **Contact Organizers**: Direct call/text functionality for event organizers
- **Event Details**: Comprehensive information including location, description, and volunteer requirements

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack Navigator)
- **Maps**: React Native Maps (Google Maps)
- **Authentication**: JSON Server Auth
- **State Management**: React Context API
- **Styling**: React Native StyleSheet

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development) or Xcode (for iOS development)

## 🚀 Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd assignment-task2
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Google Maps API Key

Add your Google Maps API key to `app.config.ts`:
```typescript
android: {
    package: 'com.yourcompany.volunteam',
    config: {
        googleMaps: {
            apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
        },
    },
},
```

### 4. Start JSON Server (Backend Mock)
```bash
npx json-server-auth db.json --port 3333 --host 0.0.0.0
```

### 5. Start the Expo development server

**For Emulator:**
```bash
npm start
# Then press 'a' for Android or 'i' for iOS
```

**For Real Device:**
```bash
npm start --tunnel
# Scan the QR code with Expo Go app
```

## 🔐 Login Credentials

Use these credentials to test the app:

- **Email**: `elif.aksit@example.com`
- **Password**: `password`

## 📂 Project Structure
```
assignment-task2/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── BigButton.tsx
│   │   └── Spacer.tsx
│   ├── constants/           # App constants and configuration
│   │   └── MapSettings.ts
│   ├── context/             # React Context providers
│   │   └── AuthenticationContext.tsx
│   ├── images/              # Image assets
│   │   ├── logo.png
│   │   ├── map-marker.png
│   │   ├── map-marker-blue.png
│   │   └── map-marker-grey.png
│   ├── pages/               # Screen components
│   │   ├── Login.tsx
│   │   ├── EventsMap.tsx
│   │   └── EventDetails.tsx
│   ├── services/            # API and caching services
│   │   ├── api.ts
│   │   └── caching.ts
│   ├── types/               # TypeScript type definitions
│   │   ├── Event.ts
│   │   └── User.ts
│   └── utils/               # Utility functions
│       └── index.ts
├── db.json                  # Mock database
├── app.config.ts            # Expo configuration
├── package.json
└── README.md
```

## 🗺️ Features Implementation

### Map Markers
- **Orange Marker**: Available event (user hasn't volunteered)
- **Blue Marker**: Event user has volunteered for
- **Grey Marker**: Event is full

### Event Details Status Display
- **Volunteered**: Shows checkmark icon with green background
- **Available**: Shows volunteer count with orange background
- **Full**: Shows slash icon with grey background

### Conditional Button Display

**Contact Buttons (Call/Text)**:
- Only shown for events the user has volunteered for

**Volunteer Button**:
- Only shown for events that are not full and user hasn't volunteered

**Share Button**:
- Shown for available events and events user has volunteered for
- Hidden for full events where user hasn't volunteered

## 🔄 API Endpoints

The app uses JSON Server Auth for backend mock:
```
POST   /login              - User authentication
GET    /events             - Fetch all events
GET    /events/:id         - Fetch specific event
GET    /users              - Fetch all users
GET    /users/:id          - Fetch specific user
```

## 📱 Screens

### 1. Login Screen
- Email/password authentication
- Form validation
- Error handling

### 2. Events Map Screen
- Interactive Google Maps
- Color-coded event markers
- Event counter footer
- Logout functionality

### 3. Event Details Screen
- Event information
- Date/time display
- Volunteer status
- Location map
- Contact organizer
- Action buttons (Call, Text, Share, Volunteer)

## 🧪 Testing

### Test User Credentials
- **Email**: `elif.aksit@example.com`
- **Password**: `password`
- **User ID**: `EF-BZ00`

### Test Scenarios

**Scenario 1: View Volunteered Event**
- Login with test credentials
- Click on "Downtown Vibe Live Music" or "Free Skating Lessons Day"
- Should show: Blue marker, "Volunteered" status, Call/Text/Share buttons

**Scenario 2: View Available Event**
- Click on any event with available spots
- Should show: Orange marker, volunteer count, Volunteer/Share buttons

**Scenario 3: View Full Event**
- Click on "Kids Programming Day"
- Should show: Grey marker, "Event Full" status, only Share button (if volunteered)

## 🐛 Known Issues

- Map markers may not be immediately visible in Android emulator - tap the orange "Fit Map" button to zoom to markers
- Google Maps requires billing-enabled API key for full functionality

## 🔮 Future Enhancements

- Implement actual volunteer registration
- Add event creation functionality
- User profile management
- Push notifications for event updates
- Event search and filtering
- Event categories

## 👥 Authors

- Your Name

## 📄 License

This project is created for educational purposes as part of an assignment.

## 🙏 Acknowledgments

- Expo team for the excellent development platform
- React Native community
- Google Maps Platform

## 📞 Support

For issues or questions, please contact [your-email@example.com]