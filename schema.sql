CREATE DATABASE meme_db;

USE meme_db;

CREATE TABLE memes
(
id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
url varchar(255)
);

SELECT * FROM memes;