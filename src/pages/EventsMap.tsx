import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';
import { useIsFocused } from '@react-navigation/native';
import * as Location from 'expo-location';
import { LatLng } from 'react-native-maps';
import { useEvents } from '../context/EventsContext';
import EventMarker from '../components/EventMarker';
import { upcomingEvents } from '../utils/eventState';
import { RootStackParamList } from '../routes/types';

export default function EventsMap(props: StackScreenProps<RootStackParamList, 'EventsMap'>) {
    const { navigation } = props;
    const authenticationContext = useContext(AuthenticationContext);
    const mapViewRef = useRef<MapView>(null);

    const { events } = useEvents();
    const isFocused = useIsFocused();
    const visibleEvents = upcomingEvents(events);
    const [position, setPosition] = useState<LatLng>();
    const [mapReady, setMapReady] = useState(false);
    const fitMap = useCallback(() => {
        if (!mapReady) return;
        const coordinates = [...upcomingEvents(events).map(event => event.position)];
        if (position) coordinates.push(position);
        if (coordinates.length) mapViewRef.current?.fitToCoordinates(coordinates, {
            edgePadding: MapSettings.EDGE_PADDING, animated: true,
        });
    }, [events, position, mapReady]);
    useEffect(() => { if (isFocused) fitMap(); }, [isFocused, fitMap]);
    useEffect(() => {
        if (!isFocused) return;
        let active = true;
        (async () => {
            const permission = await Location.requestForegroundPermissionsAsync();
            if (permission.status !== 'granted') return;
            const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            if (active) setPosition(location.coords);
        })().catch(() => {});
        return () => { active = false; };
    }, [isFocused]);

    const handleLogout = async () => {
        AsyncStorage.multiRemove(['userInfo', 'accessToken']).then(() => {
            authenticationContext?.setValue(undefined);
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
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
                onMapReady={() => setMapReady(true)}

            >
                {visibleEvents.map(event => <EventMarker key={event.id} event={event}
                    userId={authenticationContext?.value?.id}
                    onPress={() => navigation.navigate('EventDetails', { eventId: event.id })} />)}
            </MapView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>{visibleEvents.length} event(s) found · {visibleEvents.filter(event => !event.volunteersIds.includes(authenticationContext?.value?.id || '') && event.volunteersIds.length < event.volunteersNeeded).length} need volunteers</Text>
                <RectButton
                    style={[styles.smallButton, { backgroundColor: '#00A3FF' }]}
                    onPress={fitMap}
                >
                    <Feather name="crosshair" size={20} color="#FFF" />
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
