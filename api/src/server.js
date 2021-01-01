/*--------- Variables --------*/
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const Helpers = require("./utils/helpers.js");
var path = require("path");
const port = 3000;

const pg = require("knex")({
    client: "pg",
    version: "9.6",
    searchPath: ["knex", "public"],
    connection: process.env.PG_CONNECTION_STRING ? process.env.PG_CONNECTION_STRING : "postgres://example:example@localhost:5432/marketcomparedb",
});

const app = express();
http.Server(app);

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

// ========== SHOW ALL RECORDS ==========  //
app.get("/", (req, res) => {
    res.status(200).send(200);
});

const shopItemsSeeders = async () => {
    let productItemObj = {
        uuid: Helpers.generateUUID(),
        product_name: 'Cola',
        product_image: 'https://dhf6qt42idbhy.cloudfront.net/medias/sys_master/h7e/hf2/10550473949214.jpg?buildNumbe:47771e275d7016c32bd7ea607f7a5207714841b4',
        product_description: 'Cola | Zero | Canette',
        product_details: '4 x 25 cl',
        product_price: '€2,19',
        product_category: 'sodas',
        product_shop_id: '1'
    }

    const shopItems = await pg
    .table("market")
    .insert(productItemObj)
    .then(async function () {
        console.log("✅", "Market items seeders");
        return;
    })
    .catch((e) => {
        console.log("Error occured: ", e);
    });
}

const shopSeeders = async () => {
    let shopObj = {
        uuid: Helpers.generateUUID(),
        shop_name: 'Delhaize',
        shop_logo: 'https://upload.wikimedia.org/wikipedia/fr/3/34/Delhaize_-_Logo.svg',
        shop_url: 'https://www.delhaize.be/',
    }

    const shopItems = await pg
    .table("shops")
    .insert(shopObj)
    .then(async function () {
        console.log("✅", "Shop seeders");
        return;
    })
    .catch((e) => {
        console.log("Error occured: ", e);
    });
}

// product_uuid: Helpers.generateUUID()
// product_name: shopItem.name,
// product_description: shopItem.description,
// product_details: shopItem.details,
// product_price: shopItem.price,
// product_category: shopItem.category,
// product_shopId: shopItem.shopId,

// ========== INIT TABLES ==========  //
async function initialiseTables() {
    await pg.schema.hasTable("market").then(async (exists) => {
        if (!exists) {
            await pg.schema
                .createTable("market", (table) => {
                    table.increments();
                    table.uuid("uuid");
                    table.string("product_name");
                    table.string("product_image");
                    table.string("product_description");
                    table.string("product_details");
                    table.string("product_price");
                    table.string("product_category");
                    table.string("product_shop_id");
                    table.timestamps(true, true);
                })
                .createTable("shops", (table) => {
                    table.increments();
                    table.uuid("uuid");
                    table.string("shop_name");
                    table.string("shop_logo");
                    table.string("shop_url");
                    table.timestamps(true, true);
                })
                .then(async () => {
                    shopItemsSeeders();
                    shopSeeders();
                    console.log("Shops items tables are created");
                    console.log("Shops table are created");
                });
        }
    });
}

initialiseTables();

module.exports = app;