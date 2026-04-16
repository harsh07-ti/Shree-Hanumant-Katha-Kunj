import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email !== 'admin@gmail.com') {
      toast.error('Unauthorized email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Admin login successful');
      navigate('/home');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-stone-800 rounded-3xl shadow-2xl p-8 relative z-10 border border-stone-700"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-stone-400 text-sm">Authorized personnel only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-600 bg-stone-700 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-600 bg-stone-700 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-orange-700 transition-all active:scale-95 disabled:opacity-70 mt-4"
          >
            {isSubmitting ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-stone-400 hover:text-white transition-colors">
            &larr; Back to Guest Entry
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
