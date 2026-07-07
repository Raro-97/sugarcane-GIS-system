//------------------------------------------------------
// CHARTS.JS VERSION 4.0
// Sugarcane GIS Enterprise
//------------------------------------------------------

//======================================================
// GLOBAL CHART OBJECTS
//======================================================

let harvestChart = null;
let varietyChart = null;

//======================================================
// INITIALIZE CHARTS
//======================================================

document.addEventListener("DOMContentLoaded", function(){

    loadCharts();

});

//======================================================
// LOAD DEFAULT CHARTS
//======================================================

async function loadCharts(){

    try{

        const response = await fetch("/parcels");

        const geojson = await response.json();

        updateCharts(geojson.features);

    }

    catch(error){

        console.error("Charts Error:", error);

    }

}

//======================================================
// UPDATE BOTH CHARTS
//======================================================

function updateCharts(features){

    buildHarvestChart(features);

    buildVarietyChart(features);

}

//======================================================
// HARVEST STATUS CHART
//======================================================

function buildHarvestChart(features){

    let growing = 0;
    let mature = 0;
    let harvested = 0;

    features.forEach(function(feature){

        const status = String(feature.properties.Status)
            .trim()
            .toLowerCase();

        if(status === "growing") growing++;

        else if(status === "mature") mature++;

        else if(status === "harvested") harvested++;

    });

    const ctx = document
        .getElementById("statusChart")
        .getContext("2d");

    if(harvestChart){

        harvestChart.destroy();

    }

    harvestChart = new Chart(ctx,{

        type:"doughnut",

        data:{

            labels:[
                "Growing",
                "Mature",
                "Harvested"
            ],

            datasets:[{

                data:[
                    growing,
                    mature,
                    harvested
                ],

                backgroundColor:[
                    "#43A047",
                    "#FBC02D",
                    "#1E88E5"
                ],

                borderWidth:2,

                borderColor:"#ffffff"

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            animation:{
                animateRotate:true,
                duration:1200
            },

            plugins:{

                legend:{
                    position:"bottom"
                }

            }

        }

    });

}

//======================================================
// VARIETY CHART
//======================================================

function buildVarietyChart(features){

    const varieties = {};

    features.forEach(function(feature){

        const variety = feature.properties.Variety;

        varieties[variety] = (varieties[variety] || 0) + 1;

    });

    const ctx = document
        .getElementById("varietyChart")
        .getContext("2d");

    if(varietyChart){

        varietyChart.destroy();

    }

    varietyChart = new Chart(ctx,{

        type:"bar",

        data:{

            labels:Object.keys(varieties),

            datasets:[{

                label:"Number of Parcels",

                data:Object.values(varieties),

                backgroundColor:[
                    "#2E7D32",
                    "#43A047",
                    "#66BB6A",
                    "#81C784",
                    "#A5D6A7"
                ],

                borderRadius:8

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            plugins:{

                legend:{
                    display:false
                }

            },

            scales:{

                y:{

                    beginAtZero:true,

                    ticks:{
                        precision:0
                    }

                }

            }

        }

    });

}

//======================================================
// REFRESH
//======================================================

function refreshCharts(){

    loadCharts();

}