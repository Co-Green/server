const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const questionDao = require('../dao/questionDao');

submit = async (req, res) => {
    const {
        answer1, answer2, answer3, answer4, answer5
    } = req.body

    // answers 검증
    // 추천 시스템으로 미션 아이디 선택
    // return
};


module.exports = {
    submit
}