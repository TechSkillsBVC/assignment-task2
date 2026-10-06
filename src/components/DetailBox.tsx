import { Feather } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '../constants/Colors';

export type DetailBoxVariant = 'info' | 'warning' | 'disabled';

const variants: Record<DetailBoxVariant, { backgroundColor: string; borderColor: string; iconColor: string }> = {
    info: { backgroundColor: Colors.infoBackground, borderColor: Colors.infoBorder, iconColor: Colors.primary },
    warning: { backgroundColor: Colors.warningBackground, borderColor: Colors.warningBorder, iconColor: Colors.accent },
    disabled: {
        backgroundColor: Colors.disabledBackground,
        borderColor: Colors.disabledBorder,
        iconColor: Colors.muted,
    },
};

interface DetailBoxProps {
    variant: DetailBoxVariant;
    featherIconName?: keyof typeof Feather.glyphMap;
    style?: ViewStyle;
    children: ReactNode;
}

/**
 * The rounded, tinted box used on the event details screen for the date and the
 * event status. The colour scheme comes from the variant.
 */
export default function DetailBox({ variant, featherIconName, style, children }: DetailBoxProps) {
    const { backgroundColor, borderColor, iconColor } = variants[variant];

    return (
        <View style={[styles.container, { backgroundColor, borderColor }, style]}>
            {featherIconName && <Feather name={featherIconName} size={32} color={iconColor} style={styles.icon} />}
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: 128,
        padding: 16,
        borderWidth: 1,
        borderRadius: 16,

        justifyContent: 'center',
        alignItems: 'center',
    },

    icon: {
        marginBottom: 12,
    },
});
