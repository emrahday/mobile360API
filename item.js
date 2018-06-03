const {MongoClient} = require('mongodb');
const dbUtil = require('./dbutil');
const config = require('./config');

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
    get : query => {
        return new Promise( (resolve, reject) => {
            dbUtil.connect()
            .then( db => {
                db.collection(config.mongo.collections.items).find(query).toArray()
                .then ( items => resolve(items));
            })
        });
    },
    getInRange: query => {

    }

}

module.exports = item;