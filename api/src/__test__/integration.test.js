const supertest = require('supertest')
const app = require('../server.js')

request = supertest(app)

const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');
const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors] });

// ====================== TEST TO ADD A SHOP ====================== //
describe('POST /addshop endpoint', () => {
    test('check if shop is added', async (done) =>{
        const req = {
            shop_name: randomName,
            shop_logo: 'logo',
            shop_url: `https://www.${randomName}.be/`,
        };
        try {
            const response = await request.post('/addshop').send(req)
            expect(response.status).toBe(200)
            done()
        } catch (error) {
            console.log(error);
        }
    })

    test('check if shop can not be added if it already exists', async (done) =>{
        const req = {
            shop_name: 'Delhaize',
            shop_logo: 'logo',
            shop_url: 'https://www.lidl.be/',
        };
        try {
            const response = await request.post('/addshop').send(req)
            expect(response.status).toBe(400)
            done()
        } catch (error) {
            console.log(error);
        }
    })
})

// ====================== TEST TO SEARCH A PRODUCT ====================== //
describe('GET /shop endpoint', () => {
    test('check if you can search a product', async (done) =>{
        try {
            const response = await request.get('/shop/fanta')
            expect(response.status).toBe(200)
            done()
        } catch (error) {
            console.log(error);
        }
    })
})

// ====================== DELETE PRODUCT RECORD BY ID ====================== //
describe('DELETE /shop endpoint', ()=>{
    test('check if product is deleted', async (done) =>{
        const req = {
            uuid: 'de004fb0-2910-11eb-94dc-9b0137d739c0'
        };
        try {
            const response = await request.delete('/shop').send(req)
            expect(response.status).toBe(200, done())
        } catch (error) {
            console.log(error);
        }
    })
    test('check if delete request contains an UUID', async (done) =>{
        const req = {
            api_key: 'de004fb0-2910-11eb-94dc-9b0137d739c0'
        };
        try {
            const response = await request.delete('/shop').send(req)
            expect(response.status).toBe(404, done())
        } catch (error) {
            console.log(error);
        }
    })
})