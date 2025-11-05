import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useContext, useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { AuthenticationContext } from '../context/AuthenticationContext';
import mapMarker from '../images/map-marker.png';
import { getEventById } from '../services/api';
import { Event } from '../types/Event';

export default function EventDetails({ route, navigation }: StackScreenProps<any>) {
    const { eventId } = route.params;
    const authenticationContext = useContext(AuthenticationContext);
    const currentUserId = authenticationContext?.value?.id;

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvent();
    }, [eventId]);

    const loadEvent = async () => {
        try {
            setLoading(true);
            const response = await getEventById(eventId);
            setEvent(response.data);
        } catch (error) {
            console.error('Error loading event:', error);
            Alert.alert('Error', 'Failed to load event details');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !event) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    const isUserVolunteered = event.volunteersIds.includes(currentUserId || '');
    const isEventFull = event.volunteersIds.length >= event.volunteersNeeded;
    const spotsLeft = event.volunteersNeeded - event.volunteersIds.length;

    const showContactButtons = isUserVolunteered;
    const showVolunteerButton = !isEventFull && !isUserVolunteered;
    const showShareButton = !isEventFull || isUserVolunteered;

    const handleCall = () => {
        const phoneNumber = event.organizerId;
        const phoneUrl = Platform.OS === 'ios' ? `telprompt:${phoneNumber}` : `tel:${phoneNumber}`;
        Linking.openURL(phoneUrl);
    };

    const handleText = () => {
        const phoneNumber = event.organizerId;
        const smsUrl = Platform.OS === 'ios' ? `sms:${phoneNumber}` : `sms:${phoneNumber}`;
        Linking.openURL(smsUrl);
    };

    const handleVolunteer = () => {
        Alert.alert(
            'Volunteer',
            'Would you like to volunteer for this event?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: () => {
                        Alert.alert('Success', 'You have volunteered for this event!');
                    },
                },
            ]
        );
    };

    const handleShare = () => {
        Alert.alert('Share', 'Share functionality coming soon!');
    };

    const handleShowDirections = () => {
        const url = Platform.select({
            ios: `maps:0,0?q=${event.position.latitude},${event.position.longitude}`,
            android: `geo:0,0?q=${event.position.latitude},${event.position.longitude}`,
        });
        if (url) {
            Linking.openURL(url);
        }
    };

    const getStatusBoxStyle = () => {
        if (isUserVolunteered) {
            return { backgroundColor: '#D4EDDA', borderColor: '#C3E6CB' };
        } else if (isEventFull) {
            return { backgroundColor: '#F0F0F0', borderColor: '#D3D3D3' };
        } else {
            return { backgroundColor: '#FFE8CC', borderColor: '#FFD699' };
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />

            <View style={styles.backButton}>
                <RectButton onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={24} color="#00A3FF" />
                </RectButton>
            </View>

            <View style={styles.contentContainer}>
                <Text style={styles.eventName}>{event.name}</Text>

                {/* Icon-Based Status Display */}
                <View style={styles.statusContainer}>
                    {/* Date/Time Box */}
                    <View style={styles.dateBox}>
                        <Feather name="calendar" size={24} color="#00A3FF" />
                        <Text style={styles.dateText}>
                            {new Date(event.dateTime).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </Text>
                        <Text style={styles.timeText}>
                            {new Date(event.dateTime).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                            })}
                        </Text>
                    </View>

                    {/* Status Box - Changes based on volunteer status */}
                    <View style={[styles.statusBox, getStatusBoxStyle()]}>
                        {isUserVolunteered ? (
                            <>
                                <Feather name="check" size={24} color="#28A745" />
                                <Text style={styles.statusLabel}>Volunteered</Text>
                            </>
                        ) : isEventFull ? (
                            <>
                                <Feather name="slash" size={24} color="#8FA7B3" />
                                <Text style={styles.statusLabel}>Event Full</Text>
                            </>
                        ) : (
                            <>
                                <Text style={styles.volunteerCount}>{event.volunteersIds.length} of {event.volunteersNeeded}</Text>
                                <Text style={styles.statusLabel}>Volunteers</Text>
                                <Text style={styles.spotsLeft}>{spotsLeft} spots left</Text>
                            </>
                        )}
                    </View>
                </View>

                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.description}>{event.description}</Text>

                <Text style={styles.sectionTitle}>Event Location</Text>
                <MapView
                    style={styles.mapStyle}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={{
                        latitude: event.position.latitude,
                        longitude: event.position.longitude,
                        latitudeDelta: 0.008,
                        longitudeDelta: 0.008,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                >
                    <Marker
                        coordinate={{
                            latitude: event.position.latitude,
                            longitude: event.position.longitude,
                        }}
                    >
                        <Image
                            source={mapMarker}
                            style={{ width: 48, height: 54 }}
                            resizeMode="contain"
                        />
                    </Marker>
                </MapView>

                <RectButton style={styles.directionsButton} onPress={handleShowDirections}>
                    <Feather name="navigation" size={16} color="#00A3FF" />
                    <Text style={styles.directionsText}>Show directions on map</Text>
                </RectButton>

                <Text style={styles.sectionTitle}>Contact Organizer</Text>
                <Text style={styles.organizerName}>{event.organizerId}</Text>

                {showContactButtons && (
                    <View style={styles.contactButtonsRow}>
                        <RectButton style={styles.callButton} onPress={handleCall}>
                            <Feather name="phone" size={20} color="#FFF" />
                            <Text style={styles.callButtonText}>Call</Text>
                        </RectButton>

                        <RectButton style={styles.textButton} onPress={handleText}>
                            <Feather name="message-circle" size={20} color="#FFF" />
                            <Text style={styles.textButtonText}>Text</Text>
                        </RectButton>
                    </View>
                )}

                {showShareButton && (
                    <RectButton style={styles.shareButton} onPress={handleShare}>
                        <Feather name="share-2" size={20} color="#00A3FF" />
                    </RectButton>
                )}

                {showVolunteerButton && (
                    <RectButton style={styles.volunteerButton} onPress={handleVolunteer}>
                        <Text style={styles.volunteerButtonText}>Volunteer</Text>
                    </RectButton>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F3F5',
    },
    eventImage: {
        width: '100%',
        height: 240,
        resizeMode: 'cover',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 24,
        width: 40,
        height: 40,
        backgroundColor: '#FFF',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    contentContainer: {
        padding: 24,
    },
    eventName: {
        fontFamily: 'Nunito_700Bold',
        fontSize: 24,
        color: '#4D6F80',
        marginBottom: 16,
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 24,
    },
    dateBox: {
        flex: 1,
        backgroundColor: '#E3F2FD',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#BBDEFB',
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
    },
    dateText: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 14,
        color: '#4D6F80',
        textAlign: 'center',
        marginTop: 8,
    },
    timeText: {
        fontFamily: 'Nunito_400Regular',
        fontSize: 12,
        color: '#8FA7B3',
        textAlign: 'center',
        marginTop: 4,
    },
    statusBox: {
        flex: 1,
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
    },
    statusLabel: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 14,
        color: '#4D6F80',
        textAlign: 'center',
        marginTop: 8,
    },
    volunteerCount: {
        fontFamily: 'Nunito_700Bold',
        fontSize: 20,
        color: '#FF8700',
    },
    spotsLeft: {
        fontFamily: 'Nunito_400Regular',
        fontSize: 12,
        color: '#8FA7B3',
        marginTop: 4,
        textAlign: 'center',
    },
    sectionTitle: {
        fontFamily: 'Nunito_700Bold',
        fontSize: 18,
        color: '#4D6F80',
        marginBottom: 12,
        marginTop: 8,
    },
    description: {
        fontFamily: 'Nunito_400Regular',
        fontSize: 15,
        color: '#5C8599',
        lineHeight: 24,
        marginBottom: 24,
    },
    mapStyle: {
        width: '100%',
        height: 150,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#D3E2E5',
        marginBottom: 12,
    },
    directionsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginBottom: 24,
    },
    directionsText: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 15,
        color: '#00A3FF',
        marginLeft: 8,
    },
    organizerName: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 16,
        color: '#4D6F80',
        marginBottom: 16,
    },
    contactButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 16,
    },
    callButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#00A3FF',
        borderRadius: 16,
        padding: 16,
        height: 56,
    },
    callButtonText: {
        fontFamily: 'Nunito_700Bold',
        fontSize: 16,
        color: '#FFF',
        marginLeft: 8,
    },
    textButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF8700',
        borderRadius: 16,
        padding: 16,
        height: 56,
    },
    textButtonText: {
        fontFamily: 'Nunito_700Bold',
        fontSize: 16,
        color: '#FFF',
        marginLeft: 8,
    },
    shareButton: {
        width: 56,
        height: 56,
        backgroundColor: '#FFF',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#D3E2E5',
        marginBottom: 24,
    },
    volunteerButton: {
        backgroundColor: '#FF8700',
        borderRadius: 16,
        padding: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    volunteerButtonText: {
        fontFamily: 'Nunito_700Bold',
        fontSize: 16,
        color: '#FFF',
    },
});