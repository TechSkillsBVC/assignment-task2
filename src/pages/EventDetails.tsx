import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useContext, useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Linking,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import customMapStyle from '../../map-style.json';
import { AuthenticationContext } from '../context/AuthenticationContext';
import mapMarkerImg from '../images/map-marker.png';
import * as api from '../services/api';
import { User } from '../types/User';
import { VolunteerEvent } from '../types/VolunteerEvent';

interface EventDetailsRouteParams {
    event: VolunteerEvent;
}

export default function EventDetails({ navigation, route }: StackScreenProps<any>) {
    const authenticationContext = useContext(AuthenticationContext);
    const routeParams = route.params as EventDetailsRouteParams;
    const [event, setEvent] = useState<VolunteerEvent>(routeParams.event);
    const [organizer, setOrganizer] = useState<User>();
    const [isSaving, setIsSaving] = useState(false);

    const currentUserId = authenticationContext?.value?.id;
    const hasVolunteered = Boolean(currentUserId && event.volunteersIds.includes(currentUserId));
    const isFull = event.volunteersIds.length >= event.volunteersNeeded;
    const canVolunteer = !hasVolunteered && !isFull;
    const canShare = hasVolunteered || !isFull;

    useEffect(() => {
        api.getUser(event.organizerId)
            .then(({ data }) => setOrganizer(data as User))
            .catch(() => setOrganizer(undefined));
    }, [event.organizerId]);

    const handleVolunteer = async () => {
        if (!currentUserId || !canVolunteer || isSaving) return;

        const volunteersIds = [...event.volunteersIds, currentUserId];
        setIsSaving(true);

        try {
            const { data } = await api.updateEvent(event.id, { volunteersIds });
            setEvent(data);
            Alert.alert('Thank you!', 'You have volunteered for this event.');
        } catch {
            Alert.alert('Unable to volunteer', 'Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                title: event.name,
                message: `${event.name}\n${formatDateAndTime(event.dateTime)}\nJoin me as a volunteer!`,
            });
        } catch {
            Alert.alert('Unable to share', 'Please try again.');
        }
    };

    const openUrl = async (url: string, errorMessage: string) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (!supported) throw new Error('Unsupported URL');
            await Linking.openURL(url);
        } catch {
            Alert.alert(errorMessage);
        }
    };

    const handleCall = () => {
        if (!organizer?.mobile) {
            Alert.alert('Contact information is unavailable.');
            return;
        }
        openUrl(`tel:${organizer.mobile.replace(/[^\d+]/g, '')}`, 'Calling is unavailable.');
    };

    const handleText = () => {
        if (!organizer?.mobile) {
            Alert.alert('Contact information is unavailable.');
            return;
        }
        openUrl(`sms:${organizer.mobile.replace(/[^\d+]/g, '')}`, 'Texting is unavailable.');
    };

    const handleDirections = () => {
        const { latitude, longitude } = event.position;
        openUrl(
            `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
            'Directions are unavailable.'
        );
    };

    const organizerName = organizer ? `${organizer.name.first} ${organizer.name.last}` : 'Event organizer';

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <RectButton style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={24} color="#00A3FF" />
                </RectButton>
                <Text style={styles.headerTitle}>Event</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {event.imageUrl ? (
                    <Image source={{ uri: event.imageUrl }} style={styles.heroImage} resizeMode="cover" />
                ) : (
                    <View style={[styles.heroImage, styles.imagePlaceholder]}>
                        <Feather name="image" size={40} color="#8FA7B3" />
                    </View>
                )}

                <View style={styles.content}>
                    <Text style={styles.title}>{event.name}</Text>
                    <Text style={styles.organizer}>organized by {organizerName}</Text>
                    <Text style={styles.description}>{event.description}</Text>

                    <View style={styles.statusRow}>
                        <View style={[styles.statusCard, styles.dateCard]}>
                            <Feather name="calendar" size={36} color="#00A3FF" />
                            <Text style={styles.dateText}>{formatDate(event.dateTime)}</Text>
                            <Text style={styles.dateText}>{formatTime(event.dateTime)}</Text>
                        </View>

                        {hasVolunteered ? (
                            <View style={[styles.statusCard, styles.volunteeredCard]}>
                                <Feather name="check" size={40} color="#00A3FF" />
                                <Text style={styles.volunteeredText}>Volunteered</Text>
                            </View>
                        ) : isFull ? (
                            <View style={[styles.statusCard, styles.fullCard]}>
                                <Feather name="slash" size={40} color="#8FA7B3" />
                                <Text style={styles.fullText}>Team is full</Text>
                            </View>
                        ) : (
                            <View style={[styles.statusCard, styles.availableCard]}>
                                <Text style={styles.volunteerCount}>
                                    {event.volunteersIds.length} of {event.volunteersNeeded}
                                </Text>
                                <Text style={styles.availableText}>Volunteer(s){'\n'}needed</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.actionRow}>
                        {canShare && <ActionButton icon="share-2" label="Share" onPress={handleShare} />}
                        {hasVolunteered && (
                            <>
                                <ActionButton icon="phone" label="Call" onPress={handleCall} />
                                <ActionButton icon="message-circle" label="Text" onPress={handleText} />
                            </>
                        )}
                        {canVolunteer && (
                            <ActionButton
                                icon="plus"
                                label={isSaving ? 'Saving...' : 'Volunteer'}
                                color="#FF8700"
                                onPress={handleVolunteer}
                            />
                        )}
                    </View>

                    <View style={styles.divider} />

                    <MapView
                        provider={PROVIDER_GOOGLE}
                        style={styles.previewMap}
                        customMapStyle={customMapStyle}
                        initialRegion={{
                            ...event.position,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                        scrollEnabled={false}
                        zoomEnabled={false}
                        rotateEnabled={false}
                        pitchEnabled={false}
                        toolbarEnabled={false}
                    >
                        <Marker coordinate={event.position}>
                            <Image resizeMode="contain" style={styles.mapMarker} source={mapMarkerImg} />
                        </Marker>
                    </MapView>

                    <RectButton style={styles.directionsButton} onPress={handleDirections}>
                        <Feather name="map-pin" size={20} color="#FFF" />
                        <Text style={styles.directionsText}>Get Directions to Event</Text>
                    </RectButton>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

interface ActionButtonProps {
    icon: keyof typeof Feather.glyphMap;
    label: string;
    onPress: () => void;
    color?: string;
}

function ActionButton({ icon, label, onPress, color = '#00A3FF' }: ActionButtonProps) {
    return (
        <RectButton style={[styles.actionButton, { backgroundColor: color }]} onPress={onPress}>
            <Feather name={icon} size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>{label}</Text>
        </RectButton>
    );
}

const MONTHS = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];

function formatDate(dateTime: string) {
    const date = new Date(dateTime);
    return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatTime(dateTime: string) {
    const date = new Date(dateTime);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const twelveHour = hours % 12 || 12;
    return `${twelveHour}:${minutes} ${period}`;
}

function formatDateAndTime(dateTime: string) {
    return `${formatDate(dateTime)} at ${formatTime(dateTime)}`;
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: '#FFF',
    },
    backButton: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
    },
    headerTitle: {
        color: '#8FA7B3',
        fontFamily: 'Nunito_700Bold',
        fontSize: 16,
    },
    headerSpacer: {
        width: 48,
    },
    scrollContent: {
        backgroundColor: '#EDF7FA',
        paddingBottom: 24,
    },
    heroImage: {
        width: '100%',
        height: 220,
    },
    imagePlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#DDE9ED',
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    title: {
        color: '#4D6F80',
        fontFamily: 'Nunito_800ExtraBold',
        fontSize: 25,
    },
    organizer: {
        color: '#8FA7B3',
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 13,
        marginTop: 2,
    },
    description: {
        color: '#5C8599',
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 15,
        lineHeight: 20,
        marginTop: 18,
        marginBottom: 20,
    },
    statusRow: {
        flexDirection: 'row',
        gap: 8,
    },
    statusCard: {
        flex: 1,
        minHeight: 136,
        borderWidth: 2,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
    },
    dateCard: {
        borderColor: '#8DD8FF',
        backgroundColor: '#F1FAFF',
    },
    dateText: {
        color: '#00A3FF',
        fontFamily: 'Nunito_700Bold',
        fontSize: 13,
        marginTop: 4,
        textAlign: 'center',
    },
    volunteeredCard: {
        borderColor: '#8DD8FF',
        backgroundColor: '#F1FAFF',
    },
    volunteeredText: {
        color: '#00A3FF',
        fontFamily: 'Nunito_700Bold',
        fontSize: 14,
        marginTop: 12,
    },
    availableCard: {
        borderColor: '#FFC780',
        backgroundColor: '#FFF8EF',
    },
    volunteerCount: {
        color: '#FF8700',
        fontFamily: 'Nunito_800ExtraBold',
        fontSize: 27,
    },
    availableText: {
        color: '#FF8700',
        fontFamily: 'Nunito_700Bold',
        fontSize: 13,
        lineHeight: 16,
        marginTop: 8,
        textAlign: 'center',
    },
    fullCard: {
        borderColor: '#C7D4D9',
        backgroundColor: '#E3EBEE',
    },
    fullText: {
        color: '#8FA7B3',
        fontFamily: 'Nunito_700Bold',
        fontSize: 14,
        marginTop: 12,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 16,
    },
    actionButton: {
        flex: 1,
        minHeight: 56,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 10,
    },
    actionButtonText: {
        color: '#FFF',
        fontFamily: 'Nunito_700Bold',
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: '#DDE9ED',
        marginVertical: 20,
    },
    previewMap: {
        width: '100%',
        height: 280,
        borderRadius: 12,
    },
    mapMarker: {
        width: 48,
        height: 54,
    },
    directionsButton: {
        height: 56,
        marginTop: 16,
        borderRadius: 12,
        backgroundColor: '#4D6F80',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    directionsText: {
        color: '#FFF',
        fontFamily: 'Nunito_700Bold',
        fontSize: 15,
    },
});
