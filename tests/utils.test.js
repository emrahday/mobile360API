// do not start express server manually
// run 'npm run test-watch' in order to run mocha test under nodemon
// it will automatically run express server and will listen port

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const utils = require('./../utils');
chai.use(chaiHttp); 

describe ('utils', () => {
    
    before(function() {
        // this.skip();
    });

    it ('should return a random lat/lng', () => {
        const latLng = utils.getRandomLatLng();
        latLng.should.not.be.empty;
        latLng.should.include.keys('lat', 'lng');
        latLng.lat.should.be.greaterThan(-90);
        latLng.lat.should.be.lessThan(90);
        latLng.lng.should.be.greaterThan(-180);
        latLng.lng.should.be.lessThan(180);
    });
});

describe ('check point is inside', () => {
    
    before(function() {
        // this.skip();
    });

    it ('should check given point in given radius of circle center', () => {
        const origin = {lat:41, lng:-107};
        const radious = 587282;
        const point = {lat:41, lng:-100};
        const isInCircle = utils.isInCircle(origin, radious, point);
        isInCircle.should.be.true;
    });

    it ('should check given point not in given radius of circle center', () => {
        const origin = {lat:41, lng:-107};
        const radious = 587281;
        const point = {lat:41, lng:-100};
        const isInCircle = utils.isInCircle(origin, radious, point);
        isInCircle.should.be.false;
    });

    it ('should check given point is in polygon', () => {
        const origin = {lat:41, lng:-107};
        const polygon = [
            {lat: 41.003436, lng:-107.003888}, 
            {lat: 41.001266, lng:-106.996435}, 
            {lat: 40.999101, lng:-106.998680},
            {lat: 40.999482, lng:-107.001792}
        ];
        const point = {lat:41, lng:-100};
        const isInPolygon = utils.isInPolygon(origin, polygon);
        isInPolygon.should.be.true;
    });

    it ('should get outer rectangle', () => {
        const polygon = [
            { lat: 7, lng: 1},
            { lat: 6, lng: 8},
            { lat: 1, lng: 7},
            { lat: 2, lng: 2},
        ]
        const rectangle = [
            { lat: 7, lng: 1},
            { lat: 1, lng: 8},
        ];
        const result = utils.getOuterRectangleFromPolygon(polygon);
        rectangle.should.deep.include(result[0]);
        rectangle.should.deep.include(result[1]);
    });
    
});

describe ('distance calculations', () => {

    // according to test result harversine formula is better match with google maps
    before(function() {
        // this.skip();
    });

    it ('should return distance in libia', () => {
        const point1 = {lat:30, lng:20};
        const point2 = {lat:30, lng:21};
        const distance = 96300; // according to google maps
        const harversine = utils.getHaversineDistance(point1, point2, -1)
        const geolibSimple = utils.getGeolibDistanceSimple(point1, point2, -1)
        const geolib = utils.getGeolibDistance(point1, point2, -1);
        distance.should.be.equal(harversine);
        (distance+1000).should.be.greaterThan(geolibSimple);
        (distance+1000).should.be.greaterThan(geolib);

    });

    it ('should return distance in central usa', () => {
        const point1 = {lat:41, lng:-107};
        const point2 = {lat:41, lng:-100};
        const distance = 587280; // according to google maps
        const harversine = utils.getHaversineDistance(point1, point2, -1)
        const geolibSimple = utils.getGeolibDistanceSimple(point1, point2, -1)
        const geolib = utils.getGeolibDistance(point1, point2, -1);
        distance.should.be.equal(harversine);
        (distance+2000).should.be.greaterThan(geolibSimple);
        (distance+2000).should.be.greaterThan(geolib);
    });

    it ('should return distance in west usa', () => {
        const point1 = {lat:46, lng:-121};
        const point2 = {lat:38, lng:-121};
        const distance = 889560; // according to google maps
        const harversine = utils.getHaversineDistance(point1, point2, -1)
        const geolibSimple = utils.getGeolibDistanceSimple(point1, point2, -1)
        const geolib = utils.getGeolibDistance(point1, point2, -1);
        distance.should.be.equal(harversine);
        (distance+2000).should.be.greaterThan(geolibSimple);
        (distance+2000).should.be.greaterThan(geolib);
    });

    it ('should return distance in germany north to south', () => {
        const point1 = {lat:54.676225, lng:9.636944};
        const point2 = {lat:47.895890, lng:12.533485};
        const distance = 780210; // according to google maps
        const harversine = utils.getHaversineDistance(point1, point2, -1)
        const geolibSimple = utils.getGeolibDistanceSimple(point1, point2, -1)
        const geolib = utils.getGeolibDistance(point1, point2, -1);
        distance.should.be.equal(harversine);
        (distance+1000).should.be.greaterThan(geolibSimple);
        (distance+1000).should.be.greaterThan(geolib);
    });

    it ('should return distance in germany east to west', () => {
        const point1 = {lat:51.701299, lng:14.401495};
        const point2 = {lat:50.034434, lng:6.274386};
        const distance = 599310; // according to google maps
        const harversine = utils.getHaversineDistance(point1, point2, -1)
        const geolibSimple = utils.getGeolibDistanceSimple(point1, point2, -1)
        const geolib = utils.getGeolibDistance(point1, point2, -1);
        distance.should.be.equal(harversine);
        (distance+2000).should.be.greaterThan(geolibSimple);
        (distance+2000).should.be.greaterThan(geolib);
    });

    


});


