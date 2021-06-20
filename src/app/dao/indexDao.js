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

// 메인 페이지
async function mainPage(userIndex) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getMainPageQuery = `SELECT u1.userName AS name, u1.solvedMission AS continuous,
    (SELECT COUNT(*) + 1 FROM User u2 WHERE u1.solvedMission < u2.solvedMission) AS ranking,
    (SELECT ranking / (SELECT COUNT(*) FROM User u2)) AS rankingPercent,
    (SELECT COUNT(*) FROM missionAnswer ma WHERE ma.userIndex = ${userIndex} AND ma.solvedDate = CURDATE()) AS isSolvedToday,
    (SELECT GROUP_CONCAT(title SEPARATOR ',') FROM Mission m INNER JOIN missionAnswer ma ON m.missionIndex = ma.missionIndex AND ma.userIndex = ${userIndex} AND ma.isTemp != 1) AS title,
    (SELECT GROUP_CONCAT(solvedDate SEPARATOR ',') FROM missionAnswer WHERE userIndex = ${userIndex} AND isTemp != 1) AS date
    FROM User u1
    WHERE userIndex = ${userIndex};`;
  const [rows] = await connection.query(getMainPageQuery);
  connection.release();
  return rows;
}

// 유저 사이클 수정
async function updateCycle(userIndex) {
  const connection = await pool.getConnection(async (conn) => conn);
  const updateCycleQuery = `UPDATE User
  SET missionCycleDate = IF (solvedMission = 0 OR solvedMission = 30, CURDATE(), missionCycleDate),
      solvedMission = IF (solvedMission = 30, 1, solvedMission+1)
  WHERE userIndex = 1;`;
  const updateCycleParams = [userIndex];
  const [updateCycleRows] = await connection.query(
    updateCycleQuery,
    updateCycleParams
  );
  connection.release();
}

module.exports = {
  duplicateCheck,
  addUser,
  getUserIndex,
  mainPage,
  updateCycle,
};