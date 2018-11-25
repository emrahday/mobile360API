const utils = require('./../utils');
const itemUtils = require('./../item.utils');
const chai = require('chai');
const should = chai.should();

describe ('item crud', () => {
    before(function () {
		// this.skip();
    });

    it ('should create an item', async () => {
        const {lat, lng} = utils.getRandomLatLng();
        const result = await itemUtils.create({ lat, lng });
        result.should.include.keys('lat', 'lng', '_id');
        result._id.should.not.equal(null);
        result.lat.should.equal(lat);
        result.lng.should.equal(lng);
    });

    it ('should create an user', async () => {
        const latLng = utils.getRandomLatLng();
        const user = {
            firstname: 'John',
            lastname: 'Doe',
            email: 'john.doe@example.com',
            password: 'secret'
        };
        const data = Object.assign(latLng, user);
        const result = await itemUtils.create(data);
        result.should.include.keys('lat', 'lng', '_id', 'firstname', 'lastname', 'email');
        result._id.should.not.equal(null);
        result.lat.should.equal(latLng.lat);
        result.lng.should.equal(latLng.lng);
        result.firstname.should.equal(user.firstname);
        result.lastname.should.equal(user.lastname);
        result.email.should.equal(user.email);
        result.password.should.equal('');
    });

    it ('should return error if creation type is wrong', async () => {
        const result = await itemUtils.create(null);
        result.should.be.instanceOf(Error).with.property('message', 'Wrong argument ! "object" expected');
    });
    
    it ('should create bulk item', async () => {
        const items = [];
        items.push(utils.getRandomLatLng());
        items.push(utils.getRandomLatLng());
        const result = await itemUtils.createBulk(items);
        result.length.should.equal(items.length);
        result[0].should.include.keys('lat', 'lng', '_id');
        result[1].should.include.keys('lat', 'lng', '_id');
    });

    it ('should get item', async () => {
        const latLng = utils.getRandomLatLng();
        const created = await itemUtils.create(latLng);
        const result = await itemUtils.get(latLng);
        result.length.should.equal(1);
        result[0].should.include.keys('lat', 'lng', '_id');
        result[0]._id.should.equal(created._id);
        result[0].lat.should.equal(latLng.lat);
        result[0].lng.should.equal(latLng.lng);
    });
    

    it ('should get item by id', async () => {
        const latLng = utils.getRandomLatLng();
        const created = await itemUtils.create(latLng);
        const result = await itemUtils.getByID(created._id);
        result.should.include.keys('lat', 'lng', '_id');
        result._id.should.equal(created._id);
        result.lat.should.equal(latLng.lat);
        result.lng.should.equal(latLng.lng);
    });
	
    it ('should create an item with flexible props', async () => {
        const {lat, lng} = utils.getRandomLatLng();
        const created = await itemUtils.create({ 
            lat, 
            lng,
            type: 'flexible type'
        });
        const result = await itemUtils.getByID(created._id);
        result.should.include.keys('lat', 'lng', '_id', 'type');
        result._id.should.not.equal(null);
        result.lat.should.equal(lat);
        result.lng.should.equal(lng);
        result.type.should.equal('flexible type');
    });
	
    it ('should update item lat/lng by id', async () => {
        const latLng = utils.getRandomLatLng();
        const newLatLng = utils.getRandomLatLng();
        const created = await itemUtils.create(latLng);
        const updated = await itemUtils.update(
            {
                _id: created._id.str,
                lat: newLatLng.lat,
                lng: newLatLng.lng
            }
		);
        const result = await itemUtils.getByID(created._id);
        result._id.should.equal(created._id);
        result.lat.should.equal(newLatLng.lat);
        result.lng.should.equal(newLatLng.lng);
        result._id.str.should.equal(updated._id);
        result.lat.should.equal(updated.lat);
        result.lng.should.equal(updated.lng);
    });
		
    it ('should delete item by id', async () => {
        const latLng = utils.getRandomLatLng();
        const created = await itemUtils.create(latLng);
        const deleted = await itemUtils.delete({ 
            _id: created._id 
        });
        const result = await itemUtils.getByID(created._id);
        should.not.exist(result);
        deleted._id.should.equal(created._id);
    });

});

describe ('item location history', () => {

    let created, inserted, insertedLatLng;
    before( async () => {
		// this.skip();
        const latLng = utils.getRandomLatLng();
        created = await itemUtils.create(latLng);
    });

    it ('shuld push to item history', async () => {
        insertedLatLng = utils.getRandomLatLng();
        inserted = await itemUtils.pushToHistory({
            _id: created._id,
            lat: insertedLatLng.lat, 
            lng: insertedLatLng.lng
        });
        inserted.should.include.keys('_id');
        inserted._id.should.not.be.empty;
    });

    it('should get all historical data', async () => {
        const history = await itemUtils.getFromHistory(created._id.str);
        history.should.be.an('array');
        history.length.should.length.to.be.equal(1);
        history[0].should.include.keys('lat', 'lng', '_id', 'item', 'date');
        history[0]._id.should.not.equal(null);
        history[0].date.should.equal(inserted.date);
        history[0].item.should.equal(created._id.str);
        history[0].lat.should.equal(insertedLatLng.lat);
        history[0].lng.should.equal(insertedLatLng.lng);
    });

    it ('shuld push another to item history', async () => {
        insertedLatLng = utils.getRandomLatLng();
        inserted = await itemUtils.pushToHistory({
            _id: created._id,
            lat: insertedLatLng.lat, 
            lng: insertedLatLng.lng
        });
        inserted.should.include.keys('_id');
        inserted._id.should.not.be.empty;
    });

    it('should get annother all historical data', async () => {
        const history = await itemUtils.getFromHistory(created._id.str);
        history.should.be.an('array');
        history.length.should.length.to.be.equal(2);
        history[1].should.include.keys('lat', 'lng', '_id', 'item', 'date');
        history[1]._id.should.not.equal(null);
        history[1].date.should.equal(inserted.date);
        history[1].item.should.equal(created._id.str);
        history[1].lat.should.equal(insertedLatLng.lat);
        history[1].lng.should.equal(insertedLatLng.lng);
    });

    let newLocation, updated;
    it ('shuld update item location', async () => {
        newLocation = utils.getRandomLatLng();
        updated = await itemUtils.updateLocation({
            _id: created._id,
            lat: newLocation.lat, 
            lng: newLocation.lng
        });
        updated.should.include.keys('_id');
        updated._id.should.not.be.empty;
    });

    it('should get previous location of updated item', async () => {
        const history = await itemUtils.getFromHistory(created._id.str);
        history.should.be.an('array');
        history.length.should.length.to.be.equal(3);
        history[2].should.include.keys('lat', 'lng', '_id', 'item', 'date');
        history[1]._id.should.not.equal(null);
        history[1].item.should.equal(updated._id.str);
        history[1].lat.should.equal(insertedLatLng.lat);
        history[1].lng.should.equal(insertedLatLng.lng);
    });
});


describe ('item search and filter', () => {
    
    before(function () {
		// this.skip();
    });
    
    it ('should find items in given rectangle', async () => {
        const rectangle = [
			{ lat: 7, lng: 1},
			{ lat: 1, lng: 8},
        ];
        const created = await itemUtils.create({ lat: 5, lng: 5});
        const items = await itemUtils.getInRectangle(rectangle);
        items.should.deep.include(created);
    });
	
    it ('should find items in given circle radious', async () => {
        const created = await itemUtils.create({ lat: 5, lng: 5});
        const items = await itemUtils.getInCircleRadius({
            lat: 4,
            lng: 5,
            radius: 111195
        });
        items.should.deep.include(created);
    });

    it ('should check items in given rectangle', async () => {
        const rectangle = [{lat:42, lng:40},{lat:40, lng:42}];
        const created = await itemUtils.create({ lat: 41, lng: 41});
        const result = await itemUtils.isInRectangle({
            _id : created._id,
            points: rectangle
        });
        result.inRectangle.should.be.true;
    });

    it ('should check items in given circle radious', async () => {
        const created = await itemUtils.create({ lat: 41, lng: 41});
        const result = await itemUtils.isInCircleRadius({
            _id : created._id,
            lat:40, 
            lng:40,
            radius: 140000
        });
        result.inCircle.should.be.true;
    });

});

 //TODO complete
describe ('different item types', () => {
    
    before(function () {
        this.skip();
    });

    it ('should creat an item as user type', () => {
    });
});
