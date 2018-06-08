// do not start express server manually
// run 'npm run watch' in order to run mocha test under nodemon
// it will automatically run express server and will listen port

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const app = require('./../app');
const utils = require('./../utils');
const dbUtils = require('./../db-utils');
const itemUtils = require('./../item-utils');

chai.use(chaiHttp); 


describe ('init', () => {

    before(function() {
        // this.skip();

        dbUtils.drop(); // stateless test: clean db before test
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
        this.skip();
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

describe ('get items in area', () => {

    let rectangle, polygon; 
    let items;

    before(function(done) {
        // this.skip();

        rectangle = [
            { lat: 7, lng: 1},
            { lat: 1, lng: 8},
        ];
        polygon = [
            { lat: 7, lng: 1},
            { lat: 6, lng: 8},
            { lat: 1, lng: 7},
            { lat: 2, lng: 2},
        ]
        items = [
            { lat: 7, lng: 1},          //[0] in rectangle, in polygon
            { lat: 1, lng: 8},          //[1]  in rectangle, not in polygon
            { lat: 2, lng: 2},          //[2]  in rectangle, in polygon
            { lat: 4, lng: 5},          //[3]  in rectangle, in polygon
            { lat: 1, lng: 1},          //[4]  in rectangle, not in polygon
            { lat: 3, lng: 1.1},        //[5]  in rectangle, not in polygon
            { lat: 6, lng: 1.1},        //[6]  in rectangle, in polygon
            { lat: 1.1, lng: 1},        //[7]  in rectangle, in polygon
            { lat: 1.1, lng: 6},        //[8]  in rectangle, polygon
            { lat: 8, lng: 5},          //[9]  not in
            { lat: 0.5, lng: 3},        //[10]  not in
            { lat: 6, lng: 9},          //[11]  not in
            { lat: 7.000001, lng: 1},   //[12]  not in
        ]

        //create items
        items.forEach ( (element, index) => {
            itemUtils.create(element)
            .then ( item => {
                item.should.include.keys('lat', 'lng', '_id');
                item._id.should.not.equal(null);
                item.lat.should.equal(element.lat);
                item.lat.should.equal(element.lat);
                items[index]._id = item._id.toString();
            });
        });
        setTimeout(() => { // TODO fix this timeout issue
            done();
        }, 1000);
        //TODO check also NW, SW, SE
        //TODO check if item has not lat, lng property
    });

    it ('should return items in rectangle', (done) => {
        chai.request(app)
        .post(`/get/items/rectangle`)
        .send(rectangle)
        .end((err, {status, type, body:rectangleItems }) =>{
            should.not.exist(err);
            status.should.equal(200);
            type.should.equal('application/json');
            rectangleItems.should.to.have.length.above(8);
            rectangleItems.should.deep.include(items[0]);
            rectangleItems.should.deep.include(items[1]);
            rectangleItems.should.deep.include(items[2]);
            rectangleItems.should.deep.include(items[3]);
            rectangleItems.should.deep.include(items[4]);
            rectangleItems.should.deep.include(items[5]);
            rectangleItems.should.deep.include(items[6]);
            rectangleItems.should.deep.include(items[7]);
            rectangleItems.should.deep.include(items[8]);
            rectangleItems.should.not.deep.include(items[9]);
            rectangleItems.should.not.deep.include(items[10]);
            rectangleItems.should.not.deep.include(items[11]);
            done();
        });
    });

    it ('should return items in polygon', (done) => {
        chai.request(app)
        .post(`/get/items/polygon`)
        .send(polygon)
        .end((err, {status, type, body:polygonItems }) =>{
            should.not.exist(err);
            status.should.equal(200);
            type.should.equal('application/json');
            // polygonItems.should.to.have.length.above(3);

            polygonItems.should.deep.include(items[0]);
            done();
        })
    });

    // it ('should return items in circle', (done) => {
    //     chai.request(app)
    //     .get(`/get/items/circle?lat=${basePoint.lat}&lng=${basePoint.lng}&radius=${range}`)
    //     .end((err, {status, type, body:items }) =>{
    //         should.not.exist(err);
    //         status.should.equal(200);
    //         type.should.equal('application/json');
    //         items.should.to.have.length.above(3);
    //         let pointsShouldNotCatched = pointsInRange.filter (item => {
    //             return item.lat > 52.092067 && item.lng < 51.913163 && item.lng < 51.997977 && item.lng > 52.008690;
    //         });
    //         pointsShouldNotCatched.should.to.have.length(0);
    //         done();
    //     })
    // });
});


describe ('check is item in range', () => {

    let item, basePoint, range;
    before(function() {
        this.skip();
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
