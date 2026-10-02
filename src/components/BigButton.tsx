import React from 'react';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';

interface BigButtonProps {
    label: string;
    color: string;
    style?: {};
    featherIconName?: keyof typeof Feather.glyphMap;
    disabled?: boolean;
    onPress: () => void;
}

export default function BigButton(props: BigButtonProps) {
    const styles = styling(props);
    const { featherIconName, label, style, onPress, disabled } = props;

    return (
        <RectButton style={[styles.button, style]} enabled={!disabled} onPress={disabled ? undefined : onPress}>
            {featherIconName && <Feather style={styles.icon} name={featherIconName} size={24} color="#FFF" />}
            <Text style={styles.label}>{label}</Text>
        </RectButton>
    );
}

const styling = ({ color, disabled }: BigButtonProps) =>
    StyleSheet.create({
        button: {
            paddingVertical: 14,
            paddingHorizontal: 32,
            backgroundColor: disabled ? color + '80' : color,
            borderRadius: 16,
            maxHeight: 56,

            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
        },

        icon: {
            marginRight: 8,
        },

        label: {
            fontFamily: 'Nunito_800ExtraBold',
            color: '#FFF',
            fontSize: 15,
        },
    });
