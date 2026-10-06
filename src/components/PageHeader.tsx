import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderlessButton } from 'react-native-gesture-handler';
import { Colors } from '../constants/Colors';

interface PageHeaderProps {
    title: string;
    onBackPress?: () => void;
    onClosePress?: () => void;
}

/**
 * White bar at the top of a stack screen: optional back arrow, centred title and
 * an optional close button on the right.
 */
export default function PageHeader({ title, onBackPress, onClosePress }: PageHeaderProps) {
    return (
        <View style={styles.container}>
            <View style={styles.side}>
                {onBackPress && (
                    <BorderlessButton onPress={onBackPress}>
                        <Feather name="arrow-left" size={24} color={Colors.teal} />
                    </BorderlessButton>
                )}
            </View>

            <Text style={styles.title} numberOfLines={1}>
                {title}
            </Text>

            <View style={[styles.side, styles.sideRight]}>
                {onClosePress && (
                    <BorderlessButton onPress={onClosePress}>
                        <Feather name="x" size={24} color="#FF669D" />
                    </BorderlessButton>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 48,
        paddingBottom: 16,
        paddingHorizontal: 24,

        backgroundColor: Colors.surface,

        flexDirection: 'row',
        alignItems: 'center',
    },

    side: {
        width: 24,
        alignItems: 'flex-start',
    },

    sideRight: {
        alignItems: 'flex-end',
    },

    title: {
        flex: 1,
        textAlign: 'center',

        fontFamily: 'Nunito_600SemiBold',
        fontSize: 16,
        color: Colors.muted,
    },
});
