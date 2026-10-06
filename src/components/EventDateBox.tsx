import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Colors } from '../constants/Colors';
import { formatEventDate, formatEventTime } from '../utils/events';
import DetailBox from './DetailBox';

interface EventDateBoxProps {
    dateTime: Date;
}

export default function EventDateBox({ dateTime }: EventDateBoxProps) {
    return (
        <DetailBox variant="info" featherIconName="calendar">
            <Text style={styles.text}>{formatEventDate(dateTime)}</Text>
            <Text style={styles.text}>{formatEventTime(dateTime)}</Text>
        </DetailBox>
    );
}

const styles = StyleSheet.create({
    text: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 15,
        color: Colors.primary,
        textAlign: 'center',
    },
});
