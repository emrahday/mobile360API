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
        const result = await itemUtils.get(latLng)
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
        result.length.should.equal(1);
		result[0].should.include.keys('lat', 'lng', '_id');
		result[0]._id.should.equal(created._id);
		result[0].lat.should.equal(latLng.lat);
        result[0].lng.should.equal(latLng.lng);
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
			result.length.should.equal(1);
			result[0]._id.should.equal(created._id);
			result[0].lat.should.equal(newLatLng.lat);
			result[0].lng.should.equal(newLatLng.lng);
			result[0]._id.str.should.equal(updated._id);
			result[0].lat.should.equal(updated.lat);
			result[0].lng.should.equal(updated.lng);
		});
		
		it ('should delete item by id', async () => {
			const latLng = utils.getRandomLatLng();
			const created = await itemUtils.create(latLng);
			const deleted = await itemUtils.delete({ 
				_id: created._id 
			});
			const result = await itemUtils.getByID(created._id);
			result.length.should.equal(0);
			deleted._id.should.equal(created._id);
	})



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
        const circle = {lat:40, lng:40};
        const created = await itemUtils.create({ lat: 41, lng: 41});
        const result = await itemUtils.isInCircleRadius({
			_id : created._id,
			point: circle,
			radius: 140000
		});
		result.inCircle.should.be.true;
	});

});

 
describe ('different item types', () => {
    
	before(function () {
		// this.skip();
	});

	it ('should creat an item as user type', () => {
	});
});
