const errHandler = (err, req, res, next) => {
  const statuscode = res.statusCode == 200 ? 500 : res.statusCode;
  res.status(statuscode).json({
    message: err?.message,
    stack: err?.stack,
  });
};

module.exports = {
  errHandler,
};
