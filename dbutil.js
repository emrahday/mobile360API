// in order to run mongo db mongod.exe --dbpath /users/Emrah/mongo_data

const {MongoClient} = require('mongodb');
const config = require('./config');

module.exports = {
    connect: () => {
        return new Promise( (resolve, reject) => {
            MongoClient.connect(config.mongo.url, {poolSize: 10}, (err, client) => {
                if (err){
                    reject(err);
                }
                const db = client.db(config.mongo.dbName);
                resolve(db);
            });
        });use 
    },
    status: db => {
        return new Promise( (resolve, reject) => {
            const result = db.executeDbAdminCommand({ serverStatus : 1, repl: 0, metrics: 0, locks: 0 });
            resolve(result);
        });
    }

}
