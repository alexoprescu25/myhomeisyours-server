import jwt from 'jsonwebtoken';
import createError from 'http-errors';

export const isAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];

        if (!token) {
            throw new createError(
                401,
                'No authentication token, authorization denied.',
                { expose: true }
            )
        }

        const decodedToken = jwt.verify(token, process.env.JWTSecretKey);

        if (!decodedToken) {
            throw new createError(
                401,
                'Token verification failed, authorization denied.',
                { expose: true }
            )
        }

        req.userId = decodedToken.userId;
        req.role = decodedToken.role;
        next();
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        res.status(err.statusCode).json({
            jwtExpired: true, 
            message: err.message 
        }); 
    }
}