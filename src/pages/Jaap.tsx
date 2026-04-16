import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ref, update, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

export default function Jaap() {
  const { user } = useApp();
  const [count, setCount] = useState(0);
  const [dailyTarget] = useState(108);
  const [isAnimating, setIsAnimating] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{name: string, total: number}[]>([]);

  useEffect(() => {
    if (user) {
      // Reset daily jaap if it's a new day
      const today = new Date().toISOString().split('T')[0];
      if (user.lastJaapDate !== today) {
        const userRef = ref(db, `users/${user.uid}`);
        update(userRef, {
          dailyJaap: 0,
          lastJaapDate: today
        });
        setCount(0);
      } else {
        setCount(user.dailyJaap || 0);
      }
    }
  }, [user]);

  useEffect(() => {
    // Fetch leaderboard
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const leaders = Object.values(data)
          .map((u: any) => ({ name: u.name, total: u.totalJaap || 0 }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5);
        setLeaderboard(leaders);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleTap = () => {
    if (!user) return;
    
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    
    const newCount = count + 1;
    setCount(newCount);
    
    // Update Firebase
    const userRef = ref(db, `users/${user.uid}`);
    update(userRef, {
      dailyJaap: newCount,
      totalJaap: (user.totalJaap || 0) + 1,
      lastJaapDate: new Date().toISOString().split('T')[0]
    });

    if (newCount === dailyTarget) {
      toast.success('Congratulations! Daily target reached! 🙏', {
        icon: '📿',
        duration: 4000,
      });
    }
  };

  const progress = Math.min((count / dailyTarget) * 100, 100);

  return (
    <div className="p-4 space-y-8 max-w-md mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-orange-800">Ram Naam Jaap</h2>
        <p className="text-stone-500">Tap the mala to chant</p>
      </div>

      {/* Counter Display */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-orange-100 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-orange-100">
          <div 
            className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-600 to-red-600 mb-2">
          {count}
        </div>
        <div className="text-sm font-medium text-stone-400 uppercase tracking-widest">
          Daily Target: {dailyTarget}
        </div>
      </div>

      {/* Tap Button */}
      <div className="flex justify-center">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleTap}
          className="relative w-48 h-48 rounded-full bg-gradient-to-br from-orange-400 to-red-500 shadow-2xl flex items-center justify-center text-white text-3xl font-bold border-8 border-white outline-none focus:outline-none"
        >
          <div className="absolute inset-0 rounded-full bg-black opacity-0 hover:opacity-10 transition-opacity"></div>
          <span className="drop-shadow-md">राम</span>
          
          <AnimatePresence>
            {isAnimating && (
              <motion.div
                initial={{ opacity: 0.8, scale: 1 }}
                animate={{ opacity: 0, scale: 1.5 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-full border-4 border-orange-300"
              />
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100">
        <h3 className="font-bold text-lg text-stone-800 mb-4 flex items-center gap-2">
          🏆 Top Devotees
        </h3>
        <div className="space-y-3">
          {leaderboard.map((leader, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-orange-50/50">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-stone-200 text-stone-700' :
                  index === 2 ? 'bg-orange-200 text-orange-800' :
                  'bg-white text-stone-500'
                }`}>
                  {index + 1}
                </div>
                <span className="font-medium text-stone-700">{leader.name}</span>
              </div>
              <span className="font-bold text-orange-600">{leader.total}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
