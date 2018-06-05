const utils = {
    getRandomLatLng: () => {
        return {
            lat: Math.random() * (90 - (-90)) + (-90),
            lng: Math.random() * (180 - (-180)) + (-180)
        }
    },
    
    // Haversine formula returns distance in kilometer
    // https://stackoverflow.com/a/27943/3650479
    getHaversineDistance: (point1, point2) => {
        var R = 6371;
        var dLat = utils.degreeToRadian(point2.lat-point1.lat); 
        var dLng = utils.degreeToRadian(point2.lng-point1.lng); 
        var a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(utils.degreeToRadian(point1.lat)) * Math.cos(utils.degreeToRadian(point2.lat)) * 
          Math.sin(dLng/2) * Math.sin(dLng/2); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c;
        return d;
    },

    degreeToRadian: deg => {
        return deg * (Math.PI/180)
    },

    isInRange: (origin, range, point) => {
        return utils.getHaversineDistance(origin, point) < range;
    },

    getSquareCoordinates: ({lat, lng}, range) => {
        const oneLongitueInKm = utils.getHaversineDistance({lat:lat, lng:1}, {lat:lat, lng:0});
        const rangeInLongitude = range / oneLongitueInKm;
        const x1 = lng - rangeInLongitude;
        const x2 = lng + rangeInLongitude;

        const oneLatitudeInKm = 111;
        const rangeInLatitude = range / oneLatitudeInKm;
        const y1 = lat + rangeInLatitude;
        const y2 = lat - rangeInLatitude;

        return([{lat: y1, lng: x1}, {lat: y2, lng: x2}]);
    }
}

module.exports = utils;
