
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

            // Set width and height of the map container
            mapContainer.style.width = '800px'; // Example: Set to 800 pixels wide
            mapContainer.style.height = '600px'; // Example: Set to 600 pixels tall

            // Remove any existing map instance
            if (mapContainer.hasChildNodes()) {
                mapContainer._leaflet_id = null;
                mapContainer.innerHTML = '';
            }

            const map = L.map('map').setView([51.505, -0.09], 13);

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            L.marker([51.5, -0.09]).addTo(map)
                .bindPopup('<b>Hello world!</b><br />I am a popup.')
                .openPopup();
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