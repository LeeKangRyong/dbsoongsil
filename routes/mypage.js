const express = require('express');
const router = express.Router();

// 임시 사용자 데이터
let user = {
  name: 'John Doe',
  email: 'john@example.com',
  joinedDate: '2023-01-01',
};

// My Page 화면 렌더링
router.get('/', (req, res) => {
  res.render('mypage', { user });
});

// 회원정보 수정 처리
router.post('/edit', (req, res) => {
  const { name, email } = req.body;

  // 사용자 데이터 업데이트
  user.name = name;
  user.email = email;

  // 수정 후 다시 MyPage로 리다이렉트
  res.redirect('/mypage');
});

module.exports = router;
