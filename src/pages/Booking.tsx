import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ref, push, serverTimestamp, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

interface BookingRecord {
  id: string;
  name: string;
  date: string;
  roomType: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function Booking() {
  const { user } = useApp();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '',
    date: '',
    people: '1',
    roomType: 'standard'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myBookings, setMyBookings] = useState<BookingRecord[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const bookingsRef = ref(db, 'bookings');
    // We fetch all and filter client side for simplicity, in production use proper query
    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const userBookings = Object.keys(data)
          .filter(key => data[key].userId === user.uid)
          .map(key => ({
            id: key,
            ...data[key]
          }))
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setMyBookings(userBookings);
      } else {
        setMyBookings([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const bookingsRef = ref(db, 'bookings');
      await push(bookingsRef, {
        userId: user.uid,
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      toast.success('Booking request submitted successfully!');
      setFormData({ ...formData, phone: '', date: '', people: '1' });
    } catch (error) {
      toast.error('Failed to submit booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-orange-800">Room Booking</h2>
        <p className="text-stone-500 text-sm">Book your stay at the ashram</p>
      </div>

      {/* Booking Form */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-orange-50/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-orange-50/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-orange-50/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">People</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.people}
                onChange={(e) => setFormData({...formData, people: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-orange-50/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Room Type</label>
            <select
              value={formData.roomType}
              onChange={(e) => setFormData({...formData, roomType: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-orange-50/50"
            >
              <option value="standard">Standard Room</option>
              <option value="ac">AC Room</option>
              <option value="dormitory">Dormitory</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-70 mt-2"
          >
            {isSubmitting ? 'Submitting...' : 'Request Booking'}
          </button>
        </form>
      </motion.div>

      {/* My Bookings */}
      {myBookings.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h3 className="font-bold text-lg text-stone-800">My Bookings</h3>
          <div className="space-y-3">
            {myBookings.map((booking) => (
              <div key={booking.id} className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 flex justify-between items-center">
                <div>
                  <p className="font-bold text-stone-800">{new Date(booking.date).toLocaleDateString()}</p>
                  <p className="text-sm text-stone-500 capitalize">{booking.roomType} Room</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  booking.status === 'approved' ? 'bg-green-100 text-green-700' :
                  booking.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
