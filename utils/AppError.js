class AppError extends Error {
  constructor(message, statusCode) {
    super();
    this.message = message;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'error' : 'fail';

    // manipulated by me  || yes

    // Operational means that the error made by user and we are returning the erorr to display so that user can know  what mistake he has done

    // Programming error  like network failure and error in code

    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
