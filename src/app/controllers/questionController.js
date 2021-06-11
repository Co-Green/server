const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const questionDao = require('../dao/questionDao');

submitQuestionAnswer = async (req, res) => {
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
    const today = date.getFullYear() + 
    answerList.forEach(async (item, index) => {
        try {
            await questionDao.insertQuestionAnswer(userIndex, index+1, item, today);
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

showMission = async (req, res) => {
    let missionIndex = req.params.id;
    // const userIndex = req.verifiedToken.userIndex;
    let userIndex = 1; // 임시

    // validation
    try {
        if (!missionIndex) {
            return res.json({isSuccess: false, code: 400, message: "유효하지 않은 인덱스"});
        }

        missionIndex = parseInt(missionIndex, 10);
        if (Number.isNaN(missionIndex)) {
            return res.json({isSuccess: false, code: 400, message: "유효하지 않은 인덱스"});
        } 
        
        const isValidMissionIndexRows = await questionDao.isValidMissionIndex(missionIndex);
        if (isValidMissionIndexRows.length === 0 )
            return res.json({isSuccess: false, code: 404, message: "존재하지 않는 미션"});
    } catch(err) {
        logger.error(`API 5 - Validation Error\n: ${JSON.stringify(err)}`);
        return;
    }

    try {
        const [selectMissonAndAnswerRows] = await questionDao.selectMissonAndAnswer(missionIndex, userIndex);
        
        res.json({
            isSuccess: true,
            code: 200,
            message: "미션 조회 성공",
            result: selectMissonAndAnswerRows[0]
        })
    } catch(err) {
        logger.error(`API 5 - Select Query Error\n: ${JSON.stringify(err)}`);
        return;
    }
};

submitMissionAnswer = async (req, res) => {
    let missionIndex = req.params.id;
    // const userIndex = req.verifiedToken.userIndex;
    let userIndex = 1; // 임시
    let temp = req.query.temporary;
    const {
        answer1, answer2, answer3
    } = req.body;

    if (temp === "true") { temp = true; }
    else { temp = false }

    // validation
    try {
        if (!missionIndex) {
            return res.json({isSuccess: false, code: 400, message: "유효하지 않은 인덱스"});
        }

        missionIndex = parseInt(missionIndex, 10);
        if (Number.isNaN(missionIndex)) {
            return res.json({isSuccess: false, code: 400, message: "유효하지 않은 인덱스"});
        } 
        
        const isValidMissionIndexRows = await questionDao.isValidMissionIndex(missionIndex);
        if (isValidMissionIndexRows.length === 0 )
            return res.json({isSuccess: false, code: 404, message: "존재하지 않는 미션"});

        if (!temp) {
            if (!answer1 || !answer2 || !answer3) {
                return res.json({isSuccess: false, code: 400, message: "답변 미입력"});
            }
        }
    } catch(err) {
        logger.error(`API 6 - Validation Error\n: ${JSON.stringify(err)}`);
        return;
    }

    try {
        // 조회해서 row가 있으면 수정, 없으면 저장
        const selectMissionAnswerRows = await questionDao.selectMissionAnswer(missionIndex, userIndex);
        if (selectMissionAnswerRows.length === 0 ) {
            // 저장
            try {
                if (temp)
                    await questionDao.insertMissionAnswer(missionIndex, userIndex, answer1, answer2, answer3, 1);
                else
                    await questionDao.insertMissionAnswer(missionIndex, userIndex, answer1, answer2, answer3, 0);
            } catch (err) {
                logger.error(`API 6 - Insert Query Error\n: ${JSON.stringify(err)}`);
                return;
            }
        } else {
            // 수정
            try {
                if (temp)
                    await questionDao.updateMissionAnswer(missionIndex, userIndex, answer1, answer2, answer3, 1);
                else
                    await questionDao.updateMissionAnswer(missionIndex, userIndex, answer1, answer2, answer3, 0);
            } catch (err) {
                logger.error(`API 6 - Update Query Error\n: ${JSON.stringify(err)}`);
                return;
            }
        }

        const [selectMissonAndAnswerRows] = await questionDao.selectMissonAndAnswer(missionIndex, userIndex);

        const result = {
            day: selectMissonAndAnswerRows[0].day,
            missionIndex: selectMissonAndAnswerRows[0].missionIndex,
            title: selectMissonAndAnswerRows[0].title
        };
        
        if (temp) { // 임시 저장 리턴
            res.json({
                isSuccess: true,
                code: 201,
                message: "미션 임시 저장 성공"
            });
        } else { // 제출 리턴
            res.json({
                isSuccess: true,
                code: 200,
                message: "미션 제출 성공",
                result
            });
        }
    } catch(err) {
        logger.error(`API 6 -  Return Error\n: ${JSON.stringify(err)}`);
        return;
    }
};


module.exports = {
    submitQuestionAnswer,
    showMission,
    submitMissionAnswer,
}