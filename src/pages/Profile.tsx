import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ref, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { LogOut, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logoutGuest } = useApp();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ donations: 0, bookings: 0 });
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinAttempts, setPinAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Fetch user's donations count
    const donationsRef = ref(db, 'donations');
    const unsubDonations = onValue(donationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const count = Object.values(data).filter((d: any) => d.userId === user.uid).length;
        setStats(s => ({ ...s, donations: count }));
      }
    });

    // Fetch user's bookings count
    const bookingsRef = ref(db, 'bookings');
    const unsubBookings = onValue(bookingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const count = Object.values(data).filter((b: any) => b.userId === user.uid).length;
        setStats(s => ({ ...s, bookings: count }));
      }
    });

    return () => {
      unsubDonations();
      unsubBookings();
    };
  }, [user]);

  const handleLogout = () => {
    logoutGuest();
    navigate('/');
  };

  const handleAdminAccess = () => {
    if (isLocked) {
      toast.error('Admin panel locked. Try again later.');
      return;
    }
    setShowPinModal(true);
  };

  const verifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '9696') {
      setShowPinModal(false);
      setPin('');
      setPinAttempts(0);
      navigate('/admin-dashboard');
    } else {
      const newAttempts = pinAttempts + 1;
      setPinAttempts(newAttempts);
      setPin('');
      
      if (newAttempts >= 3) {
        setIsLocked(true);
        setShowPinModal(false);
        toast.error('Too many failed attempts. Locked for 30 seconds.');
        setTimeout(() => {
          setIsLocked(false);
          setPinAttempts(0);
        }, 30000);
      } else {
        toast.error(`Incorrect PIN. ${3 - newAttempts} attempts left.`);
      }
    }
  };

  if (!user) return null;

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto">
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 shadow-sm border border-orange-100 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-orange-400 to-red-500"></div>
        <div className="relative z-10">
          <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 border-4 border-white shadow-lg flex items-center justify-center text-4xl font-bold text-orange-500 uppercase">
            {user.name.charAt(0)}
          </div>
          <h2 className="text-2xl font-bold text-stone-800">{user.name}</h2>
          <p className="text-stone-500 capitalize">{user.role} Devotee</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 text-center">
          <div className="text-3xl font-black text-orange-500 mb-1">{user.totalJaap || 0}</div>
          <div className="text-xs font-medium text-stone-400 uppercase tracking-wider">Total Jaap</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 text-center">
          <div className="text-3xl font-black text-orange-500 mb-1">{stats.donations}</div>
          <div className="text-xs font-medium text-stone-400 uppercase tracking-wider">Donations</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 text-center col-span-2">
          <div className="text-3xl font-black text-orange-500 mb-1">{stats.bookings}</div>
          <div className="text-xs font-medium text-stone-400 uppercase tracking-wider">Room Bookings</div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3 pt-4"
      >
        {user.role === 'admin' && (
          <button
            onClick={handleAdminAccess}
            className="w-full bg-stone-800 text-white font-bold py-4 rounded-xl shadow-md hover:bg-stone-900 transition-all flex items-center justify-center gap-2"
          >
            <ShieldAlert size={20} />
            Admin Panel 🔐
          </button>
        )}

        <button
          onClick={handleLogout}
          className="w-full bg-white text-red-500 font-bold py-4 rounded-xl shadow-sm border border-red-100 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          Logout
        </button>
      </motion.div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
          >
            <h3 className="text-xl font-bold text-stone-800 mb-2 text-center">Admin Access</h3>
            <p className="text-stone-500 text-sm text-center mb-6">Enter PIN to access dashboard</p>
            
            <form onSubmit={verifyPin} className="space-y-4">
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-3xl tracking-[1em] px-4 py-4 rounded-xl border-2 border-stone-200 focus:border-stone-800 outline-none transition-all font-mono"
                placeholder="••••"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pin.length !== 4}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-stone-800 hover:bg-stone-900 transition-colors disabled:opacity-50"
                >
                  Verify
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
