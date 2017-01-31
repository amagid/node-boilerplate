'use strict';

module.exports = {
    extractNonprofitInfo
};

function extractNonprofitInfo(nonprofits) {
    const briefNonprofitsArray = [];

    for (let i = 0; i < nonprofits.length; i++) {
        briefNonprofitsArray.push({
            displayName: nonprofits[i].displayName,
            donated: nonprofits[i].donated,
            npType: nonprofits[i].npType,
            organizationName: nonprofits[i].organizationName,
            registrationProgress: nonprofits[i].registrationProgress,
            slug: nonprofits[i].slug,
            websiteURL: nonprofits[i].websiteURL
        });
    }

    return briefNonprofitsArray;
}