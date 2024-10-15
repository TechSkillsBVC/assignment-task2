import React from 'react';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';

interface BigButtonProps {
    label: string;
    color?: string;
    style?: object;
    featherIconName?: keyof typeof Feather.glyphMap;
    disabled?: boolean;
    onPress: () => void;
    iconColor?: string;
}

export default function BigButton(props: BigButtonProps) {
    const { featherIconName, label, style, onPress, disabled, iconColor, color = colors.primary } = props;

    return (
        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor: disabled ? `${color}80` : color },
                style
            ]}
            onPress={disabled ? undefined : onPress}
            disabled={disabled}
        >
            {featherIconName && (
                <View style={styles.iconContainer}>
                    <Feather 
                        name={featherIconName} 
                        size={24} 
                        color={iconColor || (disabled ? colors.gray : colors.white)} 
                    />
                </View>
            )}
            {label && (
                <Text style={[
                    styles.label,
                    disabled && styles.disabledText
                ]}>
                    {label}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        elevation: 3,
    },
    iconContainer: {
        marginRight: 8,
    },
    label: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledText: {
        color: colors.gray,
    },
});