require('dotenv').config();
const bcrypt = require('bcrypt');
const jwttoken = require('jsonwebtoken');
const UserRepository = require('../objects/users/usersRepository');

class AuthService {
    async verifyPass(hashedPass, pass){
        return bcrypt.compareSync(pass, hashedPass);
    }

    async verifyToken(token, tokenType, id, callbacks){
        jwttoken.verify(
            token,
            process.env.JWT_SECRET_WORD,
            function(err, data) {
                //Токен не валиден
                if(err && err.name != 'TokenExpiredError'){
                    return callbacks.tokenError();
                }

                var userId = (tokenType == 's_access_token') ? data.id : id;

                //Нет принадлежности токена к юзеру
                if(userId == null){
                    return callbacks.tokenError();
                }

                var writenToken = await UserRepository.get({
                    attributes: [
                        tokenType
                    ],
                    where: {
                        id: data.id
                    }
                });

                //Нет такого пользователя в базе или токен пользователя отозван
                if(!writenToken || writenToken[tokenType] != token){
                    return callbacks.tokenError();
                }

                if(err){
                    return callbacks.timeExpired(data);
                } else {
                    return callbacks.allClear(data);
                }
            }
        );
    }

    async generateToken(payload, tokenType, userId){
        var user = await UserRepository.get({
            where: {
                id: userId
            }
        });

        var token = jwttoken.sign(
            payload,
            (tokenType == 'access' ? process.env.JWT_ACCESS_SECRET_WORD : process.env.JWT_REFRESH_SECRET_WORD), 
            {
                expiresIn: (tokenType == 'access' ? process.env.JWT_ACCESS_EXPIRE_TIME : process.env.JWT_REFRESH_EXPIRE_TIME)
            }
        );

        if(tokenType == 'access'){
            user.s_access_token = token;
        } else {
            user.s_refresh_token = token;
        }

        await UserRepository.patch(user);

        return token;
    }

    async hashPass(pass){
        var hashedPass = bcrypt.hashSync(pass, 3);
        return hashedPass;
    }
}

module.exports = new AuthService();