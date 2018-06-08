const express = require('express');
const bodyParser = require('body-parser');
const itemUtils = require('./item-utils');
const app = express();

app.use(bodyParser.json()); 
app.get('/', (req, res) => {
    res.send({
        status: 'OK',
        message:'Express is working propery '
    });
});

app.post('/create/item', (req, res) => {
    itemUtils.create(req.body)
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
    itemUtils.get({
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
    itemUtils.getByID(req.query.id)
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


app.post('/get/items/rectangle', (req, res) => {
    itemUtils.getInRectangle(req.body)
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

app.post('/get/items/polygon', (req, res) => {
    itemUtils.getInPolygon(req.body)
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
    itemUtils.getInCircleRadius({
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

app.get('/check/item/rectangle', (req, res) => {
    itemUtils.isInSquareRange({
        id: req.query.id,
        lat: Number(req.query.lat),
        lng: Number(req.query.lng),
        range: Number(req.query.range),
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

if (!module.parent) {
    app.listen(3000, () => console.log('Listening to port 3000'));
}

module.exports = app;