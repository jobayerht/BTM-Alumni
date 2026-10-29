import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ArrowRight,
  ArrowUpRight,
  Globe,
  BarChart3,
  LayoutDashboard,
  Building2,
  Info,
  Camera,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useRouter, updateDocumentMeta } from '../utils/router';
import { IutFivePillars3D } from '../components/IutFivePillars3D';
import { isCurrentlyInHigherStudies, hasCompletedHigherStudies } from '../utils/overviewAnalytics';

const CHAPTERS = [
  { id: 'hero-sec', num: '00', label: 'The Five Pillars', sub: 'IUT Sanctuary' },
  { id: 'batches-sec', num: '01', label: 'Batches', sub: 'BTM 17 — BTM 20' },
  { id: 'map-sec', num: '02', label: 'Global Map', sub: 'Worldwide Reach' },
  { id: 'overview-sec', num: '03', label: 'Overview', sub: 'Cohort Metrics' },
  { id: 'insights-sec', num: '04', label: 'Insights', sub: 'Career Paths' },
  { id: 'about-sec', num: '05', label: 'About', sub: 'Platform Charter' },
];

const CAMERA_PRESETS = [
  { index: null, label: 'Scroll Sync', caption: 'Auto-follows page scroll' },
  { index: 0, label: '01 · Lakeside', caption: 'Reflection Pond View' },
  { index: 1, label: '02 · Five Pillars', caption: 'Side Brick Profile & Bridge' },
  { index: 2, label: '03 · Moonlit Arch', caption: 'Low-Angle Pointed Arch' },
  { index: 3, label: '04 · Inner Spectrum', caption: 'Illuminated Archivolts' },
  { index: 4, label: '05 · Elevated Vista', caption: 'Sanctuary & Lake Panorama' },
];

export const HomePage: React.FC = () => {
  const { batches, getAllPublicProfiles, getBatchProfiles } = useData();
  const { navigate } = useRouter();

  const [heroSearch, setHeroSearch] = useState('');
  const [activeChapter, setActiveChapter] = useState<number>(0);
  const [hoveredPillar, setHoveredPillar] = useState<number>(-1);
  const [cameraOverride, setCameraOverride] = useState<number | null>(null);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);

  useEffect(() => {
    updateDocumentMeta(
      'Home — IUT BTM Alumni Sanctuary',
      'Discover the people, careers, and achievements shaping the BTM alumni community at Islamic University of Technology (IUT), Bangladesh.'
    );
  }, []);

  const publicProfiles = getAllPublicProfiles();
  const totalProfiles = publicProfiles.length;

  const uniqueCompanies = useMemo(() => {
    const set = new Set<string>();
    publicProfiles.forEach((p) => {
      if (p.currentPosition?.organization?.trim()) {
        set.add(p.currentPosition.organization.trim());
      }
      p.experiences.forEach((exp) => {
        if (exp.organization?.trim()) {
          set.add(exp.organization.trim());
        }
      });
    });
    return set.size;
  }, [publicProfiles]);

  const locatedCount = useMemo(
    () =>
      publicProfiles.filter(
        (p) => p.location && p.location.visibility !== 'hidden' && Boolean(p.location.country?.trim())
      ).length,
    [publicProfiles]
  );

  const higherStudyCount = useMemo(
    () =>
      publicProfiles.filter(
        (p) => isCurrentlyInHigherStudies(p) || hasCompletedHigherStudies(p)
      ).length,
    [publicProfiles]
  );

  const countryFootprint = useMemo(() => {
    const countryMap = new Map<string, { count: number; cities: Set<string> }>();
    publicProfiles.forEach((p) => {
      if (p.location && p.location.visibility !== 'hidden' && p.location.country) {
        const country = p.location.country;
        const existing = countryMap.get(country) || { count: 0, cities: new Set<string>() };
        existing.count += 1;
        if (p.location.visibility === 'city_and_country' && p.location.city) {
          existing.cities.add(p.location.city);
        }
        countryMap.set(country, existing);
      }
    });
    return Array.from(countryMap.entries())
      .map(([country, info]) => ({
        country,
        count: info.count,
        cities: Array.from(info.cities),
      }))
      .sort((a, b) => b.count - a.count);
  }, [publicProfiles]);

  const topOrganizations = useMemo(() => {
    const orgMap = new Map<string, number>();
    publicProfiles.forEach((p) => {
      const seenForPerson = new Set<string>();
      if (p.currentPosition?.organization?.trim()) {
        seenForPerson.add(p.currentPosition.organization.trim());
      }
      p.experiences.forEach((exp) => {
        if (exp.organization?.trim()) {
          seenForPerson.add(exp.organization.trim());
        }
      });
      seenForPerson.forEach((org) => {
        orgMap.set(org, (orgMap.get(org) || 0) + 1);
      });
    });
    return Array.from(orgMap.entries())
      .map(([organization, count]) => ({ organization, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [publicProfiles]);

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = heroSearch.trim();
    if (q) {
      navigate(`/alumni?q=${encodeURIComponent(q)}`);
    } else {
      navigate('/alumni');
    }
  };

  const scrollToSection = (id: string, idx: number) => {
    setCameraOverride(null);
    setActiveChapter(idx);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative min-h-screen text-[#dfe7e0] selection:bg-[#e03c28] selection:text-white">
      {/* Live 3D WebGL Scene: IUT Five Pillars Monument */}
      <IutFivePillars3D
        activeChapter={activeChapter}
        hoveredPillar={hoveredPillar}
        cameraOverride={cameraOverride}
        onScrollProgressChange={(_prog, idx) => {
          setActiveChapter(idx);
        }}
      />

      {/* Kage Radial Vignette Overlay */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[2] pointer-events-none"
        style={{
          background:
            'radial-gradient(125% 95% at 50% 42%, transparent 38%, rgba(4, 3, 8, 0.68) 100%)',
        }}
      />

      {/* Right-Hand Chapter Progress Rail (Kage Style) */}
      <aside
        aria-label="Chapter progress rail"
        className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 flex-col gap-3 items-end"
      >
        {CHAPTERS.map((ch, idx) => {
          const isCurrent = activeChapter === idx;
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => scrollToSection(ch.id, idx)}
              onMouseEnter={() => {
                if (idx >= 1 && idx <= 5) setHoveredPillar(idx - 1);
              }}
              onMouseLeave={() => setHoveredPillar(-1)}
              title={`${ch.num} — ${ch.label}`}
              className="group flex items-center gap-2.5 py-1 cursor-pointer"
            >
              <span
                className={`text-[10px] font-mono tracking-[0.2em] uppercase transition-opacity ${
                  isCurrent
                    ? 'opacity-100 text-[#dfe7e0]'
                    : 'opacity-0 group-hover:opacity-80 text-[#aab4ad]'
                }`}
              >
                {ch.num}
              </span>
              <span
                className={`block h-[1.5px] transition-all duration-300 ${
                  isCurrent
                    ? 'w-7 bg-[#e03c28]'
                    : 'w-3.5 bg-[#dfe7e0]/30 group-hover:w-5 group-hover:bg-[#dfe7e0]/70'
                }`}
              />
            </button>
          );
        })}
      </aside>

      {/* Collapsible Bottom 3D Camera & Pillar Control Dock */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[min(920px,94vw)] pointer-events-auto">
        <div className="flex justify-center mb-1.5">
          <button
            type="button"
            onClick={() => setDockCollapsed((prev) => !prev)}
            className="px-3.5 py-1 rounded-t-lg bg-[#090812]/90 border border-b-0 border-[#dfe7e0]/15 text-[11px] font-mono tracking-wider uppercase text-[#aab4ad] hover:text-[#dfe7e0] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Camera className="w-3 h-3 text-[#e03c28]" />
            <span>{dockCollapsed ? 'Show 5 Pillars 3D Controls' : 'Hide 3D Controls'}</span>
            {dockCollapsed ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>

        {!dockCollapsed && (
          <div className="rounded-xl bg-[#090812]/92 border border-[#dfe7e0]/15 px-3 py-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#aab4ad] px-2">
              <span>IUT 5 Pillars Camera:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {CAMERA_PRESETS.map((preset) => {
                const isSelected = cameraOverride === preset.index;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setCameraOverride(preset.index)}
                    onMouseEnter={() => {
                      if (preset.index !== null && preset.index >= 0 && preset.index < 5) {
                        setHoveredPillar(preset.index);
                      }
                    }}
                    onMouseLeave={() => setHoveredPillar(-1)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono tracking-wide transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-[#e03c28] text-white font-semibold'
                        : 'bg-[#141122] text-[#aab4ad] hover:text-[#dfe7e0] border border-[#dfe7e0]/10'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Scrollable Foreground Page Layer */}
      <div className="relative z-10">
        {/* ============================================================CHAPTER 00: HERO (KAGE SPLIT LAYOUT) */}
        <section
          id="hero-sec"
          className="relative min-h-[calc(100svh-4rem)] px-6 sm:px-10 lg:px-14 pt-8 pb-16 flex flex-col justify-between max-w-[1440px] mx-auto"
        >
          {/* Top-Left Editorial Column */}
          <div className="max-w-xl space-y-5">
            <div className="text-[11px] font-mono font-medium tracking-[0.22em] uppercase text-[#aab4ad]">
              Chapter 00 — The Five Pillars · IUT BTM
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-[3.4rem] font-normal uppercase tracking-tight leading-[1.04] text-[#dfe7e0] text-balance"
              style={{ textShadow: '0 2px 34px rgba(3, 6, 8, 0.85)' }}
            >
              Where Legacy
              <br />
              Shapes The
              <br />
              Unseen Path.
            </h1>

            <p
              className="text-sm sm:text-base text-[#b4bfb7] max-w-md leading-relaxed font-light"
              style={{ textShadow: '0 1px 22px rgba(3, 6, 8, 0.95)' }}
            >
              Enter the Department of Business and Technology Management (BTM) at Islamic University
              of Technology — where five monumental arches frame generations of alumni impact.
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleHeroSearchSubmit}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#090812]/88 p-2 rounded-xl border border-[#dfe7e0]/18 max-w-lg shadow-2xl"
            >
              <div className="flex items-center gap-2.5 flex-1 px-3 py-1.5">
                <Search className="w-4 h-4 text-[#e03c28] shrink-0" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Search by name, student ID (170061...), or company..."
                  aria-label="Search alumni directory"
                  className="w-full bg-transparent text-xs sm:text-sm text-[#dfe7e0] placeholder-[#78837c] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-mono uppercase tracking-wider font-medium text-white bg-[#e03c28] hover:bg-[#c82d1b] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Search Alumni
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => navigate('/batch/17')}
                className="px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-medium text-[#06050b] bg-[#dfe7e0] hover:bg-white rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Enter BTM 17</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/batches')}
                className="px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-[#dfe7e0] bg-[#090812]/80 hover:bg-[#161224] border border-[#dfe7e0]/20 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                All Batches (17–20)
              </button>
            </div>
          </div>

          {/* Center Viewport Spacer so the 3D 5 Pillars & Giant BTM Wordmark remain unobstructed */}
          <div className="min-h-[160px] lg:min-h-[220px]" />

          {/* Bottom Bar: Kage 01–05 Numbered Pillar Chips + Right Floating Preview Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pt-6">
            {/* Left: Scroll to enter + 01–05 Pillar Chapters */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.28em] uppercase text-[#aab4ad]">
                <span>Scroll to walk through the 5 Pillars</span>
                <span className="w-14 h-[1px] bg-[#dfe7e0]/25 block" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 border-t border-[#dfe7e0]/15">
                {CHAPTERS.slice(1).map((ch, idx) => {
                  const isActive = activeChapter === idx + 1 || hoveredPillar === idx;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => scrollToSection(ch.id, idx + 1)}
                      onMouseEnter={() => setHoveredPillar(idx)}
                      onMouseLeave={() => setHoveredPillar(-1)}
                      className="group text-left cursor-pointer transition-transform hover:-translate-y-0.5"
                    >
                      <div
                        className={`text-2xl sm:text-3xl font-light font-mono tabular-nums transition-colors ${
                          isActive ? 'text-[#e03c28]' : 'text-[#dfe7e0] group-hover:text-[#ff5a3c]'
                        }`}
                      >
                        {ch.num}
                      </div>
                      <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.18em] text-[#aab4ad] group-hover:text-[#dfe7e0]">
                        {ch.label}
                      </div>
                      <div className="text-[11px] text-[#78837c] truncate">{ch.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Kage-style Floating Sanctuary Preview Window */}
            <div className="hidden lg:flex lg:col-span-4 justify-end">
              <button
                type="button"
                onClick={() =>
                  setCameraOverride((prev) => (prev === null ? 1 : (prev + 1) % 5))
                }
                className="group w-64 text-left cursor-pointer transition-transform duration-500 hover:-translate-y-1"
              >
                <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-[#dfe7e0]/20 group-hover:border-[#dfe7e0]/50 shadow-2xl bg-[#090812]">
                  <img
                    src="/assets/aistudio/image_fbf0db8d.png"
                    alt="IUT Five Pillars 3D Monument Reference"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05070a]/80 via-transparent to-transparent" />
                  <div className="absolute inset-0 grid place-items-center">
                    <span className="w-10 h-10 rounded-full bg-[#05070a]/70 border border-[#dfe7e0]/30 grid place-items-center group-hover:scale-110 transition-transform">
                      <svg viewBox="0 0 22 22" fill="none" className="w-4 h-4">
                        <path d="M8 5.6 16.4 11 8 16.4z" fill="#dfe7e0" />
                      </svg>
                    </span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between gap-2 mt-2">
                  <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#dfe7e0]">
                    IUT · 5 PILLARS
                  </span>
                  <span className="text-[10px] font-mono tracking-[0.16em] uppercase text-[#78837c]">
                    Click to switch 3D angle
                  </span>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================CHAPTER 01: BATCHES (PILLAR I) */}
        <section
          id="batches-sec"
          onMouseEnter={() => setHoveredPillar(0)}
          onMouseLeave={() => setHoveredPillar(-1)}
          className="relative max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14 py-24 lg:py-32"
        >
          {/* Kage Section Header */}
          <div className="flex items-baseline gap-4 mb-12">
            <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-[#aab4ad]">
              <b className="text-[#e03c28] font-semibold">01</b> — BTM Batches
            </span>
            <span className="flex-1 h-[1px] bg-[#dfe7e0]/12" />
            <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-[#78837c]">
              PILLAR I · BTM 17 — BTM 20
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-12">
            <div className="lg:col-span-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal uppercase tracking-tight leading-[1.06] text-[#dfe7e0] text-balance">
                Four Graduating Batches. One Enduring Archive.
              </h2>
            </div>
            <div className="lg:col-span-6 space-y-4">
              <p className="text-sm sm:text-base text-[#b4bfb7] leading-relaxed font-light">
                Every student record from BTM 17 through BTM 20 is preserved in a structured
                departmental directory. Select any batch below to browse profiles in Grid, List, or
                Short List views.
              </p>
              <button
                type="button"
                onClick={() => navigate('/batches')}
                className="inline-flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-[#dfe7e0] hover:text-[#e03c28] transition-colors cursor-pointer"
              >
                <span>Open Full Batch Archive</span>
                <span className="w-8 h-8 rounded-full border border-[#dfe7e0]/20 grid place-items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {batches.map((batch, bIdx) => {
              const batchProfiles = getBatchProfiles(batch.id);
              const count = batchProfiles.length;

              return (
                <article
                  key={batch.id}
                  onClick={() => navigate(`/batch/${batch.code}`)}
                  onMouseEnter={() => setHoveredPillar(bIdx)}
                  className="group cursor-pointer rounded-xl border border-[#dfe7e0]/14 bg-[#090812]/82 hover:bg-[#120e20]/90 hover:border-[#e03c28]/70 p-6 flex flex-col justify-between transition-all duration-300 shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.18em] text-[#aab4ad] tabular-nums">
                      <span>0{bIdx + 1} / 04</span>
                      <span>
                        {batch.intakeYear}–{batch.graduationYear}
                      </span>
                    </div>

                    <h3 className="mt-4 font-serif text-2xl sm:text-3xl font-semibold text-[#dfe7e0] group-hover:text-[#ff5a3c] transition-colors">
                      {batch.name}
                    </h3>

                    <p className="mt-2.5 text-xs sm:text-sm text-[#9aa5a0] line-clamp-3 leading-relaxed font-light">
                      {batch.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#dfe7e0]/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-[#dfe7e0] tabular-nums">{count} Alumni Records</span>
                    <span className="inline-flex items-center gap-1 text-[#e03c28] group-hover:translate-x-0.5 transition-transform">
                      <span>Directory</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ============================================================CHAPTER 02: GLOBAL MAP (PILLAR II) */}
        <section
          id="map-sec"
          onMouseEnter={() => setHoveredPillar(1)}
          onMouseLeave={() => setHoveredPillar(-1)}
          className="relative max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14 py-24 lg:py-32"
        >
          <div className="flex items-baseline gap-4 mb-12">
            <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-[#aab4ad]">
              <b className="text-[#e03c28] font-semibold">02</b> — Global Footprint
            </span>
            <span className="flex-1 h-[1px] bg-[#dfe7e0]/12" />
            <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-[#78837c]">
              PILLAR II · WORLDWIDE DISTRIBUTION
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-5 bg-[#090812]/80 border border-[#dfe7e0]/14 rounded-2xl p-8">
              <h2 className="text-3xl sm:text-4xl font-normal uppercase tracking-tight leading-[1.08] text-[#dfe7e0] text-balance">
                Global Alumni Map &amp; Hubs.
              </h2>
              <p className="text-sm sm:text-base text-[#b4bfb7] leading-relaxed font-light">
                Explore where BTM graduates are building careers and pursuing postgraduate degrees
                across Bangladesh and international hubs.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/map')}
                  className="px-5 py-3 text-xs font-mono uppercase tracking-[0.2em] text-white bg-[#e03c28] hover:bg-[#c82d1b] rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <Globe className="w-4 h-4" />
                  <span>Open Interactive Map</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {countryFootprint.slice(0, 6).map((item, idx) => (
                <button
                  key={item.country}
                  type="button"
                  onClick={() => navigate(`/map?country=${encodeURIComponent(item.country)}`)}
                  className="p-5 text-left rounded-xl bg-[#090812]/82 hover:bg-[#151125]/90 border border-[#dfe7e0]/14 hover:border-[#e03c28]/60 transition-all cursor-pointer flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#78837c]">
                      0{idx + 1} · Hub
                    </span>
                    <span className="font-mono text-xs text-[#e03c28] tabular-nums">
                      {item.count} {item.count === 1 ? 'Alumnus' : 'Alumni'}
                    </span>
                  </div>
                  <div className="text-lg font-medium text-[#dfe7e0]">{item.country}</div>
                  <div className="text-xs text-[#9aa5a0] truncate">
                    {item.cities.length > 0 ? item.cities.join(' · ') : 'Country-level record'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================CHAPTER 03: OVERVIEW DASHBOARD (PILLAR III) */}
        <section
          id="overview-sec"
          onMouseEnter={() => setHoveredPillar(2)}
          onMouseLeave={() => setHoveredPillar(-1)}
          className="relative max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14 py-24 lg:py-32"
        >
          <div className="flex items-baseline gap-4 mb-12">
            <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-[#aab4ad]">
              <b className="text-[#e03c28] font-semibold">03</b> — Overview Dashboard
            </span>
            <span className="flex-1 h-[1px] bg-[#dfe7e0]/12" />
            <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-[#78837c]">
              PILLAR III · MULTI-BATCH ANALYTICS
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-3 max-w-2xl">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal uppercase tracking-tight leading-[1.06] text-[#dfe7e0]">
                Four Batches. Measured With Precision.
              </h2>
              <p className="text-sm sm:text-base text-[#b4bfb7] font-light">
                Interactive analytics across geographic distribution, postgraduate higher studies,
                represented organizations, and cross-batch comparisons.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/overview')}
              className="px-5 py-3 text-xs font-mono uppercase tracking-[0.2em] text-[#06050b] bg-[#dfe7e0] hover:bg-white rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Open Overview Dashboard</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#dfe7e0]/15 rounded-2xl overflow-hidden bg-[#090812]/84 divide-y sm:divide-y-0 sm:divide-x divide-[#dfe7e0]/12">
            <div
              onClick={() => navigate('/overview')}
              className="p-7 cursor-pointer hover:bg-[#141022]/80 transition-colors"
            >
              <div className="text-3xl sm:text-4xl font-light font-mono text-[#dfe7e0] tabular-nums">
                {totalProfiles}
              </div>
              <div className="mt-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#aab4ad]">
                Total Alumni Records
              </div>
              <div className="mt-1 text-xs text-[#78837c]">Across BTM 17 — BTM 20</div>
            </div>

            <div
              onClick={() => navigate('/overview')}
              className="p-7 cursor-pointer hover:bg-[#141022]/80 transition-colors"
            >
              <div className="text-3xl sm:text-4xl font-light font-mono text-[#dfe7e0] tabular-nums">
                {locatedCount}
              </div>
              <div className="mt-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#aab4ad]">
                Known Locations
              </div>
              <div className="mt-1 text-xs text-[#78837c]">
                Across {countryFootprint.length} recorded countries
              </div>
            </div>

            <div
              onClick={() => navigate('/overview')}
              className="p-7 cursor-pointer hover:bg-[#141022]/80 transition-colors"
            >
              <div className="text-3xl sm:text-4xl font-light font-mono text-[#e03c28] tabular-nums">
                {higherStudyCount}
              </div>
              <div className="mt-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#aab4ad]">
                Higher Studies
              </div>
              <div className="mt-1 text-xs text-[#78837c]">Postgraduate degrees &amp; research</div>
            </div>

            <div
              onClick={() => navigate('/overview')}
              className="p-7 cursor-pointer hover:bg-[#141022]/80 transition-colors"
            >
              <div className="text-3xl sm:text-4xl font-light font-mono text-[#dfe7e0] tabular-nums">
                {uniqueCompanies}
              </div>
              <div className="mt-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#aab4ad]">
                Organizations
              </div>
              <div className="mt-1 text-xs text-[#78837c]">Companies &amp; institutions</div>
            </div>
          </div>
        </section>

        {/* ============================================================CHAPTER 04: INSIGHTS (PILLAR IV) */}
        <section
          id="insights-sec"
          onMouseEnter={() => setHoveredPillar(3)}
          onMouseLeave={() => setHoveredPillar(-1)}
          className="relative max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14 py-24 lg:py-32"
        >
          <div className="flex items-baseline gap-4 mb-12">
            <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-[#aab4ad]">
              <b className="text-[#e03c28] font-semibold">04</b> — Career Insights
            </span>
            <span className="flex-1 h-[1px] bg-[#dfe7e0]/12" />
            <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-[#78837c]">
              PILLAR IV · EMPLOYERS &amp; PATHWAYS
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end mb-10">
            <div className="lg:col-span-7">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal uppercase tracking-tight leading-[1.06] text-[#dfe7e0]">
                Leading Employers &amp; Career Trajectories.
              </h2>
            </div>
            <div className="lg:col-span-5 space-y-4">
              <p className="text-sm sm:text-base text-[#b4bfb7] font-light">
                Inspect organization representation, career tracks, and directory completeness
                computed directly from verified BTM alumni records.
              </p>
              <button
                type="button"
                onClick={() => navigate('/insights')}
                className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#e03c28] hover:text-[#ff5a3c] cursor-pointer"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Explore Full Career Insights</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Kage Syllabus/Atlas Table Style */}
          <div className="border-t border-[#dfe7e0]/15 bg-[#090812]/82 rounded-xl overflow-hidden">
            {topOrganizations.map((org, idx) => (
              <div
                key={org.organization}
                onClick={() => navigate(`/alumni?org=${encodeURIComponent(org.organization)}`)}
                className="group flex items-center justify-between gap-4 px-6 py-5 border-b border-[#dfe7e0]/10 hover:bg-[#161124]/90 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-5 min-w-0">
                  <span className="text-xs font-mono text-[#78837c] group-hover:text-[#e03c28] tabular-nums">
                    0{idx + 1}
                  </span>
                  <Building2 className="w-4 h-4 text-[#aab4ad] group-hover:text-[#e03c28] shrink-0" />
                  <h3 className="text-base sm:text-lg font-normal text-[#dfe7e0] truncate">
                    {org.organization}
                  </h3>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#aab4ad] tabular-nums">
                    {org.count} {org.count === 1 ? 'Record' : 'Records'}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#78837c] group-hover:text-[#dfe7e0]" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================CHAPTER 05: ABOUT (PILLAR V — AFTERLIGHT) */}
        <section
          id="about-sec"
          onMouseEnter={() => setHoveredPillar(4)}
          onMouseLeave={() => setHoveredPillar(-1)}
          className="relative max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14 py-28 lg:py-36"
        >
          <div className="flex items-baseline gap-4 mb-12">
            <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-[#aab4ad]">
              <b className="text-[#e03c28] font-semibold">05</b> — About &amp; Charter
            </span>
            <span className="flex-1 h-[1px] bg-[#dfe7e0]/12" />
            <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-[#78837c]">
              PILLAR V · ISLAMIC UNIVERSITY OF TECHNOLOGY
            </span>
          </div>

          <div className="rounded-2xl border border-[#dfe7e0]/15 bg-[#090812]/84 p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#e03c28]">
                Department of Business &amp; Technology Management (BTM)
              </div>
              <h2 className="text-3xl sm:text-5xl font-normal uppercase tracking-tight leading-[1.04] text-[#dfe7e0] text-balance">
                The Gate Does Not Close Behind You.
              </h2>
              <p className="text-sm sm:text-base text-[#b4bfb7] leading-relaxed font-light max-w-2xl">
                BTM Alumni is the centralized alumni directory and career archive built for
                graduates of the Department of Business and Technology Management (BTM) at Islamic
                University of Technology (IUT), Gazipur, Bangladesh. It organizes batch registries
                from BTM 17 through BTM 20 while upholding strict public privacy and data integrity
                standards.
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-4 justify-end">
              <button
                type="button"
                onClick={() => navigate('/about')}
                className="px-6 py-4 rounded-full border border-[#dfe7e0]/25 bg-[#dfe7e0] text-[#06050b] hover:bg-white text-xs font-mono uppercase tracking-[0.22em] font-semibold inline-flex items-center justify-center gap-3 cursor-pointer transition-colors"
              >
                <Info className="w-4 h-4" />
                <span>Read Platform Charter</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('hero-sec', 0)}
                className="px-6 py-4 rounded-full border border-[#dfe7e0]/20 bg-[#090812]/80 hover:border-[#dfe7e0]/50 text-[#dfe7e0] text-xs font-mono uppercase tracking-[0.22em] inline-flex items-center justify-center gap-3 cursor-pointer transition-colors"
              >
                <span>Return to Top Sanctuary</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
