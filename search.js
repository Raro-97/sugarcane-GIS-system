//------------------------------------------------------
// SEARCH.JS VERSION 3.0
// Sugarcane GIS Enterprise
//------------------------------------------------------

//======================================================
// INITIALIZE SEARCH
//======================================================

document.addEventListener("DOMContentLoaded", function(){

    initializeParcelSearch();

});

//======================================================
// INITIALIZE EVENTS
//======================================================

function initializeParcelSearch(){

    const input = document.getElementById("parcelSearch");

    const button = document.getElementById("searchBtn");

    if(!input || !button){

        console.error("Parcel search controls not found.");

        return;

    }

    button.addEventListener("click", searchParcel);

    input.addEventListener("keyup", function(event){

        if(event.key === "Enter"){

            searchParcel();

        }

    });

}

//======================================================
// SEARCH PARCEL
//======================================================

function searchParcel(){

    const input = document.getElementById("parcelSearch");

    const parcelID = input.value.trim();

    //--------------------------------------------------
    // EMPTY SEARCH
    //--------------------------------------------------

    if(parcelID === ""){

        alert("Please enter a Parcel ID.");

        input.focus();

        return;

    }

    //--------------------------------------------------
    // VALIDATE NUMBER
    //--------------------------------------------------

    if(isNaN(parcelID)){

        alert("Parcel ID must be a number.");

        input.focus();

        return;

    }

    //--------------------------------------------------
    // MAP READY?
    //--------------------------------------------------

    if(!parcelLayer){

        alert("Map is still loading. Please wait.");

        return;

    }

    //--------------------------------------------------
    // FIND PARCEL
    //--------------------------------------------------

    let found = false;

    parcelLayer.eachLayer(function(layer){

        if(String(layer.feature.properties.Parcel_ID) === String(parcelID)){

            found = true;

        }

    });

    //--------------------------------------------------
    // HIGHLIGHT
    //--------------------------------------------------

    if(found){

        highlightParcel(parcelID);

        input.value = "";

        input.focus();

    }

    //--------------------------------------------------
    // NOT FOUND
    //--------------------------------------------------

    else{

        alert("Parcel ID " + parcelID + " was not found.");

        input.focus();

    }

}

//======================================================
// RESET SEARCH BOX
//======================================================

function resetParcelSearch(){

    const input = document.getElementById("parcelSearch");

    input.value = "";

    input.focus();

}