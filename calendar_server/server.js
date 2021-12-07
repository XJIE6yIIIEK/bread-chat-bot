require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const PORT = process.env.PORT || 5000;

var app = express();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});
app.use(cookieParser());
app.use('/api/v1', router);
//app.use(ErrorHandlerMiddleware);

var start = async () => {
    try {
        


        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch(e) {
        throw e;
    }
}

start();