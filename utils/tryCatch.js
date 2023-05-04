module.exports =
  (fn) =>
   (...args) => {
    try {
      return  fn(...args);
    } catch (err) {
      return err;
    }
  };
