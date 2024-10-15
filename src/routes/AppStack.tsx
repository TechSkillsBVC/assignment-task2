import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import Login from '../pages/Login';
import EventsMap from '../pages/EventsMap';
import EventDetails from '../pages/EventDetails';
import CreateEvent from '../pages/CreateEvent';
import { AuthenticationContext, AuthenticationContextObject } from '../context/AuthenticationContext';
import { User } from '../types/User';

type RootStackParamList = {
  Login: undefined;
  EventsMap: undefined;
  EventDetails: { eventId: string };
  CreateEvent: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppStack() {
  const [authenticatedUser, setAuthenticatedUser] = useState<User>();

  const authenticationContextObj: AuthenticationContextObject = {
    value: authenticatedUser as User,
    setValue: setAuthenticatedUser,
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthenticationContext.Provider value={authenticationContextObj}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          >
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="EventsMap" component={EventsMap} />
            <Stack.Screen name="EventDetails" component={EventDetails} />
            <Stack.Screen name="CreateEvent" component={CreateEvent} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthenticationContext.Provider>
    </GestureHandlerRootView>
  );
}
