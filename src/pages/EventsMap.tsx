import React, { useContext, useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
} from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import eventsRaw from "../../db.json";
import { AuthenticationContext } from "../context/AuthenticationContext";
import { Event } from "../types/Event";

import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import customMapStyle from "../../map-style.json";
import * as MapSettings from "../constants/MapSettings";

import mapMarkerImg from "../images/map-marker.png";

export default function EventsMap({ navigation }: any) {
  const auth = useContext(AuthenticationContext);
  const currentUser = auth?.value;
  const [events, setEvents] = useState<Event[]>([]);
  const mapViewRef = useRef<MapView>(null);

  useEffect(() => {
    const eventsData = eventsRaw as { events: Event[] };
    const upcomingEvents = eventsData.events.filter(
      (event) => new Date(event.dateTime) > new Date()
    );
    setEvents(upcomingEvents.length ? upcomingEvents : eventsData.events);
  }, []);

  const handleNavigateToCreateEvent = () => {
    alert("Navigate to Create Event screen");
  };

  const handleNavigateToEventDetails = (eventId: string) => {
    navigation.navigate("EventDetails", { eventId });
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(["userInfo", "accessToken"]);
    auth?.setValue(undefined);
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      {/* --- HEADER (Welcome + Logout) --- */}
      {currentUser && (
        <View
          style={[
            styles.header,
            {
              paddingTop:
                Platform.OS === "android" ? StatusBar.currentHeight || 20 : 40,
            },
          ]}
        >
          <Text style={styles.welcome}>
            Welcome, {currentUser.name.first} {currentUser.name.last}!
          </Text>
          <RectButton style={styles.logoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={16} color="#FFF" />
          </RectButton>
        </View>
      )}

      {/* --- MAP VIEW --- */}
      <MapView
        ref={mapViewRef}
        provider={PROVIDER_GOOGLE}
        initialRegion={MapSettings.DEFAULT_REGION}
        style={styles.mapStyle}
        customMapStyle={customMapStyle}
        showsMyLocationButton={false}
        showsUserLocation={true}
        rotateEnabled={false}
        toolbarEnabled={false}
        moveOnMarkerPress={false}
        mapPadding={MapSettings.EDGE_PADDING}
        onLayout={() => {
          if (events.length) {
            mapViewRef.current?.fitToCoordinates(
              events.map((e) => e.position),
              { edgePadding: MapSettings.EDGE_PADDING }
            );
          }
        }}
      >
        {events.map((event) => (
          <Marker
            key={event.id}
            coordinate={event.position}
            onPress={() => handleNavigateToEventDetails(event.id)}
          >
            <Image
              resizeMode="contain"
              style={{ width: 48, height: 54 }}
              source={mapMarkerImg}
            />
          </Marker>
        ))}
      </MapView>

      {/* --- EVENTS LIST --- */}
      {/* <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 100,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.eventCard}
            onPress={() => handleNavigateToEventDetails(item.id)}
          >
            <Text style={styles.eventTitle}>{item.name}</Text>
            <Text style={styles.eventDate}>
              {new Date(item.dateTime).toLocaleString()}
            </Text>
            <Text style={styles.eventDescription}>{item.description}</Text>
          </TouchableOpacity>
        )}
      /> */}

      <View style={styles.footer}>
        <Text style={styles.footerText}>{events.length} event(s) found</Text>
        <RectButton
          style={[styles.smallButton, { backgroundColor: "#00A3FF" }]}
          onPress={handleNavigateToCreateEvent}
        >
          <Feather name="plus" size={20} color="#FFF" />
        </RectButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  welcome: {
    fontSize: 18,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#4D6F80",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  mapStyle: {
    flex: 1,
  },
  footer: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 40,
    backgroundColor: "#FFF",
    borderRadius: 16,
    height: 56,
    paddingLeft: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
  },
  footerText: { fontFamily: "Nunito_700Bold", color: "#8fa7b3" },
  smallButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  eventCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  eventTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  eventDate: { fontSize: 12, color: "#666", marginBottom: 6 },
  eventDescription: { fontSize: 14, color: "#444" },
});
