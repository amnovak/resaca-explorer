var map = L.map('map').setView([26.10, -97.29], 10);

// Variables to store basemap tiles
var mapboxSatStreets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW1ub3ZhayIsImEiOiJjamlrcnVqM3kwY3ZoM3ZteWVlYWEwMWdmIn0.KaCmpHIRa0GRQpUTIrRYwQ', {
   maxZoom: 18,
   attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
   id: 'mapbox.streets',
});
var mapboxLight = L.tileLayer('https://api.mapbox.com/styles/v1/amnovak/cjj8peqwe3iml2so5jebaetz7/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW1ub3ZhayIsImEiOiJjamo4cGFheGEwMWN0M2tueDZ1eXF2ZHdhIn0.olgoZrTxhNGsdatptl4hrQ', {
   maxZoom: 18,
   attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
   id: 'mapbox.light',
});


// Add baselayer to map
mapboxSatStreets.addTo(map);
//mapboxLight.addTo(map);


// Add CARTO client
const client = new carto.Client({
  apiKey: 'default_public',
  username: 'novakannaaa'
});

// Load CARTO data tables
const all_resacas = new carto.source.Dataset(`all_resacas`);
const connectionStructures = new carto.source.Dataset(`connectionstructures`);
const drainStructures = new carto.source.Dataset(`drainage`);


// CartoCSS Styles for layers
// Style for resaca visualization based on system ID
const systemStyle = new carto.style.CartoCSS(`
   @TR: #8CE826;
   @RRV: #08FFD2;
   @RDLF: #FF8B19;
   @RDLC: #CC3A67;
   @RDLG: #0038CF;
   #layer {
     line-width: 2;
     polygon-opacity: 0.2;
     [system="TR"] {
       polygon-fill: @TR;
       line-color: @TR;
     }
     [system="RRV"] {
       polygon-fill: @RRV;
       line-color: @RRV;
     }
     [system="RDLF"] {
       polygon-fill: @RDLF;
       line-color: @RDLF;
     }
     [system="RDLC"] {
       polygon-fill: @RDLC;
       line-color: @RDLC;
     }
     [system="RDLG"] {
       polygon-fill: @RDLG;
       line-color: @RDLG;
     }
     ::labels [zoom>=13] {
      text-name: [short_code];
      text-face-name: 'DejaVu Sans Book';
      text-size: 10;
      text-fill: #FFFFFF;
      text-label-position-tolerance: 0;
      text-halo-radius: 1;
      text-dy: -10;
      text-allow-overlap: true;
      text-placement: point;
      text-placement-type: dummy;
      [system="TR"] {
        text-halo-fill: @TR;
      }
      [system="RRV"] {
        text-halo-fill: @RRV;
      }
      [system="RDLC"] {
        text-halo-fill: @RDLC;
      }
      [system="RDLG"] {
        text-halo-fill: @RDLG;
      }
      [system="RDLF"] {
        text-halo-fill: @RDLF;
      }
   }
}
`);

const waterDepth = new carto.style.CartoCSS(`
   @four: #0033cc;
   @three: #1a53ff;
   @two: #668cff;
   @one: #99b3ff;
   @nodata: #d3d3d3;

   #layer {
     line-width: 2;
     polygon-opacity: 0.2;

     [waterdpth_round <= 7] {
       polygon-fill: @four;
       line-color: @four;
     }
     [waterdpth_round <= 5] {
       polygon-fill: @three;
       line-color: @three;
     }
     [waterdpth_round <= 3] {
       polygon-fill: @two;
       line-color: @two;
     }
     [waterdpth_round <= 1] {
       polygon-fill: @one;
       line-color: @one;
     }
     [waterdpth_round = 0] {
       polygon-fill: @nodata;
       line-color: @nodata;
     }
     ::labels [zoom>=13] {
      text-name: [short_code];
      text-face-name: 'DejaVu Sans Book';
      text-size: 10;
      text-fill: #FFFFFF;
      text-label-position-tolerance: 0;
      text-halo-radius: 1;
      text-dy: -10;
      text-allow-overlap: true;
      text-placement: point;
      text-placement-type: dummy;
      [waterdpth_round <= 7] {
        text-halo-fill: @four;
      }
      [waterdpth_round <= 5] {
        text-halo-fill: @three;
      }
      [waterdpth_round <= 3] {
        text-halo-fill: @two;
      }
      [waterdpth_round <= 1] {
        text-halo-fill: @one;
      }
      [waterdpth_round = 0] {
        text-halo-fill: @nodata;
      }
   }
}
`);


const sedDepth = new carto.style.CartoCSS(`
   @four: #ff9900;
   @three: #ffb84d;
   @two: #ffd699;
   @one: #ffebcc;
   @nodata: #d3d3d3;

   #layer {
     line-width: 2;
     polygon-opacity: 0.2;

     [seddpth_round <= 4] {
       polygon-fill: @four;
       line-color: @four;
     }
     [seddpth_round <= 3] {
       polygon-fill: @three;
       line-color: @three;
     }
     [seddpth_round <= 2] {
       polygon-fill: @two;
       line-color: @two;
     }
     [seddpth_round <= 1] {
       polygon-fill: @one;
       line-color: @one;
     }
     [seddpth_round = 0] {
       polygon-fill: @nodata;
       line-color: @nodata;
     }
     ::labels [zoom>=13] {
      text-name: [short_code];
      text-face-name: 'DejaVu Sans Book';
      text-size: 10;
      text-fill: #FFFFFF;
      text-label-position-tolerance: 0;
      text-halo-radius: 1;
      text-dy: -10;
      text-allow-overlap: true;
      text-placement: point;
      text-placement-type: dummy;
      [waterdpth_round <= 7] {
        text-halo-fill: @four;
      }
      [waterdpth_round <= 5] {
        text-halo-fill: @three;
      }
      [waterdpth_round <= 3] {
        text-halo-fill: @two;
      }
      [waterdpth_round <= 1] {
        text-halo-fill: @one;
      }
      [waterdpth_round = 0] {
        text-halo-fill: @nodata;
      }
   }
}
`);

// Empty variable to store selected visualization (systemStyle, waterDepth, or sedDepth)
const resacaStyle = new carto.style.CartoCSS(`
`);

// Initialize to systemStyle
resacaStyle.setContent(systemStyle.getContent());


const connectionStyle = new carto.style.CartoCSS(`
  #layer {
   marker-width: 7;
   marker-fill: #EE4D54;
 }
 `);
 const drainStyle = new carto.style.CartoCSS(`
   #layer {
    marker-width: 7;
    marker-fill: yellow;
  }
  `);


// Create and add CARTO layers
var allResacas = new carto.layer.Layer(all_resacas, resacaStyle, {
  featureOverColumns: ['short_code', 'acres_round', 'waterdpth_round', 'seddpth_round', 'system']
});
var connections = new carto.layer.Layer(connectionStructures, connectionStyle, {
  featureOverColumns: ['s_no', "s_type"]
});
var drains = new carto.layer.Layer(drainStructures, drainStyle, {
  featureOverColumns: ['s_no', "s_type"]
});
client.addLayers([allResacas, connections, drains]);
client.getLeafletLayer().addTo(map);
connections.hide();
drains.hide();


// Leaflet popup
const popup = L.popup({ closeButton: true});


// Populate info window and open popup "label"
function openPopup(featureEvent) {
  let content = '';
  content += `<div class="widget"><ul style="list-style-type:none">`;
  if (featureEvent.data.system == "TR") {
    content += `<li><h3>Town Resaca - `;
  }
  if (featureEvent.data.system == "RRV") {
    content += `<li><h3>Resaca Rancho Viejo - `;
  }
  if (featureEvent.data.system == "RDLG") {
    content += `<li><h3>Resaca de la Guerra - `;
  }
  if (featureEvent.data.system == "RDLF") {
    content += `<li><h3>Resaca de los Fresnos - `;
  }
  if (featureEvent.data.system == "RDLC") {
    content += `<li><h3>Resaca de los Cuates - `;
  }
  if (featureEvent.data.short_code) {
    content += `${featureEvent.data.short_code}</h3></li>`;
  }
  if (featureEvent.data.acres_round) {
    content += `<li>Acres: ${featureEvent.data.acres_round}</li>`;
  }
  if (featureEvent.data.waterdpth_round) {
    content += `<li>Average Water Depth: ${featureEvent.data.waterdpth_round} ft</li>`;
  }
  if (featureEvent.data.seddpth_round){
    content += `<li>Average Sediment Depth: ${featureEvent.data.seddpth_round} ft</li>`;
  }
  content += `</ul></div>`;

  //label to identify selected feature (eventually replace with highlight)
  let pContent = `<h3>${featureEvent.data.short_code}</h3>`
  popup.setContent(pContent);
  popup.setLatLng(featureEvent.latLng);
  if (!popup.isOpen()) {
    popup.openOn(map);
  }
  document.getElementById('info').innerHTML = content;
};



function openDrain(featureEvent) {
  let content = '';
  content += `<div class="widget"><ul style="list-style-type:none">`;
  if (featureEvent.data.s_no) {
    content += `<li><h3>${featureEvent.data.s_no}</li>`;
  }
  if (featureEvent.data.s_type){
    content += `<li>${featureEvent.data.s_type}</li>`;
  }
  content += `</ul></div>`;
  let pContent = `<h3>${featureEvent.data.s_no}</h3>`
  popup.setContent(pContent);
  popup.setLatLng(featureEvent.latLng);
  if (!popup.isOpen()) {
    popup.openOn(map);
  }
  document.getElementById('info').innerHTML = content;
};


// Add or remove hydraulic control structures layer
function setConnections() {
  if (connections.isVisible()) {
    connections.hide()
  } else {
    connections.show()
  }
  if (drains.isVisible()) {
    drains.hide()
  } else {
    drains.show()
  }
}

// Change style of allResacas layer based on selected visualization
function setwaterDepth() {
  resacaStyle.setContent(waterDepth.getContent());
}

function setDefault() {
  resacaStyle.setContent(systemStyle.getContent());
}

function setsedDepth() {
  resacaStyle.setContent(sedDepth.getContent());
}


const selector = $(".viz_selector");

// change sql query with dropdown value
selector.on('change', function(e) {
  let value = e.target.value;
  console.log(value);
  if (value == 'waterdepth') {
    resacaStyle.setContent(waterDepth.getContent());
  }
  if (value == 'seddepth') {
    resacaStyle.setContent(sedDepth.getContent());
  }
  if (value == 'system') {
    resacaStyle.setContent(systemStyle.getContent());
  }
});






/* Listen to event thrown when mouse is over a feature- create highlight function*/
// TR.on('featureOver', featureEvent => {
//   console.log(`Mouse over resaca segment: ${featureEvent.data.short_code}`);
// });


/* highlight currently selected feature*/
function highlightSegment(short_code) {
  // identify feature in the Dataset
  // create a copy with new style, replace original
  // control for clicked/not featureClicked
}

/** Listen to event thrown when polygon is clicked */
allResacas.on('featureClicked', openPopup);
drains.on('featureClicked', openDrain);
connections.on('featureClicked', openDrain);


/** ESRI Geocoder search */
var searchControl = L.esri.Geocoding.geosearch().addTo(map);
// empty layer for results event
var results = L.layerGroup().addTo(map);
// listen for results event and add every result to the map
searchControl.on("results", function(data) {
  results.clearLayers();
  for (var i = data.results.length - 1; i >= 0; i--) {
    results.addLayer(L.marker(data.results[i].latlng));
  }
});
