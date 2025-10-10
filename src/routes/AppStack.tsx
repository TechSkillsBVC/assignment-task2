import React, { useState } from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

type RootStackParamList = {
  Login: undefined;
  EventsMap: undefined;
  EventDetails: { event: any };
};

const { Navigator, Screen } = createStackNavigator<RootStackParamList>();

import Login from "../pages/Login";
import EventsMap from "../pages/EventsMap";
import {
  AuthenticationContext,
  AuthenticationContextObject,
} from "../context/AuthenticationContext";
import { User } from "../types/User";
import EventDetails from "../pages/EventDetails";

export default function Routes() {
  const [authenticatedUser, setAuthenticatedUser] = useState<User>();

  const authenticationContextObj: AuthenticationContextObject = {
    value: authenticatedUser as User,
    setValue: setAuthenticatedUser,
  };

  return (
    <AuthenticationContext.Provider value={authenticationContextObj}>
      <NavigationContainer>
        <Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: "#F2F3F5" },
          }}
        >
          <Screen name="Login" component={Login} />

          <Screen name="EventsMap" component={EventsMap} />

          <Screen name="EventDetails" component={EventDetails} />
        </Navigator>
      </NavigationContainer>
    </AuthenticationContext.Provider>
  );
}
