const express = require('express');
const db = require('../models/db');
const router = express.Router();

// 마이페이지 조회
router.get('/', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const userId = req.session.user.user_id;

  // user_profiles와 user_health 데이터 조회
  const queryProfiles = 'SELECT * FROM user_profiles WHERE user_id = ?';
  const queryHealth = 'SELECT * FROM user_health WHERE user_id = ?';

  db.query(queryProfiles, [userId], (err, profilesResults) => {
    if (err) {
      console.error('user_profiles 조회 중 오류:', err);
      return res.status(500).send('마이페이지를 불러오는 중 문제가 발생했습니다.');
    }

    db.query(queryHealth, [userId], (err, healthResults) => {
      if (err) {
        console.error('user_health 조회 중 오류:', err);
        return res.status(500).send('마이페이지를 불러오는 중 문제가 발생했습니다.');
      }

      // user_health 데이터가 없을 경우 기본값 설정
      const health = healthResults[0] || {
        weight: 0,
        height: 0,
        bmi: 0,
        goal_weight: 0,
        workout_freq: 0,
        experience_level: '초보자',
        activity_level: '낮음',
      };

      res.render('mypage', {
        user: profilesResults[0],
        health: health,
      });
    });
  });
});


// 사용자 정보 수정
router.post('/edit', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const userId = req.session.user.user_id;

  // 클라이언트로부터 전달된 수정 데이터
  const {
    name,
    age,
    gender,
    weight,
    height,
    goal_weight,
    workout_freq,
    experience_level,
    activity_level,
  } = req.body;

  // BMI 계산 (kg/m^2)
  const bmi = (weight / ((height / 100) ** 2)).toFixed(2);

  // user_profiles 업데이트
  const updateProfiles =
    'UPDATE user_profiles SET name = ?, age = ?, gender = ? WHERE user_id = ?';

  db.query(updateProfiles, [name, age, gender, userId], (err) => {
    if (err) {
      console.error('user_profiles 업데이트 중 오류:', err);
      return res.status(500).send('정보 수정 중 문제가 발생했습니다.');
    }

    // user_health 테이블에 데이터 존재 여부 확인
    const checkHealth = 'SELECT * FROM user_health WHERE user_id = ?';

    db.query(checkHealth, [userId], (err, results) => {
      if (err) {
        console.error('user_health 조회 중 오류:', err);
        return res.status(500).send('정보 수정 중 문제가 발생했습니다.');
      }

      if (results.length === 0) {
        // 데이터가 없으면 새 레코드 삽입
        const insertHealth =
          'INSERT INTO user_health (user_id, weight, height, bmi, goal_weight, workout_freq, experience_level, activity_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

        db.query(
          insertHealth,
          [userId, weight, height, bmi, goal_weight, workout_freq, experience_level, activity_level],
          (err) => {
            if (err) {
              console.error('user_health 삽입 중 오류:', err);
              return res.status(500).send('정보 수정 중 문제가 발생했습니다.');
            }
            res.redirect('/mypage'); // 수정 후 마이페이지로 리다이렉트
          }
        );
      } else {
        // 데이터가 있으면 업데이트
        const updateHealth =
          'UPDATE user_health SET weight = ?, height = ?, bmi = ?, goal_weight = ?, workout_freq = ?, experience_level = ?, activity_level = ? WHERE user_id = ?';

        db.query(
          updateHealth,
          [weight, height, bmi, goal_weight, workout_freq, experience_level, activity_level, userId],
          (err) => {
            if (err) {
              console.error('user_health 업데이트 중 오류:', err);
              return res.status(500).send('정보 수정 중 문제가 발생했습니다.');
            }
            res.redirect('/mypage'); // 수정 후 마이페이지로 리다이렉트
          }
        );
      }
    });
  });
});


module.exports = router;
