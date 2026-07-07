//------------------------------------------------------
// DASHBOARD.JS VERSION 3.1
// Sugarcane GIS Enterprise
//------------------------------------------------------

//======================================================
// GLOBAL VARIABLES
//======================================================

let growers = [];
let parcels = null;

//======================================================
// INITIALIZE DASHBOARD
//======================================================

document.addEventListener("DOMContentLoaded", async function () {

    updateDateTime();

    setInterval(updateDateTime, 1000);

    await loadDashboard();

    // Refresh dashboard every minute
    setInterval(loadDashboard, 60000);

    //--------------------------------------------------
    // RESET CARD
    //--------------------------------------------------

    const parcelCard = document.getElementById("parcelCard");

    if (parcelCard) {

        parcelCard.addEventListener("click", function () {

            if (typeof resetMap === "function") {

                resetMap();

            }

            restoreDashboard();

        });

    }

});

//======================================================
// LIVE DATE & TIME
//======================================================

function updateDateTime() {

    const now = new Date();

    document.getElementById("datetime").textContent =
        now.toLocaleString();

}

//======================================================
// ANIMATED COUNTER
//======================================================

function animateCounter(id, endValue, decimals = 0) {

    const element = document.getElementById(id);

    if (!element) return;

    let current = 0;

    const increment = endValue / 60;

    const timer = setInterval(function () {

        current += increment;

        if (current >= endValue) {

            current = endValue;

            clearInterval(timer);

        }

        element.textContent = current.toFixed(decimals);

    }, 20);

}

//======================================================
// LOAD DASHBOARD
//======================================================

async function loadDashboard() {

    try {

        //--------------------------------------------------
        // LOAD GROWERS
        //--------------------------------------------------

        const growerResponse = await fetch("/growers");

        growers = await growerResponse.json();

        //--------------------------------------------------
        // LOAD PARCELS
        //--------------------------------------------------

        const parcelResponse = await fetch("/parcels");

        parcels = await parcelResponse.json();

        //--------------------------------------------------
        // CALCULATE TOTALS
        //--------------------------------------------------

        let hectares = 0;

        let tonnes = 0;

        const varieties = {};

        parcels.features.forEach(function (feature) {

            hectares += Number(feature.properties.Area_Ha);

            tonnes += Number(feature.properties.Estimated_Tonnage);

            const variety = feature.properties.Variety;

            varieties[variety] = (varieties[variety] || 0) + 1;

        });

        //--------------------------------------------------
        // FIND MOST COMMON VARIETY
        //--------------------------------------------------

        let topVariety = "-";

        let highest = 0;

        for (const variety in varieties) {

            if (varieties[variety] > highest) {

                highest = varieties[variety];

                topVariety = variety;

            }

        }

        //--------------------------------------------------
        // KPI CARDS
        //--------------------------------------------------

        animateCounter("growers", growers.length);

        animateCounter("parcels", parcels.features.length);

        animateCounter("hectares", hectares, 2);

        animateCounter("yield", tonnes, 2);

        //--------------------------------------------------
        // SUMMARY PANEL
        //--------------------------------------------------

        document.getElementById("sumGrowers").textContent =
            growers.length;

        document.getElementById("sumParcels").textContent =
            parcels.features.length;

        document.getElementById("sumHectares").textContent =
            hectares.toFixed(2);

        document.getElementById("sumYield").textContent =
            tonnes.toFixed(2);

        document.getElementById("topVariety").textContent =
            topVariety;

        console.log("Dashboard loaded successfully.");

    }

    catch (error) {

        console.error("Dashboard Error:", error);

    }

}

//======================================================
// UPDATE DASHBOARD AFTER PARCEL CLICK
//======================================================

function updateDashboard(feature) {

    if (!feature) return;

    const p = feature.properties;

    const area = parseFloat(p.Area_Ha) || 0;

    const tonnes = parseFloat(p.Estimated_Tonnage) || 0;

    //--------------------------------------------------
    // KPI CARDS
    //--------------------------------------------------

    document.getElementById("growers").textContent = "1";

    document.getElementById("parcels").textContent = "1";

    document.getElementById("hectares").textContent =
        area.toFixed(2);

    document.getElementById("yield").textContent =
        tonnes.toFixed(2);

    //--------------------------------------------------
    // SUMMARY PANEL
    //--------------------------------------------------

    document.getElementById("sumGrowers").textContent = "1";

    document.getElementById("sumParcels").textContent = "1";

    document.getElementById("sumHectares").textContent =
        area.toFixed(2);

    document.getElementById("sumYield").textContent =
        tonnes.toFixed(2);

    document.getElementById("topVariety").textContent =
        p.Variety || "-";


//------------------------------------------------------
// FIND GROWER DETAILS
//------------------------------------------------------

let grower = null;

if(typeof getGrowerById === "function"){

    grower = getGrowerById(p.Grower_ID);

}
//------------------------------------------------------
// UPDATE PARCEL INFORMATION PANEL
//------------------------------------------------------

const info = document.getElementById("parcelInfo");

if(info){

    info.innerHTML = `

        <p><strong>Parcel ID:</strong> ${p.Parcel_ID}</p>

        <p><strong>Grower:</strong> ${grower ? grower.grower_name : "-"}</p>

<p><strong>Phone:</strong> ${grower ? grower.phone : "-"}</p>

<p><strong>Contract:</strong> ${grower ? grower.contract_no : "-"}</p>

<p><strong>Village:</strong> ${grower ? grower.village : "-"}</p>

        <p><strong>Area:</strong> ${Number(p.Area_Ha).toFixed(2)} Ha</p>

        <p><strong>Variety:</strong> ${p.Variety}</p>

       <p>
    <strong>Status:</strong>
    <span class="statusBadge ${String(p.Status).toLowerCase()}">
        ${p.Status}
    </span>
</p> 

        <p><strong>Crop Age:</strong> ${Number(p.Crop_Age).toFixed(1)} Months</p>

        <p><strong>Harvest Due:</strong> ${new Date(p.Harvest_Due).toLocaleDateString()}</p>

        <p><strong>Estimated Yield:</strong> ${Number(p.Estimated_Tonnage).toFixed(2)} Tonnes</p>

    `;

}
}

//======================================================
// RESTORE DASHBOARD
//======================================================

function restoreDashboard() {

    loadDashboard();

}

//======================================================
// OPTIONAL LOADING MESSAGE
//======================================================

function showLoading(message) {

    console.log(message);

}
//------------------------------------------------------
// UPDATE FILTER STATISTICS
//------------------------------------------------------

function updateFilterStatistics(features){

    if(!features) return;

    let hectares = 0;
    let tonnes = 0;

    const varieties = {};
    const growers = new Set();

    features.forEach(function(feature){

        const p = feature.properties;

        growers.add(p.Grower_ID);

        hectares += Number(p.Area_Ha);

        tonnes += Number(p.Estimated_Tonnage);

        if(p.Variety){

            varieties[p.Variety] =
                (varieties[p.Variety] || 0) + 1;

        }

    });

    //--------------------------------------------------
    // Largest Variety
    //--------------------------------------------------

    let topVariety = "-";
    let max = 0;

    for(const v in varieties){

        if(varieties[v] > max){

            max = varieties[v];
            topVariety = v;

        }

    }

    //--------------------------------------------------
    // KPI CARDS
    //--------------------------------------------------

    document.getElementById("growers").textContent =
        growers.size;

    document.getElementById("parcels").textContent =
        features.length;

    document.getElementById("hectares").textContent =
        hectares.toFixed(2);

    document.getElementById("yield").textContent =
        tonnes.toFixed(2);

    //--------------------------------------------------
    // SUMMARY PANEL
    //--------------------------------------------------

    document.getElementById("sumGrowers").textContent =
        growers.size;

    document.getElementById("sumParcels").textContent =
        features.length;

    document.getElementById("sumHectares").textContent =
        hectares.toFixed(2);

    document.getElementById("sumYield").textContent =
        tonnes.toFixed(2);

    document.getElementById("topVariety").textContent =
        topVariety;

}