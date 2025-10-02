import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../routes/AppStack";
import { useEvents } from "../hooks/useEvents";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { regionFromPoints } from "../utils/maps";

const DEFAULT_REGION = {
  latitude: 51.0486,
  longitude: -114.0708,
  latitudeDelta: 0.25,
  longitudeDelta: 0.25,
};

export default function MainScreen() {
  const mapRef = useRef<MapView | null>(null);
  const { events, loading, refresh } = useEvents();
  const { id: currentUserId } = useCurrentUser();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const markers = useMemo(
    () =>
      events.map((ev) => {
        const applied = ev.volunteers.includes(currentUserId);
        const isFull = ev.volunteers.length >= ev.requiredVolunteers;
        const color = applied ? "#0ea5e9" : isFull ? "#ef4444" : "#16a34a";
        return { ...ev, color };
      }),
    [events, currentUserId]
  );

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  useEffect(() => {
    (async () => {
      if (!mapRef.current) return;
      const pts = markers.map((m) => ({
        latitude: m.latitude,
        longitude: m.longitude,
      }));
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          pts.push({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      } catch {}
      const region = regionFromPoints(pts) || DEFAULT_REGION;
      mapRef.current.animateToRegion(region, 650);
    })();
  }, [markers]);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={DEFAULT_REGION}
      >
        {markers.map((m) => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
            title={m.title}
            pinColor={m.color}
            onPress={() =>
              navigation.navigate("EventDetails", { eventId: m.id })
            }
          />
        ))}
      </MapView>
      {loading && <ActivityIndicator style={styles.loading} />}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { position: "absolute", top: 16, right: 16 },
});
