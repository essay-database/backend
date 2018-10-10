function createError(status, message, next) {
    const error = new Error(message);
    error.status = status;
    if (next) next(error);
    else return error
  }

  module.exports = {
      createError
  }