const supertest = require('supertest')
const Helpers = require('api/src/utils/helpers.js');
const app = require('../server.js')
const request = supertest(app)

const {
    uniqueNamesGenerator,
    adjectives,
    colors,
    animals
} = require('unique-names-generator');
const { product } = require('puppeteer');
const randomName = uniqueNamesGenerator({
    dictionaries: [adjectives, colors]
});

function shop(name, logo, url) {
    let shopObj = {
        uuid: Helpers.generateUUID(),
        shop_name: name,
        shop_logo: logo,
        shop_url: url,
    }
    return shopObj;
}

function createProduct(customUUID) {
    let productObj = {
        uuid: customUUID ? customUUID : Helpers.generateUUID(),
        product_name: randomName,
        product_image: randomName + '.jpeg',
        product_description: randomName,
        product_details: randomName,
        product_price: '2.0',
        product_category: 'Frisdrank',
        shops_uuid: 'fa142540-591d-11eb-b2f8-3f503414dce5'
    }
    return productObj;
}

function createProductWithoutUUID(customUUID) {
    let productObj = {
        uuid: customUUID ? customUUID : Helpers.generateUUID(),
        product_name: randomName,
        product_image: randomName + '.jpeg',
        product_description: randomName,
        product_details: randomName,
        product_price: '2.0',
        product_category: 'Frisdrank',
        shops_uuid: 'blablalblal'
    }
    return productObj;
}

describe('DB connection test', () => {
    test('create a brand', async (done) => {
            try {
                const response = await request.post('/addshop').send(shop(randomName, 'lidl.png', `https://${randomName}.com/`))
                expect(response.status).toBe(200)
                done()
            } catch (error) {
                console.log("ERROR: ", error);
            }
        }),
        test('Try to add shop with the same name', async (done) => {
            try {
                const response = await request.post('/addshop').send(shop('Carrefour', 'Carrefour.png', `https://Carrefour.com/`))
                expect(response.status).toBe(400)
                done()
            } catch (error) {
                console.log("ERROR: ", error);
            }
        }),
        test('Try to delete a shop with uuid', async (done) => {
            try {
                const response = await request.delete('/shop').send( createProduct('40ef5840-592d-11eb-805b-8b312bce25aa') )
                expect(response.status).toBe(200)
                done()
            } catch (error) {
                console.log("ERROR: ", error);
            }
        }),
        test('Try to delete a shop without uuid', async (done) => {
            try {
                const response = await request.delete('/shop').send( {} )
                expect(response.status).toBe(404)
                done()
            } catch (error) {
                console.log("ERROR: ", error);
            }
        }),
        test('Add a product to shop', async (done) => {
            try {
                const response = await request.post('/addproduct').send( createProduct() )
                expect(response.status).toBe(200)
                done()
            } catch (error) {
                console.log("ERROR: ", error);
            }
        }),
        test('Add a product to shop that does not exist', async (done) => {
            try {
                const response = await request.post('/addproduct').send( createProductWithoutUUID() )
                expect(response.status).toBe(400)
                done()
            } catch (error) {
                console.log("ERROR: ", error);
            }
        }),
        test('Try to delete a product with uuid', async (done) => {
            try {
                const response = await request.delete('/product').send( createProduct('40ef5840-592d-11eb-805b-8b312bce25aa') )
                expect(response.status).toBe(200)
                done()
            } catch (error) {
                console.log("ERROR: ", error);
            }
        }),
        test('Try to delete a product without uuid', async (done) => {
            try {
                const response = await request.delete('/product').send( {} )
                expect(response.status).toBe(404)
                done()
            } catch (error) {
                console.log("ERROR: ", error);
            }
        }),
})