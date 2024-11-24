const express = require('express');
const router = express.Router();
const users = []; // 간단한 메모리 데이터베이스

// 회원가입 폼
router.get('/register', (req, res) => {
  res.render('register');
});

// 회원가입 처리
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  users.push({ id: users.length + 1, name, email, password });
  res.redirect('/login');
});

// 로그인 폼
router.get('/login', (req, res) => {
  res.render('login');
});

// 로그인 처리
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    req.session.user = user; // 세션에 사용자 정보 저장
    res.redirect('/mypage');
  } else {
    res.send('Invalid email or password');
  }
});

module.exports = router;
