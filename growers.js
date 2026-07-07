//------------------------------------------------------
// GROWERS.JS VERSION 3.1
// Sugarcane GIS Enterprise
//------------------------------------------------------

//======================================================
// GLOBAL VARIABLES
//======================================================

let growerList = [];

//======================================================
// LOAD GROWERS
//======================================================

document.addEventListener("DOMContentLoaded", function () {

    loadGrowers();

});

//======================================================
// LOAD GROWERS FROM SERVER
//======================================================

async function loadGrowers() {

    try {

        const response = await fetch("/growers");

        growerList = await response.json();

        console.log("Growers Loaded:", growerList);

        initializeGrowerSearch();

    }

    catch (error) {

        console.error("Failed to load growers:", error);

    }

}

//======================================================
// INITIALIZE SEARCH
//======================================================

function initializeGrowerSearch() {

    const input = document.getElementById("growerSearch");

    const button = document.getElementById("growerBtn");

    if (!input || !button) {

        console.error("Grower search controls not found.");

        return;

    }

    button.addEventListener("click", searchGrower);

    input.addEventListener("keyup", function (event) {

        if (event.key === "Enter") {

            searchGrower();

        }

    });

}

//======================================================
// SEARCH GROWER
//======================================================

function searchGrower() {

    const input = document.getElementById("growerSearch");

    const searchText = input.value.trim().toLowerCase();

    if (searchText === "") {

        alert("Please enter a grower name.");

        input.focus();

        return;

    }

    const grower = growerList.find(function (g) {

        return g.grower_name.toLowerCase().includes(searchText);

    });

    if (!grower) {

        alert("Grower not found.");

        input.focus();

        return;

    }

    console.log("Selected Grower:", grower);

    highlightGrower(grower.grower_id);

    input.value = "";

    input.focus();

}

//======================================================
// GET GROWER BY ID
//======================================================

function getGrowerById(id) {

    return growerList.find(function (g) {

        return String(g.grower_id) === String(id);

    });

}