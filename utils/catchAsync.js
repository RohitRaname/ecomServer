/* eslint-disable camelcase */


module.exports = (fn) => {
  // Why we did the way we did ?
  // - to make behave synchonously in routes
  // - to catch err and pass it to global error handler
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
