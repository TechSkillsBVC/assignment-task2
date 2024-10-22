import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useContext, useRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';
import mapMarkerImg from '../images/map-marker.png';

export default function EventsMap(props: StackScreenProps<any>) {
  const { navigation } = props;
  const authenticationContext = useContext(AuthenticationContext);
  const mapViewRef = useRef<MapView>(null);

  // Navigate to Create Event screen
  const handleNavigateToCreateEvent = () => {
    navigation.navigate('CreateEvent');
  };

  // Navigate to Event Details screen
  const handleNavigateToEventDetails = (eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  };

  // Logout user by clearing cache and navigating to Login screen
  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['userInfo', 'accessToken']);
      authenticationContext?.setValue(undefined); // Clear the authentication context
      navigation.navigate('Login'); // Navigate to login
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

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
            events.map(({ position }) => ({
              latitude: position.latitude,
              longitude: position.longitude,
            })),
            { edgePadding: MapSettings.EDGE_PADDING }
          )
        }
      >
        {events.map((event) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.position.latitude,
              longitude: event.position.longitude,
            }}
            onPress={() => handleNavigateToEventDetails(event.id)}
          >
            <Image resizeMode="contain" style={styles.markerImage} source={mapMarkerImg} />
          </Marker>
        ))}
      </MapView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{events.length} event(s) found</Text>
        <RectButton
          style={[styles.smallButton, { backgroundColor: '#FFD700' }]}
          onPress={handleNavigateToCreateEvent}
        >
          <Feather name="plus" size={24} color="#000" />
        </RectButton>
      </View>

      <RectButton
        style={[styles.logoutButton, styles.smallButton, { backgroundColor: '#3A3A3A' }]}
        onPress={handleLogout}
      >
        <Feather name="log-out" size={24} color="#FFF" />
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
    backgroundColor: '#E8EAF6',
  },
  mapStyle: {
    ...StyleSheet.absoluteFillObject,
  },
  markerImage: {
    width: 50,
    height: 55,
  },
  logoutButton: {
    position: 'absolute',
    top: 60,
    right: 30,
    borderWidth: 2,
    borderColor: '#FFF',
    elevation: 4,
  },
  footer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 50,
    backgroundColor: '#FFF',
    borderRadius: 20,
    height: 60,
    paddingLeft: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  footerText: {
    fontFamily: 'Nunito_700Bold',
    color: '#6B7280',
    fontSize: 18,
  },
  smallButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

interface Event {
  id: string;
  position: {
    latitude: number;
    longitude: number;
  };
}

const events: Event[] = [
  {
    id: 'e3c95682-870f-4080-a0d7-ae8e23e2534f',
    position: {
      latitude: 51.105761,
      longitude: -114.106943,
    },
  },
  {
    id: '98301b22-2b76-44f1-a8da-8c86c56b0367',
    position: {
      latitude: 51.04112,
      longitude: -114.069325,
    },
  },
  {
    id: 'd7b8ea73-ba2c-4fc3-9348-9814076124bd',
    position: {
      latitude: 51.01222958257112,
      longitude: -114.11677222698927,
    },
  },
  {
    id: 'd1a6b9ea-877d-4711-b8d7-af8f1bce4d29',
    position: {
      latitude: 51.010801915407036,
      longitude: -114.07823592424393,
    },
  },
];
