'use strict';
const request = require('request-promise');
const config = require('../../config');

module.exports = {
    getPatrons,
    getNonprofitDetails
};

/**
 * Gets all patrons from the BigPie database.
 * 
 * @returns Promise<Object> The list of Patrons
 */
function getPatrons() {
    const pageAmount = 10;
    const options = {
        filter: {
            fields: []
        },
        sort: {
            by: 'createdAt',
            asc: false
        },
        query: {},
        pageAmount
    }
    const withCreationSource = true;
    const withEmail = true;
    
    return request({
        uri: 'https://admin-server.bigpie.com/patrons/page',
        qs: {
            options: JSON.stringify(options),
            pageAmount,
            withCreationSource,
            withEmail
        },
        json: true,
        headers: {
            Authorization: `Bearer ${config.get().bigPie.token}`
        }
    });
}

/**
 * Gets detailed information about a nonprofit.
 * 
 * @param {String} id The ID of the nonprofit to search for
 * @returns Promise<Object> The nonprofit details
 */
function getNonprofitDetails(id) {
    return request({
        uri: `https://app-server.bigpie.com/nonprofits/${id}`,
        json: true
    });
}