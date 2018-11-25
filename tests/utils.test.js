const chai = require('chai');
const chaiHttp = require('chai-http');
const utils = require('./../utils');
chai.use(chaiHttp); 

describe ('utils', () => {
    
    before( function () {
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

describe ('distance calculations', () => {

    // according to test result harversine formula is better match with google maps
    before(function () {
        // this.skip();
    });

    it ('should return distance in libia', () => {
        const point1 = {lat:30, lng:20};
        const point2 = {lat:30, lng:21};
        const distance = 96300; // according to google maps
        const harversine = utils.getHaversineDistance(point1, point2, -1);
        const geolibSimple = utils.getGeolibDistanceSimple(point1, point2, -1);
        const geolib = utils.getGeolibDistance(point1, point2, -1);
        distance.should.be.equal(harversine);
        // geolib is not precise so it needs some corrections
        (distance + 110).should.be.equal(geolibSimple); 
        (distance + 190).should.be.equal(geolib);
    });

    it ('should return distance in central usa', () => {
        const point1 = {lat:41, lng:-107};
        const point2 = {lat:41, lng:-100};
        const distance = 587280; // according to google maps
        const harversine = utils.getHaversineDistance(point1, point2, -1);
        const geolibSimple = utils.getGeolibDistanceSimple(point1, point2, -1);
        const geolib = utils.getGeolibDistance(point1, point2, -1);
        distance.should.be.equal(harversine);
        // geolib is not precise so it needs some corrections
        (distance + 660).should.be.equal(geolibSimple);
        (distance + 1510).should.be.equal(geolib);
    });

    it ('should return distance in west usa', () => {
        const point1 = {lat:46, lng:-121};
        const point2 = {lat:38, lng:-121};
        const distance = 889560; // according to google maps
        const harversine = utils.getHaversineDistance(point1, point2, -1);
        const geolibSimple = utils.getGeolibDistanceSimple(point1, point2, -1);
        const geolib = utils.getGeolibDistance(point1, point2, -1);
        distance.should.be.equal(harversine);
        // geolib is not precise so it needs some corrections
        (distance + 1000).should.be.equal(geolibSimple);
        (distance - 970).should.be.equal(geolib);
    });

    it ('should return distance in germany north to south', () => {
        const point1 = {lat:54.676225, lng:9.636944};
        const point2 = {lat:47.895890, lng:12.533485};
        const distance = 780210; // according to google maps
        const harversine = utils.getHaversineDistance(point1, point2, -1);
        const geolibSimple = utils.getGeolibDistanceSimple(point1, point2, -1);
        const geolib = utils.getGeolibDistance(point1, point2, -1);
        distance.should.be.equal(harversine);
        // geolib is not precise so it needs some corrections
        (distance + 870).should.be.equal(geolibSimple);
        (distance + 550).should.be.equal(geolib);
    });

    it ('should return distance in germany east to west', () => {
        const point1 = {lat:51.701299, lng:14.401495};
        const point2 = {lat:50.034434, lng:6.274386};
        const distance = 599310; // according to google maps
        const harversine = utils.getHaversineDistance(point1, point2, -1);
        const geolibSimple = utils.getGeolibDistanceSimple(point1, point2, -1);
        const geolib = utils.getGeolibDistance(point1, point2, -1);
        distance.should.be.equal(harversine);
        // geolib is not precise so it needs some corrections
        (distance + 670).should.be.equal(geolibSimple);
        (distance + 1730).should.be.equal(geolib);
    });
});

describe ('check point is inside', () => {
    
    before(function () {
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

    it ('should check given point in given rectangle', () => {
        const point = {lat:41, lng:-107};
        const rectangle = [{lat:41.1, lng:-107.1},{lat:40.9, lng:-106.9} ];
        const isInCircle = utils.isInRectangle(rectangle, point);
        isInCircle.should.be.true;
    });

    it ('should check given point not in given rectangle', () => {
        const point = {lat:41, lng:-107};
        const rectangle = [{lat:40, lng:-107.1},{lat:40.9, lng:-106.9} ];
        const isInCircle = utils.isInRectangle(rectangle, point);
        isInCircle.should.be.false;
    });

    it ('should get outer rectangle from polygon', () => {
        const polygon = [
            { lat: 7, lng: 1},
            { lat: 6, lng: 8},
            { lat: 1, lng: 7},
            { lat: 2, lng: 2},
        ];
        const rectangle = [
            { lat: 7, lng: 1},
            { lat: 1, lng: 8},
        ];
        const result = utils.getOuterRectangleFromPolygon(polygon);
        rectangle.should.deep.include(result[0]);
        rectangle.should.deep.include(result[1]);
    });

    it ('should get outer rectangle from circle', () => {
        const circle = { lat: 4, lng: 5};
        const radious = 5000;
        const rectangle = utils.getRectangleOffset(circle, radious);
        const distance1 = utils.getHaversineDistance(circle,  { lat: rectangle[0].lat, lng: circle.lng });
        const distance2 = utils.getHaversineDistance(circle,  { lat: rectangle[1].lat, lng: circle.lng });
        const distance3 = utils.getHaversineDistance(circle,  { lat: circle.lat, lng: rectangle[0].lng });
        const distance4 = utils.getHaversineDistance(circle,  { lat: circle.lat, lng: rectangle[1].lng });
        distance1.should.not.lessThan(radious);
        distance2.should.not.lessThan(radious);
        distance3.should.not.lessThan(radious);
        distance4.should.not.lessThan(radious);
    });

    it('should remove private properties, such as password', () => {
        const result = utils.removePrivateProps({
            password: 'secret',
            name: 'john'
        });
        result.password.should.equal('');
        result.name.should.equal('john');
    });

    it('should check given object has only one property and that property matching with given one', () => {
        let result = utils.isOnlyProperty({
            _id: 123
        }, '_id');
        result.should.be.true;

        result = utils.isOnlyProperty({
            name: 'john',
            _id: 123
        }, '_id');
        result.should.be.false;
        
        result = utils.isOnlyProperty({
            name: 'john'
        }, '_id');
        result.should.be.false;
    });
    
});





