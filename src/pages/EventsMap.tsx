import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackScreenProps } from "@react-navigation/stack";
import React, { useContext, useRef, useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import axios from "axios";
import customMapStyle from "../../map-style.json";
import * as MapSettings from "../constants/MapSettings";
import { AuthenticationContext } from "../context/AuthenticationContext";
import mapMarkerImg from "../images/map-marker.png";

const apiBase = "http://10.0.0.33:3333";

export default function EventsMap(props: StackScreenProps<any>) {
  const { navigation } = props;
  const authenticationContext = useContext(AuthenticationContext);
  const mapViewRef = useRef<MapView>(null);

  const [eventsList, setEventsList] = useState(events);
  const [loading, setLoading] = useState(false);

  const handleNavigateToCreateEvent = () => {};

  const handleNavigateToEventDetails = (event: event) => {
    navigation.navigate("EventDetails", { event });
  };

  const handleLogout = async () => {
    AsyncStorage.multiRemove(["userInfo", "accessToken"]).then(() => {
      authenticationContext?.setValue(undefined);
      navigation.navigate("Login");
    });
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${apiBase}/events`);
        if (Array.isArray(data)) setEventsList(data);
      } catch (err) {
        console.log("⚠️ Falling back to local events, server not reachable.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <View style={styles.container}>
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
        onLayout={() =>
          mapViewRef.current?.fitToCoordinates(
            eventsList.map(({ position }) => ({
              latitude: position.latitude,
              longitude: position.longitude,
            })),
            { edgePadding: MapSettings.EDGE_PADDING }
          )
        }
      >
        {eventsList.map((event) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.position.latitude,
              longitude: event.position.longitude,
            }}
            onPress={() => handleNavigateToEventDetails(event)}
          >
            <Image
              resizeMode="contain"
              style={{ width: 48, height: 54 }}
              source={mapMarkerImg}
            />
          </Marker>
        ))}
      </MapView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {loading
            ? "Loading events..."
            : `${eventsList.length} event${
                eventsList.length !== 1 ? "s" : ""
              } found`}
        </Text>
        <RectButton
          style={[styles.smallButton, { backgroundColor: "#00A3FF" }]}
          onPress={handleNavigateToCreateEvent}
        >
          <Feather name="plus" size={20} color="#FFF" />
        </RectButton>
      </View>

      <RectButton
        style={[
          styles.logoutButton,
          styles.smallButton,
          { backgroundColor: "#4D6F80" },
        ]}
        onPress={handleLogout}
      >
        <Feather name="log-out" size={20} color="#FFF" />
      </RectButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  mapStyle: {
    ...StyleSheet.absoluteFillObject,
  },
  logoutButton: {
    position: "absolute",
    top: 70,
    right: 24,
    elevation: 3,
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
  footerText: {
    fontFamily: "Nunito_700Bold",
    color: "#8fa7b3",
  },
  smallButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});

interface event {
  id: string;
  dateTime?: string;
  description?: string;
  imageUrl?: string;
  name?: string;
  organizerId?: string;
  volunteersNeeded?: number;
  volunteersIds?: string[];
  position: {
    latitude: number;
    longitude: number;
  };
}

const events: event[] = [
  {
    id: "e3c95682-870f-4080-a0d7-ae8e23e2534f",
    position: { latitude: 51.105761, longitude: -114.106943 },
  },
  {
    id: "98301b22-2b76-44f1-a8da-8c86c56b0367",
    position: { latitude: 51.04112, longitude: -114.069325 },
  },
  {
    id: "d7b8ea73-ba2c-4fc3-9348-9814076124bd",
    position: { latitude: 51.01222958257112, longitude: -114.11677222698927 },
  },
  {
    id: "d1a6b9ea-877d-4711-b8d7-af8f1bce4d29",
    position: { latitude: 51.010801915407036, longitude: -114.07823592424393 },
  },
];
