const { pool } = require("../../../config/database");

// kakaopkID 중복 확인
async function duplicateCheck(kakaopkID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const checkpkIDQuery = `SELECT COUNT(*) AS isDuplicate FROM User WHERE kakaoID = ${kakaopkID};`;
  const [rows] = await connection.query(checkpkIDQuery);
  connection.release();
  return rows;
}

// 회원 가입
async function addUser(name, kakaopkID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const addUserQuery = `INSERT INTO User (userName, kakaoID) VALUE (?, ?);`;
  var params = [name, kakaopkID];
  const [rows] = await connection.query(
    addUserQuery,
    params
  );
  connection.release();
  return rows;
}

// 유저 인덱스 확인
async function getUserIndex(kakaopkID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getUserIndexQuery = `SELECT userIndex FROM User WHERE kakaoID = ${kakaopkID};`;
  const [rows] = await connection.query(getUserIndexQuery);
  connection.release();
  return rows;
}

module.exports = {
  defaultDao,
  duplicateCheck,
  addUser,
  getUserIndex
};