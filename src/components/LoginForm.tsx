import React, { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onLogin: (success: boolean) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');

  const correctPassword = 'inventory2024';
  const maxAttempts = 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (attempts >= maxAttempts) {
      setError('アクセスがブロックされました。しばらく時間をおいてから再試行してください。');
      return;
    }

    if (password === correctPassword) {
      onLogin(true);
      setError('');
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      const remaining = maxAttempts - newAttempts;
      
      if (remaining > 0) {
        setError(`パスワードが間違っています。残り${remaining}回の試行が可能です。`);
      } else {
        setError('アクセスがブロックされました。しばらく時間をおいてから再試行してください。');
      }
    }
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">在庫管理システム</h1>
          <p className="text-gray-600">システムにアクセスするにはパスワードを入力してください</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="パスワードを入力"
              disabled={attempts >= maxAttempts}
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={attempts >= maxAttempts}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            ログイン
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>デモ用パスワード: inventory2024</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;