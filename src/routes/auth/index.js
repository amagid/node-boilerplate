const auth = require('./auth');

module.exports = function mountAuth(router) {
    router.post('/', 
        (req, res) => res.promise(auth.login(req.body.email, req.body.password)));
};