import React, { useMemo, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Share,
  Platform,
  Linking,
  ScrollView,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../routes/AppStack";
import { useEvents } from "../hooks/useEvents";
import { useCurrentUser } from "../hooks/useCurrentUser";
import api from "../services/api";
import EventStatusBadge from "../components/EventStatusBadge";
import ContactButtons from "../components/ContactButtons";
import VolunteerButton from "../components/VolunteerButton";

type Props = NativeStackScreenProps<RootStackParamList, "EventDetails">;
type User = { id: string; mobile?: string };

export default function EventDetailsScreen({ route, navigation }: Props) {
  const { eventId } = route.params;
  const { events, applyToEvent, unapplyFromEvent } = useEvents();
  const { id: currentUserId } = useCurrentUser();
  const ev = useMemo(
    () => events.find((e) => e.id === eventId),
    [events, eventId]
  );
  const [organizerPhone, setOrganizerPhone] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    (async () => {
      if (!ev?.organizerId) return;
      try {
        const res = await api.get<User[]>("/users");
        const org = res.data.find((u) => u.id === ev.organizerId);
        setOrganizerPhone(org?.mobile);
      } catch {}
    })();
  }, [ev?.organizerId]);

  if (!ev)
    return (
      <View style={styles.container}>
        <Text>Event not found.</Text>
      </View>
    );

  const applied = ev.volunteers.includes(currentUserId);
  const count = ev.volunteers.length;
  const isFull = count >= ev.requiredVolunteers;

  const canContact = applied;
  const canVolunteer = !applied && !isFull;
  const canShare = !isFull || applied;

  const onVolunteer = async () => {
    await applyToEvent(ev.id, currentUserId);
  };
  const onUnapply = async () => {
    await unapplyFromEvent(ev.id, currentUserId);
  };

  const onShare = async () => {
    const message = `${ev.title}\n\n${ev.description ?? ""}\n\nLocation: ${
      ev.latitude
    }, ${ev.longitude}`;
    await Share.share({ message });
  };

  const onRoute = () => {
    const dest = `${ev.latitude},${ev.longitude}`;
    const url = Platform.select({
      ios: `http://maps.apple.com/?daddr=${dest}`,
      android: `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${dest}`,
    })!;
    Linking.openURL(url);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{ev.title}</Text>
      <EventStatusBadge event={ev} currentUserId={currentUserId} />
      {ev.description ? (
        <Text style={styles.desc}>{ev.description}</Text>
      ) : null}
      <View style={styles.row}>
        <Button title="Route" onPress={onRoute} />
        {canShare && <Button title="Share" onPress={onShare} />}
      </View>
      {canContact && (
        <View style={styles.section}>
          <ContactButtons phone={organizerPhone} title={ev.title} />
        </View>
      )}
      {canVolunteer && (
        <View style={styles.section}>
          <VolunteerButton onPress={onVolunteer} />
        </View>
      )}
      {applied && (
        <View style={styles.section}>
          <Button title="Withdraw" color="#ef4444" onPress={onUnapply} />
        </View>
      )}
      <View style={{ height: 32 }} />
      <Button title="Back to Map" onPress={() => navigation.navigate("Main")} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  desc: { marginTop: 8, color: "#374151" },
  row: { flexDirection: "row", gap: 12, marginTop: 12 },
  section: { marginTop: 20 },
});
