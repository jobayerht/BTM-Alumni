import React, { useState, useMemo, useEffect } from 'react';
import { Search, ArrowUpRight, RotateCcw } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useRouter, updateDocumentMeta } from '../utils/router';
import { AlumniPortrait } from '../components/EditorialMedia';
import { CompleteAlumniProfile } from '../types/models';

interface LocationCluster {
  key: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  profiles: CompleteAlumniProfile[];
}

export const MapPage: React.FC = () => {
  const { batches, getAllPublicProfiles } = useData();
  const { navigate } = useRouter();

  const initialCountry = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('country') || 'all';
    } catch {
      return 'all';
    }
  }, []);

  const [selectedBatchId, setSelectedBatchId] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>(initialCountry);
  const [locationQuery, setLocationQuery] = useState<string>('');
  const [activeClusterKey, setActiveClusterKey] = useState<string | null>(null);

  useEffect(() => {
    updateDocumentMeta(
      'Global Alumni Map & Geographic Distribution',
      'Interactive global footprint showing city and country distributions of BTM alumni from Islamic University of Technology (IUT).'
    );
  }, []);

  const allProfiles = getAllPublicProfiles();

  // Filter profiles that have public location records
  const locatedProfiles = useMemo(() => {
    return allProfiles.filter((p) => {
      if (!p.location || p.location.visibility === 'hidden') return false;
      if (selectedBatchId !== 'all' && p.batch.id !== selectedBatchId) return false;
      if (selectedCountry !== 'all' && p.location.country !== selectedCountry) return false;
      if (locationQuery.trim()) {
        const q = locationQuery.toLowerCase();
        const matchCity = (p.location.city || '').toLowerCase().includes(q);
        const matchCountry = p.location.country.toLowerCase().includes(q);
        const matchName = p.alumni.fullName.toLowerCase().includes(q);
        const matchOrg = (p.currentPosition?.organization || '').toLowerCase().includes(q);
        if (!matchCity && !matchCountry && !matchName && !matchOrg) return false;
      }
      return true;
    });
  }, [allProfiles, selectedBatchId, selectedCountry, locationQuery]);

  // Group into city/country clusters
  const clusters: LocationCluster[] = useMemo(() => {
    const map = new Map<string, LocationCluster>();
    locatedProfiles.forEach((p) => {
      const loc = p.location!;
      const displayCity = loc.visibility === 'city_and_country' ? loc.city : 'Country-Level Record';
      const key = `${loc.country}__${displayCity}`;
      const existing = map.get(key);
      if (existing) {
        existing.profiles.push(p);
      } else {
        map.set(key, {
          key,
          country: loc.country,
          city: displayCity,
          lat: loc.coordinates.lat,
          lng: loc.coordinates.lng,
          profiles: [p],
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.profiles.length - a.profiles.length);
  }, [locatedProfiles]);

  // Countries list for filter
  const allCountries = useMemo(() => {
    const set = new Set<string>();
    allProfiles.forEach((p) => {
      if (p.location && p.location.visibility !== 'hidden') {
        set.add(p.location.country);
      }
    });
    return Array.from(set).sort();
  }, [allProfiles]);

  // Project lat/lng onto 1000x480 SVG canvas
  const projectPoint = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 1000;
    const y = ((90 - lat) / 180) * 480;
    return { x, y };
  };

  const selectedCluster = useMemo(() => {
    if (activeClusterKey) {
      return clusters.find((c) => c.key === activeClusterKey) || clusters[0] || null;
    }
    return clusters[0] || null;
  }, [clusters, activeClusterKey]);

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-10 lg:py-14">
      <nav aria-label="Breadcrumb" className="text-xs text-[#716A79] dark:text-[#B69AD8]/80 mb-6 flex items-center gap-2">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
          className="hover:text-[#663078] dark:hover:text-[#FFFFFF]"
        >
          Home
        </a>
        <span aria-hidden="true">/</span>
        <span className="text-[#25212B] dark:text-[#F7F3F9] font-medium">Global Alumni Map</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E8DFED] dark:border-[#2E1A3B]">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
            Geographic Directory Index
          </div>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-[#32143F] dark:text-[#F7F3F9]">
            Global BTM Alumni Footprint
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-[#716A79] dark:text-[#B69AD8]/90 max-w-2xl leading-relaxed">
            Select a city or country node on the map below to inspect alumni working or conducting research in
            that region. Only city- and country-level data approved for public visibility is shown.
          </p>
        </div>

        {/* Batch Filter Segmented Bar */}
        <div
          role="group"
          aria-label="Filter map by batch"
          className="flex flex-wrap items-center gap-1 p-1 bg-[#F7F3F9] dark:bg-[#190D21] border border-[#E8DFED] dark:border-[#321E3E] rounded-lg shrink-0"
        >
          <button
            type="button"
            onClick={() => setSelectedBatchId('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              selectedBatchId === 'all'
                ? 'bg-[#663078] text-[#FFFFFF]'
                : 'text-[#716A79] dark:text-[#B69AD8] hover:text-[#25212B]'
            }`}
          >
            All Batches
          </button>
          {batches.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelectedBatchId(b.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedBatchId === b.id
                  ? 'bg-[#663078] text-[#FFFFFF]'
                  : 'text-[#716A79] dark:text-[#B69AD8] hover:text-[#25212B]'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="my-8 p-4 rounded-xl bg-[#F7F3F9] dark:bg-[#180C20] border border-[#E8DFED] dark:border-[#321E3E] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 bg-[#FFFFFF] dark:bg-[#120917] border border-[#E8DFED] dark:border-[#352044] rounded-lg px-3.5 py-2">
          <Search className="w-4 h-4 text-[#663078] dark:text-[#B69AD8] shrink-0" />
          <input
            type="text"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            placeholder="Filter map by city, country, alumnus name, or organization..."
            aria-label="Search locations"
            className="w-full bg-transparent text-sm text-[#25212B] dark:text-[#F7F3F9] placeholder-[#716A79] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            aria-label="Filter by Country"
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setActiveClusterKey(null);
            }}
            className="bg-[#FFFFFF] dark:bg-[#120917] border border-[#E8DFED] dark:border-[#352044] rounded-lg px-3.5 py-2 text-xs font-medium text-[#25212B] dark:text-[#F7F3F9] focus:outline-none"
          >
            <option value="all">All Countries ({allCountries.length})</option>
            {allCountries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {(selectedCountry !== 'all' || selectedBatchId !== 'all' || Boolean(locationQuery)) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCountry('all');
                setSelectedBatchId('all');
                setLocationQuery('');
                setActiveClusterKey(null);
              }}
              className="px-3 py-2 text-xs font-semibold text-[#663078] dark:text-[#B69AD8] hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Map + Location Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Interactive SVG World Map Canvas */}
        <div className="lg:col-span-8 rounded-2xl border border-[#E8DFED] dark:border-[#352044] bg-[#210E2B] text-[#F7F3F9] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#B69AD8]/20 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#B69AD8]">
            <span>INTERACTIVE GEOGRAPHIC PROJECTION · PUBLIC CITY &amp; COUNTRY NODES</span>
            <span className="tabular-nums">
              {locatedProfiles.length} Located {locatedProfiles.length === 1 ? 'Alumnus' : 'Alumni'} Across{' '}
              {clusters.length} {clusters.length === 1 ? 'Hub' : 'Hubs'}
            </span>
          </div>

          <div className="relative w-full aspect-[1000/480] bg-[#190A21]">
            <svg
              viewBox="0 0 1000 480"
              className="w-full h-full select-none"
              role="img"
              aria-label="World map showing BTM alumni hubs"
            >
              {/* Subtle Latitude / Longitude Graticule */}
              {[80, 160, 240, 320, 400].map((y) => (
                <line
                  key={`lat-${y}`}
                  x1="0"
                  y1={y}
                  x2="1000"
                  y2={y}
                  stroke="#B69AD8"
                  strokeOpacity="0.1"
                  strokeDasharray="3 3"
                />
              ))}
              {[166, 333, 500, 666, 833].map((x) => (
                <line
                  key={`lng-${x}`}
                  x1={x}
                  y1="0"
                  x2={x}
                  y2="480"
                  stroke="#B69AD8"
                  strokeOpacity="0.1"
                  strokeDasharray="3 3"
                />
              ))}

              {/* Simplified Stylized Continental Landmasses */}
              {/* North America */}
              <path
                d="M95 85 L245 75 L295 145 L245 220 L185 235 L125 175 Z"
                fill="#32143F"
                stroke="#663078"
                strokeOpacity="0.55"
                strokeWidth="1.2"
              />
              {/* South America */}
              <path
                d="M255 250 L335 275 L355 345 L305 435 L265 410 L250 310 Z"
                fill="#32143F"
                stroke="#663078"
                strokeOpacity="0.55"
                strokeWidth="1.2"
              />
              {/* Europe */}
              <path
                d="M445 80 L575 70 L595 140 L525 165 L455 155 Z"
                fill="#32143F"
                stroke="#663078"
                strokeOpacity="0.55"
                strokeWidth="1.2"
              />
              {/* Africa */}
              <path
                d="M445 175 L565 175 L605 255 L555 375 L495 375 L445 255 Z"
                fill="#32143F"
                stroke="#663078"
                strokeOpacity="0.55"
                strokeWidth="1.2"
              />
              {/* Asia & Middle East */}
              <path
                d="M580 75 L865 85 L895 185 L815 265 L735 275 L665 235 L595 195 Z"
                fill="#32143F"
                stroke="#663078"
                strokeOpacity="0.55"
                strokeWidth="1.2"
              />
              {/* Australia / Oceania */}
              <path
                d="M775 315 L885 315 L900 395 L805 405 Z"
                fill="#32143F"
                stroke="#663078"
                strokeOpacity="0.55"
                strokeWidth="1.2"
              />

              {/* Arc lines connecting IUT (Dhaka) to global hubs */}
              {clusters.map((cluster) => {
                const dhaka = projectPoint(23.8103, 90.4125);
                const pt = projectPoint(cluster.lat, cluster.lng);
                const midX = (dhaka.x + pt.x) / 2;
                const midY = Math.min(dhaka.y, pt.y) - 35;
                return (
                  <path
                    key={`arc-${cluster.key}`}
                    d={`M ${dhaka.x} ${dhaka.y} Q ${midX} ${midY} ${pt.x} ${pt.y}`}
                    fill="none"
                    stroke="#B69AD8"
                    strokeOpacity="0.35"
                    strokeWidth="1.2"
                  />
                );
              })}

              {/* Interactive Location Cluster Nodes */}
              {clusters.map((cluster) => {
                const { x, y } = projectPoint(cluster.lat, cluster.lng);
                const isSelected = selectedCluster?.key === cluster.key;
                const radius = Math.min(18, 8 + cluster.profiles.length * 2.5);

                return (
                  <g
                    key={cluster.key}
                    onClick={() => setActiveClusterKey(cluster.key)}
                    className="cursor-pointer group"
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={radius + 5}
                      fill={isSelected ? '#B69AD8' : '#663078'}
                      fillOpacity={isSelected ? 0.35 : 0.2}
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={radius}
                      fill={isSelected ? '#F7F3F9' : '#B69AD8'}
                      stroke="#32143F"
                      strokeWidth="2"
                    />
                    <text
                      x={x}
                      y={y + 3.5}
                      textAnchor="middle"
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="600"
                      fill="#32143F"
                    >
                      {cluster.profiles.length}
                    </text>
                    <text
                      x={x}
                      y={y - radius - 7}
                      textAnchor="middle"
                      fontSize="11"
                      fontFamily="Plus Jakarta Sans, sans-serif"
                      fontWeight={isSelected ? '700' : '500'}
                      fill={isSelected ? '#FFFFFF' : '#E8DFED'}
                    >
                      {cluster.city !== 'Country-Level Record' ? cluster.city : cluster.country}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Hub Selector Strip */}
          <div className="p-4 bg-[#15081C] border-t border-[#B69AD8]/20 flex flex-wrap items-center gap-2">
            {clusters.map((cluster) => {
              const active = selectedCluster?.key === cluster.key;
              return (
                <button
                  key={cluster.key}
                  type="button"
                  onClick={() => setActiveClusterKey(cluster.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#F7F3F9] text-[#32143F] font-semibold'
                      : 'bg-[#281235] text-[#E8DFED] hover:bg-[#663078]'
                  }`}
                >
                  <span>
                    {cluster.city !== 'Country-Level Record'
                      ? `${cluster.city}, ${cluster.country}`
                      : cluster.country}
                  </span>
                  <span className="ml-1.5 font-mono tabular-nums opacity-80">
                    ({cluster.profiles.length})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Location Alumni Panel */}
        <aside className="lg:col-span-4 rounded-2xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] p-6 space-y-5">
          {!selectedCluster ? (
            <div className="py-12 text-center space-y-2">
              <h2 className="font-serif text-lg font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                No Matching Locations
              </h2>
              <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/80">
                No public alumni location records match the current filter criteria.
              </p>
            </div>
          ) : (
            <>
              <div className="pb-4 border-b border-[#E8DFED] dark:border-[#2E1A3B]">
                <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
                  Selected Geographic Hub
                </div>
                <h2 className="mt-1 font-serif text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                  {selectedCluster.city !== 'Country-Level Record'
                    ? `${selectedCluster.city}, ${selectedCluster.country}`
                    : selectedCluster.country}
                </h2>
                <p className="mt-1 text-xs font-mono text-[#716A79] dark:text-[#B69AD8] tabular-nums">
                  {selectedCluster.profiles.length} Recorded{' '}
                  {selectedCluster.profiles.length === 1 ? 'Alumnus' : 'Alumni'}
                </p>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {selectedCluster.profiles.map((p) => (
                  <div
                    key={p.alumni.id}
                    onClick={() => navigate(`/alumni/${p.alumni.studentId}`)}
                    className="group cursor-pointer p-4 rounded-xl border border-[#E8DFED] dark:border-[#2E1A3B] hover:border-[#663078] dark:hover:border-[#B69AD8] transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <AlumniPortrait
                        profileImage={p.alumni.profileImage}
                        initials={p.alumni.portraitInitials}
                        fullName={p.alumni.fullName}
                        tone={p.alumni.portraitTone}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-mono text-[#716A79] dark:text-[#B69AD8] tabular-nums">
                          {p.batch.name} · ID {p.alumni.studentId}
                        </div>
                        <h3 className="text-sm font-semibold text-[#25212B] dark:text-[#F7F3F9] group-hover:text-[#663078] dark:group-hover:text-[#B69AD8] truncate">
                          {p.alumni.fullName}
                        </h3>
                        {p.currentPosition && (
                          <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/85 truncate mt-0.5">
                            {p.currentPosition.designation} · {p.currentPosition.organization}
                          </p>
                        )}
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#663078] dark:text-[#B69AD8] shrink-0 mt-1" />
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#E8DFED] dark:border-[#2E1A3B]">
                <button
                  type="button"
                  onClick={() => navigate(`/alumni?q=${encodeURIComponent(selectedCluster.country)}`)}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-[#32143F] dark:text-[#F7F3F9] bg-[#F7F3F9] dark:bg-[#241330] hover:bg-[#E8DFED] rounded-lg transition-colors cursor-pointer"
                >
                  Filter Full Directory by {selectedCluster.country} &rarr;
                </button>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
};
