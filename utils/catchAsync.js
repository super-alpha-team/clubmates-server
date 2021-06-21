/* eslint-disable promise/no-callback-in-promise */
module.exports = (fn) => (request, response, next) => fn(request, response, next).catch(next);
