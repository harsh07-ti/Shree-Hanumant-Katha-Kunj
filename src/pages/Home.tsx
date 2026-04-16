import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ref, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { Bell, Volume2, VolumeX } from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
}

export default function Home() {
  const { settings, user } = useApp();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const noticesRef = ref(db, 'notices');
    const unsubscribe = onValue(noticesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const noticesList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setNotices(noticesList);
      } else {
        setNotices([]);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 text-center"
      >
        <h2 className="text-2xl font-bold text-orange-800 mb-1">Jai Shri Ram, {user?.name}</h2>
        <p className="text-stone-500 text-sm">Welcome to Shree Hanumant Katha Kunj</p>
      </motion.div>

      {/* Live Aarti Darshan */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl overflow-hidden shadow-sm border border-orange-100"
      >
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 flex justify-between items-center text-white">
          <h3 className="font-bold flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            Live Aarti Darshan
          </h3>
        </div>
        
        <div className="relative aspect-video bg-stone-900">
          {settings.videoUrl ? (
            <iframe
              src={`${settings.videoUrl}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=1`}
              title="Live Darshan"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-500">
              No live stream available
            </div>
          )}
          
          {/* Sound Toggle Overlay */}
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-black/80 transition-colors"
          >
            {isMuted ? (
              <>
                <VolumeX size={16} />
                Tap to Enable Sound
              </>
            ) : (
              <>
                <Volume2 size={16} />
                Mute
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Notices Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className="font-bold text-lg text-stone-800 flex items-center gap-2 px-1">
          <Bell size={20} className="text-orange-500" />
          Temple Notices
        </h3>
        
        {notices.length > 0 ? (
          <div className="space-y-3">
            {notices.map((notice) => (
              <div key={notice.id} className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 border-l-4 border-l-orange-500">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-stone-800">{notice.title}</h4>
                  <span className="text-xs text-stone-400 bg-stone-100 px-2 py-1 rounded-full">
                    {new Date(notice.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed">{notice.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 text-center text-stone-500">
            No new notices at the moment.
          </div>
        )}
      </motion.div>
    </div>
  );
}
