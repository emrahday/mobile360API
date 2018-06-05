const {MongoClient, ObjectID} = require('mongodb');
const dbUtil = require('./dbutil');
const config = require('./config');
const utils = require('./utils');

const item = {
    create : item => {
        return new Promise( (resolve, reject) => {
            dbUtil.connect()
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
            dbUtil.connect()
            .then( db => {
                db.collection(config.mongo.collections.items).find(query).toArray()
                .then ( items => resolve(items));
            });
        });
    },
    getByID: id => {
        let _id = new ObjectID(id);
        return new Promise( (resolve, reject) => {
            dbUtil.connect()
            .then( db => {
                db.collection(config.mongo.collections.items).find(_id).toArray()
                .then ( items => resolve(items));
            });
        });
    },
    getInSquareRange: (query) => {
        return new Promise ( (resolve, reject) => {
            // first we are limiting search area with square
            const squarePoints = utils.getSquareCoordinates({lat:query.lat, lng:query.lng}, query.range);
            // afterwards we will get items from database in square
            const mongoQuery = { 
                lat : { 
                    $lt : squarePoints[0].lat,
                    $gt : squarePoints[1].lat,
                },
                lng : { 
                    $lt : squarePoints[1].lng,
                    $gt : squarePoints[0].lng,
                }
            }
            if (query._id) {
                mongoQuery['_id'] = new ObjectID(query.id)
            }
            dbUtil.connect()
            .then ( db => {
                db.collection(config.mongo.collections.items).find(mongoQuery).toArray()
                .then ( items => resolve(items));
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


    isInSquareRange: (itemID, point1, point2) => {
        let itemToCheck = item.getByID(itemID);
    }



}

module.exports = item;