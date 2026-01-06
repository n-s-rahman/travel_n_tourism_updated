import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Coordinates for popular travel destinations
const locationCoordinates = {
  Maldives: { lat: 4.1694, lng: 73.5093, zoom: 9 },
  Nepal: { lat: 27.7172, lng: 85.324, zoom: 7 },
  "Bali, Indonesia": { lat: -8.6705, lng: 115.2126, zoom: 9 },
  Switzerland: { lat: 46.8182, lng: 8.2275, zoom: 7 },
  "Paris, France": { lat: 48.8566, lng: 2.3522, zoom: 11 },
  "Phuket, Thailand": { lat: 8.1247, lng: 98.2997, zoom: 10 },
  Kathmandu: { lat: 27.7172, lng: 85.324, zoom: 11 },
  Ubud: { lat: -8.5069, lng: 115.2625, zoom: 12 },
  Denpasar: { lat: -8.6705, lng: 115.2126, zoom: 11 },
  Lukla: { lat: 27.6959, lng: 86.7283, zoom: 12 },
  "Namche Bazaar": { lat: 27.8083, lng: 86.7152, zoom: 12 },
  Tengboche: { lat: 27.8444, lng: 86.7583, zoom: 12 },
  Lucerne: { lat: 47.0502, lng: 8.3093, zoom: 12 },
  Interlaken: { lat: 46.6838, lng: 8.2275, zoom: 12 },
  Jungfraujoch: { lat: 46.5528, lng: 8.1635, zoom: 13 },
  Zurich: { lat: 47.3769, lng: 8.5472, zoom: 11 },
  "Mont Titlis": { lat: 46.7599, lng: 8.228, zoom: 12 },
  Louvre: { lat: 48.8606, lng: 2.3352, zoom: 15 },
  "Eiffel Tower": { lat: 48.8584, lng: 2.2945, zoom: 15 },
  Versailles: { lat: 48.8047, lng: 2.1204, zoom: 12 },
  Montmartre: { lat: 48.8867, lng: 2.3431, zoom: 14 },
  "Patong Beach": { lat: 8.2875, lng: 98.294, zoom: 13 },
  "Phi Phi Islands": { lat: 8.1734, lng: 98.776, zoom: 11 },
};

const PackageMap = ({ packageData, onlyDestination = false }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapContainer.current || !packageData) return;

    // Initialize map if not already done
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView([20, 0], 3);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map.current);
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      map.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Get locations to display
    const locations = new Map(); // Use Map to avoid duplicates

    if (onlyDestination) {
      // Only show main destination
      const mainDest = packageData.destination;
      if (mainDest && locationCoordinates[mainDest]) {
        locations.set(mainDest, locationCoordinates[mainDest]);
      }
    } else {
      // Show main destination + all itinerary locations
      const mainDest = packageData.destination;
      if (mainDest && locationCoordinates[mainDest]) {
        locations.set(mainDest, locationCoordinates[mainDest]);
      }

      // Extract locations from itinerary descriptions
      if (packageData.itinerary && Array.isArray(packageData.itinerary)) {
        packageData.itinerary.forEach((item) => {
          // Try to find known locations in the description
          Object.entries(locationCoordinates).forEach(([locName, coords]) => {
            if (
              item.description.toLowerCase().includes(locName.toLowerCase()) ||
              item.title.toLowerCase().includes(locName.toLowerCase())
            ) {
              locations.set(locName, coords);
            }
          });
        });
      }
    }

    // If no locations found, use main destination
    if (locations.size === 0 && packageData.destination) {
      locations.set(
        packageData.destination,
        locationCoordinates[packageData.destination] || {
          lat: 20,
          lng: 0,
          zoom: 3,
        }
      );
    }

    // Add markers to map
    const bounds = L.latLngBounds();
    let markerId = 0;

    locations.forEach((coords, locName) => {
      const marker = L.circleMarker([coords.lat, coords.lng], {
        radius: 10,
        fillColor: "#9333ea",
        color: "#7e22ce",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      })
        .bindPopup(
          `<div style="font-weight: bold; color: #6b21a8;">${locName}</div>`
        )
        .addTo(map.current);

      markersRef.current.push(marker);
      bounds.extend([coords.lat, coords.lng]);
      markerId++;
    });

    // Fit map to bounds
    if (markerId > 0) {
      map.current.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.current.setView([20, 0], 3);
    }

    // Clean up on unmount
    return () => {
      markersRef.current.forEach((marker) => {
        map.current.removeLayer(marker);
      });
      markersRef.current = [];
    };
  }, [packageData, onlyDestination]);

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden shadow-lg border border-gray-200">
      <div
        ref={mapContainer}
        style={{ width: "100%", height: "100%" }}
        className="map-container"
      />
    </div>
  );
};

export default PackageMap;
