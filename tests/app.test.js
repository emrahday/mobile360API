// do not start express server manually
// run 'npm run test-watch' in order to run mocha test under nodemon
// it will automatically run express server and will listen port

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const app = require('./../app');
const utils = require('./../utils');
chai.use(chaiHttp); 


describe ('utils', () => {

    before(function() {
        this.skip();
    });

    it ('should return status OK', (done) => {
        chai.request(app)
        .get('/')
        .end((err, res) =>{
            should.not.exist(err);
            res.status.should.equal(200);
            res.type.should.equal('application/json');
            res.body.status.should.equal('OK');
            done();
        })
    });
});

describe ('items', () => {
    let latLng;
    before(function() {
        // this.skip();
        latLng = utils.getRandomLatLng();
    });
    it ('should create an item and return', (done) => {
        
        chai.request(app)
        .post('/item')
        .send(latLng)
        .end((err, {status, type, body:item}) => {
            should.not.exist(err);
            status.should.equal(200);
            type.should.equal('application/json');
            item.should.include.keys('lat', 'lng', '_id');
            item._id.should.not.equal(null);
            item.lat.should.equal(latLng.lat);
            item.lat.should.equal(latLng.lat);
            done();
        })
    });

    it ('should return items by lat/lng', (done) => {
        chai.request(app)
        .get(`/items?lat=${latLng.lat}&lng=${latLng.lng}`)
        .end((err, {status, type, body:items }) =>{
            should.not.exist(err);
            status.should.equal(200);
            type.should.equal('application/json');
            items.should.be.an('array');
            items.should.length.to.be.above(0);
            items[0].should.include.keys('lat', 'lng', '_id');
            items[0]._id.should.not.equal(null);
            items[0].lat.should.equal(latLng.lat);
            items[0].lng.should.equal(latLng.lng);
            done();
        })
    });

    it ('should return items in range of given lat/lng', (done) => {
        const range = 10;
        chai.request(app)
        .get(`/items/range?lat=${latLng.lat}&lng=${latLng.lng}&range=${range}`)
        .end((err, {status, type, body:items }) =>{
            should.not.exist(err);
            status.should.equal(200);
            type.should.equal('application/json');
            done();
        })
    });

});
