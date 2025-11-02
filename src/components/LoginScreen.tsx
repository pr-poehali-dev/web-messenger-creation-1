import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';
import type { User } from '@/pages/Index';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');

    if (!phone || !password) {
      setError('Заполните все поля');
      return;
    }

    setLoading(true);

    try {
      let apiUser;
      if (isRegister) {
        apiUser = await api.register(phone, password);
      } else {
        apiUser = await api.login(phone, password);
      }

      const user: User = {
        id: apiUser.id,
        phone: apiUser.phone,
        firstName: apiUser.first_name,
        lastName: apiUser.last_name,
        username: apiUser.username,
        isDeveloper: apiUser.is_developer,
        isBlocked: apiUser.is_blocked,
        lastSeen: new Date(apiUser.last_seen),
        isOnline: apiUser.is_online,
      };

      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <Card className="w-full max-w-md mx-4 shadow-xl border-slate-200">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto bg-primary rounded-2xl p-4 w-16 h-16 flex items-center justify-center">
            <Icon name="MessageSquare" className="text-white" size={32} />
          </div>
          <CardTitle className="text-2xl font-semibold">Корпоративный мессенджер</CardTitle>
          <CardDescription className="text-base">
            {isRegister ? 'Создайте новый аккаунт' : 'Войдите, используя номер телефона и пароль'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Номер телефона
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+7 (902) 242-80-92"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Пароль
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="h-11"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              <Icon name="AlertCircle" size={16} />
              <span>{error}</span>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              onClick={handleLogin}
              variant={isRegister ? 'outline' : 'default'}
              className="flex-1 h-11 text-base font-medium"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Загрузка...' : 'Войти'}
            </Button>
            <Button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              variant={isRegister ? 'default' : 'outline'}
              className="flex-1 h-11 text-base font-medium"
              size="lg"
              disabled={loading}
            >
              Регистрация
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground pt-2">
            {isRegister ? 'При регистрации будет создан новый аккаунт' : 'Аккаунт создается автоматически при первом входе'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginScreen;