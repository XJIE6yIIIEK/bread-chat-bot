require('dotenv').config();
const bcrypt = require('bcrypt');
const jwttoken = require('jsonwebtoken');
const Users = require('../objects/users/usersModel');
const UserRepository = require('../objects/users/usersRepository');

class AuthService {
    async verifyPass(pass, hashedPass){
        return bcrypt.compareSync(pass, hashedPass);
    }

    async verifyAccessToken(token, callbacks){
        jwttoken.verify(
            token,
            process.env.JWT_ACCESS_SECRET_WORD,
            async (err, data) => {
                if(err && err.name == 'TokenExpiredError'){
                    return callbacks.timeExpired();
                } else if (err) {
                    return callbacks.tokenError();
                }

                var userId = data.id;

                if(userId == null){
                    return callbacks.tokenError();
                }

                var writtenToken = await UserRepository.get({
                    attributes: [
                        's_access_token'
                    ],
                    where: {
                        id: data.id
                    }
                });

                if(!writtenToken || writtenToken.s_access_token != token){
                    return callbacks.tokenError();
                }
                
                return callbacks.allClear(data);
            }
        );
    }

    async verifyRefreshToken(token, callbacks){
        jwttoken.verify(
            token,
            process.env.JWT_REFRESH_SECRET_WORD,
            async (err, data) => {
                if(err){
                    return callbacks.tokenError();
                }

                var user = await UserRepository.get({
                    where: {
                        s_refresh_token: token
                    }
                });

                if(!user){
                    return callbacks.tokenError();
                }

                return callbacks.allClear(user.id);
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
            (tokenType == 's_access_token' ? process.env.JWT_ACCESS_SECRET_WORD : process.env.JWT_REFRESH_SECRET_WORD), 
            {
                expiresIn: (tokenType == 's_access_token' ? process.env.JWT_ACCESS_EXPIRE_TIME : process.env.JWT_REFRESH_EXPIRE_TIME)
            }
        );

        if(tokenType == 's_access_token'){
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