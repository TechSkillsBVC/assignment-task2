import React from "react";
import { Button } from "react-native";

type Props = { onPress: () => void; disabled?: boolean };

export default function VolunteerButton({ onPress, disabled }: Props) {
  return <Button title="Volunteer" onPress={onPress} disabled={disabled} />;
}
