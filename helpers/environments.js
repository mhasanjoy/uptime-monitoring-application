/*
 * Title: Environments
 * Description: Handle all environment related things
 * Author: Md. Mehedi Hasan
 * Date: 05/03/2024
 *
 */

// module scaffolding
const environments = {};

// staging environment
environments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'hasdjkfsdkljfaskj',
    maxChecks: 5,
    twilio: {
        fromPhone: '+13612731928',
        accountSid: 'AC0fcede25316ef3ffefe6abfbd51f0db9',
        authToken: '9868d2e40972b346d1ef84c85d787179',
    },
};

// production environment
environments.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'fjasdkjfaskfjsdaklfj',
    maxChecks: 5,
    twilio: {
        fromPhone: '+13612731928',
        accountSid: 'AC0fcede25316ef3ffefe6abfbd51f0db9',
        authToken: '9868d2e40972b346d1ef84c85d787179',
    },
};

// determine which environment was passed
const currentEnvironment =
    typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

// export corresponding environment object
const environmentToExport =
    typeof environments[currentEnvironment] === 'object'
        ? environments[currentEnvironment]
        : environments.staging;

// export module
module.exports = environmentToExport;
