//------------------------------------------------------
// MAP.JS VERSION 4.1
// Sugarcane GIS Enterprise
//------------------------------------------------------

//======================================================
// GLOBAL VARIABLES
//======================================================

let map;
let parcelLayer;
let parcelData;

let street;
let satellite;

let layerControl;

let selectedParcel = null;
let highlightedLayers = [];
let filteredFeatures = [];

//======================================================
// DEFAULT STYLE
//======================================================

const defaultStyle = {
    color: "#2E7D32",
    weight: 2,
    fillColor: "#81C784",
    fillOpacity: 0.45
};

//======================================================
// HOVER STYLE
//======================================================

const hoverStyle = {
    color: "#388E3C",
    weight: 3,
    fillColor: "#A5D6A7",
    fillOpacity: 0.65
};

//======================================================
// HIGHLIGHT STYLE
//======================================================

const highlightStyle = {
    color: "#E53935",
    weight: 4,
    fillColor: "#FFEB3B",
    fillOpacity: 0.85
};

//======================================================
// INITIALIZE MAP
//======================================================

document.addEventListener("DOMContentLoaded", initializeMap);

function initializeMap() {

    map = L.map("map", {
        zoomControl: true
    });

    street = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 20,
            attribution: "© OpenStreetMap"
        }
    );

    satellite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
            attribution: "© Esri"
        }
    );

    street.addTo(map);

    legend.addTo(map);

    loadParcels();

}

//======================================================
// LOAD PARCELS
//======================================================

function loadParcels() {

    fetch("/parcels")

        .then(response => response.json())

        .then(data => {

            parcelData = data;

            parcelLayer = L.geoJSON(parcelData, {

                style: defaultStyle,

                onEachFeature: onEachParcel

            });

            parcelLayer.addTo(map);

            if (layerControl) {

                map.removeControl(layerControl);

            }

            layerControl = L.control.layers(

                {
                    "🗺 Street Map": street,
                    "🛰 Satellite": satellite
                },

                {
                    "🌾 Sugarcane Parcels": parcelLayer
                },

                {
                    collapsed: false
                }

            ).addTo(map);

            map.fitBounds(parcelLayer.getBounds(), {

                padding: [30, 30]

            });

            populateFilters();
            populateParcelTable(parcelData.features);

        })

        .catch(err => console.error(err));

}

//======================================================
// PARCEL EVENTS
//======================================================

function onEachParcel(feature, layer) {

    const p = feature.properties;

    layer.bindPopup(

        "<h3>🌾 Sugarcane Parcel</h3>" +
        "<hr>" +
        "<b>Parcel ID:</b> " + p.Parcel_ID + "<br>" +
        "<b>Grower ID:</b> " + p.Grower_ID + "<br>" +
        "<b>Area:</b> " + Number(p.Area_Ha).toFixed(2) + " Ha<br>" +
        "<b>Variety:</b> " + p.Variety + "<br>" +
        "<b>Status:</b> " + p.Status + "<br>" +
        "<b>Crop Age:</b> " + Number(p.Crop_Age).toFixed(1) + " Months<br>" +
        "<b>Estimated Yield:</b> " +
        Number(p.Estimated_Tonnage).toFixed(2) +
        " Tonnes"

    );

    layer.bindTooltip(

        "Parcel " + p.Parcel_ID,

        {
            sticky: true,
            direction: "top"
        }

    );

    layer.on({

        mouseover: function () {

            if (!highlightedLayers.includes(layer)) {

                layer.setStyle(hoverStyle);

            }

        },

        mouseout: function () {

            if (!highlightedLayers.includes(layer)) {

                layer.setStyle(defaultStyle);

            }

        },

        click: function () {

            highlightParcel(p.Parcel_ID);

        }

    });

}

//======================================================
// CLEAR HIGHLIGHTS
//======================================================

function clearHighlights() {

    highlightedLayers.forEach(function (layer) {

        layer.setStyle(defaultStyle);

    });

    highlightedLayers = [];

    selectedParcel = null;

}

//======================================================
// HIGHLIGHT PARCEL
//======================================================

function highlightParcel(parcelID) {

    if (!parcelLayer) return;

    clearHighlights();

    parcelLayer.eachLayer(function (layer) {

        if (String(layer.feature.properties.Parcel_ID) === String(parcelID)) {

            layer.setStyle(highlightStyle);

            highlightedLayers.push(layer);

            selectedParcel = layer;

            map.flyToBounds(layer.getBounds(), {

                padding: [40, 40],

                duration: 1.5

            });

            layer.openPopup();

            if (typeof updateDashboard === "function") {

                updateDashboard(layer.feature);

            }

        }

    });

}

//======================================================
// HIGHLIGHT GROWER
//======================================================

function highlightGrower(growerID) {

    if (!parcelLayer) return;

    clearHighlights();

    let found = [];

    parcelLayer.eachLayer(function (layer) {

        if (String(layer.feature.properties.Grower_ID) === String(growerID)) {

            layer.setStyle(highlightStyle);

            highlightedLayers.push(layer);

            found.push(layer);

        }

    });

    if (found.length === 0) {

        alert("Grower not found.");

        return;

    }

    const group = L.featureGroup(found);

    map.flyToBounds(group.getBounds(), {

        padding: [40, 40],

        duration: 1.5

    });

    found[0].openPopup();

    if (typeof updateDashboard === "function") {

        updateDashboard(found[0].feature);

    }

}

//======================================================
// RESET MAP
//======================================================

function resetMap() {

    restoreDashboard();
    if(typeof loadCharts === "function"){

    loadCharts();

}

    clearHighlights();

    if (parcelLayer) {

        map.fitBounds(parcelLayer.getBounds(), {

            padding: [30, 30]

        });

    }

}


//------------------------------------------------------
// UPDATE PARCEL TABLE
//------------------------------------------------------

function updateParcelTable(features){

    const tbody = document.querySelector("#parcelTable tbody");

    if(!tbody) return;

    tbody.innerHTML = "";

    features.forEach(function(feature){

        const p = feature.properties;

        const row = document.createElement("tr");
        console.log(
    "Parcel Grower_ID:",
    p.Grower_ID,
    "Matched Grower:",
    getGrowerById(p.Grower_ID)
);

        const grower = (typeof getGrowerById === "function")
    ? getGrowerById(p.Grower_ID)
    : null;

row.innerHTML = `

    <td>${p.Parcel_ID}</td>

    <td>${grower ? grower.grower_name : p.Grower_ID}</td>

    <td>${grower ? grower.village : (p.Village || "-")}</td>

    <td>${p.Variety}</td>

    <td>
        <span class="statusBadge ${String(p.Status).toLowerCase()}">
            ${p.Status}
        </span>
    </td>

    <td>${Number(p.Area_Ha).toFixed(2)}</td>

    <td>${Number(p.Estimated_Tonnage).toFixed(2)} T</td>

`;

        row.addEventListener("click", function(){

            highlightParcel(p.Parcel_ID);

        });

        tbody.appendChild(row);

    });

}
//======================================================
// POPULATE FILTERS
//======================================================

function populateFilters(){

    if(!parcelData) return;

    fillFilter("filterVariety","Variety");
    fillFilter("filterStatus","Status");
    fillFilter("filterVillage","Village");
    fillFilter("filterGrower","Grower_ID");
    fillFilter("filterRatoon","Ratoon_Cycle");

}

function fillFilter(id,field){

    const select=document.getElementById(id);

    if(!select) return;

    while(select.options.length>1){
        select.remove(1);
    }

    const values=[...new Set(
        parcelData.features
        .map(f=>f.properties[field])
        .filter(v=>v!==null && v!==undefined && v!=="")
    )].sort();

    values.forEach(value=>{

        const option=document.createElement("option");

        option.value=value;

        option.textContent=value;

        select.appendChild(option);

    });

}

//======================================================
// APPLY FILTERS
//======================================================

document.getElementById("applyFilters").addEventListener("click",applyFilters);

function applyFilters(){

    const variety=document.getElementById("filterVariety").value;
    const status=document.getElementById("filterStatus").value;
    const village=document.getElementById("filterVillage").value;
    const grower=document.getElementById("filterGrower").value;
    const ratoon=document.getElementById("filterRatoon").value;

    const filtered=parcelData.features.filter(f=>{

        const p=f.properties;

        return(
            (!variety || p.Variety==variety) &&
            (!status || p.Status==status) &&
            (!village || p.Village==village) &&
            (!grower || String(p.Grower_ID)==grower) &&
            (!ratoon || String(p.Ratoon_Cycle)==ratoon)
        );

    });

    map.removeLayer(parcelLayer);

    parcelLayer=L.geoJSON(
        {
            type:"FeatureCollection",
            features:filtered
        },
        {
            style:defaultStyle,
            onEachFeature:onEachParcel
        }
    ).addTo(map);

    if(filtered.length>0){

        map.fitBounds(parcelLayer.getBounds(),{

            padding:[30,30]

        });

    }

    updateFilterStatistics(filtered);

    updateCharts(filtered);

    populateParcelTable(filtered);

}

//======================================================
// RESET FILTERS
//======================================================

document.getElementById("resetFilters").addEventListener("click",function(){

    document.getElementById("filterVariety").value="";
    document.getElementById("filterStatus").value="";
    document.getElementById("filterVillage").value="";
    document.getElementById("filterGrower").value="";
    document.getElementById("filterRatoon").value="";

    map.removeLayer(parcelLayer);

    parcelLayer=L.geoJSON(parcelData,{
        style:defaultStyle,
        onEachFeature:onEachParcel
    }).addTo(map);

    map.fitBounds(parcelLayer.getBounds(),{

        padding:[30,30]

    });

    restoreDashboard();

    loadCharts();

    populateParcelTable(parcelData.features);

});

//======================================================
// MAP LEGEND
//======================================================

const legend=L.control({

    position:"bottomright"

});

legend.onAdd=function(){

    const div=L.DomUtil.create("div","legend");

    div.innerHTML=`
        <h4>Legend</h4>

        <div><span class="legend-green"></span> Sugarcane Parcel</div>

        <div><span class="legend-yellow"></span> Selected Parcel</div>
    `;

    return div;

};
//------------------------------------------------------
// POPULATE PARCEL TABLE
//------------------------------------------------------

function populateParcelTable(features){

    const tbody = document.querySelector("#parcelTable tbody");

    if(!tbody) return;

    tbody.innerHTML = "";

    features.forEach(function(feature){

        const p = feature.properties;

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${p.Parcel_ID}</td>
            <td>${p.Grower_ID}</td>
            <td>${p.Village}</td>
            <td>${p.Variety}</td>
            <td>${p.Status}</td>
            <td>${Number(p.Area_Ha).toFixed(2)}</td>
            <td>${Number(p.Estimated_Tonnage).toFixed(2)}</td>
        `;

        row.addEventListener("click", function(){

            highlightParcel(p.Parcel_ID);

        });

        tbody.appendChild(row);

    });

}