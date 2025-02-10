        const loadCSS = () => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
            link.crossOrigin = '';
            document.head.appendChild(link);
        };

        const loadLeaflet = () => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
            script.crossOrigin = '';
            script.onload = initializeMap;
            document.head.appendChild(script);
        };

        const initializeMap = () => {
            const mapContainer = document.getElementById('map');
            mapContainer.style.width = '100%';
            mapContainer.style.height = '600px';

            if (mapContainer.hasChildNodes()) {
                mapContainer._leaflet_id = null;
                mapContainer.innerHTML = '';
            }

            const map = L.map('map').setView([40.7128, -74.0060], 4); 

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            const markers = [
                { coords: [37.7749, -122.4194], city: 'San Francisco' }, 
                { coords: [40.7128, -74.0060], city: 'New York City' },   
                { coords: [51.5074, -0.1278], city: 'London' }          
            ];

            markers.forEach(markerData => {
                L.marker(markerData.coords)
                    .addTo(map)
                    .bindPopup(`<b>${markerData.city}</b>`)
                    .openPopup();
            });
        };

        loadCSS();
        loadLeaflet(); 

/**
 * fetch('https://raw.githubusercontent.com/ilyakatz/automation/refs/heads/master/src/website/map.js')
    .then(response => response.text())
    .then(code => {
        const script = document.createElement('script');
        script.text = code;
        document.head.appendChild(script);
    });
 */