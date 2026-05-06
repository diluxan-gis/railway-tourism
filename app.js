// =============================================
// APP.JS — The brain of our railway map
// =============================================

// -------------------------------------------
// STEP 1: CREATE THE MAP
// L.map('map') tells Leaflet: "put the map inside the div with id='map'"
// setView([lat, lng], zoom) sets where the map starts
// 7.2, 80.7 is roughly central Sri Lanka, zoom 8 shows the whole island
// -------------------------------------------
const map = L.map('map').setView([7.2, 80.7], 8);

// -------------------------------------------
// STEP 2: ADD THE BACKGROUND MAP (called a "tile layer")
// This loads the background map images from OpenStreetMap — totally free!
// Think of tiles like puzzle pieces that make up the background map
// attribution: gives credit to OpenStreetMap (required by their rules)
// -------------------------------------------
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 18
}).addTo(map);

// -------------------------------------------
// STEP 3: OUR STATION DATA
// This is the same data as our stations.csv, written as a JavaScript array
// Each {} is one station with all its information
// -------------------------------------------
const stations = [
  {
    id: 1,
    name: "Colombo Fort",
    lat: 6.9344,
    lng: 79.8428,
    elevation_m: 7,
    distance_km: 0,
    zone: "Western Province",
    facilities: ["Ticket office", "Waiting room", "Toilets", "Food stalls"],
    tourist_highlight: "National Museum of Colombo"
  },
  {
    id: 2,
    name: "Rambukkana",
    lat: 7.3297,
    lng: 80.3856,
    elevation_m: 112,
    distance_km: 95.5,
    zone: "Sabaragamuwa Province",
    facilities: ["Ticket office", "Waiting room", "Toilets"],
    tourist_highlight: "Pinnawala Elephant Orphanage"
  },
  {
    id: 3,
    name: "Kandy",
    lat: 7.2906,
    lng: 80.6337,
    elevation_m: 488,
    distance_km: 121,
    zone: "Central Province",
    facilities: ["Ticket office", "Waiting room", "Toilets", "Cafe", "ATM"],
    tourist_highlight: "Temple of the Tooth Relic"
  },
  {
    id: 4,
    name: "Nanu Oya",
    lat: 6.9706,
    lng: 80.7731,
    elevation_m: 1710,
    distance_km: 169,
    zone: "Central Province",
    facilities: ["Ticket office", "Waiting room"],
    tourist_highlight: "Nuwara Eliya Hill Station"
  },
  {
    id: 5,
    name: "Ella",
    lat: 6.8667,
    lng: 81.0466,
    elevation_m: 1041,
    distance_km: 219,
    zone: "Uva Province",
    facilities: ["Ticket office", "Waiting room", "Toilets", "Cafe"],
    tourist_highlight: "Nine Arch Bridge"
  },
  {
    id: 6,
    name: "Badulla",
    lat: 6.9934,
    lng: 81.0550,
    elevation_m: 680,
    distance_km: 292,
    zone: "Uva Province",
    facilities: ["Ticket office", "Waiting room", "Toilets", "ATM", "Cafe"],
    tourist_highlight: "Dunhinda Falls"
  }
];

// -------------------------------------------
// STEP 4: DRAW THE RAILWAY LINE
// We load our railway.geojson file using fetch()
// fetch() is like asking the browser: "go get this file for me"
// .then() means "after you get it, do this next thing"
// -------------------------------------------
fetch('railway.geojson')
  .then(response => response.json())   // convert the file into data JS can read
  .then(data => {
    // Add the GeoJSON data to the map as a coloured line
    L.geoJSON(data, {
      style: {
        color: '#e94560',      // red colour for the railway line
        weight: 3,             // thickness of the line (3 pixels)
        opacity: 0.9           // 0 = invisible, 1 = fully visible
      }
    }).addTo(map);
  })
  .catch(error => {
    // If the file fails to load, show a message in the console
    console.log('Railway file not loaded — drawing route from stations instead.');
    drawFallbackRoute(); // use our backup line if GeoJSON fails
  });

// -------------------------------------------
// STEP 5: BACKUP RAILWAY LINE
// If the GeoJSON fails, we draw a simple line connecting our stations
// This is a "polyline" — just a line connecting a list of coordinates
// -------------------------------------------
function drawFallbackRoute() {
  const routeCoords = stations.map(s => [s.lat, s.lng]); // get [lat, lng] for each station
  L.polyline(routeCoords, {
    color: '#e94560',
    weight: 3,
    opacity: 0.8,
    dashArray: '8, 6'  // makes a dashed line to show it's approximate
  }).addTo(map);
}

// -------------------------------------------
// STEP 6: ADD STATION MARKERS
// We loop through each station and add a circle marker on the map
// forEach() means "do this for every item in the list"
// -------------------------------------------
stations.forEach(station => {

  // Create a circle marker at the station's coordinates
  // circleMarker is a simple dot — easier to style than default pin icons
  const marker = L.circleMarker([station.lat, station.lng], {
    radius: 8,              // size of the dot in pixels
    fillColor: '#89b4fa',   // inside colour (light blue)
    color: '#ffffff',       // border colour (white)
    weight: 2,              // border thickness
    opacity: 1,
    fillOpacity: 0.9
  }).addTo(map);

  // -------------------------------------------
  // STEP 7: ADD A POPUP TO EACH MARKER
  // When someone clicks the dot, a little bubble appears
  // We build the HTML for that bubble here using template literals (` `)
  // -------------------------------------------
  const popupHTML = `
    <div class="popup-title">🚉 ${station.name}</div>
    <div class="popup-detail">
      📍 ${station.zone}<br>
      ⛰️ ${station.elevation_m}m above sea level<br>
      📏 ${station.distance_km} km from Colombo<br>
      🌟 ${station.tourist_highlight}
    </div>
  `;

  // Bind (attach) the popup to the marker
  marker.bindPopup(popupHTML, { maxWidth: 220 });

  // -------------------------------------------
  // STEP 8: UPDATE THE INFO PANEL WHEN CLICKED
  // When a marker is clicked, we also update the bottom info panel
  // with more detailed information
  // -------------------------------------------
  marker.on('click', function () {
    updateInfoPanel(station);
  });
});

// -------------------------------------------
// STEP 9: THE INFO PANEL UPDATE FUNCTION
// This function fills the bottom panel with station details
// It runs every time you click a station marker
// -------------------------------------------
function updateInfoPanel(station) {
  // Get the info panel element from index.html
  const infoContent = document.getElementById('info-content');

  // Build the HTML for the info panel
  infoContent.innerHTML = `
    <h2>🚉 ${station.name}</h2>
    <div class="info-row">
      <div class="info-item">⛰️ Elevation: <span>${station.elevation_m}m</span></div>
      <div class="info-item">📏 Distance: <span>${station.distance_km} km</span></div>
      <div class="info-item">📍 Zone: <span>${station.zone}</span></div>
    </div>
    <div class="tourist-highlight">🌟 Nearby attraction: ${station.tourist_highlight}</div>
    <div class="facilities">🏢 Facilities: ${station.facilities.join(' · ')}</div>
  `;
}
