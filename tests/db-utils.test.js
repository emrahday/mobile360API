// do not start express server manually
// run 'npm run test-watch' in order to run mocha test under nodemon
// it will automatically run express server and will listen port

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const dbUtils = require('./../db-utils');
chai.use(chaiHttp); 

describe ('status', () => {
    
    before(function() {
        this.skip();
    });

    it ('should have minimum open connection', (done) => {
        dbUtils.connect()
        .then( db => {
            const status = dbUtils.status(db);
            return status;
        })
        .then ( status => {
            status.host.should.not.be.empty;
            status.connections.current.should.be.at.least(1);
            status.connections.current.should.be.at.most(10);
            status.connections.available.should.be.at.least(1);
            status.connections.available.should.be.at.least(9999);
            status.connections.totalCreated.should.be.at.least(1);
            done();
        })
        .catch( error => {
            done(error);
        });
    });
});


