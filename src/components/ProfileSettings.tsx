import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/pages/Index';

interface ProfileSettingsProps {
  currentUser: User;
  onUpdateProfile: (firstName: string, lastName: string, username: string) => void;
}

const ProfileSettings = ({ currentUser, onUpdateProfile }: ProfileSettingsProps) => {
  const { toast } = useToast();
  const [firstName, setFirstName] = useState(currentUser.firstName);
  const [lastName, setLastName] = useState(currentUser.lastName);
  const [username, setUsername] = useState(currentUser.username);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0] || ''}`.toUpperCase();
  };

  const handleSave = () => {
    if (!firstName.trim() || !username.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Имя и username обязательны для заполнения',
        variant: 'destructive',
      });
      return;
    }

    onUpdateProfile(firstName, lastName, username);
    
    toast({
      title: 'Профиль обновлён',
      description: 'Изменения успешно сохранены',
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Настройки профиля</h1>
            <p className="text-sm text-muted-foreground">Управление личной информацией</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Аватар и статус</CardTitle>
            <CardDescription>Ваше изображение профиля и верификация</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-muted">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-2xl">
                  {getInitials(firstName, lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">
                    {firstName} {lastName}
                  </h3>
                  {currentUser.isDeveloper && (
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="bg-primary rounded-full p-1">
                          <Icon name="Check" size={12} className="text-white" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Верифицированный аккаунт разработчика</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">@{username}</p>
                <p className="text-sm text-muted-foreground">{currentUser.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Личная информация</CardTitle>
            <CardDescription>Обновите свои данные профиля</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Введите имя"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Введите фамилию"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="username"
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Другие пользователи смогут найти вас по username
              </p>
            </div>
            <Button onClick={handleSave} className="w-full">
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить изменения
            </Button>
          </CardContent>
        </Card>

        {currentUser.isDeveloper && (
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="Shield" size={20} className="text-primary" />
                Права разработчика
              </CardTitle>
              <CardDescription>Административные функции системы</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon name="Users" size={18} className="text-muted-foreground" />
                  <span className="text-sm font-medium">Управление пользователями</span>
                </div>
                <Button variant="outline" size="sm">
                  Открыть
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon name="Eye" size={18} className="text-muted-foreground" />
                  <span className="text-sm font-medium">Просмотр учётных данных</span>
                </div>
                <Button variant="outline" size="sm">
                  Открыть
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon name="Ban" size={18} className="text-muted-foreground" />
                  <span className="text-sm font-medium">Блокировка аккаунтов</span>
                </div>
                <Button variant="outline" size="sm">
                  Открыть
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;