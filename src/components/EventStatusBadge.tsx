import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Event } from "../types/Event";

type Props = { event: Event; currentUserId: string };

export default function EventStatusBadge({ event, currentUserId }: Props) {
  const applied = event.volunteers.includes(currentUserId);
  const count = event.volunteers.length;
  const isFull = count >= event.requiredVolunteers;
  const label = applied
    ? "volunteered"
    : isFull
    ? "team is full"
    : `${count} / ${event.requiredVolunteers}`;
  const style = applied ? styles.applied : isFull ? styles.full : styles.open;
  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  text: { color: "white", fontWeight: "700" },
  applied: { backgroundColor: "#0ea5e9" },
  full: { backgroundColor: "#ef4444" },
  open: { backgroundColor: "#16a34a" },
});
