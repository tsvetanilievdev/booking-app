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

export const jsonErrorHandler = (err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            message: 'Invalid JSON format',
            details: err.message,
            help: 'Please check your request body format. Make sure all property names and string values are enclosed in double quotes.'
        });
    }
    next(err);
}; 