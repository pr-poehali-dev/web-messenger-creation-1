import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Icon from '@/components/ui/icon';
import type { User } from '@/pages/Index';

interface Chat {
  id: string;
  user: User;
  messages: Array<{ id: string; senderId: string; text: string; timestamp: Date }>;
  isTyping: boolean;
}

interface SidebarProps {
  currentUser: User;
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onChangeView: (view: 'chats' | 'settings' | 'search') => void;
  activeView: 'chats' | 'settings' | 'search';
  onLogout: () => void;
}

const Sidebar = ({ currentUser, chats, selectedChat, onSelectChat, onChangeView, activeView, onLogout }: SidebarProps) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0] || ''}`.toUpperCase();
  };

  const formatLastSeen = (date: Date, isOnline: boolean) => {
    if (isOnline) return 'онлайн';
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин. назад`;
    if (hours < 24) return `${hours} ч. назад`;
    return `${days} дн. назад`;
  };

  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-sidebar-accent">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {getInitials(currentUser.firstName, currentUser.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-sidebar-foreground">
                {currentUser.firstName} {currentUser.lastName}
              </span>
              {currentUser.isDeveloper && (
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
            <span className="text-xs text-sidebar-foreground/60">@{currentUser.username}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onLogout} className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground">
          <Icon name="LogOut" size={18} />
        </Button>
      </div>

      <div className="flex gap-1 p-2 border-b border-sidebar-border">
        <Button
          variant={activeView === 'chats' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onChangeView('chats')}
          className="flex-1 h-9 text-sidebar-foreground"
        >
          <Icon name="MessageSquare" size={16} className="mr-2" />
          Чаты
        </Button>
        <Button
          variant={activeView === 'search' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onChangeView('search')}
          className="flex-1 h-9 text-sidebar-foreground"
        >
          <Icon name="Search" size={16} className="mr-2" />
          Поиск
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeView === 'chats' && (
          <div className="divide-y divide-sidebar-border/50">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-sidebar-accent transition-colors ${
                  selectedChat?.id === chat.id ? 'bg-sidebar-accent' : ''
                }`}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(chat.user.firstName, chat.user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  {chat.user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent border-2 border-sidebar rounded-full" />
                  )}
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-sm text-sidebar-foreground truncate">
                        {chat.user.firstName} {chat.user.lastName}
                      </span>
                      {chat.user.isDeveloper && (
                        <div className="bg-primary rounded-full p-0.5 flex-shrink-0">
                          <Icon name="Check" size={8} className="text-white" />
                        </div>
                      )}
                    </div>
                    {chat.messages.length > 0 && (
                      <span className="text-xs text-sidebar-foreground/50">
                        {new Date(chat.messages[chat.messages.length - 1].timestamp).toLocaleTimeString('ru', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                  {chat.isTyping ? (
                    <span className="text-xs text-primary">печатает...</span>
                  ) : chat.messages.length > 0 ? (
                    <p className="text-xs text-sidebar-foreground/60 truncate">
                      {chat.messages[chat.messages.length - 1].text}
                    </p>
                  ) : (
                    <p className="text-xs text-sidebar-foreground/50">
                      {formatLastSeen(chat.user.lastSeen, chat.user.isOnline)}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChangeView('settings')}
          className="w-full justify-start h-10 text-sidebar-foreground"
        >
          <Icon name="Settings" size={18} className="mr-3" />
          Настройки профиля
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
