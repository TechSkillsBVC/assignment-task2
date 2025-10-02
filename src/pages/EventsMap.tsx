import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
// import react and helpers
import React, { useContext, useRef, useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import customMapStyle from '../../map-style.json';
import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';
import mapMarkerImg from '../images/map-marker.png';

//api
import api from '../services/api';


export default function EventsMap(props: StackScreenProps<any>) {
    const { navigation } = props;
    const authenticationContext = useContext(AuthenticationContext);
    const mapViewRef = useRef<MapView>(null);
    
    //set state for upcoming id 
    const [upcomingIds, setUpcomingIds] = React.useState<Set<string>>(new Set());
    
    // While loading (upcomingIds.size === 0), fall back to showing all.
    const mapEvents = upcomingIds.size ? events.filter(e => upcomingIds.has(e.id)) : events;

    // listens to the nav focus event 
    useEffect(() => {
        // start listening so when screen is focused map is refitted
        const unsubscribe = navigation.addListener('focus', () => {
            // refit to include all event coordinates
            mapViewRef.current?.fitToCoordinates(
                mapEvents.map(({ position }) => ({
                    // get latitude for each event
                    latitude: position.latitude,
                    // get longitude for each event
                    longitude: position.longitude,
                })),
                // padding so markers are not touching sides of screen
                { edgePadding: MapSettings.EDGE_PADDING, animated: true }
            );
        });

        // stop listening when component unmounts
        return unsubscribe;
    }, [navigation]);



    // refocus to make sure it works when coming back from EventDetails
    useFocusEffect(
        React.useCallback(() => {
            if (!mapViewRef.current) return;

            mapViewRef.current.fitToCoordinates(
                mapEvents.map(({ position }) => ({
                    latitude: position.latitude,
                    longitude: position.longitude,
                })),
                { edgePadding: MapSettings.EDGE_PADDING, animated: true }
            );
        }, [])
    );

    useEffect(() => {
        let mounted = true;
            (async () => {
                try {
                const res = await api.get('/events');
                // hide events from 2022
                const cutoff = new Date('2023-01-01T00:00:00Z').getTime();
                const ids = new Set(
                    (res.data as any[])
                    .filter((e) => new Date(e.dateTime).getTime() >= cutoff)
                    .map((e) => e.id)
                );
                if (mounted) setUpcomingIds(ids);
                } catch {

                }
            })();
            return () => { mounted = false; };
            }, []);


    const handleNavigateToCreateEvent = () => {};

    // pass id to the function
    const handleNavigateToEventDetails = (eventId: string) => {
        // go to EventDetails screen and pass event id
        navigation.navigate('EventDetails', { eventId });
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
                
                onMapReady={() => {
                    // delay so padding applies clean
                    setTimeout(() => {
                        mapViewRef.current?.fitToCoordinates(
                            mapEvents.map(({ position }) => ({
                                latitude: position.latitude,
                                longitude: position.longitude,
                            })),
                            { edgePadding: MapSettings.EDGE_PADDING, animated: true }
                        );
                    }, 120);
                }}

                // original on layout as backup
                onLayout={() =>
                    mapViewRef.current?.fitToCoordinates(
                        mapEvents.map(({ position }) => ({
                            latitude: position.latitude,
                            longitude: position.longitude,
                        })),
                        { edgePadding: MapSettings.EDGE_PADDING, animated: true }
                    )
                }
            >
                {mapEvents.map((event) => {
                    return (
                        <Marker
                            key={event.id}
                            coordinate={{
                                latitude: event.position.latitude,
                                longitude: event.position.longitude,
                            }}
                            // send event id on press
                            onPress={() => handleNavigateToEventDetails(event.id)}
                        >
                            <Image resizeMode="contain" style={{ width: 48, height: 54 }} source={mapMarkerImg} />
                        </Marker>
                    );
                })}
            </MapView>

            <View style={styles.footer}>
                {/* footer shows actual number of events */}
                <Text style={styles.footerText}>{mapEvents.length} event(s) found</Text>
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
