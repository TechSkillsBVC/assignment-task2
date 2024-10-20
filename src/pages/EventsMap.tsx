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
import mapMarkerImgBlue from '../images/map-marker-blue.png';
import mapMarkerImgGrey from '../images/map-marker-grey.png';

export default function EventsMap(props: StackScreenProps<any>) {
    const { navigation } = props;
    const authenticationContext = useContext(AuthenticationContext);
    const mapViewRef = useRef<MapView>(null);

    const handleNavigateToCreateEvent = () => {};

    const handleNavigateToEventDetails = () => {};

    const handleLogout = async () => {
        AsyncStorage.multiRemove(['userInfo', 'accessToken']).then(() => {
            authenticationContext?.setValue(undefined);
            navigation.navigate('Login');
        });
    };

    const currentUserId = "EF-BZ00"; // Hardcoded user ID

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
                {events.map((event) => {
                    // Determine the logo color based on volunteer status
                    let markerImage = mapMarkerImg; // Default is orange

                    // Check if the hardcoded user ID has volunteered
                    const isUserVolunteered = event.volunteersIds.includes(currentUserId);
                    const isEventFull = event.volunteersNeeded <= event.volunteersIds.length;

                    if (isUserVolunteered) {
                        markerImage = mapMarkerImgBlue; // Blue if user has volunteered
                    } else if (isEventFull) {
                        markerImage = mapMarkerImgGrey; // Grey if event is full
                    }

                    return (
                        <Marker
                            key={event.id}
                            coordinate={{
                                latitude: event.position.latitude,
                                longitude: event.position.longitude,
                            }}
                            onPress={handleNavigateToEventDetails}
                        >
                            <Image resizeMode="contain" style={{ width: 48, height: 54 }} source={markerImage} />
                        </Marker>
                    );
                })}
            </MapView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>{events.length} event(s) found</Text>
                <RectButton
                    style={[styles.smallButton, { backgroundColor: '#00A3FF' }]}
                    onPress={handleNavigateToCreateEvent}
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

// Event data
const events = [
    {
        id: "e3c95682-870f-4080-a0d7-ae8e23e2534f",
        position: { latitude: 51.105761, longitude: -114.106943 },
        volunteersNeeded: 1,
        volunteersIds: []
    },
    {
        id: "98301b22-2b76-44f1-a8da-8c86c56b0367",
        position: { latitude: 51.04112, longitude: -114.069325 },
        volunteersNeeded: 4,
        volunteersIds: ["3UN3-2L", "gpFfX6e", "tRHltUh", "ajY8pM2"]
    },
    {
        id: "d7b8ea73-ba2c-4fc3-9348-9814076124bd",
        position: { latitude: 51.01222958257112, longitude: -114.11677222698927 },
        volunteersNeeded: 10,
        volunteersIds: ["EF-BZ00", "gpFfX6e", "Hr-40KW", "elKKrm3"]
    },
    {
        id: "d1a6b9ea-877d-4711-b8d7-af8f1bce4d29",
        position: { latitude: 51.010801915407036, longitude: -114.07823592424393 },
        volunteersNeeded: 2,
        volunteersIds: ["EF-BZ00", "Q5bVHgP"]
    }
];
