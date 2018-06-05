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

    it ('should return distance between two points with Haversine formula', () => {
        const westend = {lat:52.510187, lng:13.284765};
        const brandenburgerTor = {lat:52.516349, lng:13.376820};
        const expectedDistance = 6.266999459614887;
        const distance = utils.getHaversineDistance(westend, brandenburgerTor );
        distance.should.be.equal(expectedDistance);
    })

    it ('should check given lat/lng in given range of origin', () => {
        const westend = {lat:52.510187, lng:13.284765};
        const brandenburgerTor = {lat:52.516349, lng:13.376820};
        const expectedDistance = 6.266999459614887;
       // westend should be in 10 km radius of brandenburger tor
        const check1 = utils.isInRange(brandenburgerTor, 10, westend);
        check1.should.be.true;
        // westend should NOT be in 6 km radius of brandenburger tor
        const check2 = utils.isInRange(brandenburgerTor, 6, westend);
        check2.should.be.false;
    });
    

    
});


