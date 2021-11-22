require('dotenv').config();
const PORT = process.env.PORT || 5000;
var SwaggerUI = require('swagger-ui-express');
const SwaggerJSDoc = require('swagger-jsdoc');

var swaggerOption = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "HR Telegram bot API documentation",
            version: "1.0.0",
            description: "Руководство по использованию REST методов для HR инструментария"
        },
        servers: [{
            url: "http://localhost:" + PORT + "/api/"
        }]
    },
    apis: ["./docs.swagger"]
}
var swaggerDocSpecs = SwaggerJSDoc(swaggerOption);

module.exports = {
    SwaggerUI,
    swaggerDocSpecs
};