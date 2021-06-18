module.exports = function(app){
    const index = require('../controllers/indexController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 소셜 로그인
    app.post('/user', index.login);

    // 메인 페이지 (유저 정보 페이지)
    app.get('/user',  jwtMiddleware, index.user);

};