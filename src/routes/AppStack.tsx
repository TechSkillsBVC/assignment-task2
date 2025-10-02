import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainScreen from "../screens/MainScreen";
import EventDetailsScreen from "../screens/EventDetailsScreen";

export type RootStackParamList = {
  Main: undefined;
  EventDetails: { eventId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{ title: "Volunteam" }}
        />
        <Stack.Screen
          name="EventDetails"
          component={EventDetailsScreen}
          options={{ title: "Event details" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
