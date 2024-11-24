const express = require('express');
const session = require('express-session');
const mainRouter = require('./routes/main');
const myPageRouter = require('./routes/mypage');
const bodyParser = require('body-parser');

const app = express();

// 템플릿 엔진 설정
app.set('view engine', 'ejs');
app.set('views', './views');

// 정적 파일 제공
app.use(express.static('public'));

// 세션 설정
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
}));

// Body parser 설정 (POST 요청 처리)
app.use(bodyParser.urlencoded({ extended: true }));

// 라우트 설정
app.use('/', mainRouter);
app.use('/mypage', myPageRouter);

// 서버 실행
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
