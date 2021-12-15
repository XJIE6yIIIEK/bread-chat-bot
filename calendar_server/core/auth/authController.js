const MSAL = require('./auth');
const AuthService = require('./authService');

class AuthController {
    async authenticateRequest(req, res){
        //req.cookies.hr_id
        const authUrl = await AuthService.createRedirectUrl(req.query.id);
        res.redirect(authUrl);
    }

    async authenticateResponse(req, res){
        await AuthService.handleMicrosoftRepsponse(req);
        res.redirect(process.env.FRONTEND_IIS_ADDRESS + '/users');
    }
}

module.exports = new AuthController();