var map = L.map('map').setView([26.10, -97.29], 10);

// Variables to store basemap tiles
var mapboxSatStreets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW1ub3ZhayIsImEiOiJjamlrcnVqM3kwY3ZoM3ZteWVlYWEwMWdmIn0.KaCmpHIRa0GRQpUTIrRYwQ', {
   maxZoom: 18,
   attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
   id: 'mapbox.streets',
});

// Add baselayers to map
mapboxSatStreets.addTo(map);

// Add CARTO client
const client = new carto.Client({
  apiKey: 'default_public',
  username: 'novakannaaa'
});

// Load data tables from CARTO
const all_resacas = new carto.source.Dataset(`combined_aerial_1`);
const hydroConnects1 = new carto.source.Dataset(`connectionstructures`);
const hydroConnects2 = new carto.source.Dataset(`connectionstructures2`);
const subBasins = new carto.source.Dataset(`doc`);

// Create variables for CartoCSS styles (from index.html)
const systemStyle = new carto.style.CartoCSS($("#systems").text());
const waterStyle = new carto.style.CartoCSS($("#waterDepth").text());
const sedStyle = new carto.style.CartoCSS($("#sedimentDepth").text());

// Variable to store currently selected visualization. Initialize as systemStyle
const resacaStyle = new carto.style.CartoCSS(systemStyle.getContent());


const basinStyle = new carto.style.CartoCSS(`
  #layer {
  line-width: 1;
  polygon-fill: #FFFFFF;
  polygon-opacity: 0;
  line-color: #FFFFFF;
}
`);

// cartoCSS styles for other layers
const hcs1Style = new carto.style.CartoCSS(`
  #layer {
   marker-width: 7;
   marker-fill: #EE4D54;

   [zoom>=12] {
     marker-width: 10;
   }

   [zoom>=15] {
     marker-width: 13;
   }
 }
 `);

 const hcs2Style = new carto.style.CartoCSS(`
   #layer {
    marker-width: 7;
    marker-fill: yellow;

    [zoom>=12] {
      marker-width: 10;
    }

    [zoom>=15] {
      marker-width: 13;
    }
  }
  `);


// Create CARTO layers and add to map
var allResacas = new carto.layer.Layer(all_resacas, resacaStyle, {
  featureOverColumns: ['short_code', 'acres_round', 'water_depth', 'sed_height', 'system']
});
var connections = new carto.layer.Layer(hydroConnects1, hcs1Style, {
  featureOverColumns: ['s_no', "s_type"]
});
var connections2 = new carto.layer.Layer(hydroConnects2, hcs2Style, {
  featureOverColumns: ['s_no', "s_type"]
});
var basins = new carto.layer.Layer(subBasins, basinStyle, {
  featureOverColumns: ['name']
});

client.addLayers([basins, allResacas, connections, connections2]);
client.getLeafletLayer().addTo(map);

// Hide the optional layers
connections.hide();
connections2.hide();
basins.hide();



// Leaflet popup
const popup = L.popup({ closeButton: true});


var highlight;


// Populate info window and open popup "label"
// highlight selected feature (adapted from Ramiro Aznar: https://bl.ocks.org/oriolbx/9a81ae25e512abaf59d09dddbd8a6c24)
function openPopup(featureEvent) {

  let content = '';
  content += `<div class="widget"><ul style="list-style-type:none">`;
  if (featureEvent.data.system == "TR") {
    content += `<li><h3>Town Resaca - `;
  }
  if (featureEvent.data.system == "RRV") {
    content += `<li><h3>Resaca de Rancho Viejo - `;
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
  if (featureEvent.data.water_depth) {
    content += `<li>Average Water Depth: ${featureEvent.data.water_depth} ft</li>`;
  }
  if (featureEvent.data.sed_height){
    content += `<li>Average Sediment Depth: ${featureEvent.data.sed_height} ft</li>`;
  }
  content += `</ul></div>`;

  //Popup label to identify selected feature
  let pContent = `<h3>${featureEvent.data.short_code}</h3>`
  popup.setContent(pContent);
  popup.setLatLng(featureEvent.latLng);
  if (!popup.isOpen()) {
    popup.openOn(map);
  }
  document.getElementById('info').innerHTML = content;




// reset styling to remove previously highlighted features (?)


//highlight selected feature
  let selected_polygon = featureEvent.data.cartodb_id;


//remove the highlight on the previously selected feature.
  if (highlight) {
    console.log("has layer = true");
    map.removeLayer(highlight);
  }

  // call with CARTO SQL API the layer that we want to use,
            // we get the boundaries of the polygons to highlight them when click
            axios.get(`https://novakannaaa.carto.com/api/v2/sql?q=SELECT ST_asGeoJSON(ST_Boundary(the_geom)) as geom
                FROM combined_aerial_1
                WHERE cartodb_id = ${selected_polygon}
            `).then(function (response) {

              // if (highlight) {
              //   console.log("highlight true");
              //   map.removeLayer(highlight);
              // }
                    // save into geom the geometry that came from CARTO
                    var geom = response.data.rows[0].geom;
                    // style
                    highlight = L.geoJson(JSON.parse(geom), {
                        style: {
                            color: "#FFF",
                            weight: 1
                        }
                    });
                    // add Leaflet layer to the map
              map.addLayer(highlight);

});
          // // add CARTO layer to the client
          // client.addLayer(cartoLayer);
          //
          // // get tile from client and add them to the map object
          // client.getLeafletLayer().addTo(map);
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



function openBasin(featureEvent) {
  let content = '';
  content += `<div class="widget"><ul style="list-style-type:none">`;
  if (featureEvent.data.name) {
    content += `<li>${featureEvent.data.name}</li>`;
  }
  content += `</ul></div>`;
  popup.setContent(content);
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
  if (connections2.isVisible()) {
    connections2.hide()
  } else {
    connections2.show()
  }
};

// Add or remove basins layer
function addBasins() {
  if (basins.isVisible()) {
    basins.hide()
  } else {
    basins.show()
  }
};


// Change style of resacas layer based on selected visualization
function setwaterDepth() {
  resacaStyle.setContent(waterStyle.getContent());
}

function setDefault() {
  resacaStyle.setContent(systemStyle.getContent());
}

function setsedDepth() {
  resacaStyle.setContent(sedStyle.getContent());
}



/* Listen to event thrown when mouse is over a feature- create highlight function*/
// TR.on('featureOver', featureEvent => {
//   console.log(`Mouse over resaca segment: ${featureEvent.data.short_code}`);
// });



// Update legend when style is changed
allResacas.on('metadataChanged', renderLegend);


//Function to add legend elements
//Code adapted from Ramiro Aznar: https://bl.ocks.org/ramiroaznar/8c055a821e3446d8a4f11656402de705
function renderLegend(metadata){
  metadata.styles.forEach(function (styleMetadata) {
    if (styleMetadata.getType() == 'categories') {              // categorical legend
      if (styleMetadata.getProperty() == 'polygon-fill') {
       let categories = styleMetadata.getCategories();
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

  if (styleMetadata.getType() == 'buckets') {                // quantitative legend
    if (styleMetadata.getProperty() == 'polygon-fill') {
      let buckets = styleMetadata.getBuckets();
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
      document.getElementById('legend-content').innerHTML = content;
    }
  }

  });
};


// update infowindow when a feature is clicked
allResacas.on('featureClicked', openPopup);
connections2.on('featureClicked', openDrain);
connections.on('featureClicked', openDrain);
basins.on('featureClicked', openBasin);


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
