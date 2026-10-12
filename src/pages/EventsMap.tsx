import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { getEvents } from '../services/api';
import { Event } from '../types/Event';

export default function EventsMap() {
    const navigation = useNavigation<any>();
    const [events, setEvents] = useState<Event[]>([]);

    useEffect(() => {
        getEvents()
            .then((response) => {
                const now = new Date();

                const upcomingEvents = response.data.filter(
                    (event: Event) => new Date(event.dateTime) > now
                );

                setEvents(upcomingEvents);
                console.log('Upcoming events:', upcomingEvents.length);
            })
            .catch((error) => {
                console.log('Error loading events:', error.message);
            });
    }, []);

    const eventsForMap = JSON.stringify(
        events.map((event) => ({
            id: event.id,
            name: event.name,
            description: event.description,
            latitude: event.position.latitude,
            longitude: event.position.longitude,
        }))
    );

    const mapHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport"
                  content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                html, body, #map {
                    height: 100%;
                    width: 100%;
                    margin: 0;
                    padding: 0;
                }
            </style>
        </head>
        <body>
            <div id="map"></div>

            <script>
                const events = ${eventsForMap};

                const map = L.map('map').setView(
                    [51.03, -114.093],
                    12
                );

                L.tileLayer(
                    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    {
                        attribution: '&copy; OpenStreetMap contributors',
                        maxZoom: 19
                    }
                ).addTo(map);

                events.forEach(function(event) {
                    const marker = L.marker([
                        event.latitude,
                        event.longitude
                    ]).addTo(map);

                    marker.bindPopup(
                        '<b>' + event.name + '</b><br>' +
                        event.description +
                        '<br><br><b>Tap marker to view details</b>'
                    );

                    marker.on('click', function() {
                        window.ReactNativeWebView.postMessage(
                            String(event.id)
                        );
                    });
                });

                if (events.length > 1) {
                    const bounds = L.latLngBounds(
                        events.map(function(event) {
                            return [
                                event.latitude,
                                event.longitude
                            ];
                        })
                    );

                    map.fitBounds(bounds, {
                        padding: [40, 40],
                        maxZoom: 13
                    });
                }
            </script>
        </body>
        </html>
    `;

    return (
        <View style={styles.container}>
            <WebView
                source={{ html: mapHtml }}
                style={styles.map}
                originWhitelist={['*']}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                onMessage={(message) => {
                    const eventId = message.nativeEvent.data;

                    const selectedEvent = events.find(
                        (event) => event.id === eventId
                    );

                    if (selectedEvent) {
                        navigation.navigate('EventDetails', {
                            event: selectedEvent,
                        });
                    }
                }}
                onError={(error) => {
                    console.log(
                        'Map WebView error:',
                        error.nativeEvent.description
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
});