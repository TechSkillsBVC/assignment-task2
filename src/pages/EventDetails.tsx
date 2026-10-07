import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, Linking, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { Marker } from 'react-native-maps';
import { AuthenticationContext } from '../context/AuthenticationContext';
import * as api from '../services/api';
import { getFromCache } from '../services/caching';
import { Event } from '../types/Event';
import { User } from '../types/User';
import { getMapsUrl } from '../utils';


export default function EventDetails({ navigation, route }: StackScreenProps<any>) {
    const { eventId } = route.params as { eventId: string };
    const authenticationContext = useContext(AuthenticationContext);
    const [event, setEvent] = useState<Event>();
    const [organizer, setOrganizer] = useState<User>();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        api.getEvent(eventId)
            .then(async ({ data }) => {
                if (!isMounted) return;
                setEvent(data);
                try {
                    const organizerResponse = await api.getUser(data.organizerId);
                    if (isMounted) setOrganizer(organizerResponse.data);
                } catch {
                    if (isMounted) setOrganizer(undefined);
                }
            })
            .catch(() => Alert.alert('Unable to load event', 'Check that the event server is running and try again.'))
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [eventId]);

    const userId = authenticationContext?.value?.id;
    const hasVolunteered = !!event && !!userId && event.volunteersIds.includes(userId);
    const spotsLeft = event ? Math.max(event.volunteersNeeded - event.volunteersIds.length, 0) : 0;
    const teamIsFull = !!event && spotsLeft === 0 && !hasVolunteered;

    const handleVolunteer = async () => {
        if (!event || !userId || hasVolunteered || spotsLeft === 0 || saving) return;

        setSaving(true);
        try {
            const accessToken = await getFromCache<string>('accessToken');
            const volunteersIds = [...new Set([...event.volunteersIds, userId])];
            const response = await api.addEventVolunteer(event.id, volunteersIds, accessToken);
            setEvent(response.data);
        } catch {
            Alert.alert('Unable to volunteer', 'Your spot was not saved. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleShare = () => {
        if (event) Share.share({ message: `${event.name}\n${event.description}` });
    };

    const handleContact = (method: 'tel' | 'sms') => {
        if (!organizer?.mobile) {
            Alert.alert('Contact unavailable', 'The organizer has not added a phone number.');
            return;
        }
        Linking.openURL(`${method}:${organizer.mobile}`).catch(() =>
            Alert.alert('Unable to open app', 'No compatible phone or messaging app was found.')
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#00A3FF" />
            </View>
        );
    }

    if (!event) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Event details could not be loaded.</Text>
                <RectButton style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.buttonLabel}>Go back</Text>
                </RectButton>
            </View>
        );
    }

    const eventDate = new Date(event.dateTime);
    const dateLabel = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeLabel = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const organizerName = organizer ? `${organizer.name.first} ${organizer.name.last}` : 'Community organizer';

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <RectButton style={styles.backIcon} onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={22} color="#00A3FF" />
                </RectButton>
                <Text style={styles.topBarTitle}>Event</Text>
                <View style={styles.backIcon} />
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <ImageBackground source={{ uri: event.imageUrl }} style={styles.heroImage} />
                <View style={styles.details}>
                    <Text style={styles.title}>{event.name}</Text>
                    <Text style={styles.organizer}>organized by {organizerName}</Text>
                    <Text style={styles.description}>{event.description}</Text>

                    <View style={styles.infoRow}>
                        <View style={styles.infoCard}>
                            <Feather name="calendar" size={25} color="#00A3FF" />
                            <Text style={styles.infoText}>{dateLabel}{'\n'}{timeLabel}</Text>
                        </View>
                        <View style={[styles.infoCard, hasVolunteered ? styles.joinedCard : teamIsFull ? styles.fullCard : styles.openCard]}>
                            <Feather
                                name={hasVolunteered ? 'check' : teamIsFull ? 'slash' : 'users'}
                                size={25}
                                color={hasVolunteered ? '#00A3FF' : teamIsFull ? '#8FA7B3' : '#FF8700'}
                            />
                            <Text style={[styles.infoText, hasVolunteered && styles.blueText, !hasVolunteered && !teamIsFull && styles.orangeText]}>
                                {hasVolunteered ? 'Volunteered' : teamIsFull ? 'Team is full' : `${spotsLeft} of ${event.volunteersNeeded}\nvolunteer(s) needed`}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.actionRow}>
                        <RectButton style={[styles.actionButton, styles.blueButton]} onPress={handleShare}>
                            <Feather name="share-2" size={18} color="#FFF" />
                            <Text style={styles.buttonLabel}>Share</Text>
                        </RectButton>
                        {hasVolunteered ? (
                            <>
                                <RectButton style={[styles.actionButton, styles.blueButton]} onPress={() => handleContact('tel')}>
                                    <Feather name="phone" size={18} color="#FFF" />
                                    <Text style={styles.buttonLabel}>Call</Text>
                                </RectButton>
                                <RectButton style={[styles.actionButton, styles.blueButton]} onPress={() => handleContact('sms')}>
                                    <Feather name="message-circle" size={18} color="#FFF" />
                                    <Text style={styles.buttonLabel}>Text</Text>
                                </RectButton>
                            </>
                        ) : teamIsFull ? null : (
                            <RectButton
                                style={[styles.actionButton, styles.orangeButton, saving && styles.disabledButton]}
                                onPress={handleVolunteer}
                                enabled={!saving}
                            >
                                <Feather name="plus" size={18} color="#FFF" />
                                <Text style={styles.buttonLabel}>{saving ? 'Saving...' : 'Volunteer'}</Text>
                            </RectButton>
                        )}
                    </View>

                    <View style={styles.divider} />
                    <MapView
                        style={styles.map}
                        initialRegion={{ ...event.position, latitudeDelta: 0.004, longitudeDelta: 0.004 }}
                        scrollEnabled={false}
                        zoomEnabled={false}
                        rotateEnabled={false}
                        toolbarEnabled={false}
                    >
                        <Marker coordinate={event.position} title={event.name} />
                    </MapView>
                    <RectButton
                        style={styles.directionsButton}
                        onPress={() => Linking.openURL(getMapsUrl(event.position))}
                    >
                        <Feather name="map-pin" size={17} color="#FFF" />
                        <Text style={styles.buttonLabel}>Get Directions to Event</Text>
                    </RectButton>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#E9F2F5' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E9F2F5', padding: 24 },
    topBar: {
        height: 64,
        paddingHorizontal: 16,
        paddingTop: 12,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backIcon: { width: 40, height: 40, justifyContent: 'center' },
    topBarTitle: { fontFamily: 'Nunito_600SemiBold', color: '#8FA7B3', fontSize: 14 },
    content: { paddingBottom: 28 },
    heroImage: { height: 220, width: '100%', backgroundColor: '#D3E2E5' },
    details: { paddingHorizontal: 20, paddingTop: 16 },
    title: { color: '#5C8599', fontFamily: 'Nunito_800ExtraBold', fontSize: 21 },
    organizer: { color: '#8FA7B3', fontFamily: 'Nunito_600SemiBold', fontSize: 12, marginTop: 1 },
    description: { color: '#5C8599', fontFamily: 'Nunito_600SemiBold', fontSize: 13, marginTop: 12, marginBottom: 14 },
    infoRow: { flexDirection: 'row', gap: 8 },
    infoCard: {
        flex: 1,
        minHeight: 76,
        borderWidth: 1,
        borderColor: '#00A3FF',
        borderRadius: 7,
        backgroundColor: '#E2F4FF',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        gap: 3,
    },
    openCard: { borderColor: '#FF8700', backgroundColor: '#F9E9D9' },
    joinedCard: { borderColor: '#00A3FF', backgroundColor: '#E2F4FF' },
    fullCard: { borderColor: '#B7C9CF', backgroundColor: '#D8E4E7' },
    infoText: { color: '#00A3FF', fontFamily: 'Nunito_700Bold', fontSize: 10, textAlign: 'center' },
    blueText: { color: '#00A3FF' },
    orangeText: { color: '#E87500' },
    actionRow: { flexDirection: 'row', gap: 7, marginTop: 14 },
    actionButton: { minHeight: 44, borderRadius: 12, paddingHorizontal: 14, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    blueButton: { backgroundColor: '#00A3FF' },
    orangeButton: { backgroundColor: '#FF8700' },
    disabledButton: { opacity: 0.65 },
    buttonLabel: { color: '#FFF', fontFamily: 'Nunito_800ExtraBold', fontSize: 12 },
    divider: { height: 1, backgroundColor: '#D3E2E5', marginVertical: 14 },
    map: { height: 210, borderRadius: 7 },
    directionsButton: { height: 44, borderRadius: 10, backgroundColor: '#4D6F80', marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
    errorText: { color: '#5C8599', fontFamily: 'Nunito_700Bold', marginBottom: 16 },
    backButton: { paddingHorizontal: 24, height: 44, borderRadius: 10, backgroundColor: '#4D6F80', alignItems: 'center', justifyContent: 'center' },
});