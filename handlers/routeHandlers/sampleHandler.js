/*
 * Title: Sample Handler
 * Description: Sample Handler
 * Author: Md. Mehedi Hasan
 * Date: 04/03/2024
 *
 */
// module scaffolding
const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
    callback(200, {
        message: 'This is a sample url',
    });
};

module.exports = handler;
