export const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Server error' });
};

export default { errorHandler };
