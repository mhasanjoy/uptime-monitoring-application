/*
 * Title: Routes
 * Description: Application Routes
 * Author: Md. Mehedi Hasan
 * Date: 04/03/2024
 *
 */

// dependencies
const { userHandler } = require('./handlers/routeHandlers/userHandler');
const { tokenHandler } = require('./handlers/routeHandlers/tokenHandler');
const { checkHandler } = require('./handlers/routeHandlers/checkHandler');

const routes = {
    user: userHandler,
    token: tokenHandler,
    check: checkHandler,
};

module.exports = routes;
