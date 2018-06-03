module.exports ={
    getRandomLatLng: () => {
        return {
            lat: Math.random() * (90 - (-90)) + (-90),
            lng: Math.random() * (180 - (-180)) + (-180)
        }
    },

    isInRange: (origin, range, latLng) => {
        return false;
    } 
}