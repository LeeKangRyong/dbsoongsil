const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// MySQL 데이터베이스 연결 설정
const db = mysql.createPool({
  host: 'localhost', // 데이터베이스 호스트
  user: 'root', // 사용자 이름
  password: 'password', // 비밀번호
  database: 'calendar', // 데이터베이스 이름
});

router.get('/', async (req, res) => {
  const userId = req.session.user_id || 1; // 세션에서 사용자 ID 가져오기 (기본값: 1)
  try {
    // SQL 쿼리로 데이터 가져오기
    const [results] = await db.query(
      `SELECT
         records.date,
         calorie_predictions.predicted_calories,
         records.calories_burned,
         records.water_intake
       FROM
         records
       LEFT JOIN calorie_predictions ON records.record_id = calorie_predictions.record_id
       WHERE
         records.user_id = ?`,
      [userId]
    );

    // 데이터 정리
    const calendarData = results.map(row => ({
      date: row.date.toISOString().split('T')[0], // 날짜를 YYYY-MM-DD 형식으로 변환
      predictedCalories: row.predicted_calories || 'N/A',
      caloriesBurned: row.calories_burned || 'N/A',
      waterIntake: row.water_intake || 'N/A',
    }));

    // index.ejs에 데이터 전달
    res.render('index', { calendarData });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
