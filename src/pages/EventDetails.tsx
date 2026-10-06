import { StackScreenProps } from '@react-navigation/stack';
import React, { useContext, useEffect, useState } from 'react';
import { Image, Linking, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import BigButton from '../components/BigButton';
import EventDateBox from '../components/EventDateBox';
import EventMapPreview from '../components/EventMapPreview';
import EventStatusBox from '../components/EventStatusBox';
import PageHeader from '../components/PageHeader';
import Spacer from '../components/Spacer';
import { Colors } from '../constants/Colors';
import { AuthenticationContext } from '../context/AuthenticationContext';
import { EventsContext } from '../context/EventsContext';
import * as api from '../services/api';
import { findLocalUser } from '../services/localDatabase';
import { User } from '../types/User';
import { getMapsUrl } from '../utils';
import { getEventStatus, toDialableNumber } from '../utils/events';

export default function EventDetails({ navigation, route }: StackScreenProps<any>) {
    const { eventId } = route.params as { eventId: string };

    const eventsContext = useContext(EventsContext);
    const authenticationContext = useContext(AuthenticationContext);

    const currentUser = authenticationContext?.value;
    const event = eventsContext?.getEventById(eventId);

    const [organizer, setOrganizer] = useState<User>();

    useEffect(() => {
        if (!event) return;

        let isCurrent = true;

        const loadOrganizer = async () => {
            try {
                const { data } = await api.getUserById(event.organizerId);
                if (isCurrent) setOrganizer(data);
            } catch {
                if (isCurrent) setOrganizer(findLocalUser(event.organizerId));
            }
        };

        loadOrganizer();

        return () => {
            isCurrent = false;
        };
    }, [event?.organizerId]);

    if (!event) {
        return (
            <View style={styles.container}>
                <PageHeader title="Event" onBackPress={navigation.goBack} />
                <Text style={styles.notFound}>This event is no longer available.</Text>
            </View>
        );
    }

    const status = getEventStatus(event, currentUser?.id);

    const handleShare = () => {
        Share.share({
            message: `${event.name}\n\n${event.description}\n\n${getMapsUrl(event.position)}`,
        });
    };

    const handleCall = () => {
        if (organizer?.mobile) Linking.openURL(`tel:${toDialableNumber(organizer.mobile)}`);
    };

    const handleText = () => {
        if (organizer?.mobile) Linking.openURL(`sms:${toDialableNumber(organizer.mobile)}`);
    };

    const handleVolunteer = () => {
        if (currentUser) eventsContext?.addVolunteer(event.id, currentUser.id);
    };

    const handleGetDirections = () => {
        Linking.openURL(getMapsUrl(event.position));
    };

    return (
        <View style={styles.container}>
            <PageHeader title="Event" onBackPress={navigation.goBack} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {!!event.imageUrl && <Image source={{ uri: event.imageUrl }} style={styles.image} />}

                <View style={styles.content}>
                    <Text style={styles.title}>{event.name}</Text>

                    {!!organizer && (
                        <Text style={styles.organizer}>
                            organized by {organizer.name.first} {organizer.name.last}
                        </Text>
                    )}

                    <Spacer size={16} />
                    <Text style={styles.description}>{event.description}</Text>

                    <Spacer size={24} />
                    <View style={styles.row}>
                        <EventDateBox dateTime={event.dateTime} />
                        <Spacer size={16} horizontal />
                        <EventStatusBox event={event} status={status} />
                    </View>

                    {status !== 'full' && (
                        <>
                            <Spacer size={16} />
                            <View style={styles.row}>
                                <BigButton
                                    style={styles.actionButton}
                                    label="Share"
                                    color={Colors.primary}
                                    featherIconName="share-2"
                                    onPress={handleShare}
                                />

                                {status === 'volunteered' ? (
                                    <>
                                        <Spacer size={8} horizontal />
                                        <BigButton
                                            style={styles.actionButton}
                                            label="Call"
                                            color={Colors.primary}
                                            featherIconName="phone"
                                            onPress={handleCall}
                                        />
                                        <Spacer size={8} horizontal />
                                        <BigButton
                                            style={styles.actionButton}
                                            label="Text"
                                            color={Colors.primary}
                                            featherIconName="message-circle"
                                            onPress={handleText}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <Spacer size={8} horizontal />
                                        <BigButton
                                            style={styles.actionButton}
                                            label="Volunteer"
                                            color={Colors.accent}
                                            featherIconName="plus"
                                            onPress={handleVolunteer}
                                        />
                                    </>
                                )}
                            </View>
                        </>
                    )}
                </View>

                <View style={styles.divider} />

                <View style={styles.content}>
                    <EventMapPreview position={event.position} />
                    <Spacer size={16} />
                    <BigButton
                        label="Get Directions to Event"
                        color={Colors.slate}
                        featherIconName="map-pin"
                        onPress={handleGetDirections}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    scrollContent: {
        paddingBottom: 32,
    },

    image: {
        width: '100%',
        height: 240,
    },

    content: {
        paddingHorizontal: 24,
        paddingVertical: 24,
    },

    title: {
        fontFamily: 'Nunito_800ExtraBold',
        fontSize: 24,
        color: Colors.heading,
    },

    organizer: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 14,
        color: Colors.muted,
        marginTop: 2,
    },

    description: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 16,
        lineHeight: 24,
        color: Colors.body,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },

    actionButton: {
        paddingHorizontal: 8,
    },

    divider: {
        height: 1,
        marginHorizontal: 24,
        backgroundColor: Colors.divider,
    },

    notFound: {
        margin: 24,
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 16,
        color: Colors.muted,
        textAlign: 'center',
    },
});
