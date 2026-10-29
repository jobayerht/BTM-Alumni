import React, { useState, useEffect } from 'react';
import { Search, Sun, Moon, Menu, X, ArrowUpRight } from 'lucide-react';
import { useRouter } from '../utils/router';
import { useData } from '../context/DataContext';
import { AlumniPortrait } from './EditorialMedia';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { path, navigate } = useRouter();
  const { theme, toggleTheme, getAllPublicProfiles, batches } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSearchModalOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const allProfiles = getAllPublicProfiles();

  const quickResults = quickQuery.trim()
    ? allProfiles
        .filter((p) => {
          const q = quickQuery.toLowerCase();
          return (
            p.alumni.fullName.toLowerCase().includes(q) ||
            p.alumni.studentId.toLowerCase().includes(q) ||
            (p.currentPosition?.organization || '').toLowerCase().includes(q) ||
            (p.currentPosition?.designation || '').toLowerCase().includes(q) ||
            (p.alumni.primaryIndustry || '').toLowerCase().includes(q) ||
            (p.location?.city || '').toLowerCase().includes(q) ||
            (p.location?.country || '').toLowerCase().includes(q)
          );
        })
        .slice(0, 6)
    : [];

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Batches', href: '/batches' },
    { label: 'Global Map', href: '/map' },
    { label: 'Overview', href: '/overview' },
    { label: 'Insights', href: '/insights' },
    { label: 'About', href: '/about' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return path === '/';
    const clean = path.split('?')[0];
    return clean === href || clean.startsWith(`${href}/`) || (href === '/batches' && clean.startsWith('/batch/'));
  };

  const isHome = path === '/' || path === '';

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${
        isHome
          ? 'bg-[#06050b] text-[#dfe7e0]'
          : 'bg-[#FFFFFF] dark:bg-[#120917] text-[#25212B] dark:text-[#F7F3F9]'
      }`}
    >
      {/* Single Top Header Bar */}
      <header
        className={`sticky top-0 z-40 border-b transition-colors ${
          isHome
            ? 'bg-[#06050b]/85 border-[#dfe7e0]/12 text-[#dfe7e0]'
            : 'bg-[#FFFFFF]/95 dark:bg-[#120917]/95 backdrop-blur-md border-[#E8DFED] dark:border-[#2E1A3B]'
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className="font-serif text-lg sm:text-xl font-semibold tracking-tight text-[#32143F] dark:text-[#F7F3F9] whitespace-nowrap shrink-0"
          >
            BTM Alumni
          </a>

          {/* Zone 2: Navigation links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[#716A79] dark:text-[#B69AD8]"
          >
            {navLinks.map((item) => {
              const active = isActive(item.href);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.href);
                  }}
                  className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                    active
                      ? 'border-[#663078] dark:border-[#B69AD8] text-[#25212B] dark:text-[#FFFFFF] font-semibold'
                      : 'border-transparent hover:text-[#25212B] dark:hover:text-[#FFFFFF]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Search, Theme Toggle, and Mobile Menu Trigger */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              aria-label="Search Directory"
              className="px-3 sm:px-4 py-2 text-xs font-semibold text-[#FFFFFF] bg-[#663078] hover:bg-[#32143F] dark:bg-[#663078] dark:hover:bg-[#7D3C94] rounded-lg transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Search</span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              className="p-2 sm:px-3 sm:py-2 rounded-lg border border-[#E8DFED] dark:border-[#321E3E] bg-[#F7F3F9] dark:bg-[#190D21] text-xs font-medium text-[#25212B] dark:text-[#F7F3F9] hover:border-[#663078] dark:hover:border-[#B69AD8] transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4 text-[#663078] shrink-0" />
                  <span className="hidden lg:inline">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-[#B69AD8] shrink-0" />
                  <span className="hidden lg:inline">Light</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-lg border border-[#E8DFED] dark:border-[#321E3E] text-[#25212B] dark:text-[#F7F3F9] shrink-0"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFFFFF] dark:bg-[#190D21] border-b border-[#E8DFED] dark:border-[#321E3E] px-6 py-5 space-y-3">
          <div className="flex flex-col space-y-2.5 text-sm font-medium">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  navigate(item.href);
                }}
                className={`py-1.5 ${
                  isActive(item.href)
                    ? 'text-[#663078] dark:text-[#B69AD8] font-semibold'
                    : 'text-[#25212B] dark:text-[#E8DFED]'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Instant Global Search Modal */}
      {searchModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#190920]/70 backdrop-blur-xs flex items-start justify-center pt-16 px-4"
          onClick={() => setSearchModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-[#FFFFFF] dark:bg-[#1B0E24] border border-[#E8DFED] dark:border-[#362046] rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[#E8DFED] dark:border-[#321E3E] flex items-center gap-3">
              <Search className="w-5 h-5 text-[#663078] dark:text-[#B69AD8] shrink-0" />
              <input
                type="text"
                autoFocus
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Search alumni by name, student ID (e.g. 170061001), company, or city..."
                className="w-full bg-transparent text-sm text-[#25212B] dark:text-[#F7F3F9] placeholder-[#716A79] focus:outline-none"
              />
              {quickQuery && (
                <button
                  type="button"
                  onClick={() => setQuickQuery('')}
                  className="text-xs text-[#716A79] hover:text-[#25212B] dark:hover:text-[#FFFFFF] whitespace-nowrap shrink-0"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="p-1 text-[#716A79] hover:text-[#25212B] dark:hover:text-[#FFFFFF]"
                aria-label="Close search modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-4">
              {!quickQuery.trim() ? (
                <div className="py-4 space-y-4">
                  <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/80">
                    Quick Navigation &amp; Batch Directories
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {batches.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setSearchModalOpen(false);
                          navigate(`/batch/${b.code}`);
                        }}
                        className="p-3 text-left rounded-lg border border-[#E8DFED] dark:border-[#321E3E] hover:border-[#663078] dark:hover:border-[#B69AD8] transition-colors"
                      >
                        <div className="font-serif font-semibold text-sm text-[#25212B] dark:text-[#F7F3F9]">
                          {b.name}
                        </div>
                        <div className="text-[11px] text-[#716A79] dark:text-[#B69AD8]/75 mt-0.5">
                          {b.status === 'active' ? 'Active Directory' : 'Coming Soon'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : quickResults.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm font-medium text-[#25212B] dark:text-[#F7F3F9]">
                    No matching alumni records found for &ldquo;{quickQuery}&rdquo;
                  </p>
                  <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/75 mt-1">
                    Try searching by partial name, 9-digit Student ID, or open the full directory.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#E8DFED] dark:divide-[#2E1A3B]">
                  {quickResults.map((item) => (
                    <button
                      key={item.alumni.id}
                      type="button"
                      onClick={() => {
                        setSearchModalOpen(false);
                        setQuickQuery('');
                        navigate(`/alumni/${item.alumni.studentId}`);
                      }}
                      className="w-full py-3 px-2 flex items-center justify-between gap-4 text-left hover:bg-[#F7F3F9] dark:hover:bg-[#241330] rounded-lg transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[#25212B] dark:text-[#F7F3F9] truncate">
                          {item.alumni.fullName}
                        </div>
                        <div className="text-xs text-[#716A79] dark:text-[#B69AD8]/80 truncate">
                          <span className="font-mono tabular-nums">ID {item.alumni.studentId}</span>
                          <span aria-hidden="true"> · </span>
                          <span>{item.batch.name}</span>
                          {item.currentPosition && (
                            <>
                              <span aria-hidden="true"> · </span>
                              <span>
                                {item.currentPosition.designation} at {item.currentPosition.organization}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-[#663078] dark:text-[#B69AD8] shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="px-4 py-3 bg-[#F7F3F9] dark:bg-[#150A1C] border-t border-[#E8DFED] dark:border-[#321E3E] flex items-center justify-between text-xs text-[#716A79] dark:text-[#B69AD8]/80">
              <span>Search across names, student IDs, companies, designations, and locations</span>
              <button
                type="button"
                onClick={() => {
                  setSearchModalOpen(false);
                  navigate(`/alumni?q=${encodeURIComponent(quickQuery)}`);
                }}
                className="font-semibold text-[#663078] dark:text-[#B69AD8] hover:underline whitespace-nowrap shrink-0"
              >
                Open Full Directory &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Institutional Footer */}
      <footer
        className={`relative z-10 border-t mt-20 ${
          isHome
            ? 'bg-[#06050b]/92 border-[#dfe7e0]/12 text-[#dfe7e0]'
            : 'bg-[#F7F3F9] dark:bg-[#160B1D] border-[#E8DFED] dark:border-[#2E1A3B]'
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#E8DFED] dark:border-[#2E1A3B]">
            {/* Brand & Departmental Reference */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                {/* Clean Replaceable Emblem Placeholder */}
                <div
                  aria-label="Departmental Emblem Placeholder"
                  className="w-9 h-9 rounded-lg bg-[#32143F] border border-[#663078] flex items-center justify-center text-xs font-mono font-semibold text-[#F7F3F9] shrink-0"
                >
                  BTM
                </div>
                <span className="font-serif text-xl font-semibold tracking-tight text-[#32143F] dark:text-[#F7F3F9]">
                  BTM Alumni
                </span>
              </div>
              <p className="text-sm text-[#716A79] dark:text-[#B69AD8]/85 max-w-sm leading-relaxed">
                Centralized alumni directory, career archive, and professional network for the Department of
                Business and Technology Management (BTM) at Islamic University of Technology (IUT), Board
                Bazar, Gazipur, Bangladesh.
              </p>
              <p className="text-xs text-[#716A79] dark:text-[#9A8FA6] leading-relaxed">
                Archival Notice: This platform is currently an independent architectural prototype prepared for
                the BTM community and does not represent an officially operated institutional portal of IUT
                until formal departmental authorization is established.
              </p>
            </div>

            {/* Directory & Batches */}
            <div className="md:col-span-2 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#32143F] dark:text-[#E8DFED]">
                Batch Directories
              </h3>
              <ul className="space-y-2 text-sm text-[#716A79] dark:text-[#B69AD8]/80">
                {batches.map((b) => (
                  <li key={b.id}>
                    <a
                      href={`/batch/${b.code}`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/batch/${b.code}`);
                      }}
                      className="hover:text-[#663078] dark:hover:text-[#FFFFFF] transition-colors"
                    >
                      {b.name} {b.status === 'coming_soon' ? '(Coming Soon)' : ''}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="/batches"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/batches');
                    }}
                    className="hover:text-[#663078] dark:hover:text-[#FFFFFF] transition-colors"
                  >
                    All Batches
                  </a>
                </li>
              </ul>
            </div>

            {/* Platform Sections */}
            <div className="md:col-span-2 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#32143F] dark:text-[#E8DFED]">
                Platform
              </h3>
              <ul className="space-y-2 text-sm text-[#716A79] dark:text-[#B69AD8]/80">
                <li>
                  <a
                    href="/"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/');
                    }}
                    className="hover:text-[#663078] dark:hover:text-[#FFFFFF] transition-colors"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="/map"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/map');
                    }}
                    className="hover:text-[#663078] dark:hover:text-[#FFFFFF] transition-colors"
                  >
                    Global Map
                  </a>
                </li>
                <li>
                  <a
                    href="/overview"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/overview');
                    }}
                    className="hover:text-[#663078] dark:hover:text-[#FFFFFF] transition-colors"
                  >
                    Overview
                  </a>
                </li>
                <li>
                  <a
                    href="/insights"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/insights');
                    }}
                    className="hover:text-[#663078] dark:hover:text-[#FFFFFF] transition-colors"
                  >
                    Insights
                  </a>
                </li>
              </ul>
            </div>

            {/* Governance & Privacy */}
            <div className="md:col-span-3 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#32143F] dark:text-[#E8DFED]">
                Governance &amp; Privacy
              </h3>
              <ul className="space-y-2 text-sm text-[#716A79] dark:text-[#B69AD8]/80">
                <li>
                  <a
                    href="/about"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/about');
                    }}
                    className="hover:text-[#663078] dark:hover:text-[#FFFFFF] transition-colors"
                  >
                    About &amp; Data Integrity Charter
                  </a>
                </li>
              </ul>
              <p className="text-xs text-[#716A79] dark:text-[#9A8FA6] pt-1">
                Only public professional records are displayed. Private phone numbers, personal emails, and
                residential addresses are strictly excluded.
              </p>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#716A79] dark:text-[#9A8FA6]">
            <p>
              &copy; {new Date().getFullYear()} BTM Alumni · Department of Business and
              Technology Management (BTM), IUT.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
