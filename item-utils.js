const {ObjectID} = require('mongodb');
const dbUtils = require('./db-utils');
const config = require('./config');
const utils = require('./utils');

const itemUtils = {
    create : item => {
        return new Promise( (resolve, reject) => {
            dbUtils.connect()
            .then(db => {
                db.collection(config.mongo.collections.items).insertOne(item, (err, result) => {
                    if (err){
                        reject(err);
                    }
                    resolve(result.ops[0]);
                });
            });
        });
    },
    createBulk : items => {
        return new Promise( (resolve, reject) => {
            dbUtils.connect()
            .then(db => {
                db.collection(config.mongo.collections.items).insert(items, (err, result) => {
                    if (err){
                        reject(err);
                    }
                    resolve(result.ops);
                });
            });
        });
    },
    get: query => {
        return new Promise( (resolve, reject) => {
            dbUtils.connect()
            .then( db => {
                db.collection(config.mongo.collections.items).find(query).toArray()
                .then ( items => resolve(items));
            });
        });
    },
    getByID: id => {
        let _id = new ObjectID(id);
        return new Promise( (resolve, reject) => {
            dbUtils.connect()
            .then( db => {
                db.collection(config.mongo.collections.items).find(_id).toArray()
                .then ( items => resolve(items));
            });
        });
    },
    getInRectangle: (query) => {
        return new Promise ( (resolve, reject) => {
            const mongoQuery = { 
                lat : { 
                    $lte : query[0].lat,
                    $gte : query[1].lat,
                },
                lng : { 
                    $lte : query[1].lng,
                    $gte : query[0].lng,
                }
            }
            if (query._id) {
                mongoQuery['_id'] = new ObjectID(query.id)
            }
            dbUtils.connect()
            .then ( db => {
                db.collection(config.mongo.collections.items).find(mongoQuery).toArray()
                .then ( items => resolve(items));
            });
        });
    },

    getInCircleRadius:  (query) => {
        return new Promise ( (resolve, reject) => {
            const rectangle = utils.getRectangleOffset({lat: query.lat, lng: query.lng}, query.radius);
            itemUtils.getInRectangle([
                {lat:rectangle[0].lat, lng:rectangle[0].lng},
                {lat:rectangle[1].lat, lng:rectangle[1].lng}
            ])
            .then ( items => {
                let filteredItems = items.filter( item => {
                    let distance = utils.getHaversineDistance(
                        {lat:query.lat, lng:query.lng}, 
                        {lat:item.lat, lng:item.lng}
                    )
                    return distance < query.radius;
                });
                resolve(filteredItems);
            });
        });
    },


    isInCircleRadius: (query) => {
        return new Promise ( (resolve, reject) => { 
            itemUtils.getByID(query._id)
            .then ( items => {
                if (items && items.length > 0){
                    const distance = utils.getHaversineDistance(
                        {lat:query.point.lat, lng:query.point.lng},
                        {lat:items[0].lat, lng:items[0].lng}
                    )
                    query.inCircle = distance <= query.radius;
                    query.distance = distance;
                    resolve(query);
                } else {
                    reject({
                        status: 'Error',
                        message: 'Item not found'
                    });
                }
            });
        });
    },

    isInRectangle: (query) => {
        return new Promise ( (resolve, reject) => { 
            itemUtils.getByID(query._id)
            .then ( items => {
                if (items && items.length > 0){
                    const inRectangle = utils.isInRectangle(
                        query.points,
                        {lat:items[0].lat, lng:items[0].lng}
                    )
                    query.inRectangle = inRectangle;
                    resolve(query);
                } else {
                    reject({
                        status: 'Error',
                        message: 'Item not found'
                    });
                }
            });
        });
    }
}

module.exports = itemUtils;