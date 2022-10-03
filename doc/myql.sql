-- Active: 1664475581282@@127.0.0.1@3306@d1
CREATE TABLE
    `d1`.`t1` (
        `id` BIGINT(20) NOT NULL,
        `name` VARCHAR(5) NOT NULL DEFAULT '',
        `age` INTEGER(10) NOT NULL DEFAULT 0,
        `create_time` DATETIME DEFAULT '1970-01-02 00:00:00',
        `update_time` TIMESTAMP DEFAULT '1970-01-02 00:00:00',
        PRIMARY KEY (id)
    ) ENGINE = InnoDB;

SHOW CREATE TABLE d1.t1;

DROP TABLE d1.t1;

TRUNCATE TABLE d1.t1;

SELECT * FROM d1.t1;