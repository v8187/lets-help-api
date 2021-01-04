// require('dotenv').config();

require = require('esm')(module);

const request = require('supertest');
const { initApp } = require('../app');
const app = initApp();

describe('Post Endpoints', () => {
    it('should create a new Blood Group', async () => {
        const res = await request(app)
            .post('/api/bloodGroup/add')
            .send({
                userId: 1,
                title: 'test is cool',
            })
        expect(res.statusCode).toEqual(201)
        expect(res.body).toHaveProperty('post')
    })
});
// describe('Sample Test', () => {
//     it('should test that true === true', () => {
//         expect(true).toBe(true)
//     })
// });