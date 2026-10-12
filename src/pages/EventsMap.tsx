import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import * as Location from 'expo-location';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { LatLng, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import EventMarker from '../components/EventMarker';
import * as Colors from '../constants/Colors';
import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';
import * as api from '../services/api';
import { Event } from '../types/Event';
import { AppStackParamList } from '../types/Navigation';
import { getEventStatus } from '../utils/events';

export default function EventsMap(props: StackScreenProps<AppStackParamList, 'EventsMap'>) {
    const { navigation } = props;
    const authenticationContext = useContext(AuthenticationContext);
    const mapViewRef = useRef<MapView>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            api.getUpcomingEvents()
                .then((response) => {
                    setEvents(response.data);
                    fitMapToEventsAndUser(response.data);
                })
                .catch((error) => console.log(error));
        }
    }, [isFocused]);

    const fitMapToEventsAndUser = async (upcomingEvents: Event[]) => {
        const coordinates: LatLng[] = upcomingEvents.map(({ position }) => position);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            const { coords } = await Location.getCurrentPositionAsync();
            coordinates.push(coords);
        }
        mapViewRef.current?.fitToCoordinates(coordinates, { edgePadding: MapSettings.EDGE_PADDING });
    };

    const handleNavigateToCreateEvent = () => {};

    const handleNavigateToEventDetails = (event: Event) => {
        navigation.navigate('EventDetails', { event });
    };

    const handleLogout = async () => {
        AsyncStorage.multiRemove(['userInfo', 'accessToken']).then(() => {
            authenticationContext?.setValue(undefined);
            navigation.navigate('Login');
        });
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
            >
                {events.map((event) => (
                    <EventMarker
                        key={event.id}
                        coordinate={event.position}
                        status={getEventStatus(event, authenticationContext?.value?.id)}
                        onPress={() => handleNavigateToEventDetails(event)}
                    />
                ))}
            </MapView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    {events.length} {events.length === 1 ? 'event' : 'events'} found
                </Text>
                <RectButton
                    style={[styles.smallButton, { backgroundColor: Colors.BLUE }]}
                    onPress={handleNavigateToCreateEvent}
                >
                    <Feather name="plus" size={20} color={Colors.WHITE} />
                </RectButton>
            </View>
            <RectButton
                style={[styles.logoutButton, styles.smallButton, { backgroundColor: Colors.SLATE }]}
                onPress={handleLogout}
            >
                <Feather name="log-out" size={20} color={Colors.WHITE} />
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

        backgroundColor: Colors.WHITE,
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
        fontSize: 15,
        color: Colors.GREY,
    },

    smallButton: {
        width: 56,
        height: 56,
        borderRadius: 16,

        justifyContent: 'center',
        alignItems: 'center',
    },
});
