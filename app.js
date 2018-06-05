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

app.post('/create/item', (req, res) => {
    item.create(req.body)
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

app.get('/get/items', (req, res) => {
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

app.get('/get/item', (req, res) => {
    item.getByID(req.query.id)
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

app.get('/get/items/square', (req, res) => {
    item.getInSquareRange({
        lat: Number(req.query.lat),
        lng: Number(req.query.lng),
        range: Number(req.query.range)
    })
    .then( items => {
        res.send(items);
    })
    .catch( error => {
        res.send({
            status: 'Error',
            message: error
        });
    })
});

app.get('/get/items/circle', (req, res) => {
    item.getInCircleRadius({
        lat: Number(req.query.lat),
        lng: Number(req.query.lng),
        radius: Number(req.query.radius),
    })
    .then( items => {
        res.send(items);
    })
    .catch( error => {
        res.send({
            status: 'Error',
            message: error
        });
    })
});

app.get('/check/item/square', (req, res) => {
    item.getInSquareRange({
        _id: req.query.id,
        lat: Number(req.query.lat),
        lng: Number(req.query.lng),
        range: Number(req.query.range)
    })
    .then( items => {
        res.send(items);
    })
    .catch( error => {
        res.send({
            status: 'Error',
            message: error
        });
    })
});


app.listen(3000, () => console.log('Listening to port 3000'));

module.exports = app;