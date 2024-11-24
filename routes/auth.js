const express = require('express');
const db = require('../models/db');
const bcrypt = require('bcrypt');
const router = express.Router();

// 로그인 페이지 렌더링
router.get('/login', (req, res) => {
  res.render('login'); // views/login.ejs 렌더링
});

// 회원가입 페이지 렌더링
router.get('/register', (req, res) => {
  res.render('register'); // views/register.ejs 렌더링
});

// 로그인 처리
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  console.log('로그인 요청 데이터:', req.body); // 디버깅 로그 추가

  db.query('SELECT * FROM user_profiles WHERE id = ?', [email], (err, results) => {
    if (err) {
      console.error('로그인 중 오류:', err);
      return res.status(500).send('로그인 중 문제가 발생했습니다.');
    }

    console.log('데이터베이스 조회 결과:', results); // 디버깅 로그 추가

    if (results.length > 0 && bcrypt.compareSync(password, results[0].pw)) {
      console.log('로그인 성공:', results[0]); // 디버깅 로그 추가
      req.session.user = results[0];
      res.redirect('/');
    } else {
      console.log('로그인 실패: 이메일 또는 비밀번호 불일치'); // 디버깅 로그 추가
      res.status(401).send('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  });
});

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  // 데이터베이스에서 이메일 중복 확인
  const checkEmailQuery = 'SELECT * FROM user_profiles WHERE id = ?';

  db.query(checkEmailQuery, [email], (err, results) => {
    if (err) {
      console.error('이메일 중복 확인 중 오류:', err);
      return res.status(500).send('회원가입 중 문제가 발생했습니다.');
    }

    if (results.length > 0) {
      // 중복된 이메일이 있는 경우
      return res.status(400).send('이미 사용 중인 이메일입니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = bcrypt.hashSync(password, 10);

    // 새 사용자 삽입
    const insertUserQuery =
      'INSERT INTO user_profiles (id, pw, name) VALUES (?, ?, ?)';

    db.query(insertUserQuery, [email, hashedPassword, name], (err) => {
      if (err) {
        console.error('회원가입 중 오류:', err);
        return res.status(500).send('회원가입 중 문제가 발생했습니다.');
      }
      res.redirect('/auth/login'); // 회원가입 성공 후 로그인 페이지로 이동
    });
  });
});


// 로그아웃 처리
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('로그아웃 중 오류:', err);
      return res.status(500).send('로그아웃 중 문제가 발생했습니다.');
    }
    res.redirect('/auth/login'); // 로그아웃 후 로그인 페이지로 이동
  });
});

module.exports = router;
