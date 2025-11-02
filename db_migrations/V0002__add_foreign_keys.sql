ALTER TABLE chats DROP CONSTRAINT IF EXISTS chats_user1_id_fkey;
ALTER TABLE chats DROP CONSTRAINT IF EXISTS chats_user2_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_chat_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

ALTER TABLE chats 
  ADD CONSTRAINT chats_user1_id_fkey 
  FOREIGN KEY (user1_id) REFERENCES users(id);

ALTER TABLE chats 
  ADD CONSTRAINT chats_user2_id_fkey 
  FOREIGN KEY (user2_id) REFERENCES users(id);

ALTER TABLE messages 
  ADD CONSTRAINT messages_chat_id_fkey 
  FOREIGN KEY (chat_id) REFERENCES chats(id);

ALTER TABLE messages 
  ADD CONSTRAINT messages_sender_id_fkey 
  FOREIGN KEY (sender_id) REFERENCES users(id);