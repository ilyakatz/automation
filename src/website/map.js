// Dynamically load Mapbox CSS
const loadCSS = () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
    document.head.appendChild(link);
};

// Dynamically load Mapbox JS and initialize the map
const loadMapbox = () => {
    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
    script.onload = initializeMap;
    document.head.appendChild(script);
};

const initializeMap = () => {
    const mapContainer = document.getElementById('map');
    if (mapContainer.hasChildNodes()) {
        mapContainer.innerHTML = '';
    }
    mapContainer.style.width = '100%';
    mapContainer.style.height = '500px';

    mapboxgl.accessToken = 'pk.eyJ1IjoiaWx5YWthdHoiLCJhIjoiY202eWczc21hMTh1ajJxcHpiNHY4ZWhoaSJ9.zRBF4J8y9g0aVdPEpgcIsQ';

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-122.3608, 38.40135],
        zoom: 14
    });

    map.addControl(new mapboxgl.NavigationControl());

    map.on('load', () => {
        console.log('Map loaded');

        // Add the tileset source
        map.addSource('custom-tileset', {
            type: 'vector',
            url: 'mapbox://ilyakatz.cm6yfwhuv1iyr1pnn8hvzmg3z-82w71'
        });

        // Debug: Log source information
        const source = map.getSource('custom-tileset');
        console.log('Source:', source);

        // Try these common source layer names
        const possibleSourceLayers = [
            'default',
            'points',
            'markers',
            'places',
            'cm6yfwhuv1iyr1pnn8hvzmg3z-82w71',
            'ilyakatz.cm6yfwhuv1iyr1pnn8hvzmg3z-82w71'
        ];

        // Try each possible source layer
        possibleSourceLayers.forEach(sourceLayer => {
            try {
                map.addLayer({
                    id: `custom-markers-${sourceLayer}`,
                    type: 'circle',
                    source: 'custom-tileset',
                    'source-layer': sourceLayer,
                    paint: {
                        'circle-radius': 10,
                        'circle-color': '#FF0000',
                        'circle-opacity': 0.8
                    }
                });
                console.log(`Successfully added layer with source-layer: ${sourceLayer}`);
            } catch (error) {
                console.log(`Failed to add layer with source-layer: ${sourceLayer}`);
                console.log(error.message);
            }
        });
    });

    // Debug: Log any map errors
    map.on('error', (e) => {
        console.error('Map error:', e);
    });
};

loadCSS();
loadMapbox();
