import React from 'react';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { VolunteerEvent } from '../types/Event';
import { eventState } from '../utils/eventState';

export default function EventStatus({ event, userId }: { event: VolunteerEvent; userId?: string }) {
    const state = eventState(event, userId);
    const date = new Date(event.dateTime);
    return <View style={styles.row}>
        <View style={[styles.box, { borderColor: '#5AA3FF' }]}>
            <Feather name="calendar" size={28} color="#5AA3FF" />
            <Text style={[styles.title, { color: '#5AA3FF' }]}>{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</Text>
            <Text style={styles.caption}>{date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</Text>
        </View>
        <View style={[styles.box, { borderColor: state.color, backgroundColor: state.color + '12' }]}>
            <Feather name={state.applied ? 'check' : state.full ? 'slash' : 'users'} size={28} color={state.color} />
            <Text style={[styles.title, { color: state.color }]}>{state.status}</Text>
            <Text style={styles.caption}>{state.applied ? 'You are on the team' : state.full ? 'No spaces remaining' : 'volunteers'}</Text>
        </View>
    </View>;
}
const styles = StyleSheet.create({
    row: { flexDirection: 'row', marginVertical: 20 },
    box: { flex: 1, marginHorizontal: 4, borderWidth: 1, borderRadius: 8, padding: 16, alignItems: 'center', justifyContent: 'center' },
    title: { fontFamily: 'Nunito_800ExtraBold', fontSize: 18, marginTop: 8, textAlign: 'center' },
    caption: { fontFamily: 'Nunito_600SemiBold', color: '#8FA7B3', fontSize: 12, textAlign: 'center' },
});
