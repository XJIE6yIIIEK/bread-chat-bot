require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
var http = require('http');
var https = require('https');
var fs = require('fs');
const HTTP_PORT = process.env.HTTP_PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 5001;

var CalendarReciever = require('./core/calendar/handlers/calendarReciever/calendar');
const sequelize = require('./core/db/db');
const models = require('./core/db/models');
const AuthRouter = require('./api/routes/authRouter');
const MSAL = require('./core/auth/auth');
const dbInit = require('./core/db/dbInit');

//=================================
var httpServer;
var httpsServer;

var privateKey = fs.readFileSync('key.pem', 'utf8');
var certificate = fs.readFileSync('cert.pem', 'utf8');

var credentials = {
    key: privateKey,
    cert: certificate
};
//=================================

var app = express();

MSAL.initialize();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});
app.use(cookieParser());
app.use('/auth', AuthRouter);
//app.use('/api', router);

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

        dbInit();

        CalendarReciever.initialize();
    } catch(e) {
        throw e;
    }
}

start();