const { pool } = require("../../../config/database");

// submit
insertQuestionAnswer = async (userIndex, answerIndex, degree, date) => {
    const connection = await pool.getConnection(async (conn) => conn);
    const insertAnswerQuery = `
          INSERT INTO questionAnswer (degree, userIndex, questionIndex)
          VALUES (?, ?, ?);
      `;
    const insertAnswerParams = [degree, userIndex, answerIndex];
    const insertAnswerRow = await connection.query(
      insertAnswerQuery,
      insertAnswerParams
    );
    connection.release();
}

// mission index 유효한지 조회
isValidMissionIndex = async (missionIndex) => {
    const connection = await pool.getConnection(async (conn) => conn);
    const isValidMissionIndexQuery = `
          SELECT missionIndex
          FROM Mission
          WHERE missionIndex = ?;
      `;
    const isValidMissionIndexParams = [missionIndex];
    const [isValidMissionIndexRow] = await connection.query(
      isValidMissionIndexQuery,
      isValidMissionIndexParams
    );
    connection.release();
    return isValidMissionIndexRow;
};

// mission index content 조회
selectMissonAndAnswer = async (missionIndex, userIndex) => {
    const connection = await pool.getConnection(async (conn) => conn);
    const selectMissonAndAnswerQuery = `
    SELECT
        u.solvedMission AS day,
        m.missionIndex, m.title, m.description,
        m.question1, m.question2, m.question3,
        (SELECT answer1 FROM missionAnswer WHERE m.missionIndex = ? AND u.userIndex = ?) as answer1,
        (SELECT answer2 FROM missionAnswer WHERE m.missionIndex = ? AND u.userIndex = ?) as answer2,
        (SELECT answer3 FROM missionAnswer WHERE m.missionIndex = ? AND u.userIndex = ?) as answer3
    FROM Mission m, User u
    WHERE m.missionIndex = ? AND u.userIndex = ?;
      `;
    const selectMissonAndAnswerParams = [missionIndex, userIndex, missionIndex, userIndex, missionIndex, userIndex, missionIndex, userIndex];
    const [selectMissonAndAnswerRow] = await connection.query(
      selectMissonAndAnswerQuery,
      selectMissonAndAnswerParams
    );
    connection.release();
    return [selectMissonAndAnswerRow];
};

selectMissionAnswer = async (missionIndex, userIndex) => {
    const connection = await pool.getConnection(async (conn) => conn);
    const selectMissionAnswerQuery = `
        SELECT missionAnswerIndex
        FROM missionAnswer
        WHERE missionIndex = ? AND userIndex = ?;
      `;
    const selectMissionAnswerParams = [missionIndex, userIndex];
    const [selectMissionAnswerRow] = await connection.query(
      selectMissionAnswerQuery,
      selectMissionAnswerParams
    );
    connection.release();
    return [selectMissionAnswerRow];
};

insertMissionAnswer = async (missionIndex, userIndex, answer1, answer2, answer3, isTemp) => {
    const connection = await pool.getConnection(async (conn) => conn);
    const insertMissionAnswerQuery = `
        INSERT INTO missionAnswer(userIndex, missionIndex, answer1, answer2, answer3, isTemp)
        VALUES (
            ?, ?, ?, ?, ?,
            IF (${isTemp} = 1, 1, 0)
        );
      `;
    const insertMissionAnswerParams = [missionIndex, userIndex, answer1, answer2, answer3];
    const insertMissionAnswerRow = await connection.query(
      insertMissionAnswerQuery,
      insertMissionAnswerParams
    );
    connection.release();
}

updateMissionAnswer = async (missionIndex, userIndex, answer1, answer2, answer3, isTemp) => {
    const connection = await pool.getConnection(async (conn) => conn);
    const updateMissionAnswerQuery = `
        UPDATE missionAnswer
        SET answer1 = ?, answer2 = ?, answer3 = ?, isTemp = ?
        WHERE missionIndex = ? AND userIndex = ?;
      `;
    const updateMissionAnswerParams = [answer1, answer2, answer3, isTemp, missionIndex, userIndex];
    const updateMissionAnswerRow = await connection.query(
      updateMissionAnswerQuery,
      updateMissionAnswerParams
    );
    connection.release();
}

module.exports = {
  insertQuestionAnswer,
  isValidMissionIndex,
  selectMissonAndAnswer,
  selectMissionAnswer,
  insertMissionAnswer,
  updateMissionAnswer
};
