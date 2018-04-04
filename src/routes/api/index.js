module.exports = function mountAPI(router) {
    router.get('/', (req, res) => res.promise('Up and Running!'));
};