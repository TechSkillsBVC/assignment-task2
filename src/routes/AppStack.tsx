import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthenticationContext, AuthenticationContextObject } from '../context/AuthenticationContext';
import { User } from '../types/User';

import Login from '../pages/Login';
import EventsMap from '../pages/EventsMap';
import EventDetails from '../pages/EventDetails'; // Added EventDetails screen

// Define the param list for the stack navigator
type RootStackParamList = {
  Login: undefined;
  EventsMap: undefined;
  EventDetails: { eventId: string }; // eventId is required for EventDetails screen
};

const Stack = createStackNavigator<RootStackParamList>();

export default function Routes() {
  const [authenticatedUser, setAuthenticatedUser] = useState<User | undefined>(undefined);

  const authenticationContextObj: AuthenticationContextObject = {
    value: authenticatedUser as User,
    setValue: setAuthenticatedUser,
  };

  return (
    <AuthenticationContext.Provider value={authenticationContextObj}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#FAFAFA' }, // Default background color
            gestureEnabled: true,
            animationEnabled: true,
            gestureDirection: 'horizontal',
            cardOverlayEnabled: true,
          }}
        >
          {/* Define the Login screen */}
          <Stack.Screen name="Login" component={Login} />

          {/* Define the EventsMap screen with a conditional animation for authenticated users */}
          <Stack.Screen 
            name="EventsMap" 
            component={EventsMap} 
            options={{
              animationTypeForReplace: authenticatedUser ? 'push' : 'pop',
              cardStyle: { backgroundColor: '#EAEDED' }, // Custom background color for EventsMap
            }}
          />

          {/* Define EventDetails screen */}
          <Stack.Screen 
            name="EventDetails" 
            component={EventDetails} 
            options={{
              cardStyle: { backgroundColor: '#FFF' }, // Default background color for EventDetails
            }}
            // Ensure params are passed correctly
            initialParams={{ eventId: '' }} // Initial param setup (if needed)
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthenticationContext.Provider>
  );
}
