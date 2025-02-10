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
    {
      coords: [37.7749, -122.4194],
      city: 'San Francisco',
      url: 'https://perfectloopnet.wordpress.com/2025/02/09/a-magical-dining-experience-my-night-at-the-french-laundry/'
    },
    {
      coords: [40.7128, -74.0060],
      city: 'New York City',
      url: 'https://perfectloopnet.wordpress.com/2025/02/09/a-magical-dining-experience-my-night-at-the-french-laundry/'
    },
    {
      coords: [51.5074, -0.1278],
      city: 'London',
      url: 'https://perfectloopnet.wordpress.com/2025/02/09/a-magical-dining-experience-my-night-at-the-french-laundry/'
    }
  ];

              markers.forEach(markerData => {
    L.marker(markerData.coords)
      .addTo(map)
      .bindPopup(`<b>${markerData.city}</b>`)
      .on('click', () => {
        window.location.href = markerData.url;
      });
  });
        };

        loadCSS();
        loadLeaflet(); 

/**
 *
 fetch('https://raw.githubusercontent.com/ilyakatz/automation/refs/heads/master/src/website/map.js?t=1')
    .then(response => response.text())
    .then(code => {
        const script = document.createElement('script');
        script.text = code;
        document.head.appendChild(script);
    });
 */