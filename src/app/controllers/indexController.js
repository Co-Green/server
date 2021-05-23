const request = require('request');

const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const jwt = require('jsonwebtoken');
const secret_config = require('../../../config/secret');

const indexDao = require('../dao/indexDao');

console.log('indexController 실행 중');

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
                console.log('valid test result >>', JSON.parse(body.body));

                if (JSON.parse(body.body).msg == 'this access token does not exist') {
                    isValid = 0;

                    const userData = {
                        isValid: isValid
                    };

                    resolve(userData);
                }
                else {
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

                            try {
                                const name = JSON.parse(body.body).properties.nickname;
                                const rows = await indexDao.duplicateCheck(kakaopkID);
                                isDuplicated = rows[0].isDuplicate;

                                console.log('isDuplicated >>', isDuplicated);

                                if (isDuplicated == 0) {
                                    const rows = await indexDao.addUser(name, kakaopkID);
                                    userIndex = rows.insertId;
                                }
                                else if (isDuplicated == 1) {
                                    const rows = await indexDao.getUserIndex(kakaopkID);
                                    userIndex = rows[0].userIndex;
                                }

                                const userData = {
                                    userIndex: userIndex,
                                    userName: name,
                                    isDuplicated: isDuplicated,
                                    isValid: isValid
                                };
                                resolve(userData);

                            } catch (err) {
                                console.log(err);
                                return
                            }
                        } catch (err) {
                            console.log(err);
                            return
                        }
                    });
                }
            } catch (err) {
                console.log(err);
                return false;
            }
        });
    });

    promise.then((value) => {
        userIndex = value.userIndex;
        userName = value.userName;
        isDuplicated = value.isDuplicated;
        isValid = value.isValid
        console.log('result >>', userIndex, userName, isDuplicated, isValid);

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
    })
};