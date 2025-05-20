import Joi from "joi";

export const loginSchema = {
    body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
    })
};

export const addCustomer = {
    body: Joi.object({
        email: Joi.string().email().required(),
        // password: Joi.string().min(8).required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        // externalId: Joi.string().required(),
        centerId: Joi.number().required(),
        groupId: Joi.number().required(),
        locationId: Joi.number().required(),
        phone: Joi.string().pattern(/^\d{10}$/).required(),
    })
};

export const addEmployee = {
    body: Joi.object({
        email: Joi.string().email().required(),
        // password: Joi.string().min(8).required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        // externalId: Joi.string().required(),
        departmentId: Joi.number().required(),
        designationId: Joi.number().required(),
        branchId: Joi.number().required(),
        phone: Joi.string().pattern(/^\d{10}$/).required(),
    })
};

export const addInstructor = {
    body: Joi.object({
        email: Joi.string().email().required(),
        // password: Joi.string().min(8).required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        departmentId: Joi.number().required(),
        designationId: Joi.number().required(),
        branchId: Joi.number().required(),
        phone: Joi.string().pattern(/^\d{10}$/).required(),
    })
};

export const refreshTokenSchema = {
    header: Joi.object({
        refreshToken: Joi.string().required(),
    })
};


export const updateCustomer = {
    body: Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        // externalId: Joi.string().required(),
        centerId: Joi.number().required(),
        groupId: Joi.number().required(),
        locationId: Joi.number().required(),
        phone: Joi.string().pattern(/^\d{10}$/).required(),
        email: Joi.string().email().required(),
    }),
    params: Joi.object({
        id: Joi.string().required(),
    })
};

export const updateEmployee = {
    body: Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        // externalId: Joi.string().required(),
        departmentId: Joi.number().required(),
        designationId: Joi.number().required(),
        branchId: Joi.number().required(),
        phone: Joi.string().pattern(/^\d{10}$/).required(),
        email: Joi.string().email().required(),
    }),
    params: Joi.object({
        id: Joi.string().required(),
    })
};

export const updateInstructor = {
    body: Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        phone: Joi.string().pattern(/^\d{10}$/).required(),
        email: Joi.string().email().required(),
        departmentId: Joi.number().required(),
        designationId: Joi.number().required(),
        branchId: Joi.number().required(),
    }),
    params: Joi.object({
        id: Joi.string().required(),
    })
};

export const deActivateUser = {
    params: Joi.object({
        id: Joi.string().required(),
    })
};

export const getUser = {
    params: Joi.object({
        id: Joi.string().required(),
    })
};
