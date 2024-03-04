/*
 * Title: Routes
 * Description: Application Routes
 * Author: Md. Mehedi Hasan
 * Date: 04/03/2024
 *
 */

// dependencies
const { sampleHandler } = require('./handlers/routeHandlers/sampleHandler');

const routes = {
    sample: sampleHandler,
};

module.exports = routes;
