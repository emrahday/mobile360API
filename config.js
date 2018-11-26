
const config = {
    environment: 'dev',
    mongo : {
        url : 'mongodb://localhost:27017/',
        dbName : 'mobile360',
        collections : {
            items : 'items',
            history: 'history'
        }
    },
    token: {
        tokenSecret : 'changeThis',
        credentialSecret : 'changeThis',
        expires: 1000 * 60 * 60 * 24
    }
};

module.exports = config;
