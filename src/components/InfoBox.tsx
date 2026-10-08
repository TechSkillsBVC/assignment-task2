import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BoxTheme } from '../constants/Colors';

interface InfoBoxProps {
    theme: BoxTheme;
    children: React.ReactNode;
}

export default function InfoBox({ theme, children }: InfoBoxProps) {
    return (
        <View style={[styles.box, { backgroundColor: theme.background, borderColor: theme.border }]}>{children}</View>
    );
}

const styles = StyleSheet.create({
    box: {
        flex: 1,
        height: 112,
        padding: 12,
        borderWidth: 1,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
