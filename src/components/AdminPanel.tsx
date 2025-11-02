import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import type { User as ApiUser } from '@/lib/api';
import type { User } from '@/pages/Index';

interface AdminPanelProps {
  currentUser: User;
}

const AdminPanel = ({ currentUser }: AdminPanelProps) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.adminGetUsers(currentUser.id);
      setUsers(data);
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId: string, isBlocked: boolean) => {
    try {
      await api.adminBlockUser(currentUser.id, userId, isBlocked);
      await loadUsers();
      toast({
        title: 'Успешно',
        description: isBlocked ? 'Пользователь заблокирован' : 'Пользователь разблокирован',
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Вы уверены? Это действие нельзя отменить. Пользователь и все его сообщения будут удалены.')) {
      return;
    }

    try {
      await api.adminDeleteUser(currentUser.id, userId);
      await loadUsers();
      toast({
        title: 'Успешно',
        description: 'Пользователь удалён',
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0] || ''}`.toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ru');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Icon name="Shield" size={32} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Панель администратора</h1>
            <p className="text-sm text-muted-foreground">Управление пользователями системы</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Всего пользователей</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Онлайн</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {users.filter((u) => u.is_online).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Заблокировано</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                {users.filter((u) => u.is_blocked).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Список пользователей</CardTitle>
            <CardDescription>Просмотр и управление учётными записями</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Icon name="Loader2" size={32} className="animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Логин/Пароль</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Регистрация</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                              {getInitials(user.first_name, user.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {user.first_name} {user.last_name}
                              </p>
                              {user.is_developer && (
                                <Badge variant="default" className="text-xs">
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        <div className="font-mono text-xs">
                          <div>
                            <span className="text-muted-foreground">Login: </span>
                            {user.username}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Pass: </span>
                            {user.password}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {user.is_online ? (
                            <Badge variant="default" className="w-fit bg-accent">
                              <Icon name="Circle" size={8} className="mr-1 fill-current" />
                              Онлайн
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="w-fit">
                              Офлайн
                            </Badge>
                          )}
                          {user.is_blocked && (
                            <Badge variant="destructive" className="w-fit">
                              Заблокирован
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.created_at ? formatDate(user.created_at) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.id !== currentUser.id && (
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant={user.is_blocked ? 'outline' : 'destructive'}
                              size="sm"
                              onClick={() => handleBlockUser(user.id, !user.is_blocked)}
                            >
                              <Icon
                                name={user.is_blocked ? 'Unlock' : 'Ban'}
                                size={16}
                                className="mr-2"
                              />
                              {user.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Icon name="Trash2" size={16} className="mr-2" />
                              Удалить
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;