CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    email TEXT NOT NULL,
    username TEXT NOT NULL,
    hash TEXT NOT NULL,
    birthday TEXT
);

CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id INT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    trans_type TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    datetime TEXT
);
