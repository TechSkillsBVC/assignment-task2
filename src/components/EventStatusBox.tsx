import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Colors } from '../constants/Colors';
import { Event, EventStatus } from '../types/Event';
import DetailBox from './DetailBox';

interface EventStatusBoxProps {
    event: Event;
    status: EventStatus;
}

/**
 * Right-hand box on the event details screen. It shows one of three things:
 * the user has volunteered, the team is full, or how many volunteers are still needed.
 */
export default function EventStatusBox({ event, status }: EventStatusBoxProps) {
    if (status === 'volunteered') {
        return (
            <DetailBox variant="info" featherIconName="check">
                <Text style={[styles.label, { color: Colors.primary }]}>Volunteered</Text>
            </DetailBox>
        );
    }

    if (status === 'full') {
        return (
            <DetailBox variant="disabled" featherIconName="slash">
                <Text style={[styles.label, { color: Colors.muted }]}>Team is full</Text>
            </DetailBox>
        );
    }

    return (
        <DetailBox variant="warning">
            <Text style={styles.count}>
                {event.volunteersIds.length}
                <Text style={styles.countSeparator}> of </Text>
                {event.volunteersNeeded}
            </Text>
            <Text style={[styles.label, { color: Colors.accent }]}>Volunteer(s) needed</Text>
        </DetailBox>
    );
}

const styles = StyleSheet.create({
    label: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 15,
        textAlign: 'center',
    },

    count: {
        fontFamily: 'Nunito_800ExtraBold',
        fontSize: 28,
        color: Colors.accent,
        textAlign: 'center',
        marginBottom: 4,
    },

    countSeparator: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 18,
    },
});
