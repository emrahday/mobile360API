// do not start express server manually
// run 'npm run watch' in order to run mocha test under nodemon
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

describe ('create and get items', () => {
    let latLng;
    let _id;
    before(function() {
        // this.skip();
        latLng = utils.getRandomLatLng();
    });
    it ('should create an item and return', (done) => {
        chai.request(app)
        .post('/create/item')
        .send(latLng)
        .end((err, {status, type, body:item}) => {
            should.not.exist(err);
            status.should.equal(200);
            type.should.equal('application/json');
            item.should.include.keys('lat', 'lng', '_id');
            item._id.should.not.equal(null);
            _id = item._id;
            item.lat.should.equal(latLng.lat);
            item.lat.should.equal(latLng.lat);
            done();
        })
    });

    it ('should return items by lat/lng', (done) => {
        chai.request(app)
        .get(`/get/items?lat=${latLng.lat}&lng=${latLng.lng}`)
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

    it ('should return item by id', done => {
        chai.request(app)
        .get(`/get/item?id=${_id}`)
        .end( (err, {status, type, body:items}) => {
           should.not.exist(err);
           status.should.equal(200);
           type.should.equal('application/json');
           items.should.be.an('array');
           items[0]._id.should.not.be.empty;
           items[0]._id.should.be.equal(_id);
           done();
        });
    });
});

describe ('custom property check', () => {
    let item;
    before(function() {
        this.skip();
        item = {
            lat: 30,
            lng: 30,
            name: 'sample name',
            phone: '123456789',
            address: 'sample address'
        }
    });

    it ('should create item with custom property', (done) => {
        chai.request(app)
        .post('/create/item')
        .send(item)
        .end((err, {status, type, body:result}) => {
            should.not.exist(err);
            status.should.equal(200);
            type.should.equal('application/json');
            result.should.include.keys('lat', 'lng', '_id');
            result._id.should.not.equal(null);
            result.lat.should.equal(item.lat);
            result.lat.should.equal(item.lat);
            item._id = result._id;
            done();
        });
    });

    it ('should have custom properties', done => {
        chai.request(app)
        .get(`/get/item?id=${item._id}`)
        .end( (err, {status, type, body:items}) => {
           should.not.exist(err);
           status.should.equal(200);
           type.should.equal('application/json');
           items.should.be.an('array');
           items[0]._id.should.not.be.empty;
           items[0]._id.should.be.equal(item._id);
           items[0].should.include.keys('lat', 'lng', '_id', 'name', 'phone', 'address');
           items[0].name.should.be.equal(item.name);
           items[0].phone.should.be.equal(item.phone);
           items[0].address.should.be.equal(item.address);
           done();
        });
    });
});

describe ('get items in range', () => {

    let randomPoint;
    let range; 
    let pointsInRange;
    let pointsOutOfRange;

    before(function() {
        this.skip();
        range = 10;
        // some point set in north east of world
        basePoint = {lat:52, lng:13};
        pointsInRange = [
            {lat: 52.087851, lng:12.972191}, 
            {lat: 52.024209, lng:12.860861},
            {lat: 51.928835, lng:12.999027},
            {lat: 51.979192, lng:13.097421}
        ],
        pointsOutOfRange = [
            {lat:52.965039, lng:13.122658}, 
            {lat:52.067094, lng:12.863713}
        ]

        //TODO check also NW, SW, SE
        //TODO check if item has not lat, lng property
    });

    it ('should create some item in range', (done) => {
        pointsInRange.forEach(element => {
            chai.request(app)
            .post('/create/item')
            .send(element)
            .end((err, {status, type, body:item}) => {
                should.not.exist(err);
                status.should.equal(200);
                type.should.equal('application/json');
                item.should.include.keys('lat', 'lng', '_id');
                item._id.should.not.equal(null);
                item.lat.should.equal(element.lat);
                item.lat.should.equal(element.lat);
            })
        });
        done();
    });

    it ('should create some item out of range', (done) => {
        pointsOutOfRange.forEach(element => {
            chai.request(app)
            .post('/create/item')
            .send(element)
            .end((err, {status, type, body:item}) => {
                should.not.exist(err);
                status.should.equal(200);
                type.should.equal('application/json');
                item.should.include.keys('lat', 'lng', '_id');
                item._id.should.not.equal(null);
                item.lat.should.equal(element.lat);
                item.lat.should.equal(element.lat);
            })
        });
        done();
    });

    it ('should return items in square range of given lat/lng', (done) => {
        chai.request(app)
        .get(`/get/items/square?lat=${basePoint.lat}&lng=${basePoint.lng}&range=${range}`)
        .end((err, {status, type, body:items }) =>{
            should.not.exist(err);
            status.should.equal(200);
            type.should.equal('application/json');
            items.should.to.have.length.above(3);
            let pointsShouldNotCatched = pointsInRange.filter (item => {
                return item.lat > 52.092067 && item.lng < 51.913163 && item.lng < 51.997977 && item.lng > 52.008690;
            });
            pointsShouldNotCatched.should.to.have.length(0);
            done();
        })
    });

    it ('should return items in circle range of given lat/lng', (done) => {
        chai.request(app)
        .get(`/get/items/circle?lat=${basePoint.lat}&lng=${basePoint.lng}&radius=${range}`)
        .end((err, {status, type, body:items }) =>{
            should.not.exist(err);
            status.should.equal(200);
            type.should.equal('application/json');
            items.should.to.have.length.above(3);
            let pointsShouldNotCatched = pointsInRange.filter (item => {
                return item.lat > 52.092067 && item.lng < 51.913163 && item.lng < 51.997977 && item.lng > 52.008690;
            });
            pointsShouldNotCatched.should.to.have.length(0);
            done();
        })
    });
});


describe ('check is item in range', () => {

    let item, basePoint, range;
    before(function() {
        // this.skip();
        item = {
            lat: 40,
            lng: 40,
            name: 'sample name',
            phone: '123456789',
            address: 'sample address'
        }
        range = 200;
        basePoint = {lat:41, lng:41};
    });

    it ('should create item', (done) => {
        chai.request(app)
        .post('/create/item')
        .send(item)
        .end((err, {status, type, body:result}) => {
            should.not.exist(err);
            status.should.equal(200);
            type.should.equal('application/json');
            result.should.include.keys('lat', 'lng', '_id');
            result._id.should.not.equal(null);
            result.lat.should.equal(item.lat);
            result.lat.should.equal(item.lat);
            item._id = result._id;
            done();
        });
    });

    it ('should be in square range', (done) => {
        chai.request(app)
        .get(`/check/item/square?id=${item._id}&lat=${basePoint.lat}&lng=${basePoint.lng}&range=${range}`)
        .end((err, {status, type, body:items }) =>{
            should.not.exist(err);
            status.should.equal(200);
            type.should.equal('application/json');
            done();
        })
    });

    it ('should NOT be in square range', (done) => {
        done();
    });

    it ('should be in circle range', (done) => {
        done();
    });

    it ('should NOT be in circle range', (done) => {
        done();
    });

});




// moveable item stoped in time
// moveable item faster
// moveable item slower

// item connection status since given time period
// get item actual power status
// request response from item 
// is item out of path
// is item out of schedule
// is item path rounded
// is item in emergency
