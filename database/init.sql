CREATE DATABASE IF NOT EXISTS user_eco;
USE user_eco;

CREATE TABLE users (
id INT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(50) UNIQUE,
password VARCHAR(255),
name VARCHAR(50),
avatar VARCHAR(500) DEFAULT 'https://picsum.photos/200/200',
signature VARCHAR(255) DEFAULT '这家伙很懒',
gender ENUM('男','女','保密') DEFAULT '保密',
role ENUM('user','admin') DEFAULT 'user',
status ENUM('normal','banned') DEFAULT 'normal'
);

CREATE TABLE IF NOT EXISTS follows (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
followed_username VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
id INT AUTO_INCREMENT PRIMARY KEY,
title VARCHAR(255),
content TEXT,
author VARCHAR(50),
status ENUM('pending','approved','rejected') DEFAULT 'pending',
likes INT DEFAULT 0,
comments JSON
);

INSERT INTO users (username,password,name,role) VALUES
('admin','admin888','管理员','admin'),
('user','123456','普通用户','user');