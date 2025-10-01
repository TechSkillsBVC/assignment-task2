import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
  Linking,
  StatusBar,
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { Feather } from "@expo/vector-icons";
import { RectButton } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import eventsRaw from "../../db.json";
import { AuthenticationContext } from "../context/AuthenticationContext";
import { Event } from "../types/Event";

type RootStackParamList = {
  EventDetails: { eventId: string };
};

type Props = StackScreenProps<RootStackParamList, "EventDetails">;

export default function EventDetails({ route, navigation }: Props) {
  const { eventId } = route.params;
  const auth = useContext(AuthenticationContext);
  const currentUser = auth?.value;

  const eventsData = eventsRaw as { events: Event[] };
  const eventOriginal = eventsData.events.find((e) => e.id === eventId);

  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      if (!eventOriginal) return;

      const saved = await AsyncStorage.getItem(`event-${eventOriginal.id}`);
      if (saved) {
        setEvent(JSON.parse(saved));
      } else {
        setEvent(eventOriginal);
      }
    };

    loadEvent();
  }, [eventOriginal]);

  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Event not found.</Text>
      </View>
    );
  }

  const isUserVolunteered = currentUser
    ? event.volunteersIds.includes(currentUser.id)
    : false;
  const isFull = event.volunteersIds.length >= event.volunteersNeeded;

  let statusText = "";
  if (isUserVolunteered) {
    statusText = "Volunteered";
  } else if (isFull) {
    statusText = "Team is full";
  } else {
    statusText = `${event.volunteersIds.length} / ${event.volunteersNeeded} volunteers`;
  }

  const handleVolunteer = async () => {
    if (!currentUser) return Alert.alert("Error", "No user logged in");
    if (isFull) return Alert.alert("Team is full");
    if (isUserVolunteered) return;

    const updatedEvent = {
      ...event,
      volunteersIds: [...event.volunteersIds, currentUser.id],
    };

    setEvent(updatedEvent);
    await AsyncStorage.setItem(
      `event-${event.id}`,
      JSON.stringify(updatedEvent)
    );
    Alert.alert("Success", "You have volunteered!");
  };

  const handleCall = () => {
    Linking.openURL("tel:1234567890").catch(() =>
      Alert.alert("Error", "Unable to open dialer")
    );
  };

  const handleText = () => {
    Linking.openURL("sms:1234567890").catch(() =>
      Alert.alert("Error", "Unable to open messaging app")
    );
  };

  const handleShare = () => {
    Share.share({
      message: `Check out this event: ${event.name}\n${event.description}`,
    });
  };

  const handleShowRoute = () => {
    const { latitude, longitude } = event.position;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Unable to open maps")
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        padding: 16,
        paddingTop: StatusBar.currentHeight || 50,
      }}
    >
      {/* --- BACK BUTTON */}
      {/*
      <RectButton
        style={[styles.backButton, styles.smallButton, { backgroundColor: "#4D6F80" }]}
        onPress={() => navigation.goBack()}
      >
        <Feather name="arrow-left" size={20} color="#FFF" />
      </RectButton>
      */}

      <Image source={{ uri: event.imageUrl }} style={styles.image} />

      <Text style={styles.title}>{event.name}</Text>
      <Text style={styles.date}>
        {new Date(event.dateTime).toLocaleString()}
      </Text>
      <Text style={styles.description}>{event.description}</Text>

      <View style={styles.statusBox}>
        <Text style={styles.status}>{statusText}</Text>
      </View>

      <View style={styles.buttonRow}>
        {!isFull && !isUserVolunteered && (
          <RectButton style={styles.actionButton} onPress={handleVolunteer}>
            <Text style={styles.actionButtonText}>Volunteer</Text>
          </RectButton>
        )}

        {isUserVolunteered && (
          <>
            <RectButton style={styles.iconButton} onPress={handleCall}>
              <Feather name="phone" size={20} color="white" />
            </RectButton>
            <RectButton style={styles.iconButton} onPress={handleText}>
              <Feather name="message-circle" size={20} color="white" />
            </RectButton>
          </>
        )}

        {(!isFull || isUserVolunteered) && (
          <RectButton style={styles.iconButton} onPress={handleShare}>
            <Feather name="share-2" size={20} color="white" />
          </RectButton>
        )}

        <RectButton style={styles.iconButton} onPress={handleShowRoute}>
          <Feather name="map-pin" size={20} color="white" />
        </RectButton>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { fontSize: 18, color: "red" },
  backButton: {
    position: "absolute",
    top: 70,
    left: 24,
    elevation: 3,
    zIndex: 10,
  },
  smallButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  image: { width: "100%", height: 220, borderRadius: 12, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  date: { fontSize: 14, color: "#666", marginBottom: 12 },
  description: { fontSize: 16, color: "#444", marginBottom: 16 },
  statusBox: {
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  status: { fontSize: 16, fontWeight: "600" },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  actionButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonText: { color: "white", fontWeight: "600" },
  iconButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 50,
  },
});
