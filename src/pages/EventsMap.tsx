import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useContext, useMemo, useRef, useCallback, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { Marker, PROVIDER_GOOGLE, LatLng } from 'react-native-maps';
import * as Location from 'expo-location';

import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';

import mapMarkerDefault from '../images/map-marker.png';
import mapMarkerBlue from '../images/map-marker-blue.png';
import mapMarkerGrey from '../images/map-marker-grey.png';

import { EVENTS_INITIAL } from '../constants/mockData';
import { Event } from '../@types/Event';
import { useFocusEffect } from '@react-navigation/native';

export default function EventsMap(props: StackScreenProps<any>) {
  const { navigation } = props;
  const auth = useContext(AuthenticationContext);
  const currentUserId = auth?.value?.id;

  const mapViewRef = useRef<MapView>(null);
  const [events, setEvents] = useState<Event[]>(
    // exclude past events
    EVENTS_INITIAL.filter(e => new Date(e.dateTime).getTime() > Date.now())
  );

  const coords: LatLng[] = useMemo(
    () =>
      events.map(e => ({
        latitude: e.position.latitude,
        longitude: e.position.longitude,
      })),
    [events]
  );

  const fitAll = useCallback(
    async (animate = true) => {
      try {
        let points: LatLng[] = [...coords];

        // try to include user location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          points.push({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        }

        if (mapViewRef.current && points.length) {
          mapViewRef.current.fitToCoordinates(points, {
            edgePadding: MapSettings.EDGE_PADDING,
            animated: animate,
          });
        }
      } catch {
        // ignore permission errors; still fit to events
        if (mapViewRef.current && coords.length) {
          mapViewRef.current.fitToCoordinates(coords, {
            edgePadding: MapSettings.EDGE_PADDING,
            animated: animate,
          });
        }
      }
    },
    [coords]
  );

  useFocusEffect(
    useCallback(() => {
      fitAll();
    }, [fitAll])
  );

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['userInfo', 'accessToken']);
    auth?.setValue(undefined);
    navigation.navigate('Login');
  };

  const handleMarkerPress = (event: Event) => {
    navigation.navigate('EventDetails', {
      event,
      onUpdateEvent: (updated: Event) =>
        setEvents(prev => prev.map(e => (e.id === updated.id ? updated : e))),
    });
  };

  const markerImageFor = (e: Event) => {
    const isFull = e.volunteersIds.length >= e.volunteersNeeded;
    const hasApplied = currentUserId ? e.volunteersIds.includes(currentUserId) : false;
    if (isFull) return mapMarkerGrey;
    if (hasApplied) return mapMarkerBlue;
    return mapMarkerDefault;
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapViewRef}
        provider={PROVIDER_GOOGLE}
        initialRegion={MapSettings.DEFAULT_REGION}
        style={styles.mapStyle}
        showsMyLocationButton={false}
        showsUserLocation
        rotateEnabled={false}
        toolbarEnabled={false}
        moveOnMarkerPress={false}
        mapPadding={MapSettings.EDGE_PADDING}
        onLayout={() => fitAll(false)}
      >
        {events.map(event => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.position.latitude,
              longitude: event.position.longitude,
            }}
            onPress={() => handleMarkerPress(event)}
          >
            <Image source={markerImageFor(event)} style={{ width: 48, height: 54 }} resizeMode="contain" />
          </Marker>
        ))}
      </MapView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{events.length} event(s) found</Text>
        <RectButton
          style={[styles.smallButton, { backgroundColor: '#00A3FF' }]}
          onPress={() => {}}
        >
          <Feather name="plus" size={20} color="#FFF" />
        </RectButton>
      </View>

      <RectButton
        style={[styles.logoutButton, styles.smallButton, { backgroundColor: '#4D6F80' }]}
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
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  mapStyle: {
    ...StyleSheet.absoluteFillObject,
  },
  logoutButton: {
    position: 'absolute',
    top: 70,
    right: 24,
    elevation: 3,
  },
  footer: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 40,
    backgroundColor: '#FFF',
    borderRadius: 16,
    height: 56,
    paddingLeft: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
  },
  footerText: {
    fontFamily: 'Nunito_700Bold',
    color: '#8fa7b3',
  },
  smallButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
