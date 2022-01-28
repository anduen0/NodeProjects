const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  console.log('handleCastErrorDB');
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const message = `Duplicate field value: ${
    err.keyValue.name
  }. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Message input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  console.log('sendErrorProd');
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    console.log('Error', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

module.exports = (err, req, res, next) => {
  //   console.log(err.stack);
  console.log('TEST');
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    console.log('DEV');
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production ') {
    let error = err;

    if (err.name === 'CastError') {
      error = handleCastErrorDB(err);
    }

    if (err.code === 11000) error = handleDuplicateFieldsDB(err);

    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);

    sendErrorProd(error, res);

    // console.log({ err });

    // res.status(500).json({
    //   status: 'error',
    //   err: error,
    //   message: 'Something went wrong'
    // });
  }
};
