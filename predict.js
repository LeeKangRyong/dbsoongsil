const express = require('express');
const mysql = require('mysql2/promise');
const ort = require('onnxruntime-node');

const app = express();
const port = 3000;

// MySQL 데이터베이스 연결 설정
const dbConfig = {
  host: 'localhost',
  user: 'root', // 실제 MySQL 사용자명으로 수정
  password: '2151', // 실제 MySQL 비밀번호로 수정
  database: 'dbsoongsil',
};

// 레이블 인코더 (예시로 설정, 실제로는 모델 학습 시 사용한 것과 동일해야 함)
const labelEncoders = {
  gender: { Male: 1, Female: 0 }, // 성별 인코딩
  workout_type: { Yoga: 0, HIIT: 1, Cardio: 2 }, // Workout_Type 인코딩 예시
};

// 예측 API 엔드포인트
app.get('/predict', async (req, res) => {
  try {
    // 예시 데이터
    const exampleData = [
      { age: 56, gender: 'Male', weight: 88.3, height: 1.71, max_bpm: 180, avg_bpm: 157, resting_bpm: 60, duration: 1.69, workout_type: 'Yoga', fat_percentage: 12.6, water: 3.5, frequency: 4, experience: 3, bmi: 30.2 }
    ];

    // 각 예시 데이터에 대해 예측 수행
    const predictions = await Promise.all(exampleData.map(async (data) => {
      const inputTensor = new Float32Array([
        data.age,
        labelEncoders.gender[data.gender], // Gender: 1 for Male, 0 for Female
        data.weight,
        data.height,
        data.max_bpm,
        data.avg_bpm,
        data.resting_bpm,
        data.duration,
        data.fat_percentage,
        data.water,
        data.frequency,
        data.experience,
        data.bmi,
        labelEncoders.workout_type[data.workout_type] // 레이블 인코딩된 Workout_Type 추가
      ]);

      // ONNX 모델 로드
      const session = await ort.InferenceSession.create('xgb_model.onnx');

      // 모델 입력 정의
      const inputTensorMap = {
        input: new ort.Tensor('float32', inputTensor, [1, inputTensor.length]),
      };

      // 예측 수행
      const output = await session.run(inputTensorMap);
      const prediction = output.output.data[0]; // 예측 결과

      return { ...data, predicted_calories: prediction }; // 예측 결과 포함
    }));

    // 결과 반환
    res.json(predictions);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
