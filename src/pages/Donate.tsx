import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ref, push, serverTimestamp } from 'firebase/database';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export default function Donate() {
  const { settings, user } = useApp();
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const donationsRef = ref(db, 'donations');
      await push(donationsRef, {
        userId: user.uid,
        name: user.name,
        amount: Number(amount),
        status: 'pending', // Admin will approve/verify
        createdAt: serverTimestamp()
      });
      
      toast.success('Donation recorded! Please complete payment via QR.');
      setAmount('');
    } catch (error) {
      toast.error('Failed to record donation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-orange-800">Temple Donation</h2>
        <p className="text-stone-500 text-sm">Support the temple activities</p>
      </div>

      {/* QR Code Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 shadow-sm border border-orange-100 text-center"
      >
        <div className="bg-orange-50 rounded-2xl p-4 mb-6 inline-block">
          {settings.qrUrl ? (
            <img 
              src={settings.qrUrl} 
              alt="Donation QR Code" 
              className="w-48 h-48 object-contain mx-auto mix-blend-multiply"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-stone-400 bg-stone-100 rounded-xl">
              QR Not Available
            </div>
          )}
        </div>
        <p className="text-stone-600 font-medium mb-2">Scan to Donate via UPI</p>
        <p className="text-sm text-stone-400">Shree Hanumant Katha Kunj Trust</p>
      </motion.div>

      {/* Record Donation Form */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100"
      >
        <h3 className="font-bold text-lg text-stone-800 mb-4">Record Your Donation</h3>
        <p className="text-sm text-stone-500 mb-6">
          After scanning and paying, please enter the amount here for our records.
        </p>

        <form onSubmit={handleDonate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-medium">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-orange-50/50"
                required
                min="1"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-70"
          >
            {isSubmitting ? 'Recording...' : 'Submit Details'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
