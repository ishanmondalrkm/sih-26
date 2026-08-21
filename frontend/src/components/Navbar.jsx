import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, LogIn, LayoutDashboard, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group" data-testid="navbar-logo-link">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 block leading-tight font-outfit">
              Civic<span className="text-blue-600">Pulse</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
              Municipal Grievance System
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <Link to="/" className="hover:text-blue-600 transition-colors" data-testid="nav-link-home">
            Home
          </Link>
          <a href="#how-it-works" className="hover:text-blue-600 transition-colors" data-testid="nav-link-how-it-works">
            How It Works
          </a>
          <a href="#categories" className="hover:text-blue-600 transition-colors" data-testid="nav-link-categories">
            Categories
          </a>
          <a href="#stats" className="hover:text-blue-600 transition-colors" data-testid="nav-link-stats">
            City Stats
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <Link
                to={user.role === 'citizen' ? '/citizen' : '/admin'}
                data-testid="nav-dashboard-btn"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
              >
                <LayoutDashboard className="h-4 w-4" />
                {user.role === 'citizen' ? 'Citizen Portal' : 'Admin Portal'}
              </Link>
              <button
                onClick={logout}
                data-testid="nav-logout-btn"
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                data-testid="nav-login-btn"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign In
              </Link>
              <Link
                to="/login?mode=register"
                data-testid="nav-register-btn"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Report Grievance
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}