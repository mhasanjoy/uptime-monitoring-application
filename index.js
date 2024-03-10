/*
 * Title: Project Initial File
 * Description: Initial file to start the node server and workers
 * Author: Md. Mehedi Hasan
 * Date: 04/03/2024
 *
 */

// dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');

// app object - module scaffolding
const app = {};

app.init = () => {
    // start the server
    server.init();
    // start the workers
    workers.init();
};

app.init();

// export the app
module.exports = app;
