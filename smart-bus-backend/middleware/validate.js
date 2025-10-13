import Joi from 'joi';

export const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  req.body = value;
  next();
};

export default { validateBody };
