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
        } else {
            // Multipart clients may send each form field directly instead of
            // nesting them in a JSON `data` field. Preserve those fields.
            req.body = req.body ?? {};
        }
        next();
    } catch (error) {
        console.error("PARSE ERROR ON:", req.body.data);
        next(new AppError('Invalid JSON format in data field', httpStatus.BAD_REQUEST));
    }
};
export default parseData;
