import React from "react";
import { View, Button, Platform, Linking, Alert } from "react-native";

type Props = { phone?: string; title: string };

export default function ContactButtons({ phone, title }: Props) {
  const onCall = () => {
    if (!phone) return Alert.alert("No phone available");
    Linking.openURL(`tel:${phone}`);
  };
  const onText = () => {
    if (!phone) return Alert.alert("No phone available");
    const body = encodeURIComponent(`Hi, I'm interested in: ${title}`);
    const url = Platform.select({
      ios: `sms:&body=${body}`,
      android: `sms:${phone}?body=${body}`,
      default: `sms:${phone}?body=${body}`,
    })!;
    Linking.openURL(url);
  };
  return (
    <View style={{ flexDirection: "row" }}>
      <Button title="Call" onPress={onCall} />
      <Button title="Text" onPress={onText} />
    </View>
  );
}
