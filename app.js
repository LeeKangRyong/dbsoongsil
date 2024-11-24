const express = require('express');
const ejs = require('ejs');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const { BigQuery } = require('@google-cloud/bigquery');

require('dotenv').config();

const bigquery = new BigQuery({
    keyFilename: 'mykey.json'
});

const projectId = 'dbsoongsil';

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '2151',
    database: 'records'
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

connection.connect((err) => {
    if (err) {
        console.error('데이터베이스 연결 오류:', err);
    } else {
        console.log('데이터베이스 연결 성공!');
    }
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/record', (req, res) => {
    res.render('record');
});

app.get('/viewRecords', (req, res) => {
    const sql = 'SELECT * FROM record';
    
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('운동 기록 조회 오류:', err);
            return res.status(500).send("<script>alert('운동 기록 조회 실패!'); location.href='/';</script>");
        }
        // Pass 'results' as 'records' to the view
        res.render('viewRecords', { records: results });
    });
});

async function predictCalories(data) {
    try {
        const sqlQuery = `
        SELECT predicted_calory
        FROM ML.PREDICT(MODEL \`${projectId}.gyms.xgboost_model\`,
        (SELECT 
            CAST(? as INT64) AS max_bpm, 
            CAST(? as INT64) AS avg_bpm, 
            CAST(? as INT64) AS resting_bpm,
            CAST(? as FLOAT64) AS duration, 
            CAST(? as STRING) AS workout_type,
            CAST(? as FLOAT64) AS water,
            CAST(? as INT64) AS age,
            CAST(? as STRING) AS gender,
            CAST(? as FLOAT64) AS weight,
            CAST(? as FLOAT64) AS height,
            CAST(? as FLOAT64) AS fat_percentage,
            CAST(? as INT64) AS workout_frequency,
            CAST(? as INT64) AS experience_level,
            CAST(? as FLOAT64) AS bmi))`;

        const options = {
            query: sqlQuery,
            params: [
                data.max_bpm, data.avg_bpm, data.resting_bpm, data.duration,
                data.workout_type, data.water, data.age, data.gender,
                data.weight, data.height, data.fat_percentage, data.workout_frequency,
                data.experience_level, data.bmi
            ],
            useLegacySql: false
        };

        const [rows] = await bigquery.query(options);
        const predictedCalories = rows[0]?.predicted_calory || 0;

        return { predictedCalories };
    } catch (error) {
        console.error('예측 오류:', error);
        throw new Error('예측 오류 발생: ' + error.message);
    }
}

app.post('/predict', async (req, res) => {
    try {
        const { max_bpm, avg_bpm, resting_bpm, duration, workout_type, water, age } = req.body;

        // 예시 값 설정
        const gender = 'Male';
        const weight = 70.0;
        const height = 1.75;
        const fat_percentage = 20.0;
        const workout_frequency = '3';
        const experience_level = '2';
        const bmi = 22.0;

        const predictionData = await predictCalories({
            max_bpm, avg_bpm, resting_bpm, duration, workout_type, water,
            age, gender, weight, height, fat_percentage, workout_frequency, experience_level, bmi
        });

        res.json({ predictedCalories: predictionData.predictedCalories });
    } catch (error) {
        console.error('예측 오류:', error);
        res.status(500).json({ error: '예측 중 오류가 발생했습니다: ' + error.message });
    }
});

app.post('/record', async (req, res) => {
    try {
        console.log('Received data:', req.body); // Log incoming data

        const { max_bpm, avg_bpm, resting_bpm, duration, workout_type, water, description } = req.body;

        const predictionData = await predictCalories({
            max_bpm, avg_bpm, resting_bpm, duration, workout_type, water,
            age: 25, gender: 'Male', weight: 70.0, height: 1.75,
            fat_percentage: 20.0, workout_frequency: '3', experience_level: '2', bmi: 22.0
        });

        const calory = predictionData.predictedCalories || 0;

        const sql = `
            INSERT INTO record 
            (max_bpm, avg_bpm, resting_bpm, duration, workout_type, water, calory, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        connection.query(
            sql,
            [max_bpm, avg_bpm, resting_bpm, duration, workout_type, water, calory, description],
            (err) => {
                if (err) {
                    console.error('Database insert error:', err); // Log database errors
                    return res.status(500).send("<script>alert('운동 기록 등록 실패: " + err.message + "'); location.href='/record';</script>");
                }
                console.log('운동 기록 등록 완료!');
                res.send("<script>alert('운동 기록이 등록되었습니다!'); location.href='/';</script>");
            }
        );
    } catch (error) {
        console.error('Error occurred:', error); // Log unexpected errors
        res.status(500).send("<script>alert('운동 기록 등록 실패: " + error.message + "'); location.href='/record';</script>");
    }
});
app.listen(port, () => {
    console.log(`서버가 열렸습니다! 주소: http://localhost:${port}`);
});
