require('dotenv').config();
const bcrypt = require('bcrypt');
const jwttoken = require('jsonwebtoken');

class AuthService {
    async verifyPass(hashedPass, pass){
        return bcrypt.compareSync(pass, hashedPass);
    }

    async verifyToken(token){
        return jwttoken.verify(
            token,
            process.env.JWT_SECRET_WORD
        );
    }

    async generateToken(payload){
        return jwttoken.sign(
            payload,
            process.env.JWT_SECRET_WORD, {
                expiresIn: process.env.JWT_EXPIRE_TIME
            }
        );
    }

    async hashPass(pass){
        var hashedPass = bcrypt.hashSync(pass, 3);
        return hashedPass;
    }
}

module.exports = new AuthService();