const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  console.error("----- ERROR TRACE -----");
  console.error(err.stack);
  console.error("-----------------------");
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    return res.status(404).json({ success: false, message });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value for field: ${field}`;
    return res.status(400).json({ success: false, message });
  }
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    return res.status(400).json({ success: false, message });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size cannot exceed 10MB',
    });
  }
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    stack: err.stack
  });
};

module.exports = errorHandler;
