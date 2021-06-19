module.exports = function(app){
    const question = require('../controllers/questionController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.post('/questions', jwtMiddleware, question.submitQuestionAnswer);
    app.get('/missions/:id', jwtMiddleware, question.showMission);
    app.patch('/missions/:id', jwtMiddleware, question.submitMissionAnswer);
};
