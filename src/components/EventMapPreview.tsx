import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import MapView, { LatLng, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import * as MapSettings from '../constants/MapSettings';
import mapMarkerImg from '../images/map-marker.png';

interface EventMapPreviewProps {
    position: LatLng;
}

/** Small, non-interactive map showing where the event takes place. */
export default function EventMapPreview({ position }: EventMapPreviewProps) {
    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                initialRegion={{ ...position, ...MapSettings.DEFAULT_DELTA }}
                style={styles.map}
                customMapStyle={customMapStyle}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
                toolbarEnabled={false}
                cacheEnabled={true}
            >
                <Marker coordinate={position}>
                    <Image resizeMode="contain" style={styles.marker} source={mapMarkerImg} />
                </Marker>
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
    },

    map: {
        ...StyleSheet.absoluteFillObject,
    },

    marker: {
        width: 48,
        height: 54,
    },
});
