import Joi from "joi";

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),
};

export const refreshTokenSchema = {
  header: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};
export const signupSchema = {
  body: Joi.object({
    name: Joi.string().required(),
    // lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).regex(/[A-Z]/).regex(/[0-9]/).required(),
    phone: Joi.string()
      .pattern(/^\d{10}$/)
      .required(),
    role: Joi.string().valid("admin", "customer").required(),
  }),
};

export const deActivateUser = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

export const getUser = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};
