import * as dotenv from 'dotenv';
import app from './server.js';
dotenv.config();


app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});