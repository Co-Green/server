module.exports = function(app){
    const question = require('../controllers/questionController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.post('/questions', question.submit);
};
