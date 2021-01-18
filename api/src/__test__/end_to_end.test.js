const supertest = require('supertest')
const Helpers = require('api/src/utils/helpers.js');
const app = require('../server.js')
const request = supertest(app)

const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');
const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors] });

function shop(name, logo, url) {
    let shopObj = {
        uuid: Helpers.generateUUID(),
        shop_name: name,
        shop_logo: logo,
        shop_url: url,
    }
    return shopObj
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
    })
})