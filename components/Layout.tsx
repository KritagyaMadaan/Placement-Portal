import React, { useState } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { AuthService } from '../services/authService';
import { Role } from '../types';
import { LogOut, LayoutDashboard, User, Briefcase, Mail, ChevronDown, LogIn, ShieldCheck } from 'lucide-react';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = StorageService.getCurrentUser();
  const [isRecruiterMenuOpen, setIsRecruiterMenuOpen] = useState(false);

  // Public paths where the landing header should be shown
  const publicPaths = ['/', '/login', '/signup', '/register-company', '/recruiter-login', '/admin-login'];

  // Determine if we should show the public layout
  const isPublicView = publicPaths.includes(location.pathname);
  const logoUrl = "https://upload.wikimedia.org/wikipedia/en/a/a7/National_Forensic_Sciences_University_Logo.png";

  const handleLogout = async () => {
    await AuthService.logout();
    navigate('/');
  };

  const getDashboardRoute = (role: Role) => {
    switch (role) {
      case Role.ADMIN: return '/admin';
      case Role.RECRUITER: return '/recruiter';
      case Role.STUDENT: return '/student';
      default: return '/';
    }
  };

  // --- PUBLIC LAYOUT ---
  if (isPublicView) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-white text-slate-900">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
          <div className="container mx-auto px-6 h-20 flex items-center justify-between">

            {/* LEFT SIDE: Branding + Actions */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                <img src={logoUrl} alt="NFSU Logo" className="w-10 h-10 object-contain transition-transform group-hover:scale-105" />
                <div className="hidden lg:flex flex-col">
                  <span className="text-lg font-extrabold text-slate-900 leading-none tracking-tight">NFSU</span>
                  <span className="text-sm font-bold text-rose-500 tracking-widest uppercase mt-0.5">Placement Cell</span>
                </div>
              </div>

              <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

              <div className="flex items-center gap-3">
                {user ? (
                  <button
                    onClick={() => navigate(getDashboardRoute(user.role))}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition shadow-sm hover:shadow-md active:scale-95"
                  >
                    <LayoutDashboard size={16} />
                    Go to Dashboard
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => navigate('/login')}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition shadow-sm hover:shadow-md active:scale-95"
                    >
                      Student Login
                    </button>
                    <button
                      onClick={() => navigate('/signup')}
                      className="hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-200 text-slate-600 font-semibold text-sm hover:border-slate-400 hover:text-slate-900 transition active:scale-95"
                    >
                      Register
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* RIGHT SIDE: Master Login & Recruiter Dropdown */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/admin-login')}
                className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-slate-900 uppercase tracking-wider transition"
              >
                <ShieldCheck size={14} /> Master
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsRecruiterMenuOpen(!isRecruiterMenuOpen)}
                  onBlur={() => setTimeout(() => setIsRecruiterMenuOpen(false), 200)}
                  className="flex items-center gap-1.5 text-slate-600 font-semibold text-sm hover:text-rose-600 transition px-3 py-2 rounded-lg hover:bg-rose-50"
                >
                  For Recruiters <ChevronDown size={16} className={`transition-transform duration-200 ${isRecruiterMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isRecruiterMenuOpen && (
                  <div className="absolute right-0 mt-4 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-5 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Corporate Access</div>
                    <button
                      onClick={() => navigate('/recruiter-login')}
                      className="w-full text-left px-5 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-rose-600 flex items-center gap-3 font-medium transition-colors"
                    >
                      <LogIn size={16} /> Recruiter Login
                    </button>
                    <button
                      onClick={() => navigate('/register-company')}
                      className="w-full text-left px-5 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-rose-600 flex items-center gap-3 font-medium transition-colors"
                    >
                      <Briefcase size={16} /> Register Company
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-grow">
          <Outlet key={location.pathname} />
        </main>
        <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
          <div className="container mx-auto text-center px-4">
            <div className="mb-4">
              <span className="text-rose-600 font-bold tracking-widest uppercase text-xs">National Forensic Sciences University</span>
            </div>
            <p className="text-slate-900 font-bold text-lg tracking-tight">Dharwad Campus Placement Cell</p>
            <p className="text-gray-400 text-sm mt-4">© {new Date().getFullYear()} Official Portal • Secure & Verified</p>
          </div>
        </footer>
      </div>
    );
  }

  // --- AUTHENTICATED LAYOUT ---
  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-10 shadow-xl">
        <div className="p-6 border-b border-slate-700 flex items-center gap-3 cursor-pointer hover:bg-slate-800 transition" onClick={() => navigate('/')}>
          <img src={logoUrl} alt="NFSU Logo" className="w-10 h-10 object-contain bg-white rounded-full p-0.5" />
          <div>
            <h1 className="text-white text-lg font-bold leading-tight">NFSU Portal</h1>
            <p className="text-xs text-slate-400 truncate w-32" title={user?.name}>{user?.name}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {user?.role === Role.ADMIN && (
            <>
              <NavItem to="/admin" icon={<LayoutDashboard size={18} />} label="Overview" active={location.pathname === '/admin'} />
              <NavItem to="/admin/students" icon={<User size={18} />} label="Student Database" active={location.pathname === '/admin/students'} />
              <NavItem to="/admin/drives" icon={<Briefcase size={18} />} label="Placement Drives" active={location.pathname === '/admin/drives'} />
              <NavItem to="/admin/mail-bot" icon={<Mail size={18} />} label="Mail Bot (AI)" active={location.pathname === '/admin/mail-bot'} />
            </>
          )}

          {user?.role === Role.STUDENT && (
            <>
              <NavItem to="/student" icon={<LayoutDashboard size={18} />} label="Dashboard" active={location.pathname === '/student'} />
              <NavItem to="/student/profile" icon={<User size={18} />} label="My Profile" active={location.pathname === '/student/profile'} />
            </>
          )}

          {user?.role === Role.RECRUITER && (
            <>
              <NavItem to="/recruiter" icon={<LayoutDashboard size={18} />} label="Dashboard" active={location.pathname === '/recruiter'} />
              <NavItem to="/recruiter/drives" icon={<Briefcase size={18} />} label="My Drives" active={location.pathname === '/recruiter/drives'} />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-800 rounded transition"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet key={location.pathname} />
        </div>
      </main>
    </div>
  );
};

// Using Link instead of useNavigate for better router integration
const NavItem = ({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) => {
  return (
    <Link
      to={to}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-rose-600 text-white shadow-md' : 'hover:bg-slate-800'
        }`}
    >
      {icon}
      {label}
    </Link>
  )
}