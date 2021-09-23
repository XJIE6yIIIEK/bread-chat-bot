require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const ErrorHandlerMiddleware = require('./core/middlewares/errorMiddleware');
const SwaggerUI = require('./api/v1/docs/swaggerOptions');
const PORT = process.env.PORT || 5000;

var app = express();

app.use(express.json());
app.use(cookieParser());
app.use(ErrorHandlerMiddleware);
app.use('/api/v1');

var start = () => {
    try {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch(e) {
        throw e;
    }
}

start();