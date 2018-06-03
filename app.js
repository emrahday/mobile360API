const express = require('express');
const bodyParser = require('body-parser');
const item = require('./item');
const app = express();

app.use(bodyParser.json()); 
app.get('/', (req, res) => {
    res.send({
        status: 'OK',
        message:'Express is working propery '
    });
});

app.post('/item', (req, res) => {
    item.create({
        lat: Number(req.body.lat),
        lng: Number(req.body.lng)
    })
    .then( item => {
        res.send(item);
    })
    .catch( error => {
        res.send({
            status: 'Error',
            message: error
        })
    });
});

app.get('/items', (req, res) => {
    item.get({
        lat: Number(req.query.lat),
        lng: Number(req.query.lng),
    })
    .then( items => {
        res.send(items);
    })
    .catch( error => {
        res.send({
            status: 'Error',
            message: error
        })
    })
});

app.get('/items/range', (req, res) => {
    item.getInRange({
        lat: Number(req.query.lat),
        lng: Number(req.query.lng),
        range: Number(req.query.range),
    })
    .then( items => {
        res.send();
    })
    .catch( error => {
        res.send({
            status: 'Error',
            message: error
        })
    })
});


app.listen(3000, () => console.log('Listening to port 3000'));

module.exports = app;