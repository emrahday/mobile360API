// do not start express server manually
// run 'npm run test-watch' in order to run mocha test under nodemon
// it will automatically run express server and will listen port

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const utils = require('./../utils');
chai.use(chaiHttp); 

describe ('utils', () => {
    
    it ('should return a random lat/lng', () => {
        const latLng = utils.getRandomLatLng();
        latLng.should.not.be.empty;
        latLng.should.include.keys('lat', 'lng');
        latLng.lat.should.be.greaterThan(-90);
        latLng.lat.should.be.lessThan(90);
        latLng.lng.should.be.greaterThan(-180);
        latLng.lng.should.be.lessThan(180);
    });

    it ('should check given lat/lng in given range of origin', () => {
        const inRange = utils.isInRange({}, 10, {});
        inRange.should.be.true;
    })
});


