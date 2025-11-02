const API_URL = 'https://functions.poehali.dev/38a0d7da-cc9c-4087-928d-53f056ea4713';

export interface User {
  id: string;
  phone: string;
  password?: string;
  first_name: string;
  last_name: string;
  username: string;
  is_developer: boolean;
  is_blocked: boolean;
  last_seen: string;
  is_online: boolean;
  created_at?: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  text: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  user1_id: string;
  user2_id: string;
  other_user_id: string;
  phone: string;
  first_name: string;
  last_name: string;
  username: string;
  is_developer: boolean;
  is_blocked: boolean;
  is_online: boolean;
  last_seen: string;
  created_at: string;
}

export const api = {
  async login(phone: string, password: string): Promise<User> {
    const response = await fetch(`${API_URL}?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Login failed');
    return data.user;
  },

  async register(phone: string, password: string): Promise<User> {
    const response = await fetch(`${API_URL}?action=register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Registration failed');
    return data.user;
  },

  async getUserByPhone(phone: string): Promise<User> {
    const response = await fetch(`${API_URL}?action=user&phone=${encodeURIComponent(phone)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'User not found');
    return data.user;
  },

  async updateUser(userId: string, firstName: string, lastName: string, username: string): Promise<User> {
    const response = await fetch(`${API_URL}?action=user`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, first_name: firstName, last_name: lastName, username }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Update failed');
    return data.user;
  },

  async getChats(userId: string): Promise<Chat[]> {
    const response = await fetch(`${API_URL}?action=chats&user_id=${userId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to load chats');
    return data.chats;
  },

  async createChat(user1Id: string, user2Id: string): Promise<string> {
    const response = await fetch(`${API_URL}?action=chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user1_id: user1Id, user2_id: user2Id }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create chat');
    return data.chat_id;
  },

  async getMessages(chatId: string): Promise<Message[]> {
    const response = await fetch(`${API_URL}?action=messages&chat_id=${chatId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to load messages');
    return data.messages;
  },

  async sendMessage(chatId: string, senderId: string, text: string): Promise<Message> {
    const response = await fetch(`${API_URL}?action=message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, sender_id: senderId, text }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to send message');
    return data.message;
  },

  async updateOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    await fetch(`${API_URL}?action=online`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, is_online: isOnline }),
    });
  },

  async adminGetUsers(userId: string): Promise<User[]> {
    const response = await fetch(`${API_URL}?action=admin/users&user_id=${userId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Access denied');
    return data.users;
  },

  async adminBlockUser(adminId: string, targetUserId: string, isBlocked: boolean): Promise<User> {
    const response = await fetch(`${API_URL}?action=admin/block`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_id: adminId, user_id: targetUserId, is_blocked: isBlocked }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Operation failed');
    return data.user;
  },

  async adminDeleteUser(adminId: string, targetUserId: string): Promise<void> {
    const response = await fetch(`${API_URL}?action=admin/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_id: adminId, user_id: targetUserId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Operation failed');
  },
};