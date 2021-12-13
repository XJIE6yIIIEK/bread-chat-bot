require('dotenv').config();
const https = require('https');
const http = require('http');
const fs = require('fs');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const HTTP_PORT = process.env.HTTP_PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 5001;
const {SwaggerUI, swaggerDocSpecs} = require('./api/v1/docs/swaggerOptions');

//Global modules init
const router = require('./api/v1/routes/routes');
const sequelize = require('./core/db/db');
const models = require('./core/db/models');
const BotReciever = require('./core/botHandler/botReciever/botReciever');
const BotTransmitter = require('./core/botHandler/botTransmitter/botTransmitter');
const BotCalendarTransmittrer = require('./core/botHandler/botCalendarTransmitter/botCalendarTransmitter');
const CalendarTransmitter = require('./core/calendarHandler/calendarTransmitter');
const ErrorHandlerMiddleware = require('./core/middlewares/errorMiddleware');
const dbInitialization = require('./core/db/dbInit');
//===================

//===================
var httpServer;
var httpsServer;

var privateKey = fs.readFileSync('key.pem', 'utf8');
var certificate = fs.readFileSync('cert.pem', 'utf8');

var credentials = {
    key: privateKey,
    cert: certificate
};
//===================

var app = express();

app.use(cors());
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.header('Access-Control-Expose-Headers', 'Set-Cookie');
    res.header('Access-Control-Allow-Credentials', true);
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

        httpServer = http.createServer(app);
        httpServer.listen(HTTP_PORT);

        httpsServer = https.createServer(credentials, app);
        httpsServer.listen(HTTPS_PORT);

        console.log(`HTTP Server running on port ${HTTP_PORT}`);
        console.log(`HTTPS Server running on port ${HTTPS_PORT}`);

        dbInitialization();

        BotReciever.initialize();
        BotTransmitter.initialize();

        BotCalendarTransmittrer.initialize();
        CalendarTransmitter.initialize();
    } catch(e) {
        throw e;
    }
}

start();