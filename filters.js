//------------------------------------------------------
// FILTERS.JS VERSION 2.0
// Enterprise Filter Controller
//------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {

    document
        .getElementById("applyFilters")
        .addEventListener("click", applyFilters);

    document
        .getElementById("resetFilters")
        .addEventListener("click", resetFilters);

});

//------------------------------------------------------
// Populate Filters
//------------------------------------------------------

function populateFilters(features){

    if(!features) return;

    const varieties = new Set();
    const statuses = new Set();
    const villages = new Set();
    const growers = new Set();
    const ratoons = new Set();

    features.forEach(feature=>{

        const p = feature.properties;

        if(p.Variety)
            varieties.add(p.Variety);

        if(p.Status)
            statuses.add(p.Status);

        if(p.Village)
            villages.add(p.Village);

        if(p.Grower_ID!=null)
            growers.add(p.Grower_ID);

        if(p.Ratoon_Cycle!=null)
            ratoons.add(p.Ratoon_Cycle);

    });

    fillSelect("filterVariety",varieties);
    fillSelect("filterStatus",statuses);
    fillSelect("filterVillage",villages);
    fillSelect("filterGrower",growers);
    fillSelect("filterRatoon",ratoons);

}

//------------------------------------------------------
// Fill Select
//------------------------------------------------------

function fillSelect(id,set){

    const select=document.getElementById(id);

    if(!select) return;

    const firstOption=select.options[0];

    select.innerHTML="";

    select.appendChild(firstOption);

    [...set]
        .sort()
        .forEach(value=>{

            const option=document.createElement("option");

            option.value=value;

            option.textContent=value;

            select.appendChild(option);

        });

}

//------------------------------------------------------
// Apply Filters
//------------------------------------------------------

function applyFilters(){

    if(!parcelData) return;

    const variety=document.getElementById("filterVariety").value;

    const status=document.getElementById("filterStatus").value;

    const village=document.getElementById("filterVillage").value;

    const grower=document.getElementById("filterGrower").value;

    const ratoon=document.getElementById("filterRatoon").value;

    filteredFeatures=parcelData.features.filter(feature=>{

        const p=feature.properties;

        return(

            (!variety || p.Variety==variety)&&

            (!status || p.Status==status)&&

            (!village || p.Village==village)&&

            (!grower || String(p.Grower_ID)==grower)&&

            (!ratoon || String(p.Ratoon_Cycle)==ratoon)

        );

    });

    redrawMap(filteredFeatures);

}

//------------------------------------------------------
// Reset Filters
//------------------------------------------------------

function resetFilters(){

    document.getElementById("filterVariety").value="";

    document.getElementById("filterStatus").value="";

    document.getElementById("filterVillage").value="";

    document.getElementById("filterGrower").value="";

    document.getElementById("filterRatoon").value="";

    filteredFeatures=[];

    redrawMap(parcelData.features);

}

//------------------------------------------------------
// Redraw Entire Dashboard
//------------------------------------------------------

function redrawMap(features){

    if(parcelLayer){

        map.removeLayer(parcelLayer);

    }

    parcelLayer=L.geoJSON({

        type:"FeatureCollection",

        features:features

    },{

        style:defaultStyle,

        onEachFeature:onEachParcel

    }).addTo(map);

    if(features.length){

        map.fitBounds(parcelLayer.getBounds(),{

            padding:[30,30]

        });

    }

    //------------------------------------
    // Update Dashboard
    //------------------------------------

    if(typeof updateFilterStatistics==="function"){

        updateFilterStatistics(features);

    }

    //------------------------------------
    // Charts
    //------------------------------------

    if(typeof updateCharts==="function"){

        updateCharts(features);

    }

    //------------------------------------
    // Parcel Table
    //------------------------------------

    if(typeof populateParcelTable==="function"){

        populateParcelTable(features);

    }

}