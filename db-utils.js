let {MongoClient} = require('mongodb');
const config = require('./config');
var mongodbMock = require('mongo-mock');
mongodbMock.max_delay = 1000;

if (config.environment === 'dev'){
    MongoClient = mongodbMock.MongoClient;  
}


const dbUtils = {
    connect: () => {
        return new Promise( (resolve, reject) => {
            MongoClient.connect(config.mongo.url, {poolSize: 10}, (err, client) => {
                if (err){
                    reject(err);
                }
                const db = client.db(config.mongo.dbName);
                resolve(db);
            });
        });
    },
    status: db => {
        return new Promise( (resolve, reject) => {
            const result = db.executeDbAdminCommand({ serverStatus : 1, repl: 0, metrics: 0, locks: 0 });
            resolve(result);
        });
    },
    close: db => db.close
}

module.exports = dbUtils;
