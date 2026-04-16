import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, update, remove, push, serverTimestamp } from 'firebase/database';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { Users, Activity, HeartHandshake, CalendarDays, Settings, Bell, ArrowLeft, Check, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [stats, setStats] = useState({ users: 0, jaap: 0, donations: 0, bookings: 0 });
  const [bookings, setBookings] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // Settings states
  const [appSettings, setAppSettings] = useState({ logoUrl: '', qrUrl: '', videoUrl: '' });
  const [newNotice, setNewNotice] = useState({ title: '', content: '' });

  useEffect(() => {
    // Fetch all data
    const usersRef = ref(db, 'users');
    const bookingsRef = ref(db, 'bookings');
    const donationsRef = ref(db, 'donations');
    const noticesRef = ref(db, 'notices');
    const settingsRef = ref(db, 'settings');

    const unsubUsers = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const usersList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setUsers(usersList);
        
        const totalJaap = usersList.reduce((sum, u) => sum + (u.totalJaap || 0), 0);
        setStats(s => ({ ...s, users: usersList.length, jaap: totalJaap }));
      }
    });

    const unsubBookings = onValue(bookingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] })).sort((a, b) => b.createdAt - a.createdAt);
        setBookings(list);
        setStats(s => ({ ...s, bookings: list.length }));
      }
    });

    const unsubDonations = onValue(donationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] })).sort((a, b) => b.createdAt - a.createdAt);
        setDonations(list);
        setStats(s => ({ ...s, donations: list.length }));
      }
    });

    const unsubNotices = onValue(noticesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setNotices(list);
      } else {
        setNotices([]);
      }
    });

    const unsubSettings = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setAppSettings(snapshot.val());
      }
    });

    return () => {
      unsubUsers();
      unsubBookings();
      unsubDonations();
      unsubNotices();
      unsubSettings();
    };
  }, []);

  // Handlers
  const handleBookingStatus = async (id: string, status: string) => {
    try {
      await update(ref(db, `bookings/${id}`), { status });
      toast.success(`Booking ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDonationStatus = async (id: string, status: string) => {
    try {
      await update(ref(db, `donations/${id}`), { status });
      toast.success(`Donation ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await update(ref(db, 'settings'), appSettings);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) return;
    
    try {
      await push(ref(db, 'notices'), {
        ...newNotice,
        date: new Date().toISOString()
      });
      setNewNotice({ title: '', content: '' });
      toast.success('Notice added');
    } catch (error) {
      toast.error('Failed to add notice');
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (confirm('Are you sure you want to delete this notice?')) {
      try {
        await remove(ref(db, `notices/${id}`));
        toast.success('Notice deleted');
      } catch (error) {
        toast.error('Failed to delete notice');
      }
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 font-sans text-stone-800 pb-20">
      {/* Header */}
      <header className="bg-stone-900 text-white p-4 sticky top-0 z-20 shadow-md flex items-center gap-4">
        <button onClick={() => navigate('/home')} className="p-2 hover:bg-stone-800 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
      </header>

      {/* Tabs */}
      <div className="flex overflow-x-auto bg-white border-b border-stone-200 sticky top-[60px] z-10 hide-scrollbar">
        {[
          { id: 'overview', icon: <Activity size={18} />, label: 'Overview' },
          { id: 'bookings', icon: <CalendarDays size={18} />, label: 'Bookings' },
          { id: 'donations', icon: <HeartHandshake size={18} />, label: 'Donations' },
          { id: 'notices', icon: <Bell size={18} />, label: 'Notices' },
          { id: 'users', icon: <Users size={18} />, label: 'Users' },
          { id: 'settings', icon: <Settings size={18} />, label: 'Settings' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id ? 'border-orange-500 text-orange-600 bg-orange-50/50' : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="p-4 max-w-4xl mx-auto">
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Users" value={stats.users} icon={<Users className="text-blue-500" />} />
            <StatCard title="Total Jaap" value={stats.jaap} icon={<Activity className="text-orange-500" />} />
            <StatCard title="Donations" value={stats.donations} icon={<HeartHandshake className="text-green-500" />} />
            <StatCard title="Bookings" value={stats.bookings} icon={<CalendarDays className="text-purple-500" />} />
          </motion.div>
        )}

        {activeTab === 'bookings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Manage Bookings</h2>
            {bookings.map(booking => (
              <div key={booking.id} className="bg-white p-4 rounded-xl shadow-sm border border-stone-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{booking.name}</h3>
                    <p className="text-sm text-stone-500">{booking.phone} • {booking.people} People</p>
                    <p className="text-sm font-medium text-stone-700 mt-1">
                      {new Date(booking.date).toLocaleDateString()} • {booking.roomType} Room
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    booking.status === 'approved' ? 'bg-green-100 text-green-700' :
                    booking.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                
                {booking.status === 'pending' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-stone-100">
                    <button onClick={() => handleBookingStatus(booking.id, 'approved')} className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-100 transition-colors">
                      <Check size={18} /> Approve
                    </button>
                    <button onClick={() => handleBookingStatus(booking.id, 'rejected')} className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
                      <X size={18} /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
            {bookings.length === 0 && <p className="text-stone-500 text-center py-8">No bookings found.</p>}
          </motion.div>
        )}

        {activeTab === 'donations' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Verify Donations</h2>
            {donations.map(donation => (
              <div key={donation.id} className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{donation.name}</h3>
                  <p className="text-lg font-black text-green-600">₹{donation.amount}</p>
                  <p className="text-xs text-stone-400">{new Date(donation.createdAt).toLocaleString()}</p>
                </div>
                
                {donation.status === 'pending' ? (
                  <div className="flex gap-2">
                    <button onClick={() => handleDonationStatus(donation.id, 'verified')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" title="Verify">
                      <Check size={20} />
                    </button>
                    <button onClick={() => handleDonationStatus(donation.id, 'rejected')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Reject">
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    donation.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {donation.status}
                  </span>
                )}
              </div>
            ))}
            {donations.length === 0 && <p className="text-stone-500 text-center py-8">No donations found.</p>}
          </motion.div>
        )}

        {activeTab === 'notices' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
              <h3 className="font-bold mb-4">Add New Notice</h3>
              <form onSubmit={handleAddNotice} className="space-y-4">
                <input
                  type="text"
                  placeholder="Notice Title"
                  value={newNotice.title}
                  onChange={e => setNewNotice({...newNotice, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-orange-500 outline-none"
                  required
                />
                <textarea
                  placeholder="Notice Content"
                  value={newNotice.content}
                  onChange={e => setNewNotice({...newNotice, content: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-orange-500 outline-none h-24 resize-none"
                  required
                />
                <button type="submit" className="bg-stone-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-stone-900 transition-colors">
                  Publish Notice
                </button>
              </form>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold">Current Notices</h3>
              {notices.map(notice => (
                <div key={notice.id} className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex justify-between items-start">
                  <div>
                    <h4 className="font-bold">{notice.title}</h4>
                    <p className="text-sm text-stone-600 mt-1">{notice.content}</p>
                    <p className="text-xs text-stone-400 mt-2">{new Date(notice.date).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => handleDeleteNotice(notice.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Registered Users</h2>
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-stone-50 text-stone-500 font-medium border-b border-stone-200">
                    <tr>
                      <th className="p-4">Name</th>
                      <th className="p-4">Role</th>
                      <th className="p-4 text-right">Total Jaap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-stone-50">
                        <td className="p-4 font-medium">{u.name}</td>
                        <td className="p-4 capitalize">
                          <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-stone-100 text-stone-700'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold text-orange-600">{u.totalJaap || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
            <h2 className="text-xl font-bold mb-6">App Settings</h2>
            <form onSubmit={handleUpdateSettings} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Temple Logo URL</label>
                <input
                  type="url"
                  value={appSettings.logoUrl}
                  onChange={e => setAppSettings({...appSettings, logoUrl: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-orange-500 outline-none"
                  placeholder="https://example.com/logo.png"
                />
                {appSettings.logoUrl && <img src={appSettings.logoUrl} alt="Preview" className="h-16 mt-2 object-contain" referrerPolicy="no-referrer" />}
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Donation QR Code URL</label>
                <input
                  type="url"
                  value={appSettings.qrUrl}
                  onChange={e => setAppSettings({...appSettings, qrUrl: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-orange-500 outline-none"
                  placeholder="https://example.com/qr.png"
                />
                {appSettings.qrUrl && <img src={appSettings.qrUrl} alt="Preview" className="h-24 mt-2 object-contain" referrerPolicy="no-referrer" />}
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Live Aarti YouTube Embed URL</label>
                <input
                  type="url"
                  value={appSettings.videoUrl}
                  onChange={e => setAppSettings({...appSettings, videoUrl: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-orange-500 outline-none"
                  placeholder="https://www.youtube.com/embed/..."
                />
                <p className="text-xs text-stone-500 mt-1">Use the embed URL format (e.g., https://www.youtube.com/embed/VIDEO_ID)</p>
              </div>

              <button type="submit" className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors w-full">
                Save All Settings
              </button>
            </form>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-stone-500">{title}</span>
        <div className="p-2 bg-stone-50 rounded-lg">{icon}</div>
      </div>
      <span className="text-2xl font-black text-stone-800">{value}</span>
    </div>
  );
}
