module.exports = function(app){
    const index = require('../controllers/indexController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.get('/app', index.default);

    // Access Token 전송
    app.post('/valid-token', index.valid);

    // Access Token 유효성 검사
    app.get('/valid-token', index.valid);

    // 메인 (유저 프로필)
    //app.get('/', index.main);

};
