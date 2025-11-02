import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Icon from '@/components/ui/icon';
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

interface ChatAreaProps {
  currentUser: User;
  chat: Chat;
  onSendMessage: (text: string) => void;
}

const ChatArea = ({ currentUser, chat, onSendMessage }: ChatAreaProps) => {
  const [messageText, setMessageText] = useState('');

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0] || ''}`.toUpperCase();
  };

  const formatLastSeen = (date: Date, isOnline: boolean) => {
    if (isOnline) return 'онлайн';
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return 'был(а) только что';
    if (minutes < 60) return `был(а) ${minutes} мин. назад`;
    if (hours < 24) return `был(а) ${hours} ч. назад`;
    return new Date(date).toLocaleDateString('ru');
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b border-border px-6 py-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(chat.user.firstName, chat.user.lastName)}
              </AvatarFallback>
            </Avatar>
            {chat.user.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent border-2 border-card rounded-full" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-foreground">
                {chat.user.firstName} {chat.user.lastName}
              </h2>
              {chat.user.isDeveloper && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className="bg-primary rounded-full p-0.5">
                      <Icon name="Check" size={10} className="text-white" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Верифицированный аккаунт разработчика</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            {chat.isTyping ? (
              <p className="text-sm text-primary">печатает...</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {formatLastSeen(chat.user.lastSeen, chat.user.isOnline)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {chat.messages.map((message) => {
          const isOwn = message.senderId === currentUser.id;
          return (
            <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isOwn && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {getInitials(chat.user.firstName, chat.user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted text-foreground rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 px-1">
                    {new Date(message.timestamp).toLocaleTimeString('ru', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border p-4 bg-card">
        <div className="flex gap-2 items-end">
          <Input
            placeholder="Напишите сообщение..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 resize-none h-11"
          />
          <Button onClick={handleSend} size="icon" className="h-11 w-11 flex-shrink-0">
            <Icon name="Send" size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
