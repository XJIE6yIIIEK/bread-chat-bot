require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const {SwaggerUI, swaggerDocSpecs} = require('./api/v1/docs/swaggerOptions');

//Global modules init
const router = require('./api/v1/routes/routes');
const sequelize = require('./core/db/db');
const models = require('./core/db/models');
const BotReciever = require('./core/botHandler/botReciever/botReciever');
const BotTransmitter = require('./core/botHandler/botTransmitter/botTransmitter');
const ErrorHandlerMiddleware = require('./core/middlewares/errorMiddleware');
//===================

var app = express();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});
app.use(cookieParser());
app.use('/api/v1', router);
app.use('/api/v1/docs', SwaggerUI.serve, SwaggerUI.setup(swaggerDocSpecs));
app.use(ErrorHandlerMiddleware);


var start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();

        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

        BotReciever.initialize();
        BotTransmitter.initialize();
    } catch(e) {
        throw e;
    }
}

start();