import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/pages/Index';

interface UserSearchProps {
  currentUser: User;
  existingContacts: User[];
  onAddContact: (user: User) => void;
  allUsers: User[];
}

const UserSearch = ({ currentUser, existingContacts, onAddContact, allUsers }: UserSearchProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0] || ''}`.toUpperCase();
  };

  const filteredUsers = allUsers.filter((user) => {
    if (user.id === currentUser.id) return false;
    if (!searchQuery) return false;
    
    const query = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(query) ||
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query)
    );
  });

  const isContact = (userId: string) => {
    return existingContacts.some((contact) => contact.id === userId);
  };

  const handleAddContact = (user: User) => {
    onAddContact(user);
    toast({
      title: 'Контакт добавлен',
      description: `${user.firstName} ${user.lastName} добавлен в список контактов`,
    });
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
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Поиск пользователей</h1>
          <p className="text-sm text-muted-foreground">
            Найдите коллег по username, имени или фамилии
          </p>
        </div>

        <div className="relative">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Введите username или имя..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <div className="space-y-2">
          {searchQuery && filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Icon name="Search" size={48} className="mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Пользователи не найдены</p>
              <p className="text-sm text-muted-foreground/70">
                Попробуйте изменить запрос
              </p>
            </div>
          )}

          {!searchQuery && (
            <div className="text-center py-12">
              <Icon name="Users" size={48} className="mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Начните вводить для поиска</p>
              <p className="text-sm text-muted-foreground/70">
                Используйте username, имя или фамилию
              </p>
            </div>
          )}

          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                {user.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent border-2 border-card rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">
                    {user.firstName} {user.lastName}
                  </h3>
                  {user.isDeveloper && (
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="bg-primary rounded-full p-0.5 flex-shrink-0">
                          <Icon name="Check" size={10} className="text-white" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Верифицированный аккаунт разработчика</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatLastSeen(user.lastSeen, user.isOnline)}
                </p>
              </div>
              {isContact(user.id) ? (
                <Button variant="outline" size="sm" disabled className="flex-shrink-0">
                  <Icon name="Check" size={16} className="mr-2" />
                  В контактах
                </Button>
              ) : (
                <Button onClick={() => handleAddContact(user)} size="sm" className="flex-shrink-0">
                  <Icon name="UserPlus" size={16} className="mr-2" />
                  Добавить
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserSearch;
