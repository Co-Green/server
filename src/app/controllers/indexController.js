const request = require('request');

const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const jwt = require('jsonwebtoken');

const indexDao = require('../dao/indexDao');

console.log('indexController 실행 중');

exports.default = async function (req, res) {
    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            const [rows] = await indexDao.defaultDao();
            return res.json(rows);
        } catch (err) {
            logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return false;
        }
    } catch (err) {
        logger.error(`example non transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }
};

exports.user = async function (req, res) {
    
    const accessToken = req.body.accessToken;

    if (!accessToken) {
        res.json({
            isSuccess: false,
            code: 400,
            message: "토큰 미입력"
        });
        return
    }

    //accessToken 값 확인
    console.log('accessToken >>', accessToken);

    //이미 가입한 회원인지
    let isDuplicated = 0;

    // 유저 인덱스
    let userIndex;
    let userName;

    // 유효한 토큰인지
    let isValid = 1;

    const promise = new Promise((resolve, reject) => {

        // access token 유효성 검사
        request.get({
            url: "https://kapi.kakao.com/v1/user/access_token_info",
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }, async (res, body) => {
            try {
                console.log('유효성 결과 >>', JSON.parse(body.body));

                // 사용자 정보 조회
                request.get({
                    url: "https://kapi.kakao.com/v2/user/me",
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }, async (res, body) => {
                    try {
                        const kakaopkID = JSON.parse(body.body).id;

                        console.log('kakaopkID >>', kakaopkID);
                        console.log('user data >>', JSON.parse(body.body));

                        try {
                            const [rows] = await indexDao.duplicateCheck(kakaopkID);
                            isDuplicated = rows.isDuplicated;

                            console.log('isDuplicated >>', isDuplicated);

                            if (isDuplicated == 0) {
                                const rows = await indexDao.addUser(kakaopkID);
                                userIndex = rows.insertId;
                                console.log('사용자 추가 >>', userIndex);
                            }
                            else if (isDuplicated == 1) {
                                userIndex = rows.userIndex;
                                console.log('user index >>', userIndex);
                            }

                            let userName = '';

                            const userData = {
                                userIndex: userIndex,
                                isDuplicated: isDuplicated,
                                userName: userName
                            };
                            resolve(userData);
                        } catch (err) {
                            console.log(err);
                            isValid = 0;
                            return
                        }
                    } catch (err) {
                        console.log(err);
                        return
                    }
                });
            } catch (err) {
                console.log(err);
                return false;
            }
        });
    });

    promise.then((value) => {
        userIndex = value.userIndex;
        isDuplicated = value.isDuplicated;
        userName = value.userName;

        console.log('result >>', userIndex, isDuplicated, userName);

        if (isValid == 0) {
            res.json({
                isSuccess: false,
                code: 401,
                message: "유효하지 않은 토큰"
            });
        }

        let token = jwt.sign({
            id: userIndex
        },
        
        secret_config.jwtsecret,
        {
            expiresIn: '365d',
            subject: 'userIndex',
        });

        if (isDuplicated == 0) {
            res.json({
                jwt: token,
                isSuccess: true,
                code: 200,
                message: "회원가입 성공"
            });
        }
        else if (isDuplicated == 1) {
            res.json({
                jwt: token,
                isSuccess: true,
                code: 201,
                message: "로그인 성공"
            });
        }
        else {
            res.json({
                isSuccess: false,
                code: 403
            })
        }

    })
    

    

};