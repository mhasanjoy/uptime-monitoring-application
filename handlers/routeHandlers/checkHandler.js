/* eslint-disable no-underscore-dangle */
/*
 * Title: Check Handler
 * Description: Handler to handle user defined checks
 * Author: Md. Mehedi Hasan
 * Date: 08/03/2024
 *
 */

// dependencies
const data = require('../../lib/data');
const { parseJSON, createRandomString } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
const { maxChecks } = require('../../helpers/environments');

// module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._check[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._check = {};

handler._check.post = (requestedProperties, callback) => {
    // validate inputs
    const protocol =
        typeof requestedProperties.body.protocol === 'string' &&
        ['http', 'https'].indexOf(requestedProperties.body.protocol) > -1
            ? requestedProperties.body.protocol
            : null;

    const url =
        typeof requestedProperties.body.url === 'string' &&
        requestedProperties.body.url.trim().length > 0
            ? requestedProperties.body.url
            : null;

    const method =
        typeof requestedProperties.body.method === 'string' &&
        ['POST', 'GET', 'PUT', 'DELETE'].indexOf(requestedProperties.body.method) > -1
            ? requestedProperties.body.method
            : null;

    const successCodes =
        typeof requestedProperties.body.successCodes === 'object' &&
        requestedProperties.body.successCodes instanceof Array
            ? requestedProperties.body.successCodes
            : null;

    const timeoutSeconds =
        typeof requestedProperties.body.timeoutSeconds === 'number' &&
        requestedProperties.body.timeoutSeconds % 1 === 0 &&
        requestedProperties.body.timeoutSeconds >= 1 &&
        requestedProperties.body.timeoutSeconds <= 5
            ? requestedProperties.body.timeoutSeconds
            : null;

    if (protocol && url && method && successCodes && timeoutSeconds) {
        // verify token
        const token =
            typeof requestedProperties.headersObject.token === 'string'
                ? requestedProperties.headersObject.token
                : null;

        // lookup the user phone by reading the token
        data.read('tokens', token, (err1, tokenData) => {
            if (!err1 && tokenData) {
                const userPhone = parseJSON(tokenData).phone;

                // lookup the user
                data.read('users', userPhone, (err2, userData) => {
                    if (!err2 && userData) {
                        tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                const userObject = parseJSON(userData);
                                const userChecks =
                                    typeof userObject.checks === 'object' &&
                                    userObject.checks instanceof Array
                                        ? userObject.checks
                                        : [];

                                if (userChecks.length < maxChecks) {
                                    const checkId = createRandomString(20);
                                    const checkObject = {
                                        id: checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutSeconds,
                                    };

                                    // save the object
                                    data.create('checks', checkId, checkObject, (err3) => {
                                        if (!err3) {
                                            // add check id to the user's object
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);

                                            // save the new user data
                                            data.update('users', userPhone, userObject, (err4) => {
                                                if (!err4) {
                                                    callback(200, checkObject);
                                                } else {
                                                    callback(500, {
                                                        error: 'There was a problem in the server side!',
                                                    });
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                error: 'There was a problem in the server side!',
                                            });
                                        }
                                    });
                                } else {
                                    callback(401, {
                                        error: 'User has already reached max check limit!',
                                    });
                                }
                            } else {
                                callback(403, { error: 'Authentication failed!' });
                            }
                        });
                    } else {
                        callback(404, { error: 'User not found!' });
                    }
                });
            } else {
                callback(403, { error: 'Authentication failed!' });
            }
        });
    } else {
        callback(400, { error: 'There was a problem in your request!' });
    }
};

handler._check.get = (requestedProperties, callback) => {
    const id =
        typeof requestedProperties.queryStringObject.id === 'string' &&
        requestedProperties.queryStringObject.id.trim().length === 20
            ? requestedProperties.queryStringObject.id
            : null;

    if (id) {
        // lookup the check
        data.read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                const token =
                    typeof requestedProperties.headersObject.token === 'string'
                        ? requestedProperties.headersObject.token
                        : null;

                tokenHandler._token.verify(
                    token,
                    parseJSON(checkData).userPhone,
                    (tokenIsValid) => {
                        if (tokenIsValid) {
                            callback(200, parseJSON(checkData));
                        } else {
                            callback(403, { error: 'Authentication failed!' });
                        }
                    }
                );
            } else {
                callback(500, { error: 'There was a problem in the server side!' });
            }
        });
    } else {
        callback(400, { error: 'There was a problem in your request!' });
    }
};

handler._check.put = (requestedProperties, callback) => {
    // validate inputs
    const id =
        typeof requestedProperties.body.id === 'string' &&
        requestedProperties.body.id.trim().length === 20
            ? requestedProperties.body.id
            : null;

    const protocol =
        typeof requestedProperties.body.protocol === 'string' &&
        ['http', 'https'].indexOf(requestedProperties.body.protocol) > -1
            ? requestedProperties.body.protocol
            : null;

    const url =
        typeof requestedProperties.body.url === 'string' &&
        requestedProperties.body.url.trim().length > 0
            ? requestedProperties.body.url
            : null;

    const method =
        typeof requestedProperties.body.method === 'string' &&
        ['POST', 'GET', 'PUT', 'DELETE'].indexOf(requestedProperties.body.method) > -1
            ? requestedProperties.body.method
            : null;

    const successCodes =
        typeof requestedProperties.body.successCodes === 'object' &&
        requestedProperties.body.successCodes instanceof Array
            ? requestedProperties.body.successCodes
            : null;

    const timeoutSeconds =
        typeof requestedProperties.body.timeoutSeconds === 'number' &&
        requestedProperties.body.timeoutSeconds % 1 === 0 &&
        requestedProperties.body.timeoutSeconds >= 1 &&
        requestedProperties.body.timeoutSeconds <= 5
            ? requestedProperties.body.timeoutSeconds
            : null;

    if (id) {
        if (protocol || url || method || successCodes || timeoutSeconds) {
            data.read('checks', id, (err1, checkData) => {
                if (!err1 && checkData) {
                    const checkObject = parseJSON(checkData);
                    const token =
                        typeof requestedProperties.headersObject.token === 'string'
                            ? requestedProperties.headersObject.token
                            : null;

                    tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) => {
                        if (tokenIsValid) {
                            if (protocol) {
                                checkObject.protocol = protocol;
                            }
                            if (url) {
                                checkObject.url = url;
                            }
                            if (method) {
                                checkObject.method = method;
                            }
                            if (successCodes) {
                                checkObject.successCodes = successCodes;
                            }
                            if (timeoutSeconds) {
                                checkObject.timeoutSeconds = timeoutSeconds;
                            }

                            // store the check object
                            data.update('checks', id, checkObject, (err2) => {
                                if (!err2) {
                                    callback(200);
                                } else {
                                    callback(500, {
                                        error: 'There was problem in the server side!',
                                    });
                                }
                            });
                        } else {
                            callback(403, { error: 'Authentication failed!' });
                        }
                    });
                } else {
                    callback(500, { error: 'There was problem in the server side!' });
                }
            });
        } else {
            callback(400, { error: 'You must provide at least one field to update!' });
        }
    } else {
        callback(400, { error: 'There was a problem in your request!' });
    }
};

handler._check.delete = (requestedProperties, callback) => {
    const id =
        typeof requestedProperties.queryStringObject.id === 'string' &&
        requestedProperties.queryStringObject.id.trim().length === 20
            ? requestedProperties.queryStringObject.id
            : null;

    if (id) {
        // lookup the check
        data.read('checks', id, (err1, checkData) => {
            if (!err1 && checkData) {
                const token =
                    typeof requestedProperties.headersObject.token === 'string'
                        ? requestedProperties.headersObject.token
                        : null;

                tokenHandler._token.verify(
                    token,
                    parseJSON(checkData).userPhone,
                    (tokenIsValid) => {
                        if (tokenIsValid) {
                            data.delete('checks', id, (err2) => {
                                if (!err2) {
                                    data.read(
                                        'users',
                                        parseJSON(checkData).userPhone,
                                        (err3, userData) => {
                                            if (!err3 && userData) {
                                                const userObject = parseJSON(userData);
                                                const userChecks =
                                                    typeof userObject.checks === 'object' &&
                                                    userObject.checks instanceof Array
                                                        ? userObject.checks
                                                        : [];

                                                // remove the deleted check id from user's list of checks
                                                const checkPosition = userChecks.indexOf(id);
                                                if (checkPosition > -1) {
                                                    userChecks.splice(checkPosition, 1);
                                                    // resave the user data
                                                    userObject.checks = userChecks;
                                                    data.update(
                                                        'users',
                                                        userObject.phone,
                                                        userObject,
                                                        (err4) => {
                                                            if (!err4) {
                                                                callback(200);
                                                            } else {
                                                                callback(500, {
                                                                    error: 'There was a problem in the server side!',
                                                                });
                                                            }
                                                        }
                                                    );
                                                } else {
                                                    callback(500, {
                                                        error: "The check id that you're trying to remove is not found in user!",
                                                    });
                                                }
                                            } else {
                                                callback(500, {
                                                    error: 'There was a problem in the server side!',
                                                });
                                            }
                                        }
                                    );
                                } else {
                                    callback(500, {
                                        error: 'There was a problem in the server side!',
                                    });
                                }
                            });
                        } else {
                            callback(403, { error: 'Authentication failed!' });
                        }
                    }
                );
            } else {
                callback(500, { error: 'There was a problem in the server side!' });
            }
        });
    } else {
        callback(400, { error: 'There was a problem in your request!' });
    }
};

module.exports = handler;
