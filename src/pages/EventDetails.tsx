import React, { useContext, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Feather } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import { AuthenticationContext } from "../context/AuthenticationContext";
import { User } from "../types/User";
import mapMarkerImg from "../images/map-marker.png";
import axios from "axios";

const apiBase = "http://10.0.0.33:3333";

type RootStackParamList = {
  EventsMap: undefined;
  EventDetails: { event: any };
};

type Props = StackScreenProps<RootStackParamList, "EventDetails">;

export default function EventDetails({ route, navigation }: Props) {
  const { event: initialEvent } = route.params;
  const authContext = useContext(AuthenticationContext);
  const currentUser = authContext?.value as User;
  const [event, setEvent] = useState(initialEvent);

  const isVolunteered = event.volunteersIds.includes(currentUser?.id);
  const isFull = event.volunteersIds.length >= event.volunteersNeeded;

  let statusColor = "#00A3FF";
  let statusBorder = "#0064B3";
  let statusIcon: keyof typeof Feather.glyphMap = "check";
  let statusText = "Volunteered";

  if (isFull) {
    statusColor = "#BFC3C9";
    statusBorder = "#7B7E82";
    statusIcon = "x-circle";
    statusText = "Team is full";
  } else if (!isVolunteered) {
    const joined = event.volunteersIds.length;
    const total = event.volunteersNeeded;
    statusColor = joined > 0 ? "#FFB347" : "#00A3FF";
    statusBorder = joined > 0 ? "#E28A00" : "#0064B3";
    statusIcon = "users";
    statusText = `${joined}/${total} joined`;
  }

  const openDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${event.position.latitude},${event.position.longitude}`;
    Linking.openURL(url);
  };

  const callOrganizer = () => Linking.openURL(`tel:${currentUser?.mobile}`);
  const textOrganizer = () => Linking.openURL(`sms:${currentUser?.mobile}`);
  const shareEvent = () =>
    Linking.openURL(`mailto:?subject=${event.name}&body=${event.description}`);

  const handleVolunteer = async () => {
    try {
      const updated = {
        ...event,
        volunteersIds: [...event.volunteersIds, currentUser.id],
      };
      await axios.patch(`${apiBase}/events/${event.id}`, updated);
      setEvent(updated);
      Alert.alert("Success", "You have volunteered for this event!");
    } catch {
      Alert.alert("Error", "Could not register you for this event.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#00A3FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Banner */}
      <Image source={{ uri: event.imageUrl }} style={styles.headerImage} />

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{event.name}</Text>
        <Text style={styles.subtitle}>
          organized by <Text style={styles.bold}>Robert Last</Text>
        </Text>
        <Text style={styles.description}>{event.description}</Text>

        {/* Info Boxes */}
        <View style={styles.row}>
          <View style={styles.column}>
            <LinearGradient
              colors={["#E8F5FF", "#D9EDFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.infoBox, { borderColor: "#0077CC" }]}
            >
              <Feather name="calendar" size={20} color="#0077CC" />
              <Text style={[styles.infoText, { color: "#031A62" }]}>
                {`${new Date(event.dateTime).toLocaleDateString()}\n${new Date(
                  event.dateTime
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`}
              </Text>
            </LinearGradient>
          </View>

          <View style={styles.column}>
            <View
              style={[
                styles.infoBox,
                {
                  backgroundColor: statusColor,
                  borderColor: statusBorder,
                },
              ]}
            >
              <Feather name={statusIcon} size={20} color="#fff" />
              <Text style={[styles.infoText, { color: "#fff" }]}>
                {statusText}
              </Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        {!isFull && (
          <>
            {!isVolunteered ? (
              <View style={styles.row}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.blueButton,
                    { flex: 1, marginRight: 8 },
                  ]}
                  onPress={shareEvent}
                >
                  <Feather name="share-2" size={20} color="#fff" />
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.orangeButton,
                    { flex: 1, marginLeft: 8 },
                  ]}
                  onPress={handleVolunteer}
                >
                  <Feather name="plus" size={20} color="#fff" />
                  <Text style={styles.actionText}>Volunteer</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.row, { marginTop: 10 }]}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.blueButton,
                    styles.equalButton,
                  ]}
                  onPress={shareEvent}
                >
                  <Feather name="share-2" size={20} color="#fff" />
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.blueButton,
                    styles.equalButton,
                  ]}
                  onPress={callOrganizer}
                >
                  <Feather name="phone" size={20} color="#fff" />
                  <Text style={styles.actionText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.blueButton,
                    styles.equalButton,
                  ]}
                  onPress={textOrganizer}
                >
                  <Feather name="message-square" size={20} color="#fff" />
                  <Text style={styles.actionText}>Text</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>

      {/* Map + Directions */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.mapStyle}
          initialRegion={{
            latitude: event.position.latitude,
            longitude: event.position.longitude,
            latitudeDelta: 0.008,
            longitudeDelta: 0.008,
          }}
          zoomEnabled={false}
          pitchEnabled={false}
          scrollEnabled={false}
          rotateEnabled={false}
        >
          <Marker
            icon={mapMarkerImg}
            coordinate={{
              latitude: event.position.latitude,
              longitude: event.position.longitude,
            }}
          />
        </MapView>

        <View style={{ height: 16 }} />

        <TouchableOpacity
          style={styles.directionsButton}
          onPress={openDirections}
        >
          <Text style={styles.directionsText}>Get Directions to Event</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F3F5" },

  headerBar: {
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomColor: "#EAEAEA",
    borderBottomWidth: 1,
  },
  headerTitle: {
    color: "#8FA7B3",
    fontFamily: "Nunito_700Bold",
    fontSize: 18,
  },
  headerImage: { width: "100%", height: 220 },
  content: { padding: 24 },
  title: {
    fontFamily: "Nunito_700Bold",
    fontSize: 24,
    color: "#031A62",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Nunito_400Regular",
    color: "#8fa7b3",
    marginBottom: 8,
  },
  bold: { fontFamily: "Nunito_700Bold" },
  description: {
    fontFamily: "Nunito_400Regular",
    color: "#5C8599",
    lineHeight: 22,
    marginBottom: 24,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  column: { flex: 1, marginHorizontal: 4 },
  infoBox: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    marginBottom: 8,
    flexGrow: 1,
  },
  infoText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  actionButton: {
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  equalButton: { flex: 1, marginHorizontal: 4 },
  orangeButton: { backgroundColor: "#FFB347", borderColor: "#E28A00" },
  blueButton: { backgroundColor: "#00A3FF", borderColor: "#0064B3" },
  actionText: {
    fontFamily: "Nunito_700Bold",
    color: "#fff",
    marginLeft: 6,
  },
  mapContainer: {
    borderRadius: 20,
    overflow: "hidden",
    marginHorizontal: 24,
    marginBottom: 32,
    backgroundColor: "#E6F4FF",
  },
  mapStyle: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
  },
  directionsButton: {
    backgroundColor: "#4D6F80",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  directionsText: {
    fontFamily: "Nunito_700Bold",
    color: "#FFFFFF",
    fontSize: 16,
  },
});
