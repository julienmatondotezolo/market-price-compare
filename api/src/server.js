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
                    table.string("product_price");
                    table.string("product_category");
                    table.string("product_shop_id");
                    table.timestamps(true, true);
                })
                .then(async () => {
                    console.log("Product tables are created");
                });
        }
    });
    await pg.schema.hasTable("market").then(async (exists) => {
        if (!exists) {
            await pg.schema
                .createTable("shops", (table) => {
                    table.increments();
                    table.uuid("uuid");
                    table.string("shop_name");
                    table.timestamps(true, true);
                })
                .then(async () => {
                    console.log("Shops table are created");
                });
        }
    });
}
initialiseTables();

module.exports = app;