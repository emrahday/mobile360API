const {MongoClient, ObjectID} = require('mongodb');
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
    getInPolygon: (query) => {
        const items = [];
        return new Promise ( (resolve, reject) => {
            const rectangleQuery = utils.getOuterRectangleFromPolygon(query);
            itemUtils.getInRectangle(rectangleQuery)
            .then( recItems => {
                recItems.forEach( item => {
                    if ( utils.isInPolygon(item, query) ){
                        items.push(item);
                    }
                })
                resolve(items);
            });
        });
    },

    getInCircleRadius:  (query) => {
        return new Promise ( (resolve, reject) => {
            item.getInSquareRange({lat:query.lat, lng:query.lng, range:query.radius})
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


    isInSquareRange: ({id, lat, lng, range}) => {
        return new Promise ( (resolve, reject) => {
            let itemToCheck = item.getByID(id);
            resolve(true);
        });
    }

}

module.exports = itemUtils;