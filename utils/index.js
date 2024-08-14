import os from 'os';

export const rqListener = (PORT) => {
    console.log(`
        Server is listening on port ${PORT}!
        Operating System: ${os.type()},
        CPU Architecture: ${os.arch()},
        Network Interface: ${os.networkInterfaces()},
        Hostname: ${os.hostname()}
    `);
}

export const generateApiKey = () => {
    return [...Array(30)]
            .map(e => (Math.random() * 36 | 0).toString(36))
            .join('')
}

export const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const isAllowed = allowedMimeTypes.includes(file.mimetype);
    cb(null, isAllowed);
};

export const verifyCallback = (accessToken, refreshToken, profile, done) => {
    done(null, profile, accessToken);
} 

export const generateToken = (user) => {
    return jwt.sign({
        userId: user._id.toString(),
        email: user.email,
        role: user.role
    }, process.env.JWTSecretKey, {
        expiresIn: '24h'
    });
}

export const handleError = (res, error) => {
    if (!error.statusCode) {
        error.statusCode = 500;
    }

    return res.status(error.statusCode).json({ 
        success: false,
        message: error.message 
    });
}