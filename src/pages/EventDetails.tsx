import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Linking,
  Share,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { RectButton } from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = StackScreenProps<any, "EventDetails">;

interface Event {
  id: string;
  name: string;
  description: string;
  organizerId: string;
  dateTime: string;
  imageUrl?: string;
  position: { latitude: number; longitude: number };
  volunteersNeeded: number;
  volunteersIds: string[];
}

interface User {
  id: string;
  email: string;
  mobile?: string;
  name?: { first?: string; last?: string } | string;
}

const API_BASE = "http://192.168.1.89:3333"; // local json server address

export default function EventDetails({ route, navigation }: Props) {
  const { eventId } = route.params as { eventId: string };

  const [event, setEvent] = useState<Event | null>(null);
  const [organizer, setOrganizer] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // load event, organizer, and current user id
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        // current user id from AsyncStorage (saved at login)
        const info = await AsyncStorage.getItem("userInfo");
        if (info) {
          const parsed = JSON.parse(info);
          setUserId(parsed?.id ?? null);
        }

        // fetch event
        const eventRes = await fetch(`${API_BASE}/events/${eventId}`);
        const eventJson: Event = await eventRes.json();
        if (cancelled) return;
        setEvent(eventJson);

        // fetch organizer by id from /users/:id
        if (eventJson?.organizerId) {
          const userRes = await fetch(`${API_BASE}/users/${eventJson.organizerId}`);
          const userJson: User = await userRes.json();
          if (!cancelled) setOrganizer(userJson ?? null);
        }
      } catch (err) {
        Alert.alert("Error", "Failed to load event details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const isVolunteered = useMemo(() => {
    if (!event || !userId) return false;
    return event.volunteersIds?.includes(userId);
  }, [event, userId]);

  const isFull = useMemo(() => {
    if (!event) return false;
    return (event.volunteersIds?.length ?? 0) >= (event.volunteersNeeded ?? 0);
  }, [event]);

  const organizerName = useMemo(() => {
    if (!organizer?.name) return organizer?.email ?? "Unknown";
    if (typeof organizer.name === "string") return organizer.name;
    const f = organizer.name.first ?? "";
    const l = organizer.name.last ?? "";
    const full = `${f} ${l}`.trim();
    return full.length ? full : organizer.email ?? "Unknown";
  }, [organizer]);

  const organizerPhone = organizer?.mobile?.replace(/[^\d+]/g, "") ?? "";

  const handleShare = async () => {
    if (!event) return;
    try {
      await Share.share({
        message: `Join me at ${event.name} on ${new Date(event.dateTime).toLocaleString()}!`,
      });
    } catch {
      Alert.alert("Error", "Could not share event.");
    }
  };

  const handleVolunteer = async () => {
    if (!event) return;
    if (!userId) {
      Alert.alert("Login required", "You must log in to volunteer.");
      return;
    }
    if (isVolunteered || isFull) return;

    try {
      const updated = {
        volunteersIds: [...(event.volunteersIds ?? []), userId],
      };
      await fetch(`${API_BASE}/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      setEvent({ ...event, ...updated });
      Alert.alert("Success", "You have volunteered for this event!");
    } catch {
      Alert.alert("Error", "Could not update volunteering status.");
    }
  };

  const handleCall = () => {
    if (!organizerPhone) {
      Alert.alert("Unavailable", "Organizer phone number not provided.");
      return;
    }
    Linking.openURL(`tel:${organizerPhone}`);
  };

  const handleText = () => {
    if (!organizerPhone) {
      Alert.alert("Unavailable", "Organizer phone number not provided.");
      return;
    }
    Linking.openURL(`sms:${organizerPhone}`);
  };

  const handleDirections = () => {
    if (!event) return;
    const { latitude, longitude } = event.position;
    const url =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?daddr=${latitude},${longitude}`
        : `http://maps.google.com/?daddr=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <Text>Event not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <RectButton onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={28} color="#4D6F80" />
        </RectButton>
        <Text style={styles.headerTitle}>Event</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Image
          source={{
            uri:
              event.imageUrl ??
              "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1600&auto=format&fit=crop",
          }}
          style={styles.image}
        />

        <View style={styles.content}>
          <Text style={styles.title}>{event.name}</Text>
          <Text style={styles.organizer}>organized by {organizerName}</Text>
          <Text style={styles.description}>{event.description}</Text>

          {/* Date + Status */}
          <View style={styles.row}>
            <View style={styles.dateBox}>
              <Feather name="calendar" size={16} color="#00A3FF" />
              <Text style={styles.dateText}>{new Date(event.dateTime).toLocaleString()}</Text>
            </View>

            {isVolunteered ? (
              <View style={[styles.statusBox, { backgroundColor: "#E6F4FF" }]}>
                <Feather name="check" size={16} color="#00A3FF" />
                <Text style={[styles.statusText, { color: "#00A3FF" }]}>Volunteered</Text>
              </View>
            ) : isFull ? (
              <View style={[styles.statusBox, { backgroundColor: "#F1F5F9" }]}>
                <Text style={[styles.statusText, { color: "#8FA7B3" }]}>Team is full</Text>
              </View>
            ) : (
              <View style={[styles.statusBox, { backgroundColor: "#FFF4E6" }]}>
                <Text style={[styles.statusText, { color: "#FF9500" }]}>
                  {event.volunteersIds.length} of {event.volunteersNeeded} needed
                </Text>
              </View>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.actionsRow}>
            {/* Share (visible if not full OR volunteered) */}
            {(!isFull || isVolunteered) && (
              <RectButton style={[styles.actionButton, { backgroundColor: "#00A3FF" }]} onPress={handleShare}>
                <Feather name="share-2" size={18} color="#FFF" />
                <Text style={styles.buttonLabel}>Share</Text>
              </RectButton>
            )}

            {/* Volunteer (only if open) */}
            {!isVolunteered && !isFull && (
              <RectButton style={[styles.actionButton, { backgroundColor: "#FF9500" }]} onPress={handleVolunteer}>
                <Feather name="plus" size={18} color="#FFF" />
                <Text style={styles.buttonLabel}>Volunteer</Text>
              </RectButton>
            )}

            {/* Call/Text (only if volunteered) */}
            {isVolunteered && (
              <>
                <RectButton style={[styles.actionButton, { backgroundColor: "#34C759" }]} onPress={handleCall}>
                  <Feather name="phone" size={18} color="#FFF" />
                  <Text style={styles.buttonLabel}>Call</Text>
                </RectButton>
                <RectButton style={[styles.actionButton, { backgroundColor: "#5856D6" }]} onPress={handleText}>
                  <Feather name="message-circle" size={18} color="#FFF" />
                  <Text style={styles.buttonLabel}>Text</Text>
                </RectButton>
              </>
            )}
          </View>

          {/* Mini map */}
          <MapView
            style={styles.miniMap}
            pointerEvents="none"
            initialRegion={{
              latitude: event.position.latitude,
              longitude: event.position.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker coordinate={event.position}>
              <Feather name="map-pin" size={24} color="#FF9500" />
            </Marker>
          </MapView>
        </View>
      </ScrollView>

      <RectButton style={styles.ctaButton} onPress={handleDirections}>
        <Text style={styles.ctaText}>Get Directions to Event</Text>
      </RectButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F3F5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  backButton: { padding: 6, marginRight: 10 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#4D6F80", paddingTop: 6 },
  image: { width: "100%", height: 200 },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: "800", color: "#3D5A6C" },
  organizer: { fontSize: 13, color: "#8FA7B3", marginTop: 2, marginBottom: 8 },
  description: { fontSize: 15, color: "#5C6B73", marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  dateBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F4FF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  dateText: { marginLeft: 6, color: "#00A3FF", fontWeight: "700" },
  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: { fontWeight: "700", marginLeft: 6 },
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
  buttonLabel: { color: "#FFF", fontWeight: "700", marginLeft: 6 },
  miniMap: { height: 150, borderRadius: 12, marginTop: 8, overflow: "hidden" },
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
  ctaText: { color: "#FFF", fontWeight: "800", fontSize: 16 },
});
