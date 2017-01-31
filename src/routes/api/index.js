module.exports = function mountAPI(router) {
    router.get('/', (req, res) => res.promise('You\'re a dipshit'));
};