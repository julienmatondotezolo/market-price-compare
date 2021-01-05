const supertest = require('supertest')
const app = require('../server.js')

request = supertest(app)

// ====================== TEST TO SEARCH A PRODUCT ====================== //

describe('GET /shop endpoint', () => {
    test('check if you can search a product', async (done) =>{
        try {
            const response = await request.get('/shop/fanta')
            expect(response.status).toBe(200,done())
        } catch (error) {
            console.log(error);
        }
    })
})