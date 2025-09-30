import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
  Linking,
  Alert,
  Share,
} from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import * as Haptics from "expo-haptics";

import { EventsContext } from "../context/EventsContext";
import { AuthenticationContext } from "../context/AuthenticationContext";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../routes/AppStack";

type Props = StackScreenProps<RootStackParamList, "EventDetails">;

export default function EventDetails({ route, navigation }: Props) {
  const { eventId } = route.params;
  const { events, addVolunteer } = useContext(EventsContext);
  const authContext = useContext(AuthenticationContext);
  const user = authContext?.value;

  const event = events.find((e) => e.id === eventId);
  if (!event) return <Text>Event not found</Text>;

  const alreadyVolunteered = user
    ? event.volunteers.some((v) => v.id === user.id)
    : false;
  const isFull = event.volunteers.length >= event.requiredVolunteers;

  const handleVolunteer = () => {
    if (!user)
      return Alert.alert("Login required", "You must log in to volunteer.");
    if (alreadyVolunteered || isFull) return;

    addVolunteer(event.id, {
      id: user.id,
      name:
        typeof user.name === "string"
          ? user.name
          : `${user.name.first} ${user.name.last}`,
      phone: user.phone,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Success", "You have volunteered for this event!");
  };

  const handleCall = () => Linking.openURL(`tel:${event.contactPhone}`);
  const handleText = () => Linking.openURL(`sms:${event.contactPhone}`);
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me at ${event.title} on ${event.date} at ${event.time}!`,
      });
    } catch {
      Alert.alert("Error", "Could not share event.");
    }
  };
  const handleShowRoutes = () => {
    const url =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?daddr=${event.position.latitude},${event.position.longitude}`
        : `http://maps.google.com/?daddr=${event.position.latitude},${event.position.longitude}`;
    Linking.openURL(url);
  };

  const renderStatusBox = () => {
    if (alreadyVolunteered)
      return (
        <View style={[styles.statusBox, { backgroundColor: "#E6F4FF" }]}>
          <Feather name="check" size={16} color="#00A3FF" />
          <Text style={[styles.statusText, { color: "#00A3FF" }]}>
            Volunteered
          </Text>
        </View>
      );
    if (isFull)
      return (
        <View style={[styles.statusBox, { backgroundColor: "#F1F5F9" }]}>
          <Text style={[styles.statusText, { color: "#8FA7B3" }]}>
            Team is full
          </Text>
        </View>
      );
    return (
      <View style={[styles.statusBox, { backgroundColor: "#FFF4E6" }]}>
        <Text style={[styles.statusText, { color: "#FF9500" }]}>
          {event.volunteers.length} of {event.requiredVolunteers} needed
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <RectButton
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={30} color="#333" />
        </RectButton>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Image source={{ uri: event.imageUrl }} style={styles.image} />

        <View style={styles.content}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.organizer}>organized by {event.organizer}</Text>
          <Text style={styles.description}>{event.description}</Text>

          <View style={styles.row}>
            <View style={styles.dateBox}>
              <Feather name="calendar" size={16} color="#00A3FF" />
              <Text style={styles.dateText}>
                {event.date} {event.time}
              </Text>
            </View>
            {renderStatusBox()}
          </View>

          <View style={styles.actionsRow}>
            {(alreadyVolunteered || !isFull) && (
              <RectButton
                style={[styles.actionButton, { backgroundColor: "#00A3FF" }]}
                onPress={handleShare}
              >
                <Feather name="share-2" size={18} color="#FFF" />
                <Text style={styles.buttonLabel}>Share</Text>
              </RectButton>
            )}
            {!alreadyVolunteered && !isFull && (
              <RectButton
                style={[styles.actionButton, { backgroundColor: "#FF9500" }]}
                onPress={handleVolunteer}
              >
                <Feather name="plus" size={18} color="#FFF" />
                <Text style={styles.buttonLabel}>Volunteer</Text>
              </RectButton>
            )}
            {alreadyVolunteered && (
              <>
                <RectButton
                  style={[styles.actionButton, { backgroundColor: "#34C759" }]}
                  onPress={handleCall}
                >
                  <Feather name="phone" size={18} color="#FFF" />
                  <Text style={styles.buttonLabel}>Call</Text>
                </RectButton>
                <RectButton
                  style={[styles.actionButton, { backgroundColor: "#5856D6" }]}
                  onPress={handleText}
                >
                  <Feather name="message-circle" size={18} color="#FFF" />
                  <Text style={styles.buttonLabel}>Text</Text>
                </RectButton>
              </>
            )}
          </View>

          <MapView
            style={styles.miniMap}
            initialRegion={{
              latitude: event.position.latitude,
              longitude: event.position.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            pointerEvents="none"
          >
            <Marker coordinate={event.position}>
              <Feather name="map-pin" size={24} color="#FF9500" />
            </Marker>
          </MapView>
        </View>
      </ScrollView>

      <RectButton style={styles.ctaButton} onPress={handleShowRoutes}>
        <Text style={styles.ctaText}>Get Directions to Event</Text>
      </RectButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  backButton: { marginRight: 12, padding: 4 },
  headerTitle: {
    paddingTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  image: { width: "100%", height: 200 },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: "700", color: "#333" },
  organizer: { fontSize: 14, color: "#8FA7B3", marginBottom: 8 },
  description: { fontSize: 16, color: "#555", marginBottom: 16 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  dateBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F4FF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  dateText: { marginLeft: 6, color: "#00A3FF", fontWeight: "600" },
  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: { fontWeight: "600", marginLeft: 6 },
  actionsRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 12,
    marginBottom: 12,
  },
  buttonLabel: { color: "#FFF", fontWeight: "600", marginLeft: 6 },
  miniMap: { height: 150, borderRadius: 12, marginTop: 8 },
  ctaButton: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#00A3FF",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    elevation: 3,
  },
  ctaText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});
