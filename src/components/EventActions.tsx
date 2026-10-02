import React from 'react';
import { View, StyleSheet } from 'react-native';
import BigButton from './BigButton';
import { VolunteerEvent } from '../types/Event';
import { eventState } from '../utils/eventState';

interface Props {
    event: VolunteerEvent; userId?: string; busy: boolean;
    onShare: () => void; onVolunteer: () => void; onCall: () => void; onText: () => void;
}
export default function EventActions(props: Props) {
    const state = eventState(props.event, props.userId);
    return <View style={styles.row}>
        {state.canShare && <BigButton style={styles.button} label="Share" featherIconName="share-2" color="#5AA3FF" onPress={props.onShare} />}
        {state.applied && <>
            <BigButton style={styles.button} label="Call" featherIconName="phone" color="#5AA3FF" onPress={props.onCall} />
            <BigButton style={styles.button} label="Text" featherIconName="message-square" color="#5AA3FF" onPress={props.onText} />
        </>}
        {state.canVolunteer && <BigButton style={styles.button} label={props.busy ? 'Saving…' : 'Volunteer'} featherIconName="user-plus"
            color="#FF8700" disabled={props.busy} onPress={props.onVolunteer} />}
    </View>;
}
const styles = StyleSheet.create({ row: { flexDirection: 'row', marginBottom: 24 }, button: { marginHorizontal: 3, paddingHorizontal: 10 } });
