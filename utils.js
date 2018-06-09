const lodash = require('lodash');
const geolib = require('geolib');

const utils = {
    getRandomLatLng: () => {
        return {
            lat: Math.random() * (90 - (-90)) + (-90),
            lng: Math.random() * (180 - (-180)) + (-180)
        }
    },
    
    // Haversine formula returns distance in kilometer
    // https://stackoverflow.com/a/27943/3650479
    getHaversineDistance: (point1, point2, round) => {
        var R = 6371;
        var dLat = utils.degreeToRadian(point2.lat-point1.lat); 
        var dLng = utils.degreeToRadian(point2.lng-point1.lng); 
        var a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(utils.degreeToRadian(point1.lat)) * Math.cos(utils.degreeToRadian(point2.lat)) * 
          Math.sin(dLng/2) * Math.sin(dLng/2); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var distance = R * c * 1000;
        if (round){
            return lodash.round(distance, round);
        }
        return distance;
    },

    //returns rectangle based on center point and distance
    getRectangleOffset: (center, distance) => {
        const distanceOfOneDegreeLat = utils.getHaversineDistance(center, { lat: center.lat + 1, lng:center.lng});
        const latOffset = distance / distanceOfOneDegreeLat;
        const distanceOfOneDegreeLng = utils.getHaversineDistance(center, { lat: center.lat, lng:center.lng + 1});
        const lngOffset = distance / distanceOfOneDegreeLng;
        const point1 = {lat: center.lat + latOffset, lng: center.lng - lngOffset}
        const point2 = {lat: center.lat - latOffset, lng: center.lng + lngOffset}
        return [point1, point2];
    },

    // https://www.npmjs.com/package/geolib
    // https://github.com/manuelbieh/Geolib/blob/master/src/geolib.js
    getGeolibDistanceSimple: (point1, point2, round) => {
        const distance = geolib.getDistanceSimple(
            {latitude:point1.lat, longitude:point1.lng},
            {latitude:point2.lat, longitude:point2.lng}
        )
        if (round){
            return lodash.round(distance, round);
        }
    },

    getGeolibDistance: (point1, point2, round) => {
        const distance = geolib.getDistance(
            {latitude:point1.lat, longitude:point1.lng},
            {latitude:point2.lat, longitude:point2.lng}
        )
        if (round){
            return lodash.round(distance, round);
        }
    },

    degreeToRadian: deg => {
        return deg * (Math.PI/180)
    },

    isInCircle: (origin, radious, point) => {
        return utils.getHaversineDistance(origin, point, 1) < radious;
    },

    isInRectangle: (rectangle, point) => {
        return (
            rectangle[0].lat >= point.lat
            && rectangle[0].lng <= point.lng
            && rectangle[1].lat <= point.lat
            && rectangle[1].lng >= point.lng
        )
    },

    // we need this function to limit db search area
    // we have 4 point polygon, we are converting it to 2 point bigger rectangle
    // because limiting area with polygon requires 
    getOuterRectangleFromPolygon: polygon => {
        const p1 = {
            lat: polygon[0].lat > polygon[1].lat ? polygon[0].lat : polygon[1].lat,
            lng: polygon[0].lng < polygon[3].lng ? polygon[0].lng : polygon[3].lng
        }
        const p2 = {
            lat: polygon[2].lat < polygon[3].lat ? polygon[2].lat : polygon[3].lat,
            lng: polygon[1].lng > polygon[1].lng ? polygon[2].lng : polygon[1].lng
        }
        return [p1, p2];
    }
}

module.exports = utils;
