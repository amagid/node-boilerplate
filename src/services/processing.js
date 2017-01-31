'use strict';

const retrieval = require('./retrieval');
const logger = require('./logger');
const Promise = require('bluebird');

module.exports = {
    sortPatronsByNonprofit
};

/**
 * Sorts patrons by their selected nonprofits. One patron may be sorted
 * into many nonprofits (since they can have more than one selected nonprofit.)
 * 
 * @param {Array<Object>} patrons
 * @returns {Promise<Array<Object>>} An array of all unique nonprofits found with their patrons, wrapped in a promise.
 */
function sortPatronsByNonprofit(patrons) {
    const nonprofitsArray = [];
    let storedNonprofit;
    let currentNonprofit;
    let currentPatron;
    let promises = [];

    //For each patron,
    for (let i = 0; i < patrons.length; i++) {
        //For each nonprofit that patron has currently selected,
        currentPatron = patrons[i];
        for (let j = 0; j < currentPatron.selectedNonprofits.length; j++) {
            //Check if that nonprofit is already in the Array
            currentNonprofit = currentPatron.selectedNonprofits[j];
            storedNonprofit = _findNonprofit(nonprofitsArray, currentNonprofit.nonprofitId);
            //If it is, update its patrons
            if (storedNonprofit) {
                _addPatron(storedNonprofit, currentPatron, currentNonprofit.billing);
                //Otherwise, add it to the array with this patron
            } else {
                promises.push(_createNonprofit(nonprofitsArray, currentNonprofit, currentPatron));
            }
        }
    }

    //Wait for all retrieval promises to resolve
    return Promise.all(promises)
        .then(() => {
            //Return nonprofitsArray
            return nonprofitsArray;
        })
        .catch(error => {
            logger.error(error);
            //return nonprofitsArray, but maintain rejected status.
            return Promise.reject(nonprofitsArray);
        });
}

/**
 * Retrieves a nonprofit by id from the existing nonprofitsArray.
 * Returns null if not found.
 * 
 * @param {Array<Object>} nonprofits The current nonprofitsArray
 * @param {String} id The ID to search for
 * 
 * @return {Object} The nonprofit, if found
 */
function _findNonprofit(nonprofits, id) {
    for (let i = 0; i < nonprofits.length; i++) {
        if (nonprofits[i].id === id) {
            return nonprofits[i];
        }
    }
    return null;
}

/**
 * Creates a new nonprofit in the nonprofitsArray
 * 
 * @param {Array<Object>} nonprofits
 * @param {Object} nonprofit
 * @param {Object} patron
 */
function _createNonprofit(nonprofitsArray, nonprofit, patron) {
    const createdNonprofit = {
        id: nonprofit.nonprofitId,
        patrons: []
    };

    nonprofitsArray.push(createdNonprofit);
    _addPatron(createdNonprofit, patron, nonprofit.billing);

    return retrieval.getNonprofitDetails(nonprofit.nonprofitId).then(deets => {
        _updateNonprofit(createdNonprofit, deets);
    }).catch(error => {
        logger.warn(error);
        _updateNonprofit(createdNonprofit, { error: true });
    });
}

/**
 * Adds a patron to a particular nonprofit
 * 
 * @param {Object} nonprofit The nonprofit to update
 * @param {Object} patron The patron to add
 * @param {Object} billing The giveback information for this patron-nonprofit combo
 */
function _addPatron(nonprofit, patron, billing) {
    const createdPatron = {
        patronData: patron
    };

    if (billing) {
        createdPatron.giveback = billing;
    } else {
        createdPatron.giveback = {
            lifetime: 0,
            yearToDate: 0
        };
    }

    nonprofit.patrons.push(createdPatron);
}

/**
 * Updates a nonprofit with details from the BigPie app
 * 
 * @param {Object} nonprofit The original nonprofit
 * @param {Object} updates The new details to add / update
 */
function _updateNonprofit(nonprofit, updates) {
    Object.assign(nonprofit, updates);
}