import React from "react";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";

import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";

import AppStack from "./src/routes/AppStack";
import { StatusBar } from "expo-status-bar";

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  } else {
    return (
      <>
        <StatusBar animated translucent style="dark" />
        <ActionSheetProvider>
          <AppStack />
        </ActionSheetProvider>
      </>
    );
  }
}
