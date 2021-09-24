require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const ErrorHandlerMiddleware = require('./core/middlewares/errorMiddleware');
const {SwaggerUI, swaggerDocSpecs} = require('./api/v1/docs/swaggerOptions');
const PORT = process.env.PORT || 5000;

//Global modules init
const router = require('./api/v1/routes/routes');
const sequelize = require('./core/db/db');
const models = require('./core/db/models');
//===================

var app = express();

app.use(express.json());
app.use(cookieParser());
app.use(ErrorHandlerMiddleware);
app.use('/api/v1', router);
app.use('/api/v1/docs', SwaggerUI.serve, SwaggerUI.setup(swaggerDocSpecs));

var start = () => {
    try {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch(e) {
        throw e;
    }
}

start();