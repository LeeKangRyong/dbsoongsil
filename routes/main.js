const express = require('express');
const router = express.Router();

// 가상의 캘린더 데이터 생성
router.get('/', (req, res) => {
  const calendarData = [
    [
      { date: '1', calories: 150 },
      { date: '2', calories: 300 },
      { date: '3', calories: 400 },
      { date: '4', calories: 250 },
      { date: '5', calories: 180 },
      { date: '6', calories: 220 },
      { date: '7', calories: 300 },
    ],
    [
      { date: '8', calories: 150 },
      { date: '9', calories: 300 },
      { date: '10', calories: 400 },
      { date: '11', calories: 250 },
      { date: '12', calories: 180 },
      { date: '13', calories: 220 },
      { date: '14', calories: 300 },
    ],
  ];

  // calendarData를 index.ejs로 전달
  res.render('index', { calendarData });
});

module.exports = router;
