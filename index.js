/*
 * Title: Uptime Monitoring Application
 * Description: A RESTful API to monitor up or down time of user defined links
 * Author: Md. Mehedi Hasan
 * Date: 04/03/2024
 *
 */

// dependencies
const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');
const environments = require('./helpers/environments');

// app object - module scaffolding
const app = {};

// create server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(environments.port, () => {
        console.log(`listening to port ${environments.port}`);
    });
};

// handle Request & Response
app.handleReqRes = handleReqRes;

// start the server
app.createServer();
