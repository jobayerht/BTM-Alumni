import React, { useState, useMemo, useEffect } from 'react';
import { Search, LayoutGrid, List, AlignJustify, RotateCcw, ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useRouter, updateDocumentMeta } from '../utils/router';
import { AlumniCard } from '../components/AlumniCard';
import { EditorialPlate } from '../components/EditorialMedia';

interface BatchDirectoryPageProps {
  batchCode?: string;
}

export const BatchDirectoryPage: React.FC<BatchDirectoryPageProps> = ({ batchCode }) => {
  const { batches, getBatchByCodeOrId, getBatchProfiles, getAllPublicProfiles } = useData();
  const { navigate } = useRouter();

  const currentBatch = batchCode ? getBatchByCodeOrId(batchCode) : undefined;

  const initialParams = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return {
        q: params.get('q') || '',
        industry: params.get('industry') || 'all',
        org: params.get('org') || 'all',
        country: params.get('country') || 'all',
      };
    } catch {
      return { q: '', industry: 'all', org: 'all', country: 'all' };
    }
  }, []);

  const [searchQuery, setSearchQuery] = useState(initialParams.q);
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>(initialParams.industry);
  const [selectedOrganization, setSelectedOrganization] = useState<string>(initialParams.org);
  const [selectedLocation, setSelectedLocation] = useState<string>(initialParams.country);
  const [sortBy, setSortBy] = useState<'id_asc' | 'id_desc' | 'name_asc' | 'updated_desc'>(() => {
    try {
      const saved = sessionStorage.getItem('btm_directory_sort_by');
      if (saved === 'id_asc' || saved === 'id_desc' || saved === 'name_asc' || saved === 'updated_desc') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'id_asc';
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'short'>(() => {
    try {
      const saved = sessionStorage.getItem('btm_directory_view_mode');
      if (saved === 'grid' || saved === 'list' || saved === 'short') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'grid';
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('btm_directory_sort_by', sortBy);
      sessionStorage.setItem('btm_directory_view_mode', viewMode);
    } catch {
      // ignore
    }
  }, [sortBy, viewMode]);

  useEffect(() => {
    if (currentBatch) {
      updateDocumentMeta(
        `${currentBatch.name} Alumni Directory`,
        `Explore alumni profiles, career paths, and organizations for ${currentBatch.name} (${currentBatch.intakeYear}–${currentBatch.graduationYear}) at IUT BTM.`
      );
    } else {
      updateDocumentMeta(
        'Global Alumni Directory & Search',
        'Search and filter BTM alumni across batches, organizations, designations, and global locations.'
      );
    }
  }, [currentBatch]);

  const baseProfiles = useMemo(() => {
    if (currentBatch) {
      return getBatchProfiles(currentBatch.id);
    }
    return getAllPublicProfiles();
  }, [currentBatch, getBatchProfiles, getAllPublicProfiles]);

  const availableLocations = useMemo(() => {
    const set = new Set<string>();
    baseProfiles.forEach((p) => {
      if (p.location && p.location.visibility !== 'hidden') {
        set.add(p.location.country);
      }
    });
    return Array.from(set).sort();
  }, [baseProfiles]);

  const filteredProfiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return baseProfiles
      .filter((p) => {
        if (!currentBatch && selectedBatchFilter !== 'all' && p.batch.id !== selectedBatchFilter) {
          return false;
        }
        if (selectedIndustry !== 'all' && (p.alumni.primaryIndustry || '') !== selectedIndustry) {
          return false;
        }
        if (
          selectedOrganization !== 'all' &&
          (p.currentPosition?.organization || '') !== selectedOrganization
        ) {
          return false;
        }
        if (selectedLocation !== 'all' && (p.location?.country || '') !== selectedLocation) {
          return false;
        }

        if (!q) return true;

        const matchName = p.alumni.fullName.toLowerCase().includes(q);
        const matchId = p.alumni.studentId.toLowerCase().includes(q);
        const matchCompany = (p.currentPosition?.organization || '').toLowerCase().includes(q);
        const matchDesignation = (p.currentPosition?.designation || '').toLowerCase().includes(q);
        const matchCity = (p.location?.city || '').toLowerCase().includes(q);
        const matchCountry = (p.location?.country || '').toLowerCase().includes(q);
        const matchSkill = p.alumni.skills.some((s) => s.toLowerCase().includes(q));

        return (
          matchName ||
          matchId ||
          matchCompany ||
          matchDesignation ||
          matchCity ||
          matchCountry ||
          matchSkill
        );
      })
      .sort((a, b) => {
        const getRollSortKey = (sid: string) =>
          sid.length >= 4 ? `${sid.slice(0, 2)}-${sid.slice(-2)}-${sid}` : sid;
        if (sortBy === 'id_asc') {
          return getRollSortKey(a.alumni.studentId).localeCompare(getRollSortKey(b.alumni.studentId));
        }
        if (sortBy === 'id_desc') {
          return getRollSortKey(b.alumni.studentId).localeCompare(getRollSortKey(a.alumni.studentId));
        }
        if (sortBy === 'name_asc') return a.alumni.fullName.localeCompare(b.alumni.fullName);
        if (sortBy === 'updated_desc') return b.alumni.lastUpdated.localeCompare(a.alumni.lastUpdated);
        return 0;
      });
  }, [
    baseProfiles,
    currentBatch,
    selectedBatchFilter,
    selectedIndustry,
    selectedOrganization,
    selectedLocation,
    searchQuery,
    sortBy,
  ]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedBatchFilter !== 'all' ||
    selectedIndustry !== 'all' ||
    selectedOrganization !== 'all' ||
    selectedLocation !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedBatchFilter('all');
    setSelectedIndustry('all');
    setSelectedOrganization('all');
    setSelectedLocation('all');
    setSortBy('id_asc');
  };

  if (batchCode && !currentBatch) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-20 text-center space-y-4">
        <h1 className="font-serif text-3xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
          Batch Directory Not Found
        </h1>
        <p className="text-sm text-[#716A79] dark:text-[#B69AD8]">
          The requested batch code (&ldquo;{batchCode}&rdquo;) does not match an existing BTM batch archive.
        </p>
        <button
          type="button"
          onClick={() => navigate('/batches')}
          className="px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] bg-[#663078] rounded-lg cursor-pointer"
        >
          Return to All Batches
        </button>
      </div>
    );
  }

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
        {currentBatch ? (
          <>
            <a
              href="/batches"
              onClick={(e) => {
                e.preventDefault();
                navigate('/batches');
              }}
              className="hover:text-[#663078] dark:hover:text-[#FFFFFF]"
            >
              Batches
            </a>
            <span aria-hidden="true">/</span>
            <span className="text-[#25212B] dark:text-[#F7F3F9] font-medium">{currentBatch.name}</span>
          </>
        ) : (
          <span className="text-[#25212B] dark:text-[#F7F3F9] font-medium">Global Alumni Directory</span>
        )}
      </nav>

      {currentBatch ? (
        <div className="rounded-2xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-7 p-8 lg:p-10 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#663078] dark:text-[#B69AD8] tabular-nums">
                  <span>BATCH DIRECTORY</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    INTAKE {currentBatch.intakeYear} – GRADUATION {currentBatch.graduationYear}
                  </span>
                </div>
                <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-[#32143F] dark:text-[#F7F3F9]">
                  {currentBatch.name} Alumni Directory
                </h1>
                <p className="mt-3 text-sm sm:text-base text-[#716A79] dark:text-[#B69AD8]/90 leading-relaxed">
                  {currentBatch.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E8DFED] dark:border-[#2E1A3B] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div>
                    <div className="font-mono text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9] tabular-nums">
                      {baseProfiles.length}
                    </div>
                    <div className="text-xs text-[#716A79] dark:text-[#B69AD8]/80">
                      Available Alumni {baseProfiles.length === 1 ? 'Record' : 'Records'}
                    </div>
                  </div>
                  <div className="h-8 w-px bg-[#E8DFED] dark:bg-[#2E1A3B]" />
                  <div>
                    <div className="text-sm font-semibold text-[#25212B] dark:text-[#E8DFED]">
                      {currentBatch.status === 'active' ? 'Active Directory' : 'Coming Soon State'}
                    </div>
                    <div className="text-xs text-[#716A79] dark:text-[#B69AD8]/80">
                      {currentBatch.status === 'active'
                        ? 'Verified BTM 17 archival records loaded'
                        : 'Awaiting verified departmental intake'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-[#F7F3F9] dark:bg-[#130919] p-1 rounded-lg border border-[#E8DFED] dark:border-[#2E1A3B]">
                  {batches.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => navigate(`/batch/${b.code}`)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        b.id === currentBatch.id
                          ? 'bg-[#663078] text-[#FFFFFF]'
                          : 'text-[#716A79] dark:text-[#B69AD8] hover:text-[#25212B] dark:hover:text-[#FFFFFF]'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 min-h-[240px] border-t lg:border-t-0 lg:border-l border-[#E8DFED] dark:border-[#321E3E]">
              <EditorialPlate
                variant={currentBatch.coverPlateVariant}
                imageUrl={currentBatch.coverImage}
                alt={`${currentBatch.name} architectural cover`}
                caption={`${currentBatch.name} · IUT DEPARTMENT OF BTM`}
                className="w-full h-full min-h-[240px]"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="pb-8 mb-8 border-b border-[#E8DFED] dark:border-[#2E1A3B] flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
              Centralized Search &amp; Registry
            </div>
            <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-[#32143F] dark:text-[#F7F3F9]">
              Global BTM Alumni Directory
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#716A79] dark:text-[#B69AD8]/90 max-w-2xl">
              Search and filter across all published BTM batches by name, 9-digit Student ID, organization,
              designation, or geographic location.
            </p>
          </div>
          <div className="font-mono text-xs text-[#716A79] dark:text-[#B69AD8] tabular-nums">
            Showing {filteredProfiles.length} of {baseProfiles.length} available records
          </div>
        </div>
      )}

      {currentBatch && baseProfiles.length === 0 ? (
        <div className="rounded-2xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#F7F3F9]/60 dark:bg-[#190D21] p-10 lg:p-14 text-center max-w-3xl mx-auto my-8 space-y-5">
          <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
            {currentBatch.name} · Batch Directory Status
          </div>
          <h2 className="font-serif text-3xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
            {currentBatch.name} Records Coming Soon
          </h2>
          <p className="text-sm sm:text-base text-[#716A79] dark:text-[#B69AD8]/85 leading-relaxed">
            The reusable directory architecture for {currentBatch.name} ({currentBatch.intakeYear}–
            {currentBatch.graduationYear}) is configured and ready. In accordance with departmental data
            integrity standards, no fabricated counts or placeholder alumni identities are shown for this
            batch until verified records are added.
          </p>
          <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/batch/17')}
              className="px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] bg-[#663078] hover:bg-[#32143F] rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Explore Active BTM 17 Directory</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {!currentBatch && (
            <div className="bg-[#F7F3F9] dark:bg-[#180C20] border border-[#E8DFED] dark:border-[#321E3E] rounded-xl p-5 mb-6 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-6 relative flex items-center bg-[#FFFFFF] dark:bg-[#120917] border border-[#E8DFED] dark:border-[#352044] rounded-lg px-3.5 py-2">
                  <Search className="w-4 h-4 text-[#663078] dark:text-[#B69AD8] shrink-0 mr-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, Student ID, company, role, or city..."
                    aria-label="Filter alumni records"
                    className="w-full bg-transparent text-sm text-[#25212B] dark:text-[#F7F3F9] placeholder-[#716A79] focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-[#716A79] hover:text-[#25212B] dark:hover:text-[#FFFFFF] ml-2"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    aria-label="Filter by Batch"
                    value={selectedBatchFilter}
                    onChange={(e) => setSelectedBatchFilter(e.target.value)}
                    className="bg-[#FFFFFF] dark:bg-[#120917] border border-[#E8DFED] dark:border-[#352044] rounded-lg px-3 py-2 text-xs font-medium text-[#25212B] dark:text-[#F7F3F9] focus:outline-none focus:border-[#663078]"
                  >
                    <option value="all">All Batches</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="Filter by Country"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="bg-[#FFFFFF] dark:bg-[#120917] border border-[#E8DFED] dark:border-[#352044] rounded-lg px-3 py-2 text-xs font-medium text-[#25212B] dark:text-[#F7F3F9] focus:outline-none focus:border-[#663078]"
                  >
                    <option value="all">All Locations ({availableLocations.length})</option>
                    {availableLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="pt-3 border-t border-[#E8DFED] dark:border-[#2E1A3B] flex items-center justify-end">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#663078] dark:text-[#B69AD8] hover:underline cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Filters</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Directory View Mode & Sort Bar (Grid / List / Short List) */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E8DFED] dark:border-[#2E1A3B]">
            <div className="text-xs font-mono text-[#716A79] dark:text-[#B69AD8] tabular-nums">
              Showing <strong className="text-[#25212B] dark:text-[#F7F3F9]">{filteredProfiles.length}</strong>{' '}
              {filteredProfiles.length === 1 ? 'alumnus' : 'alumni'}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <label htmlFor="sort-select" className="text-[#716A79] dark:text-[#B69AD8] whitespace-nowrap">
                  Sort:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="bg-[#FFFFFF] dark:bg-[#190D21] border border-[#E8DFED] dark:border-[#352044] rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#25212B] dark:text-[#F7F3F9] focus:outline-none"
                >
                  <option value="id_asc">Student ID (Ascending)</option>
                  <option value="id_desc">Student ID (Descending)</option>
                  <option value="name_asc">Full Name (A–Z)</option>
                </select>
              </div>

              <div
                role="group"
                aria-label="Directory layout view mode"
                className="flex items-center gap-1 p-1 bg-[#F7F3F9] dark:bg-[#190D21] border border-[#E8DFED] dark:border-[#352044] rounded-lg"
              >
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    viewMode === 'grid'
                      ? 'bg-[#663078] text-[#FFFFFF]'
                      : 'text-[#716A79] dark:text-[#B69AD8] hover:text-[#25212B] dark:hover:text-[#FFFFFF]'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    viewMode === 'list'
                      ? 'bg-[#663078] text-[#FFFFFF]'
                      : 'text-[#716A79] dark:text-[#B69AD8] hover:text-[#25212B] dark:hover:text-[#FFFFFF]'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('short')}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    viewMode === 'short'
                      ? 'bg-[#663078] text-[#FFFFFF]'
                      : 'text-[#716A79] dark:text-[#B69AD8] hover:text-[#25212B] dark:hover:text-[#FFFFFF]'
                  }`}
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                  <span>Short List</span>
                </button>
              </div>
            </div>
          </div>

          {filteredProfiles.length === 0 ? (
            <div className="p-12 rounded-xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] text-center space-y-3">
              <h3 className="font-serif text-xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                No Matching Alumni Profiles Found
              </h3>
              <p className="text-sm text-[#716A79] dark:text-[#B69AD8]/80 max-w-md mx-auto">
                No alumni records match your current combination of search terms and filters. Try broadening
                your query or resetting active filters.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 text-xs font-semibold text-[#FFFFFF] bg-[#663078] rounded-lg cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((profile) => (
                <AlumniCard key={profile.alumni.id} profile={profile} viewMode="grid" />
              ))}
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-3">
              {filteredProfiles.map((profile) => (
                <AlumniCard key={profile.alumni.id} profile={profile} viewMode="list" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 items-start">
              <div className="space-y-2.5">
                {filteredProfiles
                  .slice(0, Math.ceil(filteredProfiles.length / 2))
                  .map((profile) => (
                    <AlumniCard key={profile.alumni.id} profile={profile} viewMode="short" />
                  ))}
              </div>
              <div className="space-y-2.5">
                {filteredProfiles
                  .slice(Math.ceil(filteredProfiles.length / 2))
                  .map((profile) => (
                    <AlumniCard key={profile.alumni.id} profile={profile} viewMode="short" />
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
