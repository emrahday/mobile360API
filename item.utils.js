const {ObjectID} = require('mongodb');
const dbUtils = require('./db.utils');
const config = require('./config');
const utils = require('./utils');

const itemUtils = {
    create : item => {
        if (!item || typeof item !== 'object'){
            return Error('Wrong argument ! "object" expected');
        }
        if (!utils.isValidLatLng({lat: item.lat, lng: item.lng})){
            return Error('Wrong latitude/longitude data !');
        }
        return new Promise( (resolve, reject) => {
            dbUtils.connect()
            .then(db => {
                db.collection(config.mongo.collections.items)
                .insertOne(item, (err, result) => {
                    if (err) {
                        reject(err);
                    }
                    const data = utils.removePrivateProps(result.ops[0]); // for example never return password
                    resolve(data);
                });
            });
        });
    },
    createBulk : items => {
        return new Promise( (resolve, reject) => {
            dbUtils.connect()
            .then(db => {
                db.collection(config.mongo.collections.items)
                .insert(items, (err, result) => {
                    if (err){
                        reject(err);
                    }
                    resolve(result.ops);
                });
            });
        });
    },
    get: query => {
        return new Promise( async (resolve) => {
            if (utils.isOnlyProperty(query, '_id')){ // if given query is only _id, redirect to getByID because better performance
                const item  = await itemUtils.getByID(query._id);
                resolve([item]);
            } else {
                const db = await dbUtils.connect();
                const items = db.collection(config.mongo.collections.items).find(query).toArray();
                resolve(items);
            }
        });
    },
    getByID: id => {
        let _id = new ObjectID(id);
        return new Promise( (resolve) => {
            dbUtils.connect()
            .then( async db => {
                // shortcut way .find(_id) is also possible but not supported by mongo-mock
                const item =  await db.collection(config.mongo.collections.items)
                                    .findOne({'_id': _id});
                resolve(item);
            });
        });
    },
    update: (data) => {
        const {_id, ...rest} = data;
        return new Promise( async (resolve) => {
            const db = await dbUtils.connect();
            const result  = await db.collection(config.mongo.collections.items).update(
				{ _id: new ObjectID(_id) }, 
				rest
			);
            resolve(data); //TODO check resuld is updated, otherwise return error
        });
    },
    delete: query => {
        return new Promise( async (resolve) => {
            const db = await dbUtils.connect();
            const result = await db.collection(config.mongo.collections.items).remove(
				query,
                {
                    justOne: true
                }
			);
            resolve(query); //TODO check resuld is deleted, otherwise return error
        });
    },
    getInRectangle: (query) => {
        return new Promise ( async (resolve) => {
            const mongoQuery = { 
                lat : { 
                    $lte : query[0].lat,
                    $gte : query[1].lat,
                },
                lng : { 
                    $lte : query[1].lng,
                    $gte : query[0].lng,
                }
            };
            if (query._id) {
                mongoQuery['_id'] = new ObjectID(query.id);
            }
            const db = await dbUtils.connect();
            const items = await db.collection(config.mongo.collections.items).find(mongoQuery).toArray();
            resolve(items);
        });
    },

    getInCircleRadius:  (query) => {
        return new Promise ( async (resolve) => {
            const rectangle = utils.getRectangleOffset({lat: query.lat, lng: query.lng}, query.radius);
            const items = await itemUtils.getInRectangle([
				{lat:rectangle[0].lat, lng:rectangle[0].lng},
				{lat:rectangle[1].lat, lng:rectangle[1].lng}
            ]);
            let filteredItems = items.filter( item => {
                let distance = utils.getHaversineDistance(
					{lat:query.lat, lng:query.lng}, 
					{lat:item.lat, lng:item.lng}
				);
                return distance < query.radius;
            });
            resolve(filteredItems);
        });
    },

    isInCircleRadius: (query) => {
        return new Promise ( async (resolve, reject) => { 
            const item = await itemUtils.getByID(query._id);
            if (item){
                const distance = utils.getHaversineDistance(
					{lat:query.lat, lng:query.lng},
					{lat:item.lat, lng:item.lng}
				);
                resolve({
                    _id: item._id,
                    inCircle: distance <= query.radius,
                    distance: distance
                });
            } else {
                reject({
                    status: 'Error',
                    message: 'Item not found'
                });
            }
        });
    },

    isInRectangle: (query) => {
        return new Promise ( async (resolve, reject) => { 
            const item = await itemUtils.getByID(query._id);
            if (item){
                const inRectangle = utils.isInRectangle(
					query.points,
					{lat:item.lat, lng:item.lng}
				);
                query.inRectangle = inRectangle;
                resolve(query);
            } else {
                reject({
                    status: 'Error',
                    message: 'Item not found'
                });
            }
        });
    },

    updateLocation: (data) => {
        return new Promise ( async (resolve, reject) => { 
            const {lat, lng } = await itemUtils.getByID(data._id);
            const updated = await itemUtils.update(data);
            if (updated._id && updated._id === data._id) {
                const history = await itemUtils.pushToHistory({
                    lat,
                    lng,
                    _id: updated._id
                });
                resolve({ _id: updated._id});
            } else {
                return new Error('Location cannot be updated');
            }
        });
    },

    pushToHistory: ({_id: item, lat, lng}) => {
        return new Promise ( async (resolve, reject) => { 
            const insertDate = (new Date()).getTime();
            const data = {
                item: item.str,
                lat,
                lng, 
                date: insertDate
            };
            const db = await dbUtils.connect();
            db.collection(config.mongo.collections.history).insertOne(data, (err, result) => {
                if (err) {
                    reject(err);
                }
                resolve({
                    _id: result.insertedId,
                    date: insertDate
                });
            });
        });
    },

    getFromHistory: (idStr) => {
        return new Promise( async (resolve) => {
            const db = await dbUtils.connect();
            const query = { item: idStr };
            const history = await db.collection(config.mongo.collections.history).find(query).toArray();
            resolve(history);
        });
    },

    registerUser:({email, password, userType}) => {
        const created = itemUtils.create({
            type: 'person',
            email,
            password
        });
        const permission = utils.getPermission(userType);
        if (created._id){
            return utils.getToken(email, password, permission);
        }
        throw new Error('User register error');
    },

};

module.exports = itemUtils;