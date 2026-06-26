import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * OpenStreetMap via Leaflet inside a WebView.
 * Free, no API key, no Google Play Services dependency.
 *
 * Props:
 *   pickup:      { latitude, longitude }
 *   drop:        { latitude, longitude }
 *   route:       optional [{ latitude, longitude }, ...]
 *   pickupLabel: string
 *   dropLabel:   string
 *   tappable:    when true (default), the entire map becomes a button that
 *                opens the system map app for navigation.
 *   tapTarget:   'pickup' | 'drop' | 'both' (default 'drop')
 *                — which point to navigate to when the map is tapped.
 *                'both' opens with pickup as origin and drop as destination.
 *   style:       container style
 */
export default function OSMMap({
  pickup,
  drop,
  route = [],
  pickupLabel = 'Pickup',
  dropLabel = 'Drop',
  tappable = true,
  tapTarget = 'drop',
  style,
}) {
  const html = useMemo(
    () => buildHtml({ pickup, drop, route, pickupLabel, dropLabel }),
    [pickup, drop, route, pickupLabel, dropLabel]
  );

  const openExternalMaps = () => {
    const target =
      tapTarget === 'pickup' ? pickup
      : tapTarget === 'both' ? drop
      : drop;
    if (!target) return;

    const lat = target.latitude;
    const lng = target.longitude;
    const label = tapTarget === 'pickup' ? pickupLabel : dropLabel;

    let url;
    if (tapTarget === 'both' && pickup) {
      // Directions from pickup → drop in Google Maps (works on Android + iOS if app is installed)
      url = `https://www.google.com/maps/dir/?api=1&origin=${pickup.latitude},${pickup.longitude}&destination=${lat},${lng}&travelmode=driving`;
    } else {
      url = Platform.select({
        ios: `maps:0,0?q=${encodeURIComponent(label)}@${lat},${lng}`,
        android: `geo:0,0?q=${lat},${lng}(${encodeURIComponent(label)})`,
      });
    }
    Linking.openURL(url).catch(() => {
      // Fallback to web Google Maps if no map app installed
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
    });
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        style={styles.webview}
        androidLayerType="hardware"
        pointerEvents={tappable ? 'none' : 'auto'}
      />
      {tappable && (
        <TouchableOpacity
          activeOpacity={0.85}
          style={StyleSheet.absoluteFill}
          onPress={openExternalMaps}
        />
      )}
    </View>
  );
}

function buildHtml({ pickup, drop, route, pickupLabel, dropLabel }) {
  const pickupLat = pickup?.latitude ?? 13.0827;
  const pickupLng = pickup?.longitude ?? 80.2707;
  const dropLat = drop?.latitude ?? 12.9716;
  const dropLng = drop?.longitude ?? 77.5946;
  const routeJson = JSON.stringify(
    (route || []).map(p => [p.latitude, p.longitude])
  );

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #e5e7eb; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var pickup = [${pickupLat}, ${pickupLng}];
    var drop = [${dropLat}, ${dropLng}];
    var routeCoords = ${routeJson};

    var map = L.map('map', { zoomControl: false, attributionControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(map);

    var greenIcon = L.divIcon({
      className: '',
      html: '<div style="background:#16A34A;border:3px solid white;width:18px;height:18px;border-radius:50%;box-shadow:0 0 0 2px #16A34A55;"></div>',
      iconSize: [18, 18], iconAnchor: [9, 9]
    });
    var redIcon = L.divIcon({
      className: '',
      html: '<div style="background:#DC2626;border:3px solid white;width:18px;height:18px;border-radius:50%;box-shadow:0 0 0 2px #DC262655;"></div>',
      iconSize: [18, 18], iconAnchor: [9, 9]
    });

    L.marker(pickup, { icon: greenIcon }).bindPopup(${JSON.stringify(pickupLabel)}).addTo(map);
    L.marker(drop, { icon: redIcon }).bindPopup(${JSON.stringify(dropLabel)}).addTo(map);

    if (routeCoords.length > 1) {
      L.polyline(routeCoords, { color: '#1B3D8F', weight: 4, opacity: 0.85 }).addTo(map);
    } else {
      L.polyline([pickup, drop], { color: '#1B3D8F', weight: 3, dashArray: '6, 8', opacity: 0.7 }).addTo(map);
    }

    map.fitBounds([pickup, drop], { padding: [40, 40] });
  </script>
</body>
</html>`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
