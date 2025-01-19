export const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'PrismaClientKnownRequestError') {
        if (err.code === 'P2002') {
            return res.status(409).json({ 
                message: 'A record with this value already exists' 
            });
        }
    }

    res.status(err.status || 500).json({
        message: err.message || 'Internal server error'
    });
}; 