import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import Login from "../pages/Login";
import EventsMap from "../pages/EventsMap";
import EventDetails from "../pages/EventDetails";

import { AuthenticationContext } from "../context/AuthenticationContext";
import { EventsProvider } from "../context/EventsContext";
import { User } from "../types/User";

export type RootStackParamList = {
  Login: undefined;
  EventsMap: undefined;
  EventDetails: { eventId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppStack() {
  const [authenticatedUser, setAuthenticatedUser] = useState<User>();

  const authenticationContextObj = {
    value: authenticatedUser,
    setValue: setAuthenticatedUser,
  };

  return (
    <AuthenticationContext.Provider value={authenticationContextObj}>
      <EventsProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: "#F2F3F5" },
            }}
            initialRouteName="Login"
          >
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="EventsMap" component={EventsMap} />
            <Stack.Screen name="EventDetails" component={EventDetails} />
          </Stack.Navigator>
        </NavigationContainer>
      </EventsProvider>
    </AuthenticationContext.Provider>
  );
}
