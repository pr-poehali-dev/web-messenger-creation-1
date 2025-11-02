CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    username VARCHAR(50) UNIQUE NOT NULL,
    is_developer BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_online BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chats (
    id VARCHAR(50) PRIMARY KEY,
    user1_id VARCHAR(50) NOT NULL,
    user2_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user1_id, user2_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(50) PRIMARY KEY,
    chat_id VARCHAR(50) NOT NULL,
    sender_id VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_chats_users ON chats(user1_id, user2_id);

INSERT INTO users (id, phone, password, first_name, last_name, username, is_developer, is_online)
VALUES 
    ('dev_admin', '+79022428092', '568876Qqq', 'Разработчик', 'Системы', 'dev_admin', TRUE, TRUE),
    ('user_1', '+79161234567', 'password123', 'Анна', 'Петрова', 'anna_petrova', FALSE, TRUE),
    ('user_2', '+79167654321', 'password123', 'Михаил', 'Соколов', 'msokolov', FALSE, FALSE),
    ('user_3', '+79169876543', 'password123', 'Елена', 'Иванова', 'elena_iv', FALSE, TRUE)
ON CONFLICT (phone) DO NOTHING;