import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { EventDetail } from '../types/Event';

type Coordinate = {
    latitude: number;
    longitude: number;
};

type EventMapWebViewProps = {
    events: EventDetail[];
    currentUserId?: string;
    userLocation?: Coordinate;
    onSelectEvent?: (id: string) => void;
    interactive?: boolean;
    style?: StyleProp<ViewStyle>;
};

const MAP_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
  <style>
    html, body, #map { width: 100%; height: 100%; margin: 0; background: #e8e4dc; }
    .leaflet-control-attribution { font-size: 9px; }
    .event-pin {
      width: 36px;
      height: 42px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
      font: 700 12px Arial, sans-serif;
      text-transform: lowercase;
      filter: drop-shadow(0 2px 2px #0005);
      clip-path: polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%);
    }
    .event-open { background: #ff8700; }
    .event-applied { background: #00a3ff; }
    .event-full { background: #8fa7b3; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const map = L.map('map', {
      zoomControl: ${'__INTERACTIVE__'},
      scrollWheelZoom: ${'__INTERACTIVE__'},
      dragging: ${'__INTERACTIVE__'},
      doubleClickZoom: ${'__INTERACTIVE__'},
      touchZoom: ${'__INTERACTIVE__'}
    }).setView([51.03, -114.093], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const markers = L.featureGroup().addTo(map);
    let userMarker;

    window.updateEventMap = function(data) {
      markers.clearLayers();
      data.events.forEach(function(event) {
        const stateClass = event.isApplied ? 'event-applied' : event.isFull ? 'event-full' : 'event-open';
        const icon = L.divIcon({
          className: '',
          html: '<div class="event-pin ' + stateClass + '">vt</div>',
          iconSize: [36, 42],
          iconAnchor: [18, 42]
        });
        const marker = L.marker([event.position.latitude, event.position.longitude], { icon: icon });
        marker.on('click', function() {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage('event:' + event.id);
          }
        });
        marker.addTo(markers);
      });

      if (userMarker) {
        markers.removeLayer(userMarker);
        userMarker = undefined;
      }
      if (data.userLocation) {
        userMarker = L.circleMarker(
          [data.userLocation.latitude, data.userLocation.longitude],
          { radius: 7, color: '#fff', weight: 3, fillColor: '#4285f4', fillOpacity: 1 }
        ).addTo(map);
        userMarker.addTo(markers);
      }

      if (markers.getLayers().length > 1) {
        map.fitBounds(markers.getBounds(), { padding: [36, 36], maxZoom: 15 });
      } else if (markers.getLayers().length === 1) {
        map.setView(markers.getLayers()[0].getLatLng(), 14);
      }
      setTimeout(function() { map.invalidateSize(); }, 100);
    };
  </script>
</body>
</html>
`;

export default function EventMapWebView({
    events,
    currentUserId,
    userLocation,
    onSelectEvent,
    interactive = true,
    style,
}: EventMapWebViewProps) {
    const webViewRef = useRef<WebView>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const mapData = useMemo(() => ({
        events: events.map((event) => ({
            id: event.id,
            position: event.position,
            isApplied: event.volunteers.some((volunteer) => volunteer.id === currentUserId),
            isFull: event.volunteers.length >= event.requiredVolunteers,
        })),
        userLocation,
    }), [currentUserId, events, userLocation]);

    useEffect(() => {
        if (!isLoaded) return;

        const data = JSON.stringify(mapData).replace(/</g, '\\u003c');
        webViewRef.current?.injectJavaScript(`window.updateEventMap(${data}); true;`);
    }, [isLoaded, mapData]);

    const handleMessage = (event: WebViewMessageEvent) => {
        const message = event.nativeEvent.data;
        if (message.startsWith('event:')) {
            onSelectEvent?.(message.slice('event:'.length));
        }
    };

    const html = useMemo(
        () => MAP_HTML.replace(/__INTERACTIVE__/g, String(interactive)),
        [interactive]
    );

    return (
        <WebView
            ref={webViewRef}
            source={{ html }}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            onLoadEnd={() => setIsLoaded(true)}
            onMessage={handleMessage}
            style={[styles.webView, style]}
        />
    );
}

const styles = StyleSheet.create({
    webView: {
        flex: 1,
        backgroundColor: '#e8e4dc',
    },
});
