import { NextFunction, Request, Response } from 'express';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';

/**
 * Middleware to parse stringified JSON from form-data.
 * This is essential when uploading files alongside text data.
 */
const parseData = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
            next();
        } else {
            // If no data field is sent, we initialize body as empty object 
            // so Zod can at least see an object instead of undefined
            req.body = {};
            next();
        }
    } catch (error) {
        console.error("PARSE ERROR ON:", req.body.data);
        next(new AppError('Invalid JSON format in data field', httpStatus.BAD_REQUEST));
    }
};
export default parseData;