const express = require('express');
const { Pool } = require('pg');

const app = express();

// ======================================
// Serve Frontend
// ======================================

app.use(express.static('public'));

const PORT = 3000;

// ======================================
// PostgreSQL Pool Connection
// ======================================

const pool = new Pool({

    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: 'postgres',
    database: 'sugarcane GIS',

    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000

});

pool.connect()

.then(client => {

    console.log("✅ Connected to PostgreSQL");

    client.release();

})

.catch(err => {

    console.error("Database Connection Error:", err);

});

// ======================================
// HOME
// ======================================

app.get('/', (req, res) => {

    res.send("Sugarcane GIS Backend Running");

});

// ======================================
// GROWERS API
// ======================================

app.get('/growers', async (req, res) => {

    try {

        const result = await pool.query(`

            SELECT *

            FROM growers

            ORDER BY grower_id;

        `);

        res.json(result.rows);

    }

    catch(err){

        console.error(err);

        res.status(500).json({

            error:"Database Error"

        });

    }

});

// ======================================
// PARCELS API (GeoJSON)
// ======================================

app.get('/parcels', async (req,res)=>{

    try{

        const result = await pool.query(`

SELECT

"Parcel_ID",
"Grower_ID",
"Area_Ha",
"Variety",
"Planting_Date",
"Harvest_Due",
"Status",
"Crop_Age",
"Harvest_Status",
"Ratoon_Cycle",
"Yield_t_ha",
"Estimated_Tonnage",

ST_AsGeoJSON(
ST_Transform(geometry,4326)
)::json AS geometry

FROM parcels

ORDER BY "Parcel_ID";

`);

        const geojson={

            type:"FeatureCollection",

            features:result.rows.map(row=>({

                type:"Feature",

                geometry:row.geometry,

                properties:{

                    Parcel_ID:row.Parcel_ID,

                    Grower_ID:row.Grower_ID,

                    Area_Ha:row.Area_Ha,

                    Variety:row.Variety,

                    Planting_Date:row.Planting_Date,

                    Harvest_Due:row.Harvest_Due,

                    Status:row.Status,

                    Crop_Age:row.Crop_Age,

                    Harvest_Status:row.Harvest_Status,

                    Ratoon_Cycle:row.Ratoon_Cycle,

                    Yield_t_ha:row.Yield_t_ha,

                    Estimated_Tonnage:row.Estimated_Tonnage

                }

            }))

        };

        res.json(geojson);

    }

    catch(err){

        console.error(err);

        res.status(500).json({

            error:"Database Error"

        });

    }

});

// ======================================
// PARCEL SEARCH API
// ======================================

app.get('/parcel/:id', async(req,res)=>{

    try{

        const result=await pool.query(

`SELECT

"Parcel_ID",
"Grower_ID",
"Area_Ha",
"Variety",
"Planting_Date",
"Harvest_Due",
"Status",
"Crop_Age",
"Harvest_Status",
"Ratoon_Cycle",
"Yield_t_ha",
"Estimated_Tonnage",

ST_AsGeoJSON(
ST_Transform(geometry,4326)
)::json AS geometry

FROM parcels

WHERE "Parcel_ID"=$1;`,

[req.params.id]

);

        if(result.rows.length===0){

            return res.status(404).json({

                message:"Parcel not found"

            });

        }

        const row=result.rows[0];

        res.json({

            type:"Feature",

            geometry:row.geometry,

            properties:{

                Parcel_ID:row.Parcel_ID,

                Grower_ID:row.Grower_ID,

                Area_Ha:row.Area_Ha,

                Variety:row.Variety,

                Planting_Date:row.Planting_Date,

                Harvest_Due:row.Harvest_Due,

                Status:row.Status,

                Crop_Age:row.Crop_Age,

                Harvest_Status:row.Harvest_Status,

                Ratoon_Cycle:row.Ratoon_Cycle,

                Yield_t_ha:row.Yield_t_ha,

                Estimated_Tonnage:row.Estimated_Tonnage

            }

        });

    }

    catch(err){

        console.error(err);

        res.status(500).json({

            error:"Database Error"

        });

    }

});

// ======================================
// START SERVER
// ======================================

app.listen(PORT,()=>{

    console.log(`🚀 Server running on http://localhost:${PORT}`);

});