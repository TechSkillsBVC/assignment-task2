import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Image, Linking, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import BigButton from '../components/BigButton';
import EventMarker from '../components/EventMarker';
import EventStatusBox from '../components/EventStatusBox';
import InfoBox from '../components/InfoBox';
import Spacer from '../components/Spacer';
import { BACKGROUND, BLUE, BOX_THEMES, DIVIDER, ORANGE, SLATE, TEXT, TEXT_LIGHT } from '../constants/Colors';
import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';
import * as api from '../services/api';
import { EventStatus } from '../types/Event';
import { RootStackParamList } from '../types/Navigation';
import { User } from '../types/User';
import { formatAMPM, getMapsUrl } from '../utils';
import { formatShortDate, getEventStatus } from '../utils/events';

export default function EventDetails({ route }: StackScreenProps<RootStackParamList, 'EventDetails'>) {
    const authenticationContext = useContext(AuthenticationContext);
    const currentUser = authenticationContext?.value;

    const [event, setEvent] = useState(route.params.event);
    const [organizer, setOrganizer] = useState<User>();
    const [isVolunteering, setIsVolunteering] = useState(false);

    const status = getEventStatus(event, currentUser?.id);
    const showContactButtons = status === EventStatus.Volunteered;
    const showVolunteerButton = status === EventStatus.Open;
    const showShareButton = status !== EventStatus.Full;

    useEffect(() => {
        api.getUser(event.organizerId)
            .then(setOrganizer)
            .catch((error) => console.log(error));
    }, [event.organizerId]);

    const openUrl = (url: string) => {
        Linking.openURL(url).catch(() => Alert.alert('Oops', 'This action is not supported on your device.'));
    };

    const handleShare = () => {
        Share.share({
            title: event.name,
            message: `${event.name} - ${formatShortDate(event.dateTime)} at ${formatAMPM(new Date(event.dateTime))}\n\n${
                event.description
            }\n\nVolunteer with me on Volunteam!`,
        });
    };

    const handleCall = () => organizer && openUrl(`tel:${organizer.mobile}`);

    const handleText = () => organizer && openUrl(`sms:${organizer.mobile}`);

    const handleGetDirections = () => openUrl(getMapsUrl(event.position));

    const handleVolunteer = () => {
        if (!currentUser || isVolunteering) return;
        setIsVolunteering(true);
        api.updateEventVolunteers(event.id, [...event.volunteersIds, currentUser.id])
            .then(setEvent)
            .catch(() => Alert.alert('Something went wrong', 'We could not sign you up. Please try again.'))
            .finally(() => setIsVolunteering(false));
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {event.imageUrl ? (
                <Image style={styles.image} source={{ uri: event.imageUrl }} resizeMode="cover" />
            ) : (
                <View style={[styles.image, styles.imagePlaceholder]}>
                    <Feather name="image" size={48} color={BOX_THEMES.grey.color} />
                </View>
            )}

            <View style={styles.content}>
                <Text style={styles.title}>{event.name}</Text>
                {organizer && (
                    <Text style={styles.organizer}>
                        organized by {organizer.name.first} {organizer.name.last}
                    </Text>
                )}
                <Spacer size={16} />
                <Text style={styles.description}>{event.description}</Text>
                <Spacer size={24} />

                <View style={styles.row}>
                    <InfoBox theme={BOX_THEMES.blue}>
                        <Feather name="calendar" size={32} color={BLUE} />
                        <Spacer size={8} />
                        <Text style={styles.dateText}>{formatShortDate(event.dateTime)}</Text>
                        <Text style={styles.dateText}>{formatAMPM(new Date(event.dateTime))}</Text>
                    </InfoBox>
                    <Spacer horizontal size={8} />
                    <EventStatusBox event={event} status={status} />
                </View>

                {(showShareButton || showContactButtons || showVolunteerButton) && (
                    <>
                        <Spacer size={16} />
                        <View style={styles.row}>
                            {showShareButton && (
                                <BigButton
                                    label="Share"
                                    color={BLUE}
                                    featherIconName="share-2"
                                    style={styles.actionButton}
                                    onPress={handleShare}
                                />
                            )}
                            {showContactButtons && (
                                <>
                                    <Spacer horizontal size={8} />
                                    <BigButton
                                        label="Call"
                                        style={styles.actionButton}
                                        color={BLUE}
                                        featherIconName="phone"
                                        disabled={!organizer}
                                        onPress={handleCall}
                                    />
                                    <Spacer horizontal size={8} />
                                    <BigButton
                                        label="Text"
                                        style={styles.actionButton}
                                        color={BLUE}
                                        featherIconName="message-circle"
                                        disabled={!organizer}
                                        onPress={handleText}
                                    />
                                </>
                            )}
                            {showVolunteerButton && (
                                <>
                                    <Spacer horizontal size={8} />
                                    <BigButton
                                        label="Volunteer"
                                        style={styles.actionButton}
                                        color={ORANGE}
                                        featherIconName="plus"
                                        disabled={isVolunteering}
                                        onPress={handleVolunteer}
                                    />
                                </>
                            )}
                        </View>
                    </>
                )}

                <Spacer size={24} />
                <View style={styles.divider} />
                <Spacer size={24} />
                <View style={styles.mapContainer}>
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        style={styles.map}
                        customMapStyle={customMapStyle}
                        initialRegion={{ ...event.position, ...MapSettings.DEFAULT_DELTA }}
                        liteMode
                        zoomEnabled={false}
                        scrollEnabled={false}
                        rotateEnabled={false}
                        pitchEnabled={false}
                        toolbarEnabled={false}
                    >
                        <EventMarker event={event} status={status} />
                    </MapView>
                </View>
                <Spacer size={16} />
                <View style={styles.row}>
                    <BigButton
                        label="Get Directions to Event"
                        color={SLATE}
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
        backgroundColor: BACKGROUND,
    },

    scrollContent: {
        paddingBottom: 24,
    },

    image: {
        width: '100%',
        height: 220,
    },

    imagePlaceholder: {
        backgroundColor: BOX_THEMES.grey.background,
        justifyContent: 'center',
        alignItems: 'center',
    },

    content: {
        padding: 24,
    },

    title: {
        fontFamily: 'Nunito_800ExtraBold',
        fontSize: 24,
        color: TEXT,
    },

    organizer: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 13,
        color: TEXT_LIGHT,
    },

    description: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 15,
        lineHeight: 22,
        color: TEXT_LIGHT,
    },

    row: {
        flexDirection: 'row',
    },

    actionButton: {
        paddingHorizontal: 8,
    },

    dateText: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 12,
        color: BLUE,
        textAlign: 'center',
    },

    divider: {
        height: 1,
        backgroundColor: DIVIDER,
    },

    mapContainer: {
        height: 180,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#D3E2E5',
    },

    map: {
        ...StyleSheet.absoluteFillObject,
    },
});
