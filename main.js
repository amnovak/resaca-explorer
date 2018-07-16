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


// Add baselayers to map
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


// create variables for styles
const systemStyle = new carto.style.CartoCSS($("#systems").text());
const waterStyle = new carto.style.CartoCSS($("#waterDepth").text());
const sedStyle = new carto.style.CartoCSS($("#sedimentDepth").text());

// Variable to store selected visualization. Initialize as systemStyle
const resacaStyle = new carto.style.CartoCSS(systemStyle.getContent());

// cartoCSS styles for other layers
const connectionStyle = new carto.style.CartoCSS(`
  #layer {
   marker-width: 7;
   marker-fill: #EE4D54;

   [zoom>=12] {
     marker-width: 10;
   }
 }
 `);

 const drainStyle = new carto.style.CartoCSS(`
   #layer {
    marker-width: 7;
    marker-fill: yellow;

    [zoom>=12] {
      marker-width: 10;
    }
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
// highlight selected feature on click (adapted from Ramiro Aznar: https://bl.ocks.org/oriolbx/9a81ae25e512abaf59d09dddbd8a6c24)
function openPopup(featureEvent) {
  // let polygon_selected = featureEvent.data.short_code;
  //
  // // call with CARTO SQL API the layer that we want to use,
  //           // we get the boundaries of the polygons to highlight them when click
  //           axios.get(`https://novakannaaa.carto.com/api/v2/sql?q=
  //               SELECT ST_asGeoJSON(ST_Boundary(the_geom)) as geom
  //               FROM all_resacas
  //               WHERE short_code = ${polygon_selected}
  //           `).then(function (response) {
  //                   // save into geom the geometriea that come from CARTO
  //                   let geom = response.data.rows[0].geom;
  //                   // style
  //                   let boundary = L.geoJson(JSON.parse(geom), {
  //                       style: {
  //                           color: "#000",
  //                           weight: 5
  //                       }
  //                   });
  //                   // add Leaflet layer to the map
  //           map.addLayer(boundary);
  //
  //           // remove Leaflet layer after 2 seconds
  //           setInterval(function(){
  //           map.removeLayer(boundary)
  //           }, 2000)
  //         });
  //
  //         // add CARTO layer to the client
  //         client.addLayer(cartoLayer);
  //
  //         // get tile from client and add them to the map object
  //         client.getLeafletLayer().addTo(map);

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
  let pContent = `<h3>${featureEvent.data.s_type}</h3>`
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

// Change style of allResacas layer based on selected visualization (buttons)
function setwaterDepth() {
  resacaStyle.setContent(waterStyle.getContent());
}

function setDefault() {
  resacaStyle.setContent(systemStyle.getContent());
}

function setsedDepth() {
  resacaStyle.setContent(sedStyle.getContent());
}



// Add field selector
const selector = $(".visualization")

// change sql query with dropdown value
selector.on('change', function(e) {
  console.log("Menu changed");
  let value = e.target.value;
  console.log(value);
  if (value == 'waterdepth') {
    resacaStyle.setContent(waterStyle.getContent());
  }
  if (value == 'seddepth') {
    resacaStyle.setContent(sedStyle.getContent());
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


//add legend elements (code adapted from Ramiro Aznar: https://bl.ocks.org/ramiroaznar/8c055a821e3446d8a4f11656402de705 )

allResacas.on('metadataChanged', renderLegend);

function renderLegend(metadata){
  console.log(metadata);
  metadata.styles.forEach(function (styleMetadata) {

    if (styleMetadata.getType() == 'categories') {
      if (styleMetadata.getProperty() == 'polygon-fill') {
       let categories = styleMetadata.getCategories();
       console.log(categories)
       var content = '';
       for (category of categories){
         content += `<li><div class="circle" style="background:${category.value}"></div>`;
         if (category.name == "RRV") {
           content += `Resaca de Rancho Viejo`;
         }
         if (category.name == "RDLG") {
           content += `Resaca de la Guerra`;
         }
         if (category.name == "RDLF") {
           content += `Resaca de los Fresnos`;
         }
         if (category.name == "RDLC") {
           content += `Resaca de los Cuates`;
         }
         if (category.name == "TR") {
           content += `Town Resaca`;
         }
         content += `</li>`
       }
       document.getElementById('legend-content').innerHTML = content;
      }

  }

  if (styleMetadata.getType() == 'buckets') {
    if (styleMetadata.getProperty() == 'polygon-fill') {
      let buckets = styleMetadata.getBuckets();
      console.log(buckets);
      var content = '';
      for (bucket of buckets){
         if (bucket.min == null) {
           content += `<li><div class="circle" style="background:${bucket.value}"></div> No data </li>`;
         }
         else if (bucket.max == undefined) {
         content += `<li><div class="circle" style="background:${bucket.value}"></div> > ${bucket.min} ft</li>`;
       }
      else {
        content += `<li><div class="circle" style="background:${bucket.value}"></div> ${bucket.min} - ${bucket.max} ft</li>`;
      }
    }
      console.log(content);
      document.getElementById('legend-content').innerHTML = content;
    }
  }

  });
};




/** update infowindow when a feature is clicked */
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
