const jwt = require('jsonwebtoken');
const secret_config = require('./secret');
const jwtMiddleware = (req, res, next) => {
    const token = req.headers['x-access-token'] || req.query.token;
    if(!token) {
        return res.status(403).json({
            isSuccess:false,
            code: 403,
            message: '토큰 검증 실패'
        });
    }

    const p = new Promise(
        (resolve, reject) => {
            jwt.verify(token, secret_config.jwtsecret , (err, verifiedToken) => {
                if(err) reject(err);
                resolve(verifiedToken)
            })
        }
    );

    const onError = (error) => {
        res.status(403).json({
            isSuccess:false,
            code: 403,
            message:"토큰 검증 실패"
        });
    };

    p.then((verifiedToken)=>{
        //비밀 번호 바뀌었을 때 검증 부분 추가 할 곳
        req.verifiedToken = verifiedToken;
        next();
    }).catch(onError)
};

module.exports = jwtMiddleware;