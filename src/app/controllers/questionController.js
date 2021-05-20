const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const questionDao = require('../dao/questionDao');

submit = async (req, res) => {
    let {
        answer1, answer2, answer3, answer4, answer5
    } = req.body
    // const userIndex = req.verifiedToken.userIndex;

    // answers 검증
    try {
        if (!answer1 || !answer2 || !answer3 || !answer4 || !answer5) {
            return res.json({isSuccess: false, code: 400, message: "올바르지 않은 답변 - 답변 미입력"});
        }
    
        answer1 = parseInt(answer1, 10);
        answer2 = parseInt(answer2, 10);
        answer3 = parseInt(answer3, 10);
        answer4 = parseInt(answer4, 10);
        answer5 = parseInt(answer5, 10);
    
        if (Number.isNaN(answer1) ||
            Number.isNaN(answer2) ||
            Number.isNaN(answer3) ||
            Number.isNaN(answer4) ||
            Number.isNaN(answer5)) {
            return res.json({isSuccess: false, code: 400, message: "올바르지 않은 답변 - 형식 오류"});
        }
    
        if ((answer1 < 1 && answer1 > 5) ||
            (answer2 < 1 && answer2 > 5) ||
            (answer3 < 1 && answer3 > 5) ||
            (answer4 < 1 && answer4 > 5) ||
            (answer5 < 1 && answer5 > 5)) {
            return res.json({isSuccess: false, code: 400, message: "올바르지 않은 답변 - 범위 초과"});
        }
    } catch(err) {
        logger.error(`API 4 - Answer validation Error\n: ${JSON.stringify(err)}`);
        return;
    }

    // answers 저장
    let userIndex = 1; // 임시
    const answerList = [answer1, answer2, answer3, answer4, answer5];
    answerList.forEach(async (item, index) => {
        try {
            await questionDao.insertAnswer(userIndex, index+1, item);
        } catch(err) {
            logger.error(`API 4 - Insert answer Query Error\n: ${JSON.stringify(err)}`);
            return;
        }
    });
        
    // 추천 시스템으로 미션 아이디 선택
    let missionIndex = 1; // 임시

    // return
    try {
        res.json({
            missionIndex,
            isSuccess: true,
            code: 200,
            message: "답변 제출 성공",
        });
    } catch(err) {
        logger.error(`API 4 - Return Error\n: ${JSON.stringify(err)}`);
        return;
    }
    
};


module.exports = {
    submit
}