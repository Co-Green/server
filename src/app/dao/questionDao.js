const { pool } = require("../../../config/database");

// submit
insertAnswer = async (userIndex, answerIndex, degree, date) => {
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

module.exports = {
  insertAnswer,
};
