import React from "react";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { StatusBar } from "expo-status-bar";

import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";

import AppStack from "./src/routes/AppStack";
import { EventsProvider } from "./src/context/EventsContext";

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar animated translucent style="dark" />
      <ActionSheetProvider>
        <EventsProvider>
          <AppStack />
        </EventsProvider>
      </ActionSheetProvider>
    </>
  );
}
