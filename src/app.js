'use strict';
const http = require('http');
const express = require('express');
const app = express();
const socketIO = require('socket.io');
const config = require('../config').get();
const logger = require('./services/logger');
const routes = require('./routes');
const bodyParser = require('body-parser');
const responsePromise = require('./middlewares/response-promise');
const morgan = require('morgan');
const cors = require('cors');
const retrieval = require('./services/retrieval');
const processing = require('./services/processing');
const utils = require('./services/utils');
const mailer = require('./services/mailer');
const ProcessError = require('./ProcessError');
const stages = require('./enums/stages');

setUpAPI();

const server = http.Server(app);
const io = socketIO(server);

setUpSocket();

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

function setUpSocket() {
    //TODO: Refactor into separate service.
    io.on('connection', socket => {
        console.log('Connection Received');
        socket.emit('connected', 'PENIS');

        socket.on('disconnect', () => {
            console.log('Connection Terminated');
        });

        let sortedNonprofits;
        socket.on('getInfo', () => {
            socket.emit('getInfoProgress', {
                percent: 0,
                message: 'Retrieving Patrons...'
            });
            retrieval.getPatrons()
                .then(patrons => {
                    socket.emit('getInfoProgress', {
                        percent: 50,
                        message: `Retrieval Complete.\n${patrons.total} Patrons found.\nSorting Patrons by nonprofit...`
                    });
                    return patrons.results;
                })
                .catch(error => {
                    throw ProcessError(401, stages.RETRIEVAL, JSON.stringify(error));
                })
                .then(processing.sortPatronsByNonprofit)
                .then(sorted => {
                    socket.emit('getInfoProgress', {
                        percent: 100,
                        message: `Sorting Complete.\n${sorted.length} unique Nonprofits found.\nSending you the overview...`
                    });
                    return sorted;
                })
                .then(sorted => {
                    sortedNonprofits = sorted;
                    return sorted;
                })
                .then(utils.extractNonprofitInfo)
                .then(briefNonprofits => {
                    socket.emit('briefNonprofits', briefNonprofits);
                });
        });

        //If extra details for a particular nonprofit (including patron list) is requested
        socket.on('getNonprofitDetails', index => {
            socket.emit('nonprofitDetails', sortedNonprofits[index]);
        });

        socket.on('excludeNonprofit', index => {
            sortedNonprofits[index].exclude = true;
            socket.emit('nonprofitExcluded', index);
        });

        socket.on('includeNonprofit', index => {
            sortedNonprofits[index].exclude = false;
            socket.emit('nonprofitIncluded', index);
        });

        socket.on('updateNonprofit', (index, info) => {
            sortedNonprofits[index] = Object.assign(sortedNonprofits[index], info);
            briefNonprofits[index] = Object.assign(briefNonprofits[index], info);
            socket.emit('nonprofitUpdated', {
                index,
                newDetails: briefNonprofits[index]  
            });
        });

        socket.on('excludePatron', (nonprofitIndex, patronIndex) => {
            //TODO: Check this field, make sure it's accurate
            sortedNonprofits[nonprofitIndex].patrons[patronIndex].exclude = true;
        });

        socket.on('includePatron', (nonprofitIndex, patronIndex) => {
            sortedNonprofits[nonprofitIndex].patrons[patronIndex].exclude = false;
        })

        socket.on('sendOne', index => {
            mailer.sendCIR(sortedNonprofits[index])
                .then(result => {
                    socket.emit('oneSent', {
                        index: index,
                        success: true,
                        details: result
                    });
                    logger.info(`CIR sent to ${sortedNonprofits[index].organizationName}`);
                })
                .catch(error => {
                    if (error.excluded) {
                        logger.info(`CIR send intentionally excluded by User.`);
                    }
                    else {
                        logger.error(`CIR send FAILED to ${sortedNonprofits[index].organizationName}.\nFull error: ${error}`);
                    }
                    socket.emit('oneSent', {
                        index: index,
                        success: false,
                        intentional: error.excluded,
                        details: error
                    });
                });
        })

        socket.on('sendAll', () => {
            for (let i = 0; i < sortedNonprofits.length; i++) {
                mailer.sendCIR(sortedNonprofits[i])
                    .then(result => {
                        logger.info(`CIR sent. result: ${result}`);
                        socket.emit('sendAllProgress', {
                            percent: ((i + 1) / sortedNonprofits.length) * 100,
                            index: i,
                            success: true,
                            details: result
                        });
                        //Checked by mailer. Exclude this nonprofit from all future sends (just in case)
                        sortedNonprofits[i].exclude = true;
                    })
                    .catch(error => {
                        if (error.excluded) {
                            //Check this field, make sure it is correct
                            logger.info(`Excluded nonprofit ${sortedNonprofits[i].organizationName}. Was either duplicate or intentionally excluded by Admin.`);
                        } else {
                            logger.error(`CIR send FAILED to nonprofit ${sortedNonprofits[i].organizationName}.\nFull Error: ${error}`);
                        }
                        socket.emit(`sendAllProgress`, {
                            percent: ((i + 1) / sortedNonprofits.length) * 100,
                            index: i,
                            success: false,
                            intentional: error.excluded,
                            details: error
                        });
                    })
            }
        })
    });
}