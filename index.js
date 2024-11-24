const express = require('express');
const session = require('express-session');
const authRouter = require('./routes/auth'); // auth.js 라우터
const myPageRouter = require('./routes/mypage'); // mypage.js 라우터
const mainRouter = require('./routes/main'); // main.js 라우터
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

app.use(express.static(path.join(__dirname, './public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
}));

// 라우터 등록
app.use('/', mainRouter); // 기본 라우터 등록
app.use('/auth', authRouter);
app.use('/mypage', myPageRouter);

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});