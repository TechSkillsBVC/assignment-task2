import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { BOX_THEMES } from '../constants/Colors';
import { Event, EventStatus } from '../types/Event';
import InfoBox from './InfoBox';
import Spacer from './Spacer';

interface EventStatusBoxProps {
    event: Event;
    status: EventStatus;
}

export default function EventStatusBox({ event, status }: EventStatusBoxProps) {
    switch (status) {
        case EventStatus.Volunteered:
            return (
                <InfoBox theme={BOX_THEMES.blue}>
                    <Feather name="check" size={32} color={BOX_THEMES.blue.color} />
                    <Spacer size={8} />
                    <Text style={[styles.label, { color: BOX_THEMES.blue.color }]}>Volunteered</Text>
                </InfoBox>
            );
        case EventStatus.Full:
            return (
                <InfoBox theme={BOX_THEMES.grey}>
                    <Feather name="slash" size={32} color={BOX_THEMES.grey.color} />
                    <Spacer size={8} />
                    <Text style={[styles.label, { color: BOX_THEMES.grey.color }]}>Team is full</Text>
                </InfoBox>
            );
        case EventStatus.Open:
            return (
                <InfoBox theme={BOX_THEMES.orange}>
                    <Text style={[styles.count, { color: BOX_THEMES.orange.color }]}>
                        {event.volunteersIds.length}
                        <Text style={styles.countOf}> of </Text>
                        {event.volunteersNeeded}
                    </Text>
                    <Text style={[styles.label, { color: BOX_THEMES.orange.color }]}>Volunteer(s) needed</Text>
                </InfoBox>
            );
    }
}

const styles = StyleSheet.create({
    label: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 12,
        textAlign: 'center',
    },

    count: {
        fontFamily: 'Nunito_800ExtraBold',
        fontSize: 28,
    },

    countOf: {
        fontSize: 18,
    },
});
