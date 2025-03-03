import * as dotenv from 'dotenv';
import app from './server.js';
import http from 'http';
dotenv.config();

// Create HTTP server
const server = http.createServer(app);

// Enable socket reuse
server.on('listening', () => {
    server.listening && server._connectionKey && 
    server._handle && server._handle.setKeepAlive(true);
});

// Function to try different ports
const tryPort = (port, maxAttempts = 10) => {
    let attempts = 0;
    
    const attemptListen = (currentPort) => {
        attempts++;
        
        server.listen(currentPort)
            .on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    console.log(`Port ${currentPort} is busy, trying ${currentPort + 1}`);
                    if (attempts < maxAttempts) {
                        attemptListen(currentPort + 1);
                    } else {
                        console.error(`Failed to find an available port after ${maxAttempts} attempts`);
                        process.exit(1);
                    }
                } else {
                    console.error('Server error:', err);
                    process.exit(1);
                }
            })
            .on('listening', () => {
                console.log(`Server is running on http://localhost:${currentPort}`);
                // Update the PORT in process.env so other parts of the app can use it
                process.env.PORT = currentPort;
            });
    };
    
    attemptListen(parseInt(port, 10));
};

// Start server with port retry logic
tryPort(process.env.PORT || 5000);

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    server.close(() => {
        process.exit(1);
    });
});