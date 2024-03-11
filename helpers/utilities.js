/* eslint-disable no-plusplus */
/*
 * Title: Utilities
 * Description: Important utility functions
 * Author: Md. Mehedi Hasan
 * Date: 06/03/2024
 *
 */

// dependencies
const crypto = require('crypto');
const environments = require('./environments');

// module scaffolding
const utilities = {};

// parse JSON string to Object
utilities.parseJSON = (jsonString) => {
    let output;
    try {
        output = JSON.parse(jsonString);
    } catch {
        output = {};
    }
    return output;
};

// hash string
utilities.hash = (str) => {
    if (typeof str === 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', environments.secretKey).update(str).digest('hex');
        return hash;
    }

    return null;
};

// create random string
utilities.createRandomString = (strLength) => {
    const length = typeof strLength === 'number' && strLength > 0 ? strLength : null;

    if (length) {
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let output = '';
        for (let i = 1; i <= length; i++) {
            const randomCharacter = possibleCharacters.charAt(
                Math.floor(Math.random() * possibleCharacters.length)
            );
            output = output.concat(randomCharacter);
        }
        return output;
    }
    return null;
};

module.exports = utilities;
