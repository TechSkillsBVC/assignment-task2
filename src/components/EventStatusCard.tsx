import React from 'react';
import { StyleSheet, Text } from 'react-native';
import * as Colors from '../constants/Colors';
import { Event, EventStatus } from '../types/Event';
import InfoCard from './InfoCard';

interface EventStatusCardProps {
    event: Event;
    status: EventStatus;
}

export default function EventStatusCard({ event, status }: EventStatusCardProps) {
    switch (status) {
        case 'volunteered':
            return (
                <InfoCard
                    label="Volunteered"
                    color={Colors.BLUE}
                    backgroundColor={Colors.BLUE_LIGHT}
                    featherIconName="check"
                />
            );
        case 'full':
            return (
                <InfoCard
                    label="Team is full"
                    color={Colors.GREY}
                    backgroundColor={Colors.GREY_LIGHT}
                    featherIconName="slash"
                />
            );
        case 'open':
            return (
                <InfoCard label="Volunteer(s) needed" color={Colors.ORANGE} backgroundColor={Colors.ORANGE_LIGHT}>
                    <Text style={styles.count}>
                        {event.volunteersIds.length}
                        <Text style={styles.countSeparator}> of </Text>
                        {event.volunteersNeeded}
                    </Text>
                </InfoCard>
            );
    }
}

const styles = StyleSheet.create({
    count: {
        fontFamily: 'Nunito_800ExtraBold',
        fontSize: 32,
        lineHeight: 36,
        color: Colors.ORANGE,
    },

    countSeparator: {
        fontSize: 24,
    },
});
