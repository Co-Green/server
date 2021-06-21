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
    answer.answer1, answer2, answer3
FROM Mission m, User u, (
        SELECT answer1, answer2, answer3
        FROM missionAnswer
        WHERE userIndex = ?
        AND missionIndex = ?
        AND cycleYear = (SELECT Year(missionCycleDate) FROM User WHERE userIndex = ?)
        AND cycleMonth = (SELECT MONTH(missionCycleDate) FROM User WHERE userIndex = ?)
    ) as answer
WHERE m.missionIndex = ? AND u.userIndex = ?;
      `;
    const selectMissonAndAnswerParams = [userIndex, missionIndex, userIndex, userIndex, missionIndex, userIndex];
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

insertMissionAnswer = async (missionIndex, userIndex, userCycle) => {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertMissionAnswerQuery = `
      INSERT INTO missionAnswer(userIndex, missionIndex, cycleYear, cycleMonth)
      VALUES (
          ?, ?,
          YEAR(?),
          MONTH(?)
      );
    `;
  const insertMissionAnswerParams = [userIndex, missionIndex, userCycle, userCycle];
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
    WHERE missionIndex = ? AND userIndex = ?
          AND cycleYear = (SELECT Year(missionCycleDate) FROM User WHERE userIndex = ?)
          AND cycleMonth = (SELECT MONTH(missionCycleDate) FROM User WHERE User.userIndex = ?);
      `;
    const updateMissionAnswerParams = [answer1, answer2, answer3, isTemp, missionIndex, userIndex, userIndex, userIndex];
    const updateMissionAnswerRow = await connection.query(
      updateMissionAnswerQuery,
      updateMissionAnswerParams
    );
    connection.release();
}

selectSimilarMissions = async (answerList) => {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectSimilarMissionsQuery = `
      SELECT md.missionIndex, SQRT((
          pow(? - SUBSTRING(GROUP_CONCAT(md.degree ORDER BY md.categoryIndex), 1, 1), 2)
        + pow(? - SUBSTRING(GROUP_CONCAT(md.degree ORDER BY md.categoryIndex), 3, 1), 2)
        + pow(? - SUBSTRING(GROUP_CONCAT(md.degree ORDER BY md.categoryIndex), 5, 1), 2)
        + pow(? - SUBSTRING(GROUP_CONCAT(md.degree ORDER BY md.categoryIndex), 7, 1), 2)
        + pow(? - SUBSTRING(GROUP_CONCAT(md.degree ORDER BY md.categoryIndex), 9, 1), 2)
      ) / 5) as similarity
      FROM missionData md
      GROUP BY md.missionIndex
      ORDER BY similarity LIMIT 30;
    `;
  const selectSimilarMissionsParams = answerList;
  const [selectSimilarMissionsRow] = await connection.query(
    selectSimilarMissionsQuery,
    selectSimilarMissionsParams
  );
  connection.release();
  return [selectSimilarMissionsRow];
};

selectSolvedMissionInCycle = async (userIndex) => {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectSolvedMissionInCycleQuery = `
  SELECT missionIndex
  FROM missionAnswer
  WHERE userIndex = ?
    AND cycleYear = (SELECT Year(missionCycleDate) FROM User WHERE userIndex = ?)
    AND cycleMonth = (SELECT MONTH(missionCycleDate) FROM User WHERE User.userIndex = ?);
    `;
  const selectSolvedMissionInCycleParams = [userIndex, userIndex, userIndex];
  const [selectSolvedMissionInCycleRow] = await connection.query(
    selectSolvedMissionInCycleQuery,
    selectSolvedMissionInCycleParams
  );
  connection.release();
  return [selectSolvedMissionInCycleRow];
};

selectMissionInCycle = async (userIndex, missionIndex) => {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectMissionInCycleQuery = `
  SELECT missionIndex
  FROM missionAnswer
  WHERE userIndex = ?
    AND missionIndex = ?
    AND cycleYear = (SELECT Year(missionCycleDate) FROM User WHERE userIndex = ?)
    AND cycleMonth = (SELECT MONTH(missionCycleDate) FROM User WHERE userIndex = ?);
    `;
  const selectMissionInCycleParams = [userIndex, missionIndex, userIndex, userIndex];
  const [selectMissionInCycleRow] = await connection.query(
    selectMissionInCycleQuery,
    selectMissionInCycleParams
  );
  connection.release();
  return selectMissionInCycleRow;
};

module.exports = {
  insertQuestionAnswer,
  isValidMissionIndex,
  selectMissonAndAnswer,
  selectMissionAnswer,
  insertMissionAnswer,
  updateMissionAnswer,
  selectSimilarMissions,
  selectSolvedMissionInCycle,
  selectMissionInCycle,
};
