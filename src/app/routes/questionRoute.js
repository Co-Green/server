module.exports = function(app){
    const question = require('../controllers/questionController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.post('/questions', question.submitQuestionAnswer);
    app.get('/missions/:id', question.showMission);
    app.post('/missions/:id', question.submitMissionAnswer);
};
