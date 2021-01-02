/*--------- Variables --------*/
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const Helpers = require("./utils/helpers.js");
var path = require("path");
const port = 3000;
const puppeteer = require("puppeteer");
const $ = require("cheerio");

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

app.get("/", (req, res) => {
    res.sendStatus(200).send(200);
});

// ========== GET ALL SHOPS ==========  //
app.get("/shop/:query", async (req, res, next) => {
    let query = req.params.query;
    storeArr = [];
    try {
        await getShopItems(res, query);
        res.send(`Searching prices for: ${query}.`);
    } catch (err) {
        res.end();
        next(err);
    }
});

// ========== SEARCH ITEM IN ALL SHOPS ==========  //
async function getShopItems(res, query) {
    try {
        // AlbertHein
        await checkAlbertHein(res);
        // res.json(storeArr);
        // res.end();
    } catch (error) {
        throw error;
    }
}

// ========== SEARCH ITEM AIN ALBERTHEIN ==========  //
async function checkAlbertHein(res) {
    const base_url = "https://www.ah.be";
    const url = `https://www.ah.be/producten/frisdrank-sappen-koffie-en-thee/frisdrank?page=1`;

    const browser = await puppeteer.launch({
        // headless: false
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();

    await page.goto(url, {
        waitUntil: 'networkidle2'
    });

    let data = await page.evaluate(() => { 
        let list = document.querySelectorAll('#search-lane > div');
        let productArray = [];

        for (let e = 0; e < list.length; e++) {
            let productList = document.querySelectorAll(`#search-lane > div:nth-child(${e}) article`);
            for (let i = 1; i < productList.length; i++) {
                let productObj = {};

                let product_name = document.querySelector(`#search-lane > div:nth-child(${e}) article:nth-child(${i}) > div+div`);
                let product_image = document.querySelector(`#search-lane > div:nth-child(${e}) article:nth-child(${i}) .lazy-image_image__2025k`);
                let product_description = document.querySelector(`#search-lane > div:nth-child(${e}) article:nth-child(${i}) .price_unitSize__8gRVX`);
                let product_details = document.querySelector(`#search-lane > div:nth-child(${e}) article:nth-child(${i}) a`);
                let product_price = document.querySelector(`#search-lane > div:nth-child(${e}) article:nth-child(${i}) .price-amount_root__37xv2`);
                let product_category = document.querySelector('h1#start-of-content');
                let product_shop_id = '';

                productObj.product_name = product_name ? product_name.innerText : '';
                productObj.product_image = product_image ? product_image.src : '';
                productObj.product_description = product_description ? product_description.innerText : '';
                productObj.product_details = product_details ? product_details.href : '';
                productObj.product_price = product_price ? product_price.innerText : '';
                productObj.product_category = product_category ? product_category.innerText : '';
                productObj.product_shop_id = product_shop_id ? product_shop_id.innerText : '';
                productArray.push(productObj);
            }
       }

        return productArray;
    })
    await browser.close();
    console.log(data);
    // res.send(data)
}

getShopItems();

// ========== DATABASE ==========  //
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