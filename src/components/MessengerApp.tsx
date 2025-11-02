import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatArea from '@/components/ChatArea';
import ProfileSettings from '@/components/ProfileSettings';
import UserSearch from '@/components/UserSearch';
import type { User } from '@/pages/Index';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  user: User;
  messages: Message[];
  isTyping: boolean;
}

interface MessengerAppProps {
  currentUser: User;
  onLogout: () => void;
}

const MOCK_USERS: User[] = [
  {
    id: '1',
    phone: '+79161234567',
    firstName: 'Анна',
    lastName: 'Петрова',
    username: 'anna_petrova',
    isDeveloper: false,
    isBlocked: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 5),
    isOnline: true,
  },
  {
    id: '2',
    phone: '+79167654321',
    firstName: 'Михаил',
    lastName: 'Соколов',
    username: 'msokolov',
    isDeveloper: false,
    isBlocked: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 30),
    isOnline: false,
  },
  {
    id: '3',
    phone: '+79169876543',
    firstName: 'Елена',
    lastName: 'Иванова',
    username: 'elena_iv',
    isDeveloper: false,
    isBlocked: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 2),
    isOnline: true,
  },
];

const MessengerApp = ({ currentUser, onLogout }: MessengerAppProps) => {
  const [activeView, setActiveView] = useState<'chats' | 'settings' | 'search'>('chats');
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      user: MOCK_USERS[0],
      messages: [
        { id: '1', senderId: '1', text: 'Привет! Как дела с новым проектом?', timestamp: new Date(Date.now() - 1000 * 60 * 10) },
        { id: '2', senderId: currentUser.id, text: 'Всё отлично, скоро релиз!', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
      ],
      isTyping: false,
    },
  ]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(chats[0] || null);

  const handleSendMessage = (text: string) => {
    if (!selectedChat) return;

    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: currentUser.id,
      text,
      timestamp: new Date(),
    };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === selectedChat.id ? { ...chat, messages: [...chat.messages, newMessage] } : chat
      )
    );

    setChats((prev) =>
      prev.map((chat) => (chat.id === selectedChat.id ? { ...chat, isTyping: true } : chat))
    );

    setTimeout(() => {
      setChats((prev) =>
        prev.map((chat) => (chat.id === selectedChat.id ? { ...chat, isTyping: false } : chat))
      );
    }, 2000);
  };

  const handleAddContact = (user: User) => {
    const existingChat = chats.find((chat) => chat.user.id === user.id);
    if (existingChat) {
      setSelectedChat(existingChat);
      setActiveView('chats');
      return;
    }

    const newChat: Chat = {
      id: Math.random().toString(36).substr(2, 9),
      user,
      messages: [],
      isTyping: false,
    };

    setChats((prev) => [...prev, newChat]);
    setSelectedChat(newChat);
    setActiveView('chats');
  };

  return (
    <div className="h-full w-full flex bg-background">
      <Sidebar
        currentUser={currentUser}
        chats={chats}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        onChangeView={setActiveView}
        activeView={activeView}
        onLogout={onLogout}
      />
      <div className="flex-1 flex flex-col">
        {activeView === 'chats' && selectedChat && (
          <ChatArea
            currentUser={currentUser}
            chat={selectedChat}
            onSendMessage={handleSendMessage}
          />
        )}
        {activeView === 'settings' && (
          <ProfileSettings currentUser={currentUser} />
        )}
        {activeView === 'search' && (
          <UserSearch
            currentUser={currentUser}
            existingContacts={chats.map((c) => c.user)}
            onAddContact={handleAddContact}
            allUsers={MOCK_USERS}
          />
        )}
      </div>
    </div>
  );
};

export default MessengerApp;
