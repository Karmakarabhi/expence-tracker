import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
        toast.success("Successfully logged in!");
        navigate('/');
      } else {
        await api.post('/auth/register', { name, email, password });
        toast.success("Registration successful! Logging in...");
        await login(email, password);
        navigate('/');
      }
    } catch(err) {
      toast.error(err.response?.data?.message || err.message || "An error occurred");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLogin ? 'Sign in to your Finlight account.' : 'Get started with Finlight.'}
          </p>
        </div>
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" type="text" placeholder="John Doe" required value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">
              {isLogin ? 'Sign in' : 'Create account'}
            </Button>
          </form>
        </Card>
        <p className="text-xs text-center text-muted-foreground">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-foreground underline-offset-4 hover:underline font-medium">
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}