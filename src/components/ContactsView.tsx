import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/pages/Index';

interface ContactsViewProps {
  currentUser: User;
  contacts: User[];
  allUsers: User[];
  onAddContact: (user: User) => void;
}

const ContactsView = ({ currentUser, contacts, allUsers, onAddContact }: ContactsViewProps) => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleAddByPhone = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите номер телефона',
        variant: 'destructive',
      });
      return;
    }

    const user = allUsers.find((u) => u.phone === phoneNumber && u.id !== currentUser.id);

    if (!user) {
      toast({
        title: 'Пользователь не найден',
        description: 'Пользователь с таким номером не зарегистрирован',
        variant: 'destructive',
      });
      return;
    }

    const isAlreadyContact = contacts.some((c) => c.id === user.id);
    if (isAlreadyContact) {
      onAddContact(user);
      setIsDialogOpen(false);
      setPhoneNumber('');
      toast({
        title: 'Чат открыт',
        description: `Переход к чату с ${user.firstName} ${user.lastName}`,
      });
      return;
    }

    onAddContact(user);
    setIsDialogOpen(false);
    setPhoneNumber('');
    toast({
      title: 'Контакт добавлен',
      description: `${user.firstName} ${user.lastName} добавлен в контакты`,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Контакты</h1>
            <p className="text-sm text-muted-foreground">
              Управление вашими контактами
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Icon name="UserPlus" size={18} className="mr-2" />
                Добавить контакт
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить контакт</DialogTitle>
                <DialogDescription>
                  Введите номер телефона пользователя для добавления в контакты
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Номер телефона</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+7 (916) 123-45-67"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddByPhone()}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleAddByPhone}>
                  Добавить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {contacts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Icon name="Users" size={64} className="text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Нет контактов</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Добавьте первый контакт по номеру телефона
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Icon name="UserPlus" size={18} className="mr-2" />
                Добавить контакт
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {contacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {getInitials(contact.firstName, contact.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      {contact.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent border-2 border-card rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {contact.firstName} {contact.lastName}
                        </h3>
                        {contact.isDeveloper && (
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
                      <p className="text-sm text-muted-foreground">@{contact.username}</p>
                      <p className="text-sm text-muted-foreground">{contact.phone}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatLastSeen(contact.lastSeen, contact.isOnline)}
                      </p>
                    </div>
                    <Button onClick={() => onAddContact(contact)} size="sm">
                      <Icon name="MessageSquare" size={16} className="mr-2" />
                      Написать
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsView;
