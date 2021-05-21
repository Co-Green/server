const { pool } = require("../../../config/database");

// index
async function defaultDao() {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectEmailQuery = `SELECT * FROM Mission`;

  const [rows] = await connection.query(selectEmailQuery)
  connection.release();

  return rows;
}

// kakaopkID 중복 확인
async function duplicateCheck(kakaopkID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const checkpkIDQuery = `SELECT COUNT(*) FROM User WHERE kakaoID = ${kakaopkID};`;
  const [rows] = await connection.query(checkpkIDQuery);
  connection.release();
  return rows;
}

// 회원 가입
async function addUser(kakaopkID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const addUserQuery = `INSERT INTO User (userName, kakaoID) VALUE ('임시', ${kakaopkID});`;
  const [rows] = await connection.query(addUserQuery);
  connection.release();
  console.log('테스트 >>', rows);
  return rows;
}


module.exports = {
  defaultDao,
  duplicateCheck,
};
