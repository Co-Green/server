module.exports = function(app){
    const index = require('../controllers/indexController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.get('/app', index.default);

    // 소셜 로그인
    app.post('/user', index.user);
    app.get('/user', index.user);


};
