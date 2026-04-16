import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Activity, HeartHandshake, CalendarDays, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Layout() {
  const { settings } = useApp();

  return (
    <div className="flex flex-col h-screen bg-orange-50 font-sans text-stone-800">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 shadow-md flex items-center justify-center relative z-10">
        <div className="flex flex-col items-center">
          {settings.logoUrl && (
            <img 
              src={settings.logoUrl} 
              alt="Temple Logo" 
              className="h-12 w-12 object-contain mb-1 drop-shadow-md"
              referrerPolicy="no-referrer"
            />
          )}
          <h1 className="text-xl font-bold tracking-wide text-center">Jai Shri Ram</h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 relative">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-orange-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          <NavItem to="/home" icon={<Home size={24} />} label="Home" />
          <NavItem to="/jaap" icon={<Activity size={24} />} label="Jaap" />
          <NavItem to="/donate" icon={<HeartHandshake size={24} />} label="Donate" />
          <NavItem to="/booking" icon={<CalendarDays size={24} />} label="Booking" />
          <NavItem to="/profile" icon={<User size={24} />} label="Profile" />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
          isActive ? 'text-orange-600' : 'text-stone-500 hover:text-orange-500'
        }`
      }
    >
      {icon}
      <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
    </NavLink>
  );
}
