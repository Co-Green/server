const { pool } = require("../../../config/database");

// submit
createQuestionAnswer = async (answers) => {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectEmailQuery = `SELECT * FROM Mission`;

  const [rows] = await connection.query(selectEmailQuery)
  connection.release();

  return rows;
}

module.exports = {
  createQuestionAnswer,
};
