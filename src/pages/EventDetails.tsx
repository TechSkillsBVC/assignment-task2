import React, { useContext } from 'react';
import {
    Image,
    Linking,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';

import EventMapWebView from '../components/EventMapWebView';
import { AuthenticationContext } from '../context/AuthenticationContext';
import { EventsContext } from '../context/EventsContext';
import { EventDetail as EventDetailType } from '../types/Event';

export default function EventDetails({ route, navigation }: StackScreenProps<any>) {
    const id = route.params?.id;
    const authContext = useContext(AuthenticationContext);
    const currentUser = authContext?.value;
    const eventsContext = useContext(EventsContext);
    const event = eventsContext?.events.find((item) => item.id === id);

    if (!event) {
        return (
            <View style={styles.notFoundContainer}>
                <Text style={styles.notFoundText}>Event not found.</Text>
                <TouchableOpacity style={styles.directionsBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.btnText}>Back to map</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const appliedCount = event.volunteers.length;
    const isApplied = event.volunteers.some((v) => v.id === currentUser?.id);
    const isFull = appliedCount >= event.requiredVolunteers;

    const handleVolunteer = () => {
        if (!currentUser || !eventsContext) return;

        eventsContext.setEvents((currentEvents) =>
            currentEvents.map((item): EventDetailType =>
                item.id === event.id && !item.volunteers.some((volunteer) => volunteer.id === currentUser.id)
                    ? { ...item, volunteers: [...item.volunteers, { id: currentUser.id }] }
                    : item
            )
        );
    };

    const handleCall = () => Linking.openURL(`tel:${event.phone}`);
    const handleText = () => Linking.openURL(`sms:${event.phone}`);
    const handleShare = () => Share.share({ message: `Check out ${event.title} on VolunTeam!` });
    const handleGetDirections = () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${event.position.latitude},${event.position.longitude}`;
        Linking.openURL(url);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.topBar}>
                <TouchableOpacity
                    accessibilityLabel="Back to map"
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="arrow-left" size={22} color="#4D6F80" />
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>Event</Text>
                <View style={styles.backButton} />
            </View>
            <Image style={styles.image} source={{ uri: event.images[0]?.url }} />

            <View style={styles.detailsContainer}>
                <Text style={styles.title}>{event.title}</Text>
                <Text style={styles.organizer}>organized by {event.organizer}</Text>
                <Text style={styles.about}>{event.about}</Text>

                <View style={styles.statusRow}>
                    <View style={styles.timeBox}>
                        <Feather name="calendar" size={24} color="#00A3FF" />
                        <Text style={styles.timeText}>{event.date}</Text>
                        <Text style={styles.timeSubText}>{event.time}</Text>
                    </View>

                    {isApplied ? (
                        <View style={[styles.statusBox, styles.volunteeredBox]}>
                            <Feather name="check" size={28} color="#00A3FF" />
                            <Text style={styles.volunteeredText}>Volunteered</Text>
                        </View>
                    ) : !isFull ? (
                        <View style={[styles.statusBox, styles.neededBox]}>
                            <Text style={styles.neededCount}>{appliedCount} of {event.requiredVolunteers}</Text>
                            <Text style={styles.neededText}>Volunteers needed</Text>
                        </View>
                    ) : (
                        <View style={[styles.statusBox, styles.fullBox]}>
                            <FontAwesome name="ban" size={24} color="#8FA7B3" />
                            <Text style={styles.fullText}>Team is full</Text>
                        </View>
                    )}
                </View>

                <View style={styles.buttonGroup}>
                    {(isApplied || !isFull) && (
                        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                            <Feather name="share-2" size={18} color="#FFF" />
                            <Text style={styles.btnText}>Share</Text>
                        </TouchableOpacity>
                    )}

                    {isApplied && (
                        <>
                            <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
                                <Feather name="phone" size={18} color="#FFF" />
                                <Text style={styles.btnText}>Call</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtn} onPress={handleText}>
                                <Feather name="message-square" size={18} color="#FFF" />
                                <Text style={styles.btnText}>Text</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {!isApplied && !isFull && currentUser && (
                        <TouchableOpacity style={styles.volunteerBtn} onPress={handleVolunteer}>
                            <Feather name="plus" size={18} color="#FFF" />
                            <Text style={styles.btnText}>Volunteer</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.mapContainer}>
                    <EventMapWebView
                        events={[event]}
                        currentUserId={currentUser?.id}
                        interactive={false}
                        style={styles.map}
                    />
                    <TouchableOpacity style={styles.directionsBtn} onPress={handleGetDirections}>
                        <Feather name="map-pin" size={18} color="#FFF" />
                        <Text style={styles.btnText}>Get Directions to Event</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    notFoundContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    notFoundText: { fontSize: 16, color: '#4D6F80', marginBottom: 16 },
    topBar: {
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
    },
    backButton: { width: 40, height: 40, justifyContent: 'center' },
    topBarTitle: { color: '#4D6F80', fontFamily: 'Nunito_600SemiBold' },
    image: { width: '100%', height: 200 },
    detailsContainer: { padding: 20 },
    title: { fontSize: 22, fontFamily: 'Nunito_700Bold', color: '#4D6F80' },
    organizer: { fontSize: 13, color: '#8FA7B3', marginBottom: 12 },
    about: { fontSize: 14, color: '#5C8599', lineHeight: 20, marginBottom: 20 },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    timeBox: { width: '48%', backgroundColor: '#E6F7FF', borderRadius: 16, padding: 16, alignItems: 'center' },
    timeText: { fontSize: 12, color: '#00A3FF', fontWeight: 'bold', marginTop: 4 },
    timeSubText: { fontSize: 11, color: '#00A3FF' },
    statusBox: { width: '48%', borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center' },
    volunteeredBox: { backgroundColor: '#E6F7FF', borderWidth: 1, borderColor: '#B3E5FF' },
    volunteeredText: { fontSize: 12, color: '#00A3FF', fontWeight: 'bold', marginTop: 4 },
    neededBox: { backgroundColor: '#FFEEDC', borderWidth: 1, borderColor: '#FFB800' },
    neededCount: { fontSize: 18, fontWeight: 'bold', color: '#FF8A00' },
    neededText: { fontSize: 11, color: '#FF8A00' },
    fullBox: { backgroundColor: '#F0F0F0' },
    fullText: { fontSize: 12, color: '#8FA7B3', marginTop: 4 },
    buttonGroup: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    shareBtn: { flex: 1, backgroundColor: '#00A3FF', padding: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginRight: 6 },
    actionBtn: { flex: 1, backgroundColor: '#00A3FF', padding: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: 6 },
    volunteerBtn: { flex: 2, backgroundColor: '#FF8A00', padding: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: 6 },
    btnText: { color: '#FFF', fontWeight: 'bold', marginLeft: 6 },
    mapContainer: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#E6F7FF' },
    map: { width: '100%', height: 150 },
    directionsBtn: { backgroundColor: '#4D6F80', padding: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
});