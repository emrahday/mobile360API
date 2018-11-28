const lodash = require('lodash');
const geolib = require('geolib');
const jwt = require('jsonwebtoken');
const config = require('./config');
const itemUtils = require('./item.utils');

const utils = {
    getRandomLatLng: () => {
        return {
            lat: Math.random() * (90 - (-90)) + (-90),
            lng: Math.random() * (180 - (-180)) + (-180)
        };
    },

    isValidLatLng: (latLng) => {
        let isLatValid, isLngValid;
        if (latLng.lat){
            isLatValid = latLng.lat >= -90 && latLng.lat <= 90;
        }
        if (latLng.lng){
            isLngValid = latLng.lng >= -180 && latLng.lng <= 180;
        }
        if (!isLatValid || !isLngValid){
            return false;
        } 
        return true;
    },

    
	// Haversine formula returns distance in kilometer
	// https://stackoverflow.com/a/27943/3650479
    getHaversineDistance: (point1, point2, round) => {
        var R = 6371;
        var latRadian = utils.degreeToRadian(point2.lat-point1.lat); 
        var lngRadian = utils.degreeToRadian(point2.lng-point1.lng); 
        var a = 
          Math.sin(latRadian/2) * Math.sin(latRadian/2) +
          Math.cos(utils.degreeToRadian(point1.lat)) * Math.cos(utils.degreeToRadian(point2.lat)) * 
          Math.sin(lngRadian/2) * Math.sin(lngRadian/2); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var distance = R * c * 1000;
        if (round){
            return lodash.round(distance, round);
        }
        return distance;
    },

	// https://www.npmjs.com/package/geolib
	// https://github.com/manuelbieh/Geolib/blob/master/src/geolib.js
    getGeolibDistanceSimple: (point1, point2, round) => {
        const distance = geolib.getDistanceSimple(
			{latitude:point1.lat, longitude:point1.lng},
			{latitude:point2.lat, longitude:point2.lng}
		);
        if (round){
            return lodash.round(distance, round);
        }
    },

    getGeolibDistance: (point1, point2, round) => {
        const distance = geolib.getDistance(
			{latitude:point1.lat, longitude:point1.lng},
			{latitude:point2.lat, longitude:point2.lng}
		);
        if (round){
            return lodash.round(distance, round);
        }
    },

	//returns rectangle based on center point and distance
    getRectangleOffset: (center, distance) => {
        const distanceOfOneDegreeLat = utils.getHaversineDistance(center, { lat: center.lat + 1, lng:center.lng});
        const latOffset = distance / distanceOfOneDegreeLat;
        const distanceOfOneDegreeLng = utils.getHaversineDistance(center, { lat: center.lat, lng:center.lng + 1});
        const lngOffset = distance / distanceOfOneDegreeLng;
        const point1 = {lat: center.lat + latOffset, lng: center.lng - lngOffset};
        const point2 = {lat: center.lat - latOffset, lng: center.lng + lngOffset};
        return [point1, point2];
    },

    degreeToRadian: deg => {
        return deg * (Math.PI/180);
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
        );
    },

	// we need this function to limit db search area
	// we have 4 point polygon, we are converting it to 2 point bigger rectangle
	// because limiting area with polygon requires 
    getOuterRectangleFromPolygon: polygon => {
        const p1 = {
            lat: polygon[0].lat > polygon[1].lat ? polygon[0].lat : polygon[1].lat,
            lng: polygon[0].lng < polygon[3].lng ? polygon[0].lng : polygon[3].lng
        };
        const p2 = {
            lat: polygon[2].lat < polygon[3].lat ? polygon[2].lat : polygon[3].lat,
            lng: polygon[1].lng > polygon[1].lng ? polygon[2].lng : polygon[1].lng
        };
        return [p1, p2];
    },

    removePrivateProps: obj => {
        if (obj.password){
            obj.password = '';
        }
        return obj;
    },

    isOnlyProperty: (obj, prop) => {
        if (Object.keys(obj).length === 1 && obj[prop]){
            return true;
        } 
        return false;
    },
	
    //TODO authentication

    getPermission: (userType) => {
        //TODO
    },
    
    getToken: (email, password, permissions) => {
        const credential = utils.encodeUserCredential(email, password);
		// check is credential matching with db credential
        const tokenData = {
            credential,
            expires: utils.getTokenExpires(),
            permissions
        };
        return utils.encodeToken(tokenData);
    },
    
    encodeUserCredential: (email, password) => {
        return jwt.sign(`${email}:${password}`, config.token.credentialSecret);
    },
    
    decodeUserCredential: hash => {
        return jwt.verify(hash, config.token.credentialSecret);
    },
    
    encodeToken: data => {
        return jwt.sign(data, config.token.tokenSecret);
    },

    decodeToken: hash => {
        return jwt.verify(hash, config.token.tokenSecret);
    },
    
    getTokenExpires: () => {
        return (new Date()).getTime() + config.token.expires;
    }
};

module.exports = utils;
