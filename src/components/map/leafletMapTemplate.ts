import type { Activity } from '../../types';

export interface MapMarkerItem {
  id: string;
  title: string;
  category: string;
  lat: number;
  lng: number;
  price?: number;
}

const CITY_DEFAULT_COORDS: Array<{ keywords: string[]; lat: number; lng: number }> = [
  { keywords: ['sfax', 'صفاقس'], lat: 34.7406, lng: 10.7603 },
  { keywords: ['tunis', 'تونس', 'aouina', 'lac', 'marsa', 'carthage', 'ariana'], lat: 36.8065, lng: 10.1815 },
  { keywords: ['sousse', 'سوسة', 'msaken', "m'saken"], lat: 35.8256, lng: 10.6370 },
  { keywords: ['monastir', 'المنستير'], lat: 35.7779, lng: 10.8262 },
  { keywords: ['bizerte', 'بنزرت'], lat: 37.2744, lng: 9.8739 },
  { keywords: ['hammamet', 'الحمامات', 'nabeul', 'نابل'], lat: 36.4000, lng: 10.6100 },
];

/**
 * Résout des coordonnées valides pour une activité.
 * Si latitude/longitude manquent ou sont à 0, utilise les coordonnées de la ville
 * avec un léger décalage déterministe selon l'index pour éviter toute superposition.
 */
export function resolveActivityCoords(
  activity: Activity,
  index = 0
): { lat: number; lng: number } {
  const hasValidLat =
    typeof activity.latitude === 'number' &&
    Number.isFinite(activity.latitude) &&
    activity.latitude !== 0;
  const hasValidLng =
    typeof activity.longitude === 'number' &&
    Number.isFinite(activity.longitude) &&
    activity.longitude !== 0;

  if (hasValidLat && hasValidLng) {
    return { lat: activity.latitude as number, lng: activity.longitude as number };
  }

  const cityNormalized = `${activity.city || ''} ${activity.cityFr || ''} ${activity.cityAr || ''}`.toLowerCase();
  const matched = CITY_DEFAULT_COORDS.find((entry) =>
    entry.keywords.some((kw) => cityNormalized.includes(kw))
  );
  const base = matched || { lat: 34.7406, lng: 10.7603 };

  const latOffset = ((index % 5) - 2) * 0.0025;
  const lngOffset = ((Math.floor(index / 5) % 5) - 2) * 0.0025;

  return {
    lat: Number((base.lat + latOffset).toFixed(6)),
    lng: Number((base.lng + lngOffset).toFixed(6)),
  };
}

function safeJsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function generateLeafletMapHtml(options: {
  userLat: number;
  userLng: number;
  userCity: string;
  activities: Activity[];
  selectedId?: string;
  isDark: boolean;
  language: string;
}): string {
  const { userLat, userLng, userCity, activities, selectedId, isDark, language } = options;

  const validActivities: MapMarkerItem[] = activities.map((act, idx) => {
    const coords = resolveActivityCoords(act, idx);
    return {
      id: act.id,
      title: act.name || 'Activité',
      category: act.category || 'general',
      lat: coords.lat,
      lng: coords.lng,
      price: act.price,
    };
  });

  const isArabic = language === 'ar';
  const userLocationLabel = isArabic ? 'موقعك الحالي' : 'Votre position';
  const primaryTileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const fallbackTileUrl =
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';

  return `<!DOCTYPE html>
<html lang="${isArabic ? 'ar' : language === 'en' ? 'en' : 'fr'}" dir="${isArabic ? 'rtl' : 'ltr'}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link id="leaflet-css" rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #map {
      width: 100%;
      height: 100%;
      background: ${isDark ? '#0F172A' : '#F8FAFC'};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    ${isDark ? '.leaflet-tile-pane { filter: invert(100%) hue-rotate(180deg) brightness(92%) contrast(90%); }' : ''}
    .custom-pin {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #4F46E5;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 13px;
      box-shadow: 0 4px 10px rgba(79, 70, 229, 0.4);
      border: 2.5px solid #FFFFFF;
      cursor: pointer;
      transition: transform 0.2s ease, background-color 0.2s ease;
    }
    .custom-pin.selected {
      background: #EA580C;
      box-shadow: 0 6px 14px rgba(234, 88, 12, 0.55);
      transform: scale(1.22);
      border-color: #FFFFFF;
      z-index: 9999 !important;
    }
    .user-gps-pin {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #10B981;
      border: 3px solid #FFFFFF;
      box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.25);
    }
    .leaflet-popup-content-wrapper {
      background: ${isDark ? '#1E293B' : '#FFFFFF'};
      color: ${isDark ? '#FFFFFF' : '#0F172A'};
      border-radius: 14px;
      padding: 4px 6px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
    }
    .leaflet-popup-tip {
      background: ${isDark ? '#1E293B' : '#FFFFFF'};
    }
    .popup-title {
      font-weight: 800;
      font-size: 13px;
      margin-bottom: 2px;
    }
    .popup-cat {
      font-size: 11px;
      color: ${isDark ? '#94A3B8' : '#64748B'};
      text-transform: capitalize;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    (function () {
      var markersData = ${safeJsonForScript(validActivities)};
      var currentSelectedId = ${safeJsonForScript(selectedId || '')};
      var userLat = ${Number.isFinite(userLat) ? userLat : 34.7406};
      var userLng = ${Number.isFinite(userLng) ? userLng : 10.7603};
      var userCityLabel = ${safeJsonForScript(userCity)};
      var userPosSubtitle = ${safeJsonForScript(userLocationLabel)};
      var primaryTileUrl = ${safeJsonForScript(primaryTileUrl)};
      var fallbackTileUrl = ${safeJsonForScript(fallbackTileUrl)};

      function escapeHtml(str) {
        return String(str || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function loadScript(src, onOk, onFail) {
        var s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = onOk;
        s.onerror = onFail || function () {};
        document.head.appendChild(s);
      }

      function initMap() {
        if (typeof L === 'undefined') return;

        var map = L.map('map', { zoomControl: false }).setView([userLat, userLng], 13);
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        var switchedToFallback = false;
        var tileLayer = L.tileLayer(primaryTileUrl, {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        });

        tileLayer.on('tileerror', function () {
          if (!switchedToFallback) {
            switchedToFallback = true;
            tileLayer.setUrl(fallbackTileUrl);
          }
        });
        tileLayer.addTo(map);

        var userIcon = L.divIcon({
          className: 'user-gps-wrapper',
          html: '<div class="user-gps-pin"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        var userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map);
        userMarker.bindPopup(
          '<div class="popup-title">' + escapeHtml(userCityLabel) + '</div>' +
          '<div class="popup-cat">' + escapeHtml(userPosSubtitle) + '</div>'
        );

        var markersMap = {};
        var bounds = L.latLngBounds([[userLat, userLng]]);

        function createMarkerIcon(isSelected) {
          return L.divIcon({
            className: 'marker-wrap',
            html: '<div class="custom-pin ' + (isSelected ? 'selected' : '') + '">★</div>',
            iconSize: [34, 34],
            iconAnchor: [17, 17]
          });
        }

        function sendToApp(actId) {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_PIN', id: actId }));
          } else if (window.parent && window.parent !== window) {
            window.parent.postMessage(JSON.stringify({ type: 'SELECT_PIN', id: actId }), '*');
          }
        }

        markersData.forEach(function (act) {
          bounds.extend([act.lat, act.lng]);
          var isSel = act.id === currentSelectedId;
          var marker = L.marker([act.lat, act.lng], {
            icon: createMarkerIcon(isSel)
          }).addTo(map);

          marker.bindPopup(
            '<div class="popup-title">' + escapeHtml(act.title) + '</div>' +
            '<div class="popup-cat">' + escapeHtml(act.category) + '</div>'
          );

          markersMap[act.id] = { marker: marker, data: act };

          marker.on('click', function () {
            window.selectMapPin(act.id);
            sendToApp(act.id);
          });
        });

        window.selectMapPin = function (actId) {
          currentSelectedId = actId || '';
          Object.keys(markersMap).forEach(function (id) {
            var entry = markersMap[id];
            var isSel = id === currentSelectedId;
            entry.marker.setIcon(createMarkerIcon(isSel));
            if (isSel) {
              entry.marker.setZIndexOffset(1000);
              entry.marker.openPopup();
              map.panTo([entry.data.lat, entry.data.lng], { animate: true });
            } else {
              entry.marker.setZIndexOffset(0);
            }
          });
          if (currentSelectedId === 'user-current-gps') {
            userMarker.openPopup();
            map.panTo([userLat, userLng], { animate: true });
          }
        };

        window.centerUserGps = function (lat, lng) {
          if (typeof lat === 'number' && typeof lng === 'number') {
            userLat = lat;
            userLng = lng;
            userMarker.setLatLng([lat, lng]);
            userMarker.openPopup();
            map.setView([lat, lng], 14, { animate: true });
          }
        };

        if (markersData.length > 0) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
        }

        if (currentSelectedId && markersMap[currentSelectedId]) {
          window.selectMapPin(currentSelectedId);
        }
      }

      loadScript(
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
        initMap,
        function () {
          var css = document.getElementById('leaflet-css');
          if (css) {
            css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
          }
          loadScript('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js', initMap);
        }
      );
    })();
  </script>
</body>
</html>`;
}
