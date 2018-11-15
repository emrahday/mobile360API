
const config = {
    environment: 'dev',
    mongo : {
        url : 'mongodb://localhost:27017/',
        dbName : 'mobile360',
        collections : {
            items : 'items'
        }
    }
}

module.exports = config;
