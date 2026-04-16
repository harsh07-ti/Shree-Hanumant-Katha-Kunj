import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export default function GuestEntry() {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loginGuest, settings } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await loginGuest(name.trim());
      toast.success('Welcome to Shree Hanumant Katha Kunj!');
      navigate('/home');
    } catch (error) {
      toast.error('Failed to enter. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 to-orange-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 rounded-full bg-orange-500 blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 rounded-full bg-red-500 blur-3xl"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 text-center relative z-10 border border-orange-100"
      >
        {settings.logoUrl && (
          <motion.img 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            src={settings.logoUrl} 
            alt="Logo" 
            className="w-24 h-24 mx-auto mb-6 object-contain drop-shadow-lg"
            referrerPolicy="no-referrer"
          />
        )}
        
        <h1 className="text-2xl font-bold text-orange-800 mb-2">Shree Hanumant Katha Kunj</h1>
        <h2 className="text-lg font-medium text-orange-600 mb-8">Ayodhya Ji | Shree Ram Vilash Maharaj Ji</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="sr-only">Your Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full px-6 py-4 rounded-full border-2 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-center text-lg text-stone-800 placeholder:text-stone-400 bg-white/50"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg py-4 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Entering...
              </span>
            ) : (
              "Enter App 🙏"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-orange-100">
          <Link to="/admin-login" className="text-sm text-stone-500 hover:text-orange-600 transition-colors">
            Admin Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
