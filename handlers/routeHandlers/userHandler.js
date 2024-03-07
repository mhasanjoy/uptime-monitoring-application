/* eslint-disable no-underscore-dangle */
/*
 * Title: User Handler
 * Description: Handler to handle user related routes
 * Author: Md. Mehedi Hasan
 * Date: 06/03/2024
 *
 */

// dependencies
const data = require('../../lib/data');
const { hash, parseJSON } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');

// module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._users[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._users = {};

handler._users.post = (requestedProperties, callback) => {
    const firstName =
        typeof requestedProperties.body.firstName === 'string' &&
        requestedProperties.body.firstName.trim().length > 0
            ? requestedProperties.body.firstName
            : null;

    const lastName =
        typeof requestedProperties.body.lastName === 'string' &&
        requestedProperties.body.lastName.trim().length > 0
            ? requestedProperties.body.lastName
            : null;

    const phone =
        typeof requestedProperties.body.phone === 'string' &&
        requestedProperties.body.phone.trim().length === 11
            ? requestedProperties.body.phone
            : null;

    const password =
        typeof requestedProperties.body.password === 'string' &&
        requestedProperties.body.password.trim().length > 0
            ? requestedProperties.body.password
            : null;

    const tosAgreement =
        typeof requestedProperties.body.tosAgreement === 'boolean' &&
        requestedProperties.body.tosAgreement.trim().length > 0
            ? requestedProperties.body.tosAgreement
            : null;

    if (firstName && lastName && phone && password && tosAgreement) {
        // make sure the user doesn't already exist
        data.read('users', phone, (err1) => {
            if (err1) {
                const userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement,
                };

                // store the user to db
                data.create('users', phone, userObject, (err2) => {
                    if (!err2) {
                        callback(200, { message: 'User was created successfully!' });
                    } else {
                        callback(500, { error: 'Could not create user!' });
                    }
                });
            } else {
                callback(500, {
                    error: 'There was a problem in server side!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request!',
        });
    }
};

handler._users.get = (requestedProperties, callback) => {
    // check if the phone number is valid
    const phone =
        typeof requestedProperties.queryStringObject.phone === 'string' &&
        requestedProperties.queryStringObject.phone.trim().length === 11
            ? requestedProperties.queryStringObject.phone
            : null;

    if (phone) {
        // verify token
        const token =
            typeof requestedProperties.headersObject.token === 'string'
                ? requestedProperties.headersObject.token
                : null;

        tokenHandler._token.verify(token, phone, (tokenId) => {
            if (tokenId) {
                // lookup the user
                data.read('users', phone, (err, userData) => {
                    const user = { ...parseJSON(userData) };
                    if (!err && user) {
                        delete user.phone;
                        callback(200, user);
                    } else {
                        callback(404, { error: 'Requested user was not found!' });
                    }
                });
            } else {
                callback(403, { error: 'Authentication failed!' });
            }
        });
    } else {
        callback(404, { error: 'Requested user was not found!' });
    }
};

handler._users.put = (requestedProperties, callback) => {
    const firstName =
        typeof requestedProperties.body.firstName === 'string' &&
        requestedProperties.body.firstName.trim().length > 0
            ? requestedProperties.body.firstName
            : null;

    const lastName =
        typeof requestedProperties.body.lastName === 'string' &&
        requestedProperties.body.lastName.trim().length > 0
            ? requestedProperties.body.lastName
            : null;

    const phone =
        typeof requestedProperties.body.phone === 'string' &&
        requestedProperties.body.phone.trim().length === 11
            ? requestedProperties.body.phone
            : null;

    const password =
        typeof requestedProperties.body.password === 'string' &&
        requestedProperties.body.password.trim().length > 0
            ? requestedProperties.body.password
            : null;

    if (phone) {
        if (firstName || lastName || password) {
            // verify token
            const token =
                typeof requestedProperties.headersObject.token === 'string'
                    ? requestedProperties.headersObject.token
                    : null;

            tokenHandler._token.verify(token, phone, (tokenId) => {
                if (tokenId) {
                    // lookup the user
                    data.read('users', phone, (err1, userData) => {
                        const user = { ...parseJSON(userData) };
                        if (!err1 && user) {
                            if (firstName) {
                                user.firstName = firstName;
                            }
                            if (lastName) {
                                user.lastName = lastName;
                            }
                            if (password) {
                                user.password = hash(password);
                            }

                            // store to db
                            data.update('users', phone, user, (err2) => {
                                if (!err2) {
                                    callback(200, { message: 'User was updated successfully!' });
                                } else {
                                    callback(500, {
                                        error: 'There was a problem in the server side!',
                                    });
                                }
                            });
                        } else {
                            callback(400, { error: 'You have a problem in your request!' });
                        }
                    });
                } else {
                    callback(403, { error: 'Authentication failed!' });
                }
            });
        } else {
            callback(400, { error: 'You have a problem in your request!' });
        }
    } else {
        callback(400, { error: 'Invalid phone number. Please try again!' });
    }
};

handler._users.delete = (requestedProperties, callback) => {
    // check if the phone number is valid
    const phone =
        typeof requestedProperties.queryStringObject.phone === 'string' &&
        requestedProperties.queryStringObject.phone.trim().length === 11
            ? requestedProperties.queryStringObject.phone
            : null;

    if (phone) {
        // verify token
        const token =
            typeof requestedProperties.headersObject.token === 'string'
                ? requestedProperties.headersObject.token
                : null;

        tokenHandler._token.verify(token, phone, (tokenId) => {
            if (tokenId) {
                // lookup the user
                data.read('users', phone, (err1, userData) => {
                    if (!err1 && userData) {
                        data.delete('users', phone, (err2) => {
                            if (!err2) {
                                callback(200, { message: 'User was successfully deleted!' });
                            } else {
                                callback(500, { error: 'There was a server side error!' });
                            }
                        });
                    } else {
                        callback(500, { error: 'There was a server side error!' });
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

module.exports = handler;
