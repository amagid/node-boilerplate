'use strict';
const http = require('http');
const express = require('express');
const app = express();
const config = require('../config').get();
const logger = require('./services/logger');
const routes = require('./routes');
const bodyParser = require('body-parser');
const responsePromise = require('./middlewares/response-promise');
const morgan = require('morgan');
const cors = require('cors');

setUpAPI();

const server = http.Server(app);
//const io = socketIO(server);

//setUpSocket();

server.listen(process.env.PORT || config.app.port);
logger.info(`Server listening on port ${process.env.PORT || config.app.port}`);


function setUpAPI() {
    //General middlewares
    app.use(morgan('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(responsePromise);
    //Mount routes
    const router = express.Router();
    routes(router);
    app.use('/', router);
}

/*
function setUpSocket() {
    io.on('connection', socket => {
        console.log('Connection Received');
        socket.emit('connected', 'connected');

        socket.on('disconnect', () => {
            console.log('Connection Terminated');
        });
    });
}
*/
