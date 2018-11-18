// do not start express server manually
// run 'npm run watch' in order to run mocha test under nodemon
// it will automatically run express server and will listen port

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const app = require('./../app');
const utils = require('./../utils');
const itemUtils = require('./../item.utils');

chai.use(chaiHttp); 


describe ('init', () => {

    before(function() {
        // this.skip();
    });

    it ('should return server status 200 and type application/json', (done) => {
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

    it ('should create an item and return created item', (done) => {
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

    it ('should create multiple items and return created items', (done) => {
        chai.request(app)
        .post('/create/items')
        .send([{lat:1, lng:1},{lat:2, lng:2}])
        .end((err, {status, type, body:items}) => {
            should.not.exist(err);
            status.should.equal(200);
            type.should.equal('application/json');
            items[0].should.include.keys('lat', 'lng', '_id');
            items[1].should.include.keys('lat', 'lng', '_id');
            done();
        })
    });

    it ('should return items by exactly matching lat/lng', (done) => {
        // we are using post because minus lat/lng goes as string, but we need number
        chai.request(app)
        .post(`/get/items`)
        .send(latLng)
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
        // this.skip();
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

    let rectangle, circle, radius; 
    let items;

    before( async () => {
        // this.skip();
        circle = { lat: 4, lng: 5};
        radius = 500000;
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
            { lat: 7, lng: 1},          //[0]  in rectangle, in polygon distance:554295.67
            { lat: 1, lng: 8},          //[1]  in rectangle, not in polygon distance: 471508.55
            { lat: 2, lng: 2},          //[2]  in rectangle, in polygon distance: 400524.43
            { lat: 4, lng: 5},          //[3]  in rectangle, in polygon distance: 0
            { lat: 1, lng: 1},          //[4]  in rectangle, not in polygon distance: 555595.06
            { lat: 3, lng: 1.1},        //[5]  in rectangle, not in polygon distance: 446899.9
            { lat: 6, lng: 1.1},        //[6]  in rectangle, in polygon distance: 485870.31
            { lat: 1.1, lng: 1},        //[7]  in rectangle, in polygon distance: 548979.68
            { lat: 1.1, lng: 6},        //[8]  in rectangle, polygon distance: 341058.72
            { lat: 8, lng: 5},          //[9]  not in distance: 444779.71
            { lat: 0.5, lng: 3},        //[10]  not in distance: 448138.82
            { lat: 6, lng: 9},          //[11]  not in distance: 495744.39
            { lat: 7.000001, lng: 1},   //[12]  not in 554295.74
        ]

        await itemUtils.createBulk(items);

        //TODO check also NW, SW, SE
        //TODO check if item has not lat, lng property
    });

    it ('should return items in rectangle', async () => {
        const res = await chai.request(app)
        .post(`/get/items/rectangle`)
        .send(rectangle);
        should.not.exist(res.err);
        res.statusCode.should.equal(200);
        res.type.should.equal('application/json');
        // TODO instead check each item _id individually
        // res.body.should.to.have.length(9);
    });

    it ('should return items in circle', async () => {
        const res = await chai.request(app)
        .post(`/get/items/circle`)
        .send({
            lat: circle.lat,
            lng: circle.lng,
            radius: radius
        }); 
        should.not.exist(res.err);
        res.statusCode.should.equal(200);
        res.type.should.equal('application/json');
        // TODO instead check each item _id individually
        // res.body.should.to.have.length(9);
    });
});

describe ('check is item in range', () => {

    let center, itemIn, radius;
    before( async () => {
        // this.skip();
        itemIn = {lat:41, lng:41};
        itemOut = {lat:41.0025, lng:41.0025};
        radius = 140000;

        const result = await itemUtils.createBulk([itemIn, itemOut])
        result[0].should.include.keys('lat', 'lng', '_id');
        result[0]._id.should.not.be.empty;
        result[0].lat.should.equal(itemIn.lat);
        result[0].lat.should.equal(itemIn.lat);
        itemIn._id = result[0]._id.toString();
        result[1].should.include.keys('lat', 'lng', '_id');
        result[1]._id.should.not.be.empty;
        result[1].lat.should.equal(itemOut.lat);
        result[1].lat.should.equal(itemOut.lat);
        itemOut._id = result[1]._id.toString();
    });


    it ('should be in circle', (done) => {
        const data = {
            _id: itemIn._id,
            point: { lat: 40, lng: 40 },
            radius: radius
        };
        chai.request(app)
        .post('/check/item/circle')
        .send(data)
        .end((err, {status, type, body:result }) =>{
            should.not.exist(err);
            status.should.equal(200);
            type.should.equal('application/json');
            result.should.not.be.empty;
            result._id.should.be.equal(data._id);
            result.point.lat.should.be.equal(data.point.lat);
            result.point.lng.should.be.equal(data.point.lng);
            result.inCircle.should.be.true;
            done();
        });
    });

    it ('should not be in circle', (done) => {
        const data = {
            _id: itemOut._id,
            point: { lat: 40, lng: 40 },
            radius: radius
        };
        chai.request(app)
        .post('/check/item/circle')
        .send(data)
        .end((err, {status, type, body:result }) =>{
            should.not.exist(err);
            status.should.equal(200);
            type.should.equal('application/json');
            result.should.not.be.empty;
            result._id.should.be.equal(data._id);
            result.point.lat.should.be.equal(data.point.lat);
            result.point.lng.should.be.equal(data.point.lng);
            result.inCircle.should.be.false;
            done();
        });
    });

    it ('should be in rectangle', (done) => {
        const data = {
            _id: itemIn._id,
            points: [{lat:42, lng:40},{lat:40, lng:42}]
        };
        chai.request(app)
        .post('/check/item/rectangle')
        .send(data)
        .end((err, {status, type, body:result }) =>{
            should.not.exist(err);
            status.should.equal(200);
            type.should.equal('application/json');
            result.should.not.be.empty;
            result._id.should.be.equal(data._id);
            result.points[0].lat.should.be.equal(data.points[0].lat);
            result.points[0].lng.should.be.equal(data.points[0].lng);
            result.points[1].lat.should.be.equal(data.points[1].lat);
            result.points[1].lng.should.be.equal(data.points[1].lng);
            result.inRectangle.should.be.true;
            done();
        });
    });


    it ('should not be in rectangle', (done) => {
        const data = {
            _id: itemIn._id,
            points: [{lat:39.99999, lng:40},{lat:40, lng:42}]
        };
        chai.request(app)
        .post('/check/item/rectangle')
        .send(data)
        .end((err, {status, type, body:result }) =>{
            should.not.exist(err);
            status.should.equal(200);
            type.should.equal('application/json');
            result.should.not.be.empty;
            result._id.should.be.equal(data._id);
            result.points[0].lat.should.be.equal(data.points[0].lat);
            result.points[0].lng.should.be.equal(data.points[0].lng);
            result.points[1].lat.should.be.equal(data.points[1].lat);
            result.points[1].lng.should.be.equal(data.points[1].lng);
            result.inRectangle.should.be.false;
            done();
        });
    });
});