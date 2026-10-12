import { StackScreenProps } from '@react-navigation/stack';
import React, { useContext, useEffect, useState } from 'react';
import { Image, Linking, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import BigButton from '../components/BigButton';
import EventMarker from '../components/EventMarker';
import EventStatusCard from '../components/EventStatusCard';
import InfoCard from '../components/InfoCard';
import Spacer from '../components/Spacer';
import * as Colors from '../constants/Colors';
import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';
import * as api from '../services/api';
import { AppStackParamList } from '../types/Navigation';
import { User } from '../types/User';
import { formatAMPM, formatDate, getMapsUrl } from '../utils';
import { getEventStatus } from '../utils/events';

export default function EventDetails({ route }: StackScreenProps<AppStackParamList, 'EventDetails'>) {
    const [event, setEvent] = useState(route.params.event);
    const dateTime = new Date(event.dateTime);
    const authenticationContext = useContext(AuthenticationContext);
    const userId = authenticationContext?.value?.id;
    const status = getEventStatus(event, userId);
    const [organizer, setOrganizer] = useState<User>();

    useEffect(() => {
        api.getUser(event.organizerId)
            .then((response) => setOrganizer(response.data))
            .catch((error) => console.log(error));
    }, [event.organizerId]);

    const handleShare = () => Share.share({ message: `${event.name}\n\n${event.description}` });

    const handleVolunteer = () => {
        if (!userId) return;
        api.updateEventVolunteers(event.id, [...event.volunteersIds, userId])
            .then((response) => setEvent(response.data))
            .catch((error) => console.log(error));
    };

    const handleCall = () => organizer && Linking.openURL(`tel:${organizer.mobile}`);

    const handleText = () => organizer && Linking.openURL(`sms:${organizer.mobile}`);

    const handleGetDirections = () => Linking.openURL(getMapsUrl(event.position));

    return (
        <ScrollView style={styles.container}>
            <Image style={styles.image} source={{ uri: event.imageUrl }} />
            <View style={styles.content}>
                <Text style={styles.title}>{event.name}</Text>
                <Spacer size={4} />
                {organizer && (
                    <Text style={styles.organizer}>
                        organized by {organizer.name.first} {organizer.name.last}
                    </Text>
                )}
                <Spacer size={16} />
                <Text style={styles.description}>{event.description}</Text>
                <Spacer size={24} />
                <View style={styles.row}>
                    <InfoCard
                        label={`${formatDate(dateTime)}\n${formatAMPM(dateTime).toUpperCase()}`}
                        color={Colors.BLUE}
                        backgroundColor={Colors.BLUE_LIGHT}
                        featherIconName="calendar"
                    />
                    <Spacer size={8} horizontal />
                    <EventStatusCard event={event} status={status} />
                </View>
                {status !== 'full' && (
                    <>
                        <Spacer size={24} />
                        <View style={styles.row}>
                            <BigButton
                                style={styles.actionButton}
                                label="Share"
                                color={Colors.BLUE}
                                featherIconName="share-2"
                                onPress={handleShare}
                            />
                            <Spacer size={8} horizontal />
                            {status === 'volunteered' ? (
                                <>
                                    <BigButton
                                        style={styles.actionButton}
                                        label="Call"
                                        color={Colors.BLUE}
                                        featherIconName="phone"
                                        onPress={handleCall}
                                    />
                                    <Spacer size={8} horizontal />
                                    <BigButton
                                        style={styles.actionButton}
                                        label="Text"
                                        color={Colors.BLUE}
                                        featherIconName="message-circle"
                                        onPress={handleText}
                                    />
                                </>
                            ) : (
                                <BigButton
                                    style={styles.actionButton}
                                    label="Volunteer"
                                    color={Colors.ORANGE}
                                    featherIconName="plus"
                                    onPress={handleVolunteer}
                                />
                            )}
                        </View>
                    </>
                )}
                <Spacer size={24} />
                <View style={styles.divider} />
                <Spacer size={24} />
                <View style={styles.routeMap}>
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        initialRegion={{ ...event.position, ...MapSettings.DEFAULT_DELTA }}
                        style={styles.map}
                        customMapStyle={customMapStyle}
                        scrollEnabled={false}
                        zoomEnabled={false}
                        rotateEnabled={false}
                        pitchEnabled={false}
                        toolbarEnabled={false}
                    >
                        <EventMarker coordinate={event.position} status={status} />
                    </MapView>
                </View>
                <Spacer size={16} />
                <View style={styles.row}>
                    <BigButton
                        label="Get Directions to Event"
                        color={Colors.SLATE}
                        featherIconName="map-pin"
                        onPress={handleGetDirections}
                    />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.BACKGROUND,
    },

    image: {
        height: 210,
    },

    content: {
        paddingTop: 24,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },

    title: {
        fontFamily: 'Nunito_800ExtraBold',
        fontSize: 24,
        lineHeight: 24,
        color: Colors.SLATE_LIGHT,
    },

    organizer: {
        fontFamily: 'Nunito_400Regular',
        fontSize: 14,
        lineHeight: 14,
        color: Colors.SLATE_LIGHT,
    },

    description: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 16,
        color: Colors.SLATE_LIGHT,
    },

    row: {
        flexDirection: 'row',
    },

    actionButton: {
        paddingHorizontal: 0,
    },

    divider: {
        height: 1,
        backgroundColor: Colors.GREY_LIGHT,
    },

    routeMap: {
        aspectRatio: 1,
        borderWidth: 1,
        borderColor: Colors.GREY_LIGHT,
        borderRadius: 8,
        overflow: 'hidden',
    },

    map: {
        flex: 1,
    },
});
