/*
 * Title: Workers library
 * Description: Workers related files
 * Author: Md. Mehedi Hasan
 * Date: 10/03/2024
 *
 */

// dependencies
const url = require('url');
const http = require('http');
const https = require('https');
const data = require('./data');
const { parseJSON } = require('../helpers/utilities');
const { sendTwilioSMS } = require('../helpers/notifications');

// workers object - module scaffolding
const workers = {};

// lookup all the checks
workers.gatherAllChecks = () => {
    // get all the checks
    data.list('checks', (err1, checks) => {
        if (!err1 && checks && checks.length > 0) {
            checks.forEach((check) => {
                // read the check data
                data.read('checks', check, (err2, checkData) => {
                    if (!err2 && checkData) {
                        // pass the data to the check validator
                        workers.validateCheckData(parseJSON(checkData));
                    } else {
                        console.log('Error: reading one of the check data!');
                    }
                });
            });
        } else {
            console.log('Error: could not find any check to process!');
        }
    });
};

// validate individual check data
workers.validateCheckData = (checkData) => {
    const originalData = checkData;

    if (originalData && originalData.id) {
        originalData.state =
            typeof originalData.state === 'string' &&
            ['up', 'down'].indexOf(originalData.state) > -1
                ? originalData.state
                : 'down';

        originalData.lastChecked =
            typeof originalData.lastChecked === 'number' && originalData.lastChecked > 0
                ? originalData.lastChecked
                : false;

        // pass to the next process
        workers.performCheck(originalData);
    } else {
        console.log('Error: check was invalid or not properly formatted!');
    }
};

// perform check
workers.performCheck = (checkData) => {
    // prepare the initial check outcome
    let checkOutcome = {
        error: false,
        responseCode: false,
    };
    // mark the outcome has not been sent yet
    let outcomeSent = false;

    // parse the url form check data
    const parsedUrl = url.parse(`${checkData.protocol}://${checkData.url}`, true);
    const { hostname, path } = parsedUrl;

    // construct the request
    const requestDetails = {
        protocol: `${checkData.protocol}:`,
        hostname,
        path,
        method: checkData.method.toUpperCase(),
        timeout: checkData.timeoutSeconds * 1000,
    };

    const protocolToUse = checkData.protocol === 'http' ? http : https;

    const req = protocolToUse.request(requestDetails, (res) => {
        // grab the status of the response
        const status = res.statusCode;

        // update the check outcome and pass to the next process
        checkOutcome.responseCode = status;
        if (!outcomeSent) {
            workers.processCheckOutcome(checkData, checkOutcome);
            outcomeSent = true;
        }
    });

    req.on('error', (err) => {
        // update the check outcome and pass to the next process
        checkOutcome = {
            error: true,
            value: err,
        };
        if (!outcomeSent) {
            workers.processCheckOutcome(checkData, checkOutcome);
            outcomeSent = true;
        }
    });

    req.on('timeout', () => {
        // update the check outcome and pass to the next process
        checkOutcome = {
            error: false,
            value: 'timeout',
        };
        if (!outcomeSent) {
            workers.processCheckOutcome(checkData, checkOutcome);
            outcomeSent = true;
        }
    });

    req.end();
};

// save check outcome to database
workers.processCheckOutcome = (checkData, checkOutcome) => {
    // check if check outcome is up or down
    const state =
        !checkOutcome.error &&
        checkOutcome.responseCode &&
        checkData.successCodes.indexOf(checkOutcome.responseCode) > -1
            ? 'up'
            : 'down';

    // decide whether we should alert the user or not
    const alertWanted = !!(checkData.lastChecked && checkData.state !== state);

    // update the check data
    const newCheckData = checkData;
    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    data.update('checks', newCheckData.id, newCheckData, (err) => {
        if (!err) {
            if (alertWanted) {
                // send check data to next process
                workers.alertUserToStatusChange(newCheckData);
            } else {
                console.log('Alert is not needed as there is no state change!');
            }
        } else {
            console.log('Error: trying to save check data of one of the checks!');
        }
    });
};

// send notification sms to user if state changes
workers.alertUserToStatusChange = (checkData) => {
    const msg = `Alert: Your check for ${checkData.method} ${checkData.protocol}://${checkData.url} is currently ${checkData.state}!`;

    sendTwilioSMS(checkData.userPhone, msg, (err) => {
        if (!err) {
            console.log(`User was alerted to a status change via SMS ${msg}`);
        } else {
            console.log('There was a problem sending sms to one of the user!');
        }
    });
};

// timer to execute the workers process once per minute
workers.loop = () => {
    setInterval(() => {
        workers.gatherAllChecks();
    }, 1000 * 60);
};

// start the workers
workers.init = () => {
    // execute all the checks
    workers.gatherAllChecks();
    // call the loop so that checks continue
    workers.loop();
};

// export the workers
module.exports = workers;
