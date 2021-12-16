const AuthService = require('./authService');

class AuthController {
    async authenticateRequest(req, res){
        var userId = req.cookies.hr_id ? req.cookies.hr_id : req.query.id;
        const authUrl = await AuthService.createRedirectUrl(userId);
        res.redirect(authUrl);
    }

    async authenticateResponse(req, res){
        await AuthService.handleMicrosoftRepsponse(req);
        res.redirect(process.env.FRONTEND_IIS_ADDRESS + '/users');
    }
}

module.exports = new AuthController();