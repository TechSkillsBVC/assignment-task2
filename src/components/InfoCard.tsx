import { Feather } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Spacer from './Spacer';

interface InfoCardProps {
    label: string;
    color: string;
    backgroundColor: string;
    featherIconName?: keyof typeof Feather.glyphMap;
    children?: ReactNode;
}

export default function InfoCard({ label, color, backgroundColor, featherIconName, children }: InfoCardProps) {
    return (
        <View style={[styles.card, { backgroundColor, borderColor: color }]}>
            {featherIconName && <Feather name={featherIconName} size={48} color={color} />}
            {children}
            <Spacer size={8} />
            <Text style={[styles.label, { color }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        height: 128,
        padding: 16,
        borderWidth: 1,
        borderRadius: 8,

        justifyContent: 'center',
        alignItems: 'center',
    },

    label: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 14,
        textAlign: 'center',
    },
});
