import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { ref, onValue, set, get } from 'firebase/database';

export interface AppUser {
  uid: string;
  name: string;
  totalJaap: number;
  dailyJaap: number;
  lastJaapDate: string;
  role: 'guest' | 'admin';
}

interface AppSettings {
  logoUrl: string;
  qrUrl: string;
  videoUrl: string;
}

interface AppContextType {
  user: AppUser | null;
  adminUser: FirebaseUser | null;
  settings: AppSettings;
  loginGuest: (name: string) => Promise<void>;
  logoutGuest: () => void;
  loading: boolean;
}

const defaultSettings: AppSettings = {
  logoUrl: 'https://cdn-icons-png.flaticon.com/512/10397/10397185.png', // Default Om/Temple logo
  qrUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg', // Default QR
  videoUrl: 'https://www.youtube.com/embed/live_stream?channel=YOUR_CHANNEL_ID', // Default Live
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [adminUser, setAdminUser] = useState<FirebaseUser | null>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load settings
    const settingsRef = ref(db, 'settings');
    const unsubscribeSettings = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings({ ...defaultSettings, ...snapshot.val() });
      } else {
        // Initialize settings if not exists
        set(settingsRef, defaultSettings);
      }
    });

    // Check local storage for guest user
    const guestUid = localStorage.getItem('guestUid');
    if (guestUid) {
      const userRef = ref(db, `users/${guestUid}`);
      get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
          setUser(snapshot.val());
        } else {
          localStorage.removeItem('guestUid');
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }

    // Listen for admin auth state
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setAdminUser(firebaseUser);
      if (firebaseUser && firebaseUser.email === 'admin@gmail.com') {
        // If admin logs in, we might want to set them as the current user or just keep adminUser state
        // For now, admin can also have a user profile or just access admin panel
        const adminUid = firebaseUser.uid;
        const userRef = ref(db, `users/${adminUid}`);
        get(userRef).then((snapshot) => {
          if (!snapshot.exists()) {
            const newAdminUser: AppUser = {
              uid: adminUid,
              name: 'Admin',
              totalJaap: 0,
              dailyJaap: 0,
              lastJaapDate: new Date().toISOString().split('T')[0],
              role: 'admin'
            };
            set(userRef, newAdminUser);
            setUser(newAdminUser);
          } else {
            setUser(snapshot.val());
          }
        });
      }
    });

    return () => {
      unsubscribeSettings();
      unsubscribeAuth();
    };
  }, []);

  // Listen to current user changes in DB
  useEffect(() => {
    if (user?.uid) {
      const userRef = ref(db, `users/${user.uid}`);
      const unsubscribeUser = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          setUser(snapshot.val());
        }
      });
      return () => unsubscribeUser();
    }
  }, [user?.uid]);

  const loginGuest = async (name: string) => {
    const newUid = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const newUser: AppUser = {
      uid: newUid,
      name,
      totalJaap: 0,
      dailyJaap: 0,
      lastJaapDate: new Date().toISOString().split('T')[0],
      role: 'guest'
    };
    await set(ref(db, `users/${newUid}`), newUser);
    localStorage.setItem('guestUid', newUid);
    setUser(newUser);
  };

  const logoutGuest = () => {
    localStorage.removeItem('guestUid');
    setUser(null);
    if (adminUser) {
      auth.signOut();
    }
  };

  return (
    <AppContext.Provider value={{ user, adminUser, settings, loginGuest, logoutGuest, loading }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
