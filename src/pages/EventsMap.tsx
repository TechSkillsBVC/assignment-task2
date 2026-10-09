import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useRef,useState } from 'react';
import { Image, StyleSheet, Text, View,Alert } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { LatLng, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';
import mapMarkerImg from '../images/map-marker.png';
import { User } from '../types/User';
import { Event } from '../types/event';
import mapmarkerimg from '../images/map-marker.png';
import mapmarkrfull from '../images/map-marker-grey.png'
import mapmarkervolunteeredimg from '../images/map-marker-blue.png';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import * as api from '../services/api';

export default function EventsMap(props: StackScreenProps<any>) {
    const { navigation } = props;
    const authenticationContext = useContext(AuthenticationContext);
    const mapViewRef = useRef<MapView>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [user, setUser] = useState<User>();



    const handleNavigateToCreateEvent = () => {alert('Navigate to Create Event')};

    const handleNavigateToEventDetails = (event: Event) => {navigation.navigate('EventDetails', {event })};
    const fetchEvents = async (events: Event[]) => {
                const eventscoords : LatLng[] = events.map((event) => ({
                    latitude: event.position.latitude,
                    longitude: event.position.longitude,
                }));
                mapViewRef.current?.fitToCoordinates(eventscoords, { edgePadding: MapSettings.EDGE_PADDING });
                try 
                    {

                        const getpermissions = await Location.requestForegroundPermissionsAsync();
                        if (getpermissions.status === 'granted') {
                            const getloc = await Location.getCurrentPositionAsync({
                                accuracy: Location.Accuracy.Balanced,
                            });
                            eventscoords.push({
                                latitude: getloc.coords.latitude,
                                longitude: getloc.coords.longitude,
                            });
                            mapViewRef.current?.fitToCoordinates(eventscoords, { edgePadding: MapSettings.EDGE_PADDING });
                        }
                    }
                catch (error) 
                    {
                        console.error('Error fetching events:', error);
                    }
            };
    useFocusEffect(
        useCallback(() => {
            api.getevents().then((response) => {
                const eventsData: Event[] = response.data;
                setEvents(eventsData);
                fetchEvents(eventsData);
            }).catch((error) => {
                console.error('Error fetching events:', error);
            })
            }, [fetchEvents])
    );

    // const handleLogout = async () => {
    //     AsyncStorage.multiRemove(['userInfo', 'accessToken']).then(() => {
    //         authenticationContext?.setValue(undefined);
    //         navigation.navigate('Login');
    //     });
    // };
    const handleLogout = async () => {
        AsyncStorage.removeMany(['userInfo', 'accessToken']).then(() => {
            authenticationContext?.setValue(undefined);
            navigation.navigate('Login');
        });
    };
    
    const eventmarker = (event: Event) => {
        const userId = authenticationContext?.value.id;
        const hasvolunteered = event.volunteersIds.includes(userId as string);
        const isteamfull = event.volunteersIds.length >= event.volunteersNeeded;
        if (hasvolunteered) {
            return mapmarkervolunteeredimg;
        }
        if (isteamfull) {
            return mapmarkrfull;
        }
        return mapMarkerImg;
    }
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
                onMapReady={() => {fetchEvents(events);}}
            >
                {events.map((event) => {
                    return (
                        <Marker
                            key={event.id}
                            coordinate={{
                                latitude: event.position.latitude,
                                longitude: event.position.longitude,
                            }}
                            onPress={() => handleNavigateToEventDetails(event)}
                        >
                            <Image resizeMode="contain" style={{ width: 48, height: 54 }} source={eventmarker(event)} />
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
        ...StyleSheet.absoluteFill,
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },

    mapStyle: {
        ...StyleSheet.absoluteFill,
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

interface event {
    id: string;
    position: {
        latitude: number;
        longitude: number;
    };
}

const events: event[] = [
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
