/*--------- Variables --------*/
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const Helpers = require("./utils/helpers.js");
const puppeteer = require("puppeteer");

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

// ========== GET ALL PRODUCTS ==========  //
app.get("/shop/", async (req, res, next) => {
    // let query = req.params.query;
    storeArr = [];
    try {
        await getShopItems(res);
    } catch (err) {
        res.end();
        next(err);
    }
});

// ========== ADD A PRODUCTS ==========  //
app.post("/addshop/", async (req, res, next) => {
    const getStory = await pg
        .select("shop_name")
        .from("shops")
        .where({
            shop_name: req.body.shop_name
        })
        .then(async (data) => {
            if (data.length >= 1) {
                console.log(req.body.shop_name + ' Already exists in DB.')
                res.status(500).send();
            } else {
                shopSeeders(req.body.shop_name, req.body.shop_logo, req.body.shop_url)
                console.log(req.body.shop_name + ' added in db');
                res.status(200).send();
            }
        })
});

// ========== DELETE A PRODUCT ==========  //
app.delete('/shop/', async (req, res) => {
    if (req.body.hasOwnProperty('uuid')) {
        const result = await pg
            .from('market')
            .where({
                uuid: req.body.uuid
            })
            .del()
            .then(function (data) {
                console.log('DELETED RECORD:', 'product with uuid ' + req.body.uuid + '.');
                res.json(data);
            }).catch((e) => res.status(404).send())
    } else {
        console.log("DELETE Request does not have an UUID.");
        res.status(404).send();
    }
})

// ========== SEARCH PRODUCT ==========  //
app.get('/shop/:id', async (req, res) => {
    searchProductInDB(res, req.params.id)
})

// ========== SEARCH ITEM IN ALL SHOPS ==========  //
async function getShopItems(res) {
    try {
        // AlbertHein
        await checkAlbertHein(res);

    } catch (error) {
        throw error;
    }
}

// ========== SEARCH ITEM AIN ALBERTHEIN ==========  //
async function checkAlbertHein(res) {
    console.log('Startscraping alberthein....')
    const url = `https://www.ah.be/producten/frisdrank-sappen-koffie-en-thee/frisdrank?page=10`;

    const browser = await puppeteer.launch({
        // headless: false
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();

    await page.goto(url, {
        waitUntil: 'networkidle2'
    });

    let data = await page.evaluate(async () => {
        let productArray = [];
        let list = document.querySelectorAll('#search-lane > div');

        for (let e = 1; e < list.length + 1; e++) {
            let productList = document.querySelectorAll(`#search-lane > div:nth-child(${e}) article`);
            for (let i = 1; i < productList.length + 1; i++) {
                let productObj = {};

                let product_name = document.querySelector(`#search-lane > div:nth-child(${e}) article:nth-child(${i}) > div+div`);
                let product_image = document.querySelector(`#search-lane > div:nth-child(${e}) article:nth-child(${i}) .lazy-image_image__2025k`);
                let product_description = document.querySelector(`#search-lane > div:nth-child(${e}) article:nth-child(${i}) .price_unitSize__8gRVX`);
                let product_details = document.querySelector(`#search-lane > div:nth-child(${e}) article:nth-child(${i}) a`);
                let product_price = document.querySelector(`#search-lane > div:nth-child(${e}) article:nth-child(${i}) .price-amount_root__37xv2`);
                let product_category = document.querySelector('h1#start-of-content');
                let product_shop_id = '';

                productObj.uuid = '';
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
    await browser.close().then(() => {
        console.log(`Alberthein is scraped`)
        res.send(addUUId(data))
        console.log('Browser closed')
        createProductsInDB(data);
    })
}

function addUUId(data) {
    newData = [];
    for (const product of data) {
        product.uuid = Helpers.generateUUID()
        newData.push(product)
    }
    return newData
}

// ========== DATABASE ==========  //
async function createProductsInDB(productObj) {
    await pg.table("market").truncate();
    await pg
        .table("market")
        .insert(productObj)
        .then(async function () {
            console.log("✅", `Products inserted in database.`);
            return;
        })
        .catch((e) => {
            console.log("Error occured: ", e);
        });
}

async function searchProductInDB(res, query) {
    await pg
        .table("market")
        .whereRaw('LOWER(product_name) LIKE ?', '%' + query.toLowerCase() + '%')
        .then(async function (data) {
            if (data.length >= 1) {
                res.send(data)
                return;
            } else {
                res.status(404).send()
            }
        })
        .catch((e) => {
            console.log("Error occured: ", e);
        });
}

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

const shopSeeders = async (name, logo, url) => {
    let shopObj = {
        uuid: Helpers.generateUUID(),
        shop_name: name,
        shop_logo: logo,
        shop_url: url,
    }

    const shopItems = await pg
        .table("shops")
        .insert(shopObj)
        .then(async function () {
            console.log(`${shopObj.shop_name} seeder created`);
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
                .createTable("shops", (table) => {
                    table.increments();
                    table.uuid("uuid").nullable().unique();;
                    table.string("shop_name").unique();
                    table.string("shop_logo");
                    table.string("shop_url");
                    table.timestamps(true, true);
                })
                .createTable("market", (table) => {
                    table.increments();
                    table.uuid("uuid").nullable().unique();;
                    table.string("product_name");
                    table.string("product_image");
                    table.string("product_description");
                    table.string("product_details");
                    table.string("product_price");
                    table.string("product_category");
                    table.string("product_shop_id");
                    table
                        .uuid("shops_uuid")
                        .unsigned()
                        .references("uuid")
                        .inTable("shops")
                        .onDelete("CASCADE")
                        .onUpdate("CASCADE")
                        .notNullable();
                    table.timestamps(true, true);
                })
                .then(async () => {
                    shopItemsSeeders();
                    shopSeeders('Delhaize', 'https://dhf6qt42idbhy.cloudfront.net/_ui/responsive/theme-delhaize-be/logo/DLL-logo.svg?e1e868fca4ed35a2', 'https://www.delhaize.be/');
                    shopSeeders('Albert Heijn', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Albert_Heijn_Logo.svg/267px-Albert_Heijn_Logo.svg.png', 'https://www.ah.be/');
                    shopSeeders('Colruyt', 'https://upload.wikimedia.org/wikipedia/fr/a/a4/Colruyt_France_logo_supermarch%C3%A9.jpg', 'https://www.colruyt.be/');
                    shopSeeders('Aldi', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Logo_Aldi_Nord.svg/246px-Logo_Aldi_Nord.svg.png', 'https://www.aldi.be/');
                    shopSeeders('Carrefour', 'https://upload.wikimedia.org/wikipedia/fr/3/3b/Logo_Carrefour.svg', 'https://drive.carrefour.eu/');
                    shopItemsSeeders();
                    console.log("✅", "Shops table is created");
                    console.log("✅", "Product table is created");
                });
        }
    });
}

initialiseTables();

module.exports = app;