import { useState } from 'react';
import LoginScreen from '@/components/LoginScreen';
import MessengerApp from '@/components/MessengerApp';

export interface User {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  username: string;
  isDeveloper: boolean;
  isBlocked: boolean;
  lastSeen: Date;
  isOnline: boolean;
}

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  return (
    <div className="h-screen w-screen overflow-hidden">
      {!currentUser ? (
        <LoginScreen onLogin={setCurrentUser} />
      ) : (
        <MessengerApp 
          currentUser={currentUser} 
          onLogout={() => setCurrentUser(null)}
          onUpdateUser={handleUpdateUser}
        />
      )}
    </div>
  );
};

export default Index;