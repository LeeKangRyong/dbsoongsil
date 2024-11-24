-- db_init.sql
DROP DATABASE IF EXISTS dbsoongsil;
CREATE DATABASE dbsoongsil;
USE dbsoongsil;

CREATE TABLE gym (
    id INT AUTO_INCREMENT PRIMARY KEY,
    age INT,
    gender VARCHAR(10),
    weight FLOAT, 
    height FLOAT,
    max_bpm INT,
    avg_bpm INT,
    resting_bpm INT,
    duration FLOAT,
    calory FLOAT,
    workout_type VARCHAR(20),
    fat_percentage FLOAT,
    water FLOAT,
    frequency INT,
    experience INT,
    bmi FLOAT
);

SET GLOBAL local_infile = 1;

LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/gym_members_exercise_tracking.csv'
INTO TABLE gym
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"' 
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(
    age, gender, weight, height, max_bpm, avg_bpm, resting_bpm, 
    duration, calory, workout_type, fat_percentage, water, 
    frequency, experience, bmi
);
