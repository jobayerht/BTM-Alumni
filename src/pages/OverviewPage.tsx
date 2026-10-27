import React, { useState, useMemo, useEffect } from 'react';
import {
  RotateCcw,
  ArrowUpRight,
  Globe,
  GraduationCap,
  Briefcase,
  Building2,
  GitCompare,
  ShieldCheck,
  Award,
  Search,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useRouter, updateDocumentMeta } from '../utils/router';
import {
  OverviewFilterState,
  filterOverviewProfiles,
  computeOverviewAnalytics,
} from '../utils/overviewAnalytics';
import { AlumniPortrait, VerificationLabel } from '../components/EditorialMedia';

type OverviewSectionFocus =
  | 'all'
  | 'geographic'
  | 'higher-studies'
  | 'career-industry'
  | 'batch-comparison'
  | 'achievements-quality';

export const OverviewPage: React.FC = () => {
  const { batches, stories, getAllPublicProfiles } = useData();
  const { navigate } = useRouter();

  useEffect(() => {
    updateDocumentMeta(
      'Overview & Multi-Batch Analytics Dashboard',
      'Interactive cohort overview and analytics dashboard for BTM 17, BTM 18, BTM 19, and BTM 20 at Islamic University of Technology (IUT).'
    );
  }, []);

  const allPublicProfiles = getAllPublicProfiles();

  // Global Filters State
  // Empty selectedBatchIds means "All Batches Combined"
  const [filters, setFilters] = useState<OverviewFilterState>({
    selectedBatchIds: [],
    country: 'all',
    city: 'all',
    careerStatus: 'all',
    industry: 'all',
    studyLevel: 'all',
    organization: 'all',
  });

  // Batch Comparison Selector State (defaults to all 4 batches)
  const [comparedBatchIds, setComparedBatchIds] = useState<string[]>(() =>
    batches.map((b) => b.id)
  );

  // Active Section Focus Tab (allows viewing all sections or focusing on one domain)
  const [sectionFocus, setSectionFocus] = useState<OverviewSectionFocus>('all');

  // Dynamic Filter Options derived from allPublicProfiles
  const filterOptions = useMemo(() => {
    const countries = new Set<string>();
    const cities = new Set<string>();
    const industries = new Set<string>();
    const organizations = new Set<string>();

    allPublicProfiles.forEach((p) => {
      if (p.location && p.location.visibility !== 'hidden' && p.location.country) {
        countries.add(p.location.country);
        if (p.location.visibility === 'city_and_country' && p.location.city) {
          cities.add(p.location.city);
        }
      }
      if (p.alumni.primaryIndustry) {
        industries.add(p.alumni.primaryIndustry);
      }
      if (p.currentPosition?.organization) {
        organizations.add(p.currentPosition.organization);
      }
    });

    return {
      countries: Array.from(countries).sort(),
      cities: Array.from(cities).sort(),
      industries: Array.from(industries).sort(),
      organizations: Array.from(organizations).sort(),
    };
  }, [allPublicProfiles]);

  // Filtered profiles and computed analytics
  const filteredProfiles = useMemo(
    () => filterOverviewProfiles(allPublicProfiles, filters),
    [allPublicProfiles, filters]
  );

  const analytics = useMemo(
    () =>
      computeOverviewAnalytics(
        filteredProfiles,
        allPublicProfiles,
        batches,
        stories,
        filters.selectedBatchIds
      ),
    [filteredProfiles, allPublicProfiles, batches, stories, filters.selectedBatchIds]
  );

  // Multi-select Batch Toggle Handler
  const handleToggleBatch = (batchId: string) => {
    setFilters((prev) => {
      const exists = prev.selectedBatchIds.includes(batchId);
      const next = exists
        ? prev.selectedBatchIds.filter((id) => id !== batchId)
        : [...prev.selectedBatchIds, batchId];
      return { ...prev, selectedBatchIds: next };
    });
  };

  const handleSelectSingleBatchOnly = (batchId: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedBatchIds: [batchId],
    }));
  };

  const handleSelectAllBatches = () => {
    setFilters((prev) => ({
      ...prev,
      selectedBatchIds: [],
    }));
  };

  const hasActiveFilters =
    filters.selectedBatchIds.length > 0 ||
    filters.country !== 'all' ||
    filters.city !== 'all' ||
    filters.careerStatus !== 'all' ||
    filters.industry !== 'all' ||
    filters.studyLevel !== 'all' ||
    filters.organization !== 'all';

  const handleResetFilters = () => {
    setFilters({
      selectedBatchIds: [],
      country: 'all',
      city: 'all',
      careerStatus: 'all',
      industry: 'all',
      studyLevel: 'all',
      organization: 'all',
    });
  };

  const toggleComparedBatch = (batchId: string) => {
    setComparedBatchIds((prev) => {
      if (prev.includes(batchId)) {
        if (prev.length === 1) return prev; // Keep at least 1 batch selected for comparison
        return prev.filter((id) => id !== batchId);
      }
      return [...prev, batchId];
    });
  };

  const showSection = (target: OverviewSectionFocus) =>
    sectionFocus === 'all' || sectionFocus === target;

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-10 lg:py-14">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="text-xs text-[#716A79] dark:text-[#B69AD8]/80 mb-6 flex items-center gap-2"
      >
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
        <span className="text-[#25212B] dark:text-[#F7F3F9] font-medium">Overview Dashboard</span>
      </nav>

      {/* 1. Dashboard Header */}
      <header className="pb-8 border-b border-[#E8DFED] dark:border-[#2E1A3B] flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2.5">
          <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
            Multi-Cohort Executive Intelligence · BTM 17 — BTM 20
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-[#32143F] dark:text-[#F7F3F9] text-balance">
            BTM Alumni Overview Dashboard
          </h1>
          <p className="text-sm sm:text-base text-[#716A79] dark:text-[#B69AD8]/90 max-w-3xl leading-relaxed">
            Comprehensive analytics across geographic distribution, postgraduate higher studies, career
            progression, industry and company representation, cross-batch comparisons, and archival data
            completeness.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/alumni')}
            className="px-4 py-2.5 text-xs font-semibold text-[#FFFFFF] bg-[#663078] hover:bg-[#32143F] rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Open Alumni Directory</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-4 py-2.5 text-xs font-semibold text-[#32143F] dark:text-[#F7F3F9] bg-[#F7F3F9] dark:bg-[#190D21] border border-[#E8DFED] dark:border-[#352044] hover:border-[#663078] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Manage Records in Admin
          </button>
        </div>
      </header>

      {/* Prototype Sample Data Transparency Notice */}
      <div className="my-6 px-5 py-3.5 rounded-xl bg-[#F7F3F9] dark:bg-[#190D21] border border-[#E8DFED] dark:border-[#352044] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#716A79] dark:text-[#B69AD8]">
        <div>
          <strong className="text-[#32143F] dark:text-[#F7F3F9]">
            Demonstration Data &amp; Counting Integrity Notice:
          </strong>{' '}
          All metrics are computed dynamically from the active local dataset without double-counting
          individuals across multiple roles or degrees. Missing fields are explicitly separated from confirmed
          counts.
        </div>
        <span className="font-mono uppercase tracking-wider text-[11px] text-[#663078] dark:text-[#C8B2E6] shrink-0 tabular-nums">
          SCOPE: {analytics.activeScopeLabel} (n = {analytics.totalAlumni})
        </span>
      </div>

      {/* 2. Global Interactive Filters */}
      <section
        aria-label="Global Dashboard Filters"
        className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#190D21] border border-[#E8DFED] dark:border-[#321E3E] space-y-5 mb-10"
      >
        {/* Row A: Multi-Batch Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E8DFED] dark:border-[#2E1A3B]">
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
              Cohort Scope Selector (Single, Multi-Batch Combination, or All Combined)
            </div>
            <div className="text-sm font-semibold text-[#32143F] dark:text-[#F7F3F9]">
              Active Scope: <span className="text-[#663078] dark:text-[#C8B2E6]">{analytics.activeScopeLabel}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAllBatches}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                filters.selectedBatchIds.length === 0
                  ? 'bg-[#663078] text-[#FFFFFF] border-[#663078]'
                  : 'bg-[#F7F3F9] dark:bg-[#140A1B] text-[#25212B] dark:text-[#E8DFED] border-[#E8DFED] dark:border-[#352044] hover:border-[#663078]'
              }`}
            >
              All 4 Batches Combined
            </button>

            {batches.map((b) => {
              const isSelected = filters.selectedBatchIds.includes(b.id);
              const bCount = allPublicProfiles.filter((p) => p.batch.id === b.id).length;
              return (
                <div
                  key={b.id}
                  className="inline-flex items-center rounded-lg border border-[#E8DFED] dark:border-[#352044] overflow-hidden bg-[#F7F3F9] dark:bg-[#140A1B]"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleBatch(b.id)}
                    title={`Toggle ${b.name} in multi-batch selection`}
                    className={`px-3 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-[#663078] text-[#FFFFFF]'
                        : 'text-[#25212B] dark:text-[#E8DFED] hover:bg-[#E8DFED]/60 dark:hover:bg-[#241330]'
                    }`}
                  >
                    <span>{b.name}</span>
                    <span className="ml-1.5 font-mono text-[11px] opacity-80 tabular-nums">({bCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectSingleBatchOnly(b.id)}
                    title={`Analyze ${b.name} individually`}
                    className="px-2 py-2 text-[10px] font-mono uppercase tracking-wider border-l border-[#E8DFED] dark:border-[#352044] text-[#716A79] dark:text-[#B69AD8] hover:text-[#663078] dark:hover:text-[#FFFFFF] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Only
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Row B: Dimension Filters (Location, Career Status, Industry, Study Level, Organization) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div>
            <label
              htmlFor="ov-country"
              className="block text-[11px] font-mono uppercase text-[#716A79] dark:text-[#B69AD8] mb-1"
            >
              Current Country
            </label>
            <select
              id="ov-country"
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
              className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#F7F3F9]/60 dark:bg-[#120917] text-[#25212B] dark:text-[#F7F3F9]"
            >
              <option value="all">All Countries</option>
              {filterOptions.countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="Unknown">Unknown / Unreported</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="ov-city"
              className="block text-[11px] font-mono uppercase text-[#716A79] dark:text-[#B69AD8] mb-1"
            >
              Current City
            </label>
            <select
              id="ov-city"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#F7F3F9]/60 dark:bg-[#120917] text-[#25212B] dark:text-[#F7F3F9]"
            >
              <option value="all">All Recorded Cities</option>
              {filterOptions.cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="ov-career"
              className="block text-[11px] font-mono uppercase text-[#716A79] dark:text-[#B69AD8] mb-1"
            >
              Career Status
            </label>
            <select
              id="ov-career"
              value={filters.careerStatus}
              onChange={(e) => setFilters({ ...filters, careerStatus: e.target.value })}
              className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#F7F3F9]/60 dark:bg-[#120917] text-[#25212B] dark:text-[#F7F3F9]"
            >
              <option value="all">All Career Statuses</option>
              <option value="Employed">Employed</option>
              <option value="Higher studies">Higher studies</option>
              <option value="Entrepreneur / Founder">Entrepreneur / Founder</option>
              <option value="Seeking employment">Seeking employment</option>
              <option value="Career transition">Career transition</option>
              <option value="Unknown">Unknown / Unreported</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="ov-industry"
              className="block text-[11px] font-mono uppercase text-[#716A79] dark:text-[#B69AD8] mb-1"
            >
              Primary Industry
            </label>
            <select
              id="ov-industry"
              value={filters.industry}
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#F7F3F9]/60 dark:bg-[#120917] text-[#25212B] dark:text-[#F7F3F9]"
            >
              <option value="all">All Industries</option>
              {filterOptions.industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
              <option value="Unknown">Unknown / Unspecified</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="ov-study"
              className="block text-[11px] font-mono uppercase text-[#716A79] dark:text-[#B69AD8] mb-1"
            >
              Recorded Study Level
            </label>
            <select
              id="ov-study"
              value={filters.studyLevel}
              onChange={(e) => setFilters({ ...filters, studyLevel: e.target.value })}
              className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#F7F3F9]/60 dark:bg-[#120917] text-[#25212B] dark:text-[#F7F3F9]"
            >
              <option value="all">All Study Levels</option>
              <option value="Bachelors">Bachelor’s (BSc in BTM)</option>
              <option value="Masters">Master’s (MSc / MBA)</option>
              <option value="PhD / Doctoral">PhD / Doctoral Studies</option>
              <option value="Postgraduate Diploma">Postgraduate Diploma</option>
              <option value="Professional Qualification">Professional Qualification</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="ov-org"
              className="block text-[11px] font-mono uppercase text-[#716A79] dark:text-[#B69AD8] mb-1"
            >
              Current Organization
            </label>
            <select
              id="ov-org"
              value={filters.organization}
              onChange={(e) => setFilters({ ...filters, organization: e.target.value })}
              className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#F7F3F9]/60 dark:bg-[#120917] text-[#25212B] dark:text-[#F7F3F9]"
            >
              <option value="all">All Organizations</option>
              {filterOptions.organizations.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row C: Filter Summary & Reset */}
        <div className="pt-3 border-t border-[#E8DFED] dark:border-[#2E1A3B] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="text-[#716A79] dark:text-[#B69AD8] font-mono tabular-nums">
            Matching Alumni in Scope:{' '}
            <strong className="text-[#32143F] dark:text-[#F7F3F9]">{analytics.totalAlumni}</strong> of{' '}
            {allPublicProfiles.length} total published records
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#663078] dark:text-[#C8B2E6] hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      </section>

      {/* 3. Key Performance Indicator Cards (10 Metrics with Explicit Denominators) */}
      <section aria-label="Key Performance Indicators" className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-5">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
              Key Performance Indicators
            </h2>
            <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/80">
              Person-level and entity-level metrics for <strong>{analytics.activeScopeLabel}</strong>.
              Missing records are separated from confirmed denominators.
            </p>
          </div>
          <span className="text-xs font-mono text-[#663078] dark:text-[#B69AD8] tabular-nums">
            Eligible Cohort Records: n = {analytics.totalAlumni}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {analytics.kpis.map((kpi) => (
            <div
              key={kpi.id}
              className="p-5 rounded-xl bg-[#FFFFFF] dark:bg-[#190D21] border border-[#E8DFED] dark:border-[#321E3E] flex flex-col justify-between"
            >
              <div>
                <div className="text-xs font-medium text-[#716A79] dark:text-[#B69AD8]">
                  {kpi.label}
                </div>
                <div className="mt-2 flex items-baseline gap-2.5 font-mono tabular-nums">
                  <span className="text-3xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                    {kpi.confirmedCount}
                  </span>
                  {kpi.percentageOfEligible !== null && (
                    <span className="text-xs font-semibold text-[#663078] dark:text-[#C8B2E6]">
                      {kpi.percentageOfEligible}%
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#E8DFED]/70 dark:border-[#2E1A3B] space-y-0.5 text-[11px] text-[#716A79] dark:text-[#9A8FA6] font-mono tabular-nums">
                <div>Denominator: {kpi.denominatorLabel}</div>
                <div className="font-sans">{kpi.subtext}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section Focus Navigation Bar (Prevents cognitive overload while keeping all sections reachable) */}
      <div
        role="tablist"
        aria-label="Dashboard analytical sections"
        className="mb-10 flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F7F3F9] dark:bg-[#180C20] border border-[#E8DFED] dark:border-[#321E3E] rounded-xl"
      >
        {[
          { id: 'all', label: 'All Insights (Complete View)', icon: null },
          { id: 'geographic', label: '01. Geographic Footprint', icon: Globe },
          { id: 'higher-studies', label: '02. Higher Studies', icon: GraduationCap },
          { id: 'career-industry', label: '03. Career, Industry & Companies', icon: Briefcase },
          { id: 'batch-comparison', label: '04. Batch Comparison (BTM 17–20)', icon: GitCompare },
          { id: 'achievements-quality', label: '05. Achievements & Data Coverage', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = sectionFocus === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSectionFocus(tab.id as OverviewSectionFocus)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-[#663078] text-[#FFFFFF]'
                  : 'text-[#716A79] dark:text-[#B69AD8] hover:text-[#25212B] dark:hover:text-[#FFFFFF]'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Empty State if active filters match 0 alumni */}
      {analytics.totalAlumni === 0 && sectionFocus !== 'batch-comparison' ? (
        <div className="p-12 rounded-2xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] text-center space-y-4 mb-12">
          <h3 className="font-serif text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
            No Alumni Records in Selected Scope ({analytics.activeScopeLabel})
          </h3>
          <p className="text-sm text-[#716A79] dark:text-[#B69AD8]/85 max-w-lg mx-auto leading-relaxed">
            The current combination of batch and attribute filters returned 0 records. Note that BTM 18, BTM
            19, and BTM 20 are currently in their &ldquo;Coming Soon&rdquo; archival intake phase unless
            populated via the Admin Workspace.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 text-xs font-semibold text-[#FFFFFF] bg-[#663078] rounded-lg cursor-pointer"
            >
              Reset Filters to All Batches
            </button>
            <button
              type="button"
              onClick={() => setSectionFocus('batch-comparison')}
              className="px-4 py-2 text-xs font-semibold text-[#32143F] dark:text-[#F7F3F9] border border-[#E8DFED] dark:border-[#352044] rounded-lg cursor-pointer"
            >
              Inspect Cross-Batch Comparison Table
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-14">
        {/* SECTION 5: GEOGRAPHIC DISTRIBUTION INSIGHTS */}
        {showSection('geographic') && analytics.totalAlumni > 0 && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-[#E8DFED] dark:border-[#2E1A3B]">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
                  Section 01 · Current Location Telemetry
                </div>
                <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                  Geographic Distribution Insights
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/map')}
                className="text-xs font-semibold text-[#663078] dark:text-[#B69AD8] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Explore Interactive Global Map</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* A. Domestic vs International Distribution */}
              <div className="lg:col-span-5 p-6 rounded-2xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] space-y-5">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                    A. Domestic vs. International Split
                  </h3>
                  <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/80 mt-0.5">
                    Each alumnus is counted once by current recorded location.
                  </p>
                </div>

                {/* Stacked Bar Visualization */}
                <div className="space-y-2">
                  <div className="h-4 w-full rounded-full bg-[#F7F3F9] dark:bg-[#120917] overflow-hidden flex">
                    {analytics.geographic.inBangladeshCount > 0 && (
                      <div
                        style={{
                          width: `${
                            (analytics.geographic.inBangladeshCount / analytics.totalAlumni) * 100
                          }%`,
                        }}
                        title={`In Bangladesh: ${analytics.geographic.inBangladeshCount}`}
                        className="h-full bg-[#32143F] dark:bg-[#663078]"
                      />
                    )}
                    {analytics.geographic.outsideBangladeshCount > 0 && (
                      <div
                        style={{
                          width: `${
                            (analytics.geographic.outsideBangladeshCount / analytics.totalAlumni) * 100
                          }%`,
                        }}
                        title={`Outside Bangladesh: ${analytics.geographic.outsideBangladeshCount}`}
                        className="h-full bg-[#663078] dark:bg-[#B69AD8]"
                      />
                    )}
                    {analytics.geographic.unknownLocationCount > 0 && (
                      <div
                        style={{
                          width: `${
                            (analytics.geographic.unknownLocationCount / analytics.totalAlumni) * 100
                          }%`,
                        }}
                        title={`Unknown / Unreported: ${analytics.geographic.unknownLocationCount}`}
                        className="h-full bg-[#E8DFED] dark:bg-[#352044]"
                      />
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-[#716A79] dark:text-[#9A8FA6] tabular-nums">
                    Total Scope Denominator: n = {analytics.totalAlumni} · Known Locations: n ={' '}
                    {analytics.geographic.knownLocationCount}
                  </div>
                </div>

                <div className="divide-y divide-[#E8DFED] dark:divide-[#2E1A3B] text-xs">
                  <div className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-[#25212B] dark:text-[#F7F3F9]">
                        Currently in Bangladesh (Domestic)
                      </div>
                      <div className="text-[#716A79] dark:text-[#9A8FA6]">
                        {analytics.geographic.inBangladeshPctOfKnown}% of known locations
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-sm text-[#32143F] dark:text-[#F7F3F9] tabular-nums">
                      {analytics.geographic.inBangladeshCount} (
                      {Math.round((analytics.geographic.inBangladeshCount / analytics.totalAlumni) * 100)}%)
                    </span>
                  </div>

                  <div className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-[#25212B] dark:text-[#F7F3F9]">
                        Currently Outside Bangladesh (International)
                      </div>
                      <div className="text-[#716A79] dark:text-[#9A8FA6]">
                        {analytics.geographic.outsideBangladeshPctOfKnown}% of known locations
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-sm text-[#663078] dark:text-[#C8B2E6] tabular-nums">
                      {analytics.geographic.outsideBangladeshCount} (
                      {Math.round(
                        (analytics.geographic.outsideBangladeshCount / analytics.totalAlumni) * 100
                      )}
                      %)
                    </span>
                  </div>

                  <div className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="italic text-[#716A79] dark:text-[#9A8FA6]">
                        Unknown or Unreported Location
                      </div>
                      <div className="text-[#716A79]/80 dark:text-[#9A8FA6]/80">
                        Location missing or set to private
                      </div>
                    </div>
                    <span className="font-mono text-sm text-[#716A79] dark:text-[#9A8FA6] tabular-nums">
                      {analytics.geographic.unknownLocationCount} (
                      {Math.round((analytics.geographic.unknownLocationCount / analytics.totalAlumni) * 100)}
                      %)
                    </span>
                  </div>
                </div>

                {/* C. City Distribution */}
                <div className="pt-4 border-t border-[#E8DFED] dark:border-[#2E1A3B] space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#32143F] dark:text-[#E8DFED]">
                    C. Recorded City Distribution (Explicit City-Level Data Only)
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    {analytics.geographic.cityDistribution.map((c) => (
                      <button
                        key={`${c.city}-${c.country}`}
                        type="button"
                        onClick={() => navigate(`/alumni?q=${encodeURIComponent(c.city)}`)}
                        className="p-2.5 text-left rounded-lg border border-[#E8DFED] dark:border-[#2E1A3B] hover:border-[#663078] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-[#25212B] dark:text-[#F7F3F9]">
                          <span className="truncate">{c.city}</span>
                          <span className="font-mono text-[#663078] dark:text-[#B69AD8] tabular-nums">
                            {c.count}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#716A79] dark:text-[#9A8FA6] truncate">
                          {c.country} · {c.pctOfKnownCities}%
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* B. Country Distribution Table */}
              <div className="lg:col-span-7 p-6 rounded-2xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                      B. Ranked Country Distribution &amp; Cohort Breakdown
                    </h3>
                    <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/80 mt-0.5">
                      Click any country row to filter the public alumni directory or inspect on the map.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#663078] dark:text-[#B69AD8] tabular-nums">
                    {analytics.geographic.countryDistribution.length} Countries
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E8DFED] dark:border-[#2E1A3B] text-[11px] font-mono uppercase text-[#716A79] dark:text-[#B69AD8]">
                        <th className="py-2.5 pr-4">Country &amp; Recorded Cities</th>
                        <th className="py-2.5 px-3 text-right">Alumni</th>
                        <th className="py-2.5 px-3 text-right">% of Known (n={analytics.geographic.knownLocationCount})</th>
                        <th className="py-2.5 px-3">Batch Breakdown</th>
                        <th className="py-2.5 pl-3 text-right">Directory</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DFED] dark:divide-[#2E1A3B]">
                      {analytics.geographic.countryDistribution.map((row) => (
                        <tr
                          key={row.country}
                          onClick={() =>
                            navigate(`/alumni?country=${encodeURIComponent(row.country)}`)
                          }
                          className="hover:bg-[#F7F3F9]/60 dark:hover:bg-[#22122D] cursor-pointer transition-colors"
                        >
                          <td className="py-3 pr-4">
                            <div className="font-semibold text-sm text-[#25212B] dark:text-[#F7F3F9]">
                              {row.country}
                            </div>
                            <div className="text-[11px] text-[#716A79] dark:text-[#9A8FA6]">
                              {row.cities.length > 0 ? row.cities.join(', ') : 'Country-level only'}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-sm text-[#32143F] dark:text-[#F7F3F9] tabular-nums">
                            {row.count}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-[#663078] dark:text-[#C8B2E6] tabular-nums">
                            {row.pctOfKnownLocations}%
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-[#716A79] dark:text-[#B69AD8] tabular-nums">
                            {Object.entries(row.byBatch)
                              .map(([bName, cnt]) => `${bName}: ${cnt}`)
                              .join(' · ')}
                          </td>
                          <td className="py-3 pl-3 text-right">
                            <span className="inline-flex items-center gap-0.5 font-semibold text-[#663078] dark:text-[#B69AD8]">
                              <span>View</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 6: HIGHER STUDIES INSIGHTS */}
        {showSection('higher-studies') && analytics.totalAlumni > 0 && (
          <section className="space-y-6">
            <div className="pb-3 border-b border-[#E8DFED] dark:border-[#2E1A3B]">
              <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
                Section 02 · Postgraduate &amp; Doctoral Analytics
              </div>
              <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                Higher Studies Insights
              </h2>
              <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/80 mt-1">
                Strictly separates currently enrolled postgraduate candidates from alumni who have already
                completed postgraduate degrees.
              </p>
            </div>

            {/* Higher Studies Summary Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-[#F7F3F9] dark:bg-[#190D21] border border-[#E8DFED] dark:border-[#321E3E]">
                <div className="font-mono text-2xl font-semibold text-[#663078] dark:text-[#C8B2E6] tabular-nums">
                  {analytics.higherStudies.currentlyEnrolledProfiles.length}
                </div>
                <div className="mt-1 text-xs font-semibold text-[#25212B] dark:text-[#F7F3F9]">
                  Currently Pursuing Higher Studies
                </div>
                <div className="text-[11px] text-[#716A79] dark:text-[#9A8FA6] mt-0.5">
                  Explicitly marked currently enrolled
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#F7F3F9] dark:bg-[#190D21] border border-[#E8DFED] dark:border-[#321E3E]">
                <div className="font-mono text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9] tabular-nums">
                  {analytics.higherStudies.completedPostgradProfiles.length}
                </div>
                <div className="mt-1 text-xs font-semibold text-[#25212B] dark:text-[#F7F3F9]">
                  Completed Postgraduate Degree
                </div>
                <div className="text-[11px] text-[#716A79] dark:text-[#9A8FA6] mt-0.5">
                  Graduated MSc / MBA / PhD records
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#F7F3F9] dark:bg-[#190D21] border border-[#E8DFED] dark:border-[#321E3E]">
                <div className="font-mono text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9] tabular-nums">
                  {analytics.higherStudies.currentInBangladeshCount} Domestic ·{' '}
                  {analytics.higherStudies.currentAbroadCount} Abroad
                </div>
                <div className="mt-1 text-xs font-semibold text-[#25212B] dark:text-[#F7F3F9]">
                  Current Study Destination Split
                </div>
                <div className="text-[11px] text-[#716A79] dark:text-[#9A8FA6] mt-0.5">
                  Bangladesh vs. international universities
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#F7F3F9] dark:bg-[#190D21] border border-[#E8DFED] dark:border-[#321E3E]">
                <div className="font-mono text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9] tabular-nums">
                  {analytics.higherStudies.studyCountryDistribution.length}
                </div>
                <div className="mt-1 text-xs font-semibold text-[#25212B] dark:text-[#F7F3F9]">
                  Postgraduate Host Countries
                </div>
                <div className="text-[11px] text-[#716A79] dark:text-[#9A8FA6] mt-0.5">
                  Across current &amp; completed programs
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Study Level & Country Breakdown */}
              <div className="lg:col-span-5 p-6 rounded-2xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] space-y-6">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                    Postgraduate Study-Level &amp; Host Country Breakdown
                  </h3>
                  <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/80 mt-0.5">
                    Distinguishes active enrollment from completed degrees.
                  </p>
                </div>

                {analytics.higherStudies.studyLevelDistribution.length === 0 ? (
                  <p className="text-xs italic text-[#716A79]">
                    No postgraduate records match the current filter criteria.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="text-xs font-mono uppercase text-[#716A79] dark:text-[#B69AD8]">
                      By Study Level
                    </div>
                    {analytics.higherStudies.studyLevelDistribution.map((lvl) => (
                      <div
                        key={lvl.level}
                        className="p-3.5 rounded-xl bg-[#F7F3F9]/70 dark:bg-[#140A1B] border border-[#E8DFED] dark:border-[#2E1A3B] flex items-center justify-between gap-4 text-xs"
                      >
                        <span className="font-semibold text-[#25212B] dark:text-[#F7F3F9]">
                          {lvl.level}
                        </span>
                        <span className="font-mono text-[#663078] dark:text-[#C8B2E6] tabular-nums">
                          {lvl.current} Enrolled · {lvl.completed} Completed
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {analytics.higherStudies.studyCountryDistribution.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-[#E8DFED] dark:border-[#2E1A3B]">
                    <div className="text-xs font-mono uppercase text-[#716A79] dark:text-[#B69AD8]">
                      By Host Country (Postgraduate)
                    </div>
                    {analytics.higherStudies.studyCountryDistribution.map((c) => (
                      <div
                        key={c.country}
                        className="flex items-center justify-between text-xs py-1.5"
                      >
                        <span className="font-medium text-[#25212B] dark:text-[#E8DFED]">
                          {c.country}
                        </span>
                        <span className="font-mono text-[#716A79] dark:text-[#B69AD8] tabular-nums">
                          {c.current} Enrolled · {c.completed} Completed (Total {c.total})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Represented Postgraduate Records & Universities Table */}
              <div className="lg:col-span-7 p-6 rounded-2xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] space-y-4">
                <h3 className="font-serif text-lg font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                  Recorded Postgraduate &amp; Doctoral Dossiers
                </h3>

                {analytics.higherStudies.postgradRecords.length === 0 ? (
                  <p className="text-xs italic text-[#716A79]">
                    No postgraduate education records found in the active filter scope.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {analytics.higherStudies.postgradRecords.map((rec, idx) => (
                      <div
                        key={`${rec.alumniId}-${idx}`}
                        onClick={() => navigate(`/alumni/${rec.studentId}`)}
                        className="p-4 rounded-xl border border-[#E8DFED] dark:border-[#2E1A3B] hover:border-[#663078] transition-colors cursor-pointer space-y-1.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono tabular-nums">
                          <span className="text-[#663078] dark:text-[#C8B2E6] font-semibold">
                            {rec.studyLevel} ·{' '}
                            {rec.enrollmentStatus === 'currently_enrolled'
                              ? 'CURRENTLY ENROLLED'
                              : 'COMPLETED DEGREE'}
                          </span>
                          <span className="text-[#716A79] dark:text-[#B69AD8]">
                            {rec.country} · {rec.startYear}–{rec.endYear || 'Present'}
                          </span>
                        </div>

                        <div className="text-sm font-semibold text-[#25212B] dark:text-[#F7F3F9]">
                          {rec.degree} — {rec.institution}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#716A79] dark:text-[#B69AD8]">
                          <span>
                            Alumnus: <strong className="text-[#25212B] dark:text-[#E8DFED]">{rec.fullName}</strong> ({rec.batchName})
                          </span>
                          {rec.scholarshipOrFunding && (
                            <span className="italic">Funding: {rec.scholarshipOrFunding}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* SECTION 7, 8, 9: CAREER, INDUSTRY & COMPANY INSIGHTS */}
        {showSection('career-industry') && analytics.totalAlumni > 0 && (
          <section className="space-y-8">
            <div className="pb-3 border-b border-[#E8DFED] dark:border-[#2E1A3B]">
              <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
                Section 03 · Employment, Seniority, Sectors &amp; Employers
              </div>
              <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                Career, Industry &amp; Organization Insights
              </h2>
            </div>

            {/* Career Status & Seniority Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Career Status Distribution */}
              <div className="p-6 rounded-2xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] space-y-5">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                    A. Primary Career Status Distribution (Person-Level)
                  </h3>
                  <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/80 mt-0.5">
                    Mutually exclusive primary status per alumnus (n = {analytics.totalAlumni}). Note:{' '}
                    {analytics.career.workingAndStudyingCount}{' '}
                    {analytics.career.workingAndStudyingCount === 1 ? 'alumnus is' : 'alumni are'}{' '}
                    simultaneously employed and enrolled in part-time higher studies.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {analytics.career.careerStatusDistribution.map((item) => (
                    <div key={item.status} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#25212B] dark:text-[#F7F3F9]">
                          {item.status}
                        </span>
                        <span className="font-mono text-[#663078] dark:text-[#B69AD8] tabular-nums">
                          {item.count} ({item.pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-[#F7F3F9] dark:bg-[#120917] overflow-hidden">
                        <div
                          style={{ width: `${Math.max(item.pct, 4)}%` }}
                          className={`h-full rounded-full ${
                            item.status === 'Unknown'
                              ? 'bg-[#716A79]/50'
                              : 'bg-[#663078] dark:bg-[#B69AD8]'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-[#E8DFED] dark:border-[#2E1A3B] grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-3 rounded-lg bg-[#F7F3F9] dark:bg-[#140A1B]">
                    <div className="font-mono text-lg font-semibold text-[#32143F] dark:text-[#F7F3F9] tabular-nums">
                      {analytics.career.domesticEmploymentCount}
                    </div>
                    <div className="text-[11px] text-[#716A79] dark:text-[#B69AD8]">
                      Working in Bangladesh
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F7F3F9] dark:bg-[#140A1B]">
                    <div className="font-mono text-lg font-semibold text-[#663078] dark:text-[#C8B2E6] tabular-nums">
                      {analytics.career.internationalEmploymentCount}
                    </div>
                    <div className="text-[11px] text-[#716A79] dark:text-[#B69AD8]">
                      Working Abroad
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F7F3F9] dark:bg-[#140A1B]">
                    <div className="font-mono text-lg font-semibold text-[#32143F] dark:text-[#F7F3F9] tabular-nums">
                      {analytics.career.multiExperienceProfilesCount}
                    </div>
                    <div className="text-[11px] text-[#716A79] dark:text-[#B69AD8]">
                      Multi-Role Transitions
                    </div>
                  </div>
                </div>
              </div>

              {/* Seniority Distribution */}
              <div className="p-6 rounded-2xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] space-y-5">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                    B. Recorded Career-Level &amp; Seniority Distribution
                  </h3>
                  <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/80 mt-0.5">
                    Based strictly on explicit career-level classifications on current positions.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {analytics.career.seniorityDistribution.map((item) => (
                    <div key={item.level} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={
                            item.isUnknown
                              ? 'italic text-[#716A79] dark:text-[#9A8FA6]'
                              : 'font-semibold text-[#25212B] dark:text-[#F7F3F9]'
                          }
                        >
                          {item.level}
                        </span>
                        <span className="font-mono text-[#716A79] dark:text-[#B69AD8] tabular-nums">
                          {item.count} ({item.pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-[#F7F3F9] dark:bg-[#120917] overflow-hidden">
                        <div
                          style={{ width: `${Math.max(item.pct, 4)}%` }}
                          className={`h-full rounded-full ${
                            item.isUnknown
                              ? 'bg-[#716A79]/40'
                              : 'bg-[#32143F] dark:bg-[#9D75C9]'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Industry Rankings & Company Representation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Section 8: Industry Insights */}
              <div className="lg:col-span-6 p-6 rounded-2xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                      C. Industry Rankings &amp; Geographic Split
                    </h3>
                    <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/80">
                      Click any industry to view matching profiles in the Alumni Directory.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-[#E8DFED] dark:divide-[#2E1A3B] text-xs">
                  {analytics.industryDistribution.map((ind) => {
                    const isUnknown = ind.industry === 'Unknown / Unspecified';
                    return (
                      <div
                        key={ind.industry}
                        onClick={() => {
                          if (!isUnknown) {
                            navigate(`/alumni?industry=${encodeURIComponent(ind.industry)}`);
                          }
                        }}
                        className={`py-3 flex items-center justify-between gap-4 ${
                          !isUnknown
                            ? 'cursor-pointer hover:bg-[#F7F3F9]/60 dark:hover:bg-[#22122D] px-2 -mx-2 rounded-lg transition-colors'
                            : ''
                        }`}
                      >
                        <div>
                          <div
                            className={
                              isUnknown
                                ? 'italic text-[#716A79]'
                                : 'font-semibold text-sm text-[#25212B] dark:text-[#F7F3F9]'
                            }
                          >
                            {ind.industry}
                          </div>
                          <div className="text-[11px] text-[#716A79] dark:text-[#9A8FA6] font-mono tabular-nums">
                            Domestic: {ind.domesticCount} · Intl: {ind.internationalCount}
                            {ind.unknownLocationCount > 0
                              ? ` · Unreported Loc: ${ind.unknownLocationCount}`
                              : ''}
                          </div>
                        </div>

                        <div className="text-right font-mono tabular-nums shrink-0">
                          <div className="font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                            {ind.count} ({ind.pctOfTotalScope}% of total)
                          </div>
                          {!isUnknown && (
                            <div className="text-[11px] text-[#663078] dark:text-[#C8B2E6]">
                              {ind.pctOfKnownIndustry}% of known industry
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 9: Company & Organization Insights */}
              <div className="lg:col-span-6 p-6 rounded-2xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                      D. Represented Organizations (Unique Alumni Count)
                    </h3>
                    <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/80">
                      Counts unique alumni per company (multiple roles at the same company are not
                      double-counted).
                    </p>
                  </div>
                  <Building2 className="w-4 h-4 text-[#663078] dark:text-[#B69AD8]" />
                </div>

                <div className="divide-y divide-[#E8DFED] dark:divide-[#2E1A3B] text-xs">
                  {analytics.companyRepresentation.map((comp) => (
                    <div
                      key={comp.organization}
                      onClick={() =>
                        navigate(`/alumni?org=${encodeURIComponent(comp.organization)}`)
                      }
                      className="py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F7F3F9]/60 dark:hover:bg-[#22122D] px-2 -mx-2 rounded-lg transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-[#25212B] dark:text-[#F7F3F9] truncate">
                          {comp.organization}
                        </div>
                        <div className="text-[11px] text-[#716A79] dark:text-[#9A8FA6] truncate">
                          {comp.industry} · Batches: {comp.batches.join(', ')}
                        </div>
                      </div>

                      <div className="text-right font-mono tabular-nums shrink-0">
                        <div className="font-semibold text-[#663078] dark:text-[#C8B2E6]">
                          {comp.currentUniqueAlumniCount} Current
                        </div>
                        <div className="text-[11px] text-[#716A79] dark:text-[#9A8FA6]">
                          {comp.totalUniqueAlumniCount} Total Unique
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 10: BATCH COMPARISON (BTM 17, 18, 19, 20) */}
        {showSection('batch-comparison') && (
          <section className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-3 border-b border-[#E8DFED] dark:border-[#2E1A3B]">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
                  Section 04 · Cross-Cohort Benchmarking
                </div>
                <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                  Batch Comparison (BTM 17 — BTM 20)
                </h2>
                <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/80 mt-1">
                  Displays both raw counts and percentages alongside each cohort’s denominator (n) so
                  batches with different record counts are compared transparently.
                </p>
              </div>

              {/* Interactive Batch Comparison Selector */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-mono text-[#716A79] dark:text-[#B69AD8] mr-1">
                  Compare Batches:
                </span>
                {batches.map((b) => {
                  const checked = comparedBatchIds.includes(b.id);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => toggleComparedBatch(b.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        checked
                          ? 'bg-[#663078] text-[#FFFFFF] border-[#663078]'
                          : 'bg-[#FFFFFF] dark:bg-[#190D21] text-[#716A79] border-[#E8DFED] dark:border-[#352044]'
                      }`}
                    >
                      {b.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E8DFED] dark:border-[#2E1A3B] bg-[#F7F3F9]/70 dark:bg-[#140A1B] font-mono uppercase text-[11px] text-[#716A79] dark:text-[#B69AD8]">
                    <th className="py-3.5 px-5">Metric / Dimension</th>
                    {analytics.batchComparisons
                      .filter((row) => comparedBatchIds.includes(row.batch.id))
                      .map((row) => (
                        <th key={row.batch.id} className="py-3.5 px-5 text-right">
                          <div className="text-sm font-serif font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                            {row.batch.name}
                          </div>
                          <div className="text-[10px] font-mono text-[#716A79] dark:text-[#B69AD8] tabular-nums">
                            n = {row.totalRecords} ({row.batch.status === 'active' ? 'Active' : 'Coming Soon'})
                          </div>
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DFED] dark:divide-[#2E1A3B] font-mono tabular-nums">
                  <tr>
                    <td className="py-3.5 px-5 font-sans font-medium text-[#25212B] dark:text-[#E8DFED]">
                      Total Alumni Records (Denominator n)
                    </td>
                    {analytics.batchComparisons
                      .filter((r) => comparedBatchIds.includes(r.batch.id))
                      .map((r) => (
                        <td
                          key={r.batch.id}
                          className="py-3.5 px-5 text-right font-semibold text-sm text-[#32143F] dark:text-[#F7F3F9]"
                        >
                          {r.totalRecords}
                        </td>
                      ))}
                  </tr>

                  <tr>
                    <td className="py-3.5 px-5 font-sans font-medium text-[#25212B] dark:text-[#E8DFED]">
                      Known Current-Location Coverage
                    </td>
                    {analytics.batchComparisons
                      .filter((r) => comparedBatchIds.includes(r.batch.id))
                      .map((r) => (
                        <td key={r.batch.id} className="py-3.5 px-5 text-right">
                          {r.totalRecords > 0
                            ? `${r.knownLocationCount}/${r.totalRecords} (${r.knownLocationPct}%)`
                            : '— (0 records)'}
                        </td>
                      ))}
                  </tr>

                  <tr>
                    <td className="py-3.5 px-5 font-sans font-medium text-[#25212B] dark:text-[#E8DFED]">
                      Domestic (BD) vs. International Split
                    </td>
                    {analytics.batchComparisons
                      .filter((r) => comparedBatchIds.includes(r.batch.id))
                      .map((r) => (
                        <td key={r.batch.id} className="py-3.5 px-5 text-right">
                          {r.knownLocationCount > 0
                            ? `${r.domesticCount} BD · ${r.internationalCount} Intl`
                            : '—'}
                        </td>
                      ))}
                  </tr>

                  <tr>
                    <td className="py-3.5 px-5 font-sans font-medium text-[#25212B] dark:text-[#E8DFED]">
                      Recorded Current Employment
                    </td>
                    {analytics.batchComparisons
                      .filter((r) => comparedBatchIds.includes(r.batch.id))
                      .map((r) => (
                        <td key={r.batch.id} className="py-3.5 px-5 text-right">
                          {r.totalRecords > 0
                            ? `${r.currentlyEmployedCount}/${r.totalRecords} (${r.currentlyEmployedPct}%)`
                            : '—'}
                        </td>
                      ))}
                  </tr>

                  <tr>
                    <td className="py-3.5 px-5 font-sans font-medium text-[#25212B] dark:text-[#E8DFED]">
                      Higher Studies (Currently Enrolled / Completed Postgrad)
                    </td>
                    {analytics.batchComparisons
                      .filter((r) => comparedBatchIds.includes(r.batch.id))
                      .map((r) => (
                        <td key={r.batch.id} className="py-3.5 px-5 text-right">
                          {r.totalRecords > 0
                            ? `${r.currentlyHigherStudiesCount} Enrolled · ${r.completedPostgradCount} Completed`
                            : '—'}
                        </td>
                      ))}
                  </tr>

                  <tr>
                    <td className="py-3.5 px-5 font-sans font-medium text-[#25212B] dark:text-[#E8DFED]">
                      Entrepreneurs / Venture Founders
                    </td>
                    {analytics.batchComparisons
                      .filter((r) => comparedBatchIds.includes(r.batch.id))
                      .map((r) => (
                        <td key={r.batch.id} className="py-3.5 px-5 text-right">
                          {r.totalRecords > 0 ? r.entrepreneursCount : '—'}
                        </td>
                      ))}
                  </tr>

                  <tr>
                    <td className="py-3.5 px-5 font-sans font-medium text-[#25212B] dark:text-[#E8DFED]">
                      Distinct Industries / Companies / Countries
                    </td>
                    {analytics.batchComparisons
                      .filter((r) => comparedBatchIds.includes(r.batch.id))
                      .map((r) => (
                        <td key={r.batch.id} className="py-3.5 px-5 text-right">
                          {r.totalRecords > 0
                            ? `${r.uniqueIndustriesCount} Ind · ${r.uniqueCompaniesCount} Org · ${r.uniqueCountriesCount} Ctry`
                            : '—'}
                        </td>
                      ))}
                  </tr>

                  <tr>
                    <td className="py-3.5 px-5 font-sans font-medium text-[#25212B] dark:text-[#E8DFED]">
                      Average Profile Field Completeness
                    </td>
                    {analytics.batchComparisons
                      .filter((r) => comparedBatchIds.includes(r.batch.id))
                      .map((r) => (
                        <td
                          key={r.batch.id}
                          className="py-3.5 px-5 text-right text-[#663078] dark:text-[#C8B2E6] font-semibold"
                        >
                          {r.totalRecords > 0 ? `${r.avgCompletenessPct}%` : '—'}
                        </td>
                      ))}
                  </tr>

                  <tr>
                    <td className="py-3.5 px-5 font-sans font-medium text-[#25212B] dark:text-[#E8DFED]">
                      Verification Coverage (Verified + Partially Verified)
                    </td>
                    {analytics.batchComparisons
                      .filter((r) => comparedBatchIds.includes(r.batch.id))
                      .map((r) => (
                        <td key={r.batch.id} className="py-3.5 px-5 text-right">
                          {r.totalRecords > 0
                            ? `${r.verifiedOrPartialCount}/${r.totalRecords} (${r.verifiedOrPartialPct}%)`
                            : '—'}
                        </td>
                      ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* SECTION 11, 12, 13: EDUCATION, ENTREPRENEURSHIP, ACHIEVEMENTS & DATA QUALITY */}
        {showSection('achievements-quality') && analytics.totalAlumni > 0 && (
          <section className="space-y-8">
            <div className="pb-3 border-b border-[#E8DFED] dark:border-[#2E1A3B]">
              <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
                Section 05 · Qualifications, Achievements &amp; Archival Coverage
              </div>
              <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                Professional Development, Achievements &amp; Data Quality
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Qualifications, Certifications & Skills */}
              <div className="lg:col-span-6 p-6 rounded-2xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] space-y-5">
                <h3 className="font-serif text-lg font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                  A. Highest Qualification &amp; Professional Certifications
                </h3>

                <div className="space-y-2.5">
                  {analytics.educationAndSkills.highestQualificationDistribution.map((q) => (
                    <div
                      key={q.label}
                      className="p-3 rounded-xl bg-[#F7F3F9]/60 dark:bg-[#140A1B] border border-[#E8DFED] dark:border-[#2E1A3B] flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-[#25212B] dark:text-[#E8DFED]">
                        {q.label}
                      </span>
                      <span className="font-mono font-semibold text-[#663078] dark:text-[#C8B2E6] tabular-nums">
                        {q.count} ({Math.round((q.count / analytics.totalAlumni) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>

                {analytics.educationAndSkills.certificationsList.length > 0 && (
                  <div className="pt-3 border-t border-[#E8DFED] dark:border-[#2E1A3B] space-y-2">
                    <div className="text-xs font-mono uppercase text-[#716A79] dark:text-[#B69AD8]">
                      Recorded Professional Certifications
                    </div>
                    <p className="text-xs text-[#25212B] dark:text-[#E8DFED] leading-relaxed">
                      {analytics.educationAndSkills.certificationsList
                        .map((c) => `${c.certification} (${c.count})`)
                        .join(' · ')}
                    </p>
                  </div>
                )}

                {analytics.educationAndSkills.topSkills.length > 0 && (
                  <div className="pt-3 border-t border-[#E8DFED] dark:border-[#2E1A3B] space-y-2">
                    <div className="text-xs font-mono uppercase text-[#716A79] dark:text-[#B69AD8]">
                      Represented Domain Skills Across Selected Scope
                    </div>
                    <p className="text-xs text-[#716A79] dark:text-[#B69AD8] leading-relaxed">
                      {analytics.educationAndSkills.topSkills
                        .slice(0, 14)
                        .map((s) => s.skill)
                        .join(' · ')}
                    </p>
                  </div>
                )}
              </div>

              {/* Entrepreneurship & Recorded Achievements */}
              <div className="lg:col-span-6 p-6 rounded-2xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                    B. Recorded Milestones, Ventures &amp; Publications
                  </h3>
                  <Award className="w-4 h-4 text-[#663078] dark:text-[#B69AD8]" />
                </div>

                <div className="space-y-3">
                  {analytics.entrepreneurshipAndAchievements.achievements.map((ach) => (
                    <div
                      key={ach.id}
                      onClick={() => navigate(`/alumni/${ach.studentId}`)}
                      className="p-3.5 rounded-xl border border-[#E8DFED] dark:border-[#2E1A3B] hover:border-[#663078] cursor-pointer transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#663078] dark:text-[#C8B2E6] tabular-nums">
                        <span>
                          {ach.category} · {ach.issuerOrContext}
                        </span>
                        <span>{ach.year}</span>
                      </div>
                      <div className="text-xs font-semibold text-[#25212B] dark:text-[#F7F3F9]">
                        {ach.title}
                      </div>
                      <div className="text-[11px] text-[#716A79] dark:text-[#9A8FA6]">
                        Associated Alumnus: {ach.alumniName} ({ach.batchName})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 13: Alumni Data Quality and Coverage */}
            <div className="p-7 rounded-2xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8DFED] dark:border-[#2E1A3B] pb-4">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                    C. Alumni Data Quality, Field Completeness &amp; Verification Audit
                  </h3>
                  <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/80 mt-0.5">
                    Data completeness measures whether a field is populated. Verification measures whether
                    the record has been independently reviewed by the department.
                  </p>
                </div>
                <span className="font-mono text-xs text-[#663078] dark:text-[#B69AD8] tabular-nums">
                  Denominator: n = {analytics.totalAlumni}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Field Completeness Bars */}
                <div className="lg:col-span-7 space-y-4">
                  {analytics.dataQuality.dataQualityMetrics.map((m) => (
                    <div key={m.field} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#25212B] dark:text-[#E8DFED]">
                          {m.field}
                        </span>
                        <span className="font-mono text-[#716A79] dark:text-[#B69AD8] tabular-nums">
                          {m.populatedCount}/{m.denominator} ({m.pct}%) · {m.missingCount} missing
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#F7F3F9] dark:bg-[#120917] overflow-hidden">
                        <div
                          style={{ width: `${Math.max(m.pct, 2)}%` }}
                          className="h-full rounded-full bg-[#663078] dark:bg-[#B69AD8]"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Verification Status Audit */}
                <div className="lg:col-span-5 p-5 rounded-xl bg-[#F7F3F9] dark:bg-[#140A1B] border border-[#E8DFED] dark:border-[#2E1A3B] space-y-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#32143F] dark:text-[#E8DFED]">
                    Verification Status Breakdown (Separate from Completeness)
                  </div>
                  <div className="divide-y divide-[#E8DFED] dark:divide-[#2E1A3B] text-xs">
                    {analytics.dataQuality.verificationBreakdown.map((v) => (
                      <div key={v.status} className="py-2.5 flex items-center justify-between gap-2">
                        <span>{v.label}</span>
                        <span className="font-mono font-semibold text-[#32143F] dark:text-[#F7F3F9] tabular-nums">
                          {v.count} ({v.pct}%)
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#716A79] dark:text-[#9A8FA6] leading-relaxed">
                    Note: A profile with 100% field completeness is not automatically classified as Verified
                    until source documentation is audited in the Admin Workspace.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 12: INTERACTIVE ALUMNI DIRECTORY SHORTCUTS (Matching Filtered Alumni) */}
        {analytics.totalAlumni > 0 && (
          <section className="pt-6 border-t border-[#E8DFED] dark:border-[#2E1A3B] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
                  Direct Dossier Shortcuts
                </div>
                <h2 className="mt-1 font-serif text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                  Alumni Matching Active Overview Filters ({filteredProfiles.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/alumni')}
                className="text-xs font-semibold text-[#663078] dark:text-[#B69AD8] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Open Full Search &amp; Directory</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredProfiles.slice(0, 8).map((p) => (
                <div
                  key={p.alumni.id}
                  onClick={() => navigate(`/alumni/${p.alumni.studentId}`)}
                  className="group cursor-pointer p-4 rounded-xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] hover:border-[#663078] dark:hover:border-[#B69AD8] transition-colors flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <AlumniPortrait
                      profileImage={p.alumni.profileImage}
                      initials={p.alumni.portraitInitials}
                      fullName={p.alumni.fullName}
                      tone={p.alumni.portraitTone}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <div className="text-[11px] font-mono text-[#716A79] dark:text-[#B69AD8] tabular-nums">
                        {p.batch.name} · ID {p.alumni.studentId}
                      </div>
                      <h3 className="text-sm font-semibold text-[#25212B] dark:text-[#F7F3F9] group-hover:text-[#663078] dark:group-hover:text-[#B69AD8] truncate">
                        {p.alumni.fullName}
                      </h3>
                      <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/80 truncate mt-0.5">
                        {p.currentPosition
                          ? `${p.currentPosition.designation} · ${p.currentPosition.organization}`
                          : 'Employment record pending'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E8DFED]/60 dark:border-[#2E1A3B] flex items-center justify-between text-[11px]">
                    <VerificationLabel status={p.alumni.verificationStatus} />
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#663078] dark:text-[#B69AD8]" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
