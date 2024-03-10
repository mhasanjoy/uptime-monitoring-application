/*
 * Title: Server library
 * Description: Server related files
 * Author: Md. Mehedi Hasan
 * Date: 10/03/2024
 *
 */

// dependencies
const http = require('http');
const { handleReqRes } = require('../helpers/handleReqRes');
const environments = require('../helpers/environments');

// server object - module scaffolding
const server = {};

// create server
server.createServer = () => {
    const createServerVariable = http.createServer(server.handleReqRes);
    createServerVariable.listen(environments.port, () => {
        console.log(`listening to port ${environments.port}`);
    });
};

// handle Request & Response
server.handleReqRes = handleReqRes;

// start the server
server.init = () => {
    server.createServer();
};

// export the server
module.exports = server;
