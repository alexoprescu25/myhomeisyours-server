import createError from 'http-errors';

export const isAdmin = (req, res, next) => {
    const role = req.role;
    
    try {
        if (!role || role !== 'masteradmin') {
            throw new createError(
                401,
                'Permission denied.',
                { expose: true }
            )
        }
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