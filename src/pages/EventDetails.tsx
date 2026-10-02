import React, { useContext, useState } from 'react';
import { Alert, Image, Linking, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import MapView from 'react-native-maps';
import data from '../../db.json';
import customMapStyle from '../../map-style.json';
import { AuthenticationContext } from '../context/AuthenticationContext';
import { useEvents } from '../context/EventsContext';
import { RootStackParamList } from '../routes/types';
import EventStatus from '../components/EventStatus';
import EventActions from '../components/EventActions';
import EventMarker from '../components/EventMarker';
import BigButton from '../components/BigButton';
import { DEFAULT_DELTA } from '../constants/MapSettings';

export default function EventDetails({ route, navigation }: StackScreenProps<RootStackParamList, 'EventDetails'>) {
    const { events, volunteer, ready } = useEvents();
    const user = useContext(AuthenticationContext)?.value;
    const event = events.find(item => item.id === route.params.eventId);
    const [busy, setBusy] = useState(false);
    if (!event) return <SafeAreaView><Text>Event not found.</Text><BigButton label="Back" color="#5AA3FF" onPress={() => navigation.goBack()} /></SafeAreaView>;
    const organizer = data.users.find(person => person.id === event.organizerId);
    const { latitude, longitude } = event.position;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    const openUrl = async (url: string) => {
        try { await Linking.openURL(url); }
        catch { Alert.alert('Unable to open', 'Please check that a compatible app is installed.'); }
    };
    const contact = (scheme: 'tel' | 'sms') => {
        if (!organizer?.mobile) { Alert.alert('Contact unavailable', 'This organizer has no phone number.'); return; }
        void openUrl(`${scheme}:${organizer.mobile.replace(/[^+\d]/g, '')}`);
    };
    const handleVolunteer = async () => {
        if (busy || !ready) return;
        if (!user) { Alert.alert('Sign in required', 'Please sign in to volunteer.'); return; }
        setBusy(true);
        try { await volunteer(event.id, user.id); }
        catch { Alert.alert('Unable to save', 'Your registration was not saved. Please try again.'); }
        finally { setBusy(false); }
    };
    const handleShare = async () => {
        try { await Share.share({ title: event.name, message: `${event.name}\n${event.description}\n${new Date(event.dateTime).toLocaleString()}\n${directionsUrl}` }); }
        catch { Alert.alert('Unable to share', 'Please try again.'); }
    };
    return <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to events" onPress={() => navigation.goBack()} style={styles.back}>
                <Feather name="arrow-left" size={24} color="#5AA3FF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Event</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
            {event.imageUrl && <Image source={{ uri: event.imageUrl }} style={styles.image} accessibilityLabel={event.name} />}
            <View style={styles.details}>
                <Text style={styles.title}>{event.name}</Text>
                <Text style={styles.description}>{event.description}</Text>
                {organizer && <Text style={styles.organizer}>Organized by {organizer.name.first} {organizer.name.last}</Text>}
                <EventStatus event={event} userId={user?.id} />
                <EventActions event={event} userId={user?.id} busy={busy || !ready}
                    onVolunteer={handleVolunteer} onShare={handleShare} onCall={() => contact('tel')} onText={() => contact('sms')} />
                <MapView style={styles.map} customMapStyle={customMapStyle} initialRegion={{ ...event.position, ...DEFAULT_DELTA }}
                    scrollEnabled={false} zoomEnabled={false} rotateEnabled={false} toolbarEnabled={false}>
                    <EventMarker event={event} userId={user?.id} />
                </MapView>
                <View style={styles.routes}><BigButton label="Get directions to event" featherIconName="navigation" color="#4D6F80" onPress={() => void openUrl(directionsUrl)} /></View>
            </View>
        </ScrollView>
    </SafeAreaView>;
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#EFF7F9' },
    header: { flexDirection: 'row', alignItems: 'center', height: 52, backgroundColor: '#FFF' },
    back: { padding: 14 }, headerTitle: { fontFamily: 'Nunito_700Bold', color: '#8FA7B3', fontSize: 16 },
    content: { paddingBottom: 24 }, image: { width: '100%', height: 220 },
    details: { padding: 24 }, title: { fontFamily: 'Nunito_800ExtraBold', fontSize: 24, color: '#4D6F80', marginBottom: 8 },
    description: { fontFamily: 'Nunito_400Regular', fontSize: 15, lineHeight: 22, color: '#5C8599' },
    organizer: { fontFamily: 'Nunito_600SemiBold', fontSize: 12, color: '#8FA7B3', marginTop: 12 },
    map: { height: 250, borderRadius: 12 }, routes: { flexDirection: 'row', marginTop: 16 },
});
