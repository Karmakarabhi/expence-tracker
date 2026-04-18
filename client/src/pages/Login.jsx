import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{isLogin ? 'Sign in to your account' : 'Create an account'}</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {!isLogin && (
              <div>
                <input name="name" type="text" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}
            <div>
              <input name="email" type="email" required className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${isLogin ? 'rounded-t-md' : ''} focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`} placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <input name="password" type="password" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>
          <div>
            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {isLogin ? 'Sign in' : 'Register'}
            </button>
          </div>
          <div className="text-center text-sm">
             <button type="button" onClick={() => setIsLogin(!isLogin)} className="font-medium text-blue-600 hover:text-blue-500">
                {isLogin ? 'Need an account? Register' : 'Already have an account? Sign in'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}