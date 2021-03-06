const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const indexDao = require('../dao/indexDao');
const questionDao = require('../dao/questionDao');

submitQuestionAnswer = async (req, res) => {
    let {
        answer1, answer2, answer3, answer4, answer5
    } = req.body
    const userIndex = req.verifiedToken.id;
    let missionIndex = 0;

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
    const date = new Date();
    const answerList = [answer1, answer2, answer3, answer4, answer5];
    const today = date.getFullYear();
    answerList.forEach(async (item, index) => {
        try {
            await questionDao.insertQuestionAnswer(userIndex, index+1, item, today);
        } catch(err) {
            logger.error(`API 4 - Insert answer Query Error\n: ${JSON.stringify(err)}`);
            return;
        }
    });
        
    // 유저 사이클 수정
    try {
        await indexDao.updateCycle(userIndex);
    } catch(err) {
        logger.error(`API 4 - Update user cycle Error\n: ${JSON.stringify(err)}`);
        return;
    }

    // 추천 시스템으로 미션 아이디 선택
    try {
        // 유사도 높은 상위 30개 미션 불러오기
        const [similarMissionRows] = await questionDao.selectSimilarMissions(answerList);

        // 유저가 사이클에서 수행한 미션 불러오기
        const [solvedMissionInCycle] = await questionDao.selectSolvedMissionInCycle(userIndex);

        // 중복 제거 후 유사도 가장 높은 미션 인덱스 추출
        missionIndex = await getRecommendIndex(similarMissionRows, solvedMissionInCycle);

    } catch(err) {
        logger.error(`API 4 - Recommend algorithms Error\n: ${JSON.stringify(err)}`);
        return;
    }

    try {
        const [userCycleRows] = await indexDao.getUserCycle(userIndex);
        await questionDao.insertMissionAnswer(missionIndex, userIndex, userCycleRows[0].missionCycleDate);
    } catch(err) {
        logger.error(`API 4 - create new mission Error\n: ${JSON.stringify(err)}`);
        return;
    }

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
    const userIndex = req.verifiedToken.id;

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
        const selectMissionInCycle = await questionDao.selectMissionInCycle(userIndex, missionIndex);
        if (selectMissionInCycle.length === 0 )
            return res.json({isSuccess: false, code: 404, message: "유효하지 않은 미션"});

        const [selectMissonAndAnswerRows] = await questionDao.selectMissonAndAnswer(missionIndex, userIndex);

        const result = selectMissonAndAnswerRows[0]
        
        res.json({
            isSuccess: true,
            code: 200,
            message: "미션 조회 성공",
            result
        })
    } catch(err) {
        logger.error(`API 5 - Select Query Error\n: ${JSON.stringify(err)}`);
        return;
    }
};

submitMissionAnswer = async (req, res) => {
    let missionIndex = req.params.id;
    const userIndex = req.verifiedToken.id;
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

        const selectMissionInCycle = await questionDao.selectMissionInCycle(userIndex, missionIndex);
        if (selectMissionInCycle.length === 0 )
            return res.json({isSuccess: false, code: 404, message: "유효하지 않은 미션"});

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
        const [userCycleRows] = await indexDao.getUserCycle(userIndex);
    
        try {
            if (temp)
                await questionDao.updateMissionAnswer(missionIndex, userIndex, answer1, answer2, answer3, 1);
            else
                await questionDao.updateMissionAnswer(missionIndex, userIndex, answer1, answer2, answer3, 0);
        } catch (err) {
            logger.error(`API 6 - Update Query Error\n: ${JSON.stringify(err)}`);
            return;
        }

        const [selectMissonAndAnswerRows] = await questionDao.selectMissonAndAnswer(missionIndex, userIndex);

        const result = {
            day: selectMissonAndAnswerRows[0].day,
            missionIdx: selectMissonAndAnswerRows[0].missionIndex,
            title: selectMissonAndAnswerRows[0].title
        }
        
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

getRecommendIndex = async (simMissionRows, doneMissionRows) => {
    let simIdxList = [];

    await simMissionRows.forEach((row) => {
        simIdxList.push(row.missionIndex)
    });

    let simIdxSet = new Set(simIdxList);

    await doneMissionRows.forEach((row) => {
        simIdxSet.delete(row.missionIndex);
    });

    return Array.from(Array.from(simIdxSet))[0];
}

module.exports = {
    submitQuestionAnswer,
    showMission,
    submitMissionAnswer,
}