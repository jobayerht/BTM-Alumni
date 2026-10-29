import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useRouter, updateDocumentMeta } from '../utils/router';

export const InsightsPage: React.FC = () => {
  const { batches, getAllPublicProfiles } = useData();
  const { navigate } = useRouter();
  const [selectedBatchId, setSelectedBatchId] = useState<string>('all');

  useEffect(() => {
    updateDocumentMeta(
      'Career Insights & Cohort Analytics',
      'Explore aggregated industry distributions, organization representation, career tracks, geographic footprint, and data completeness for BTM alumni.'
    );
  }, []);

  const allProfiles = getAllPublicProfiles();

  const filteredProfiles = useMemo(() => {
    if (selectedBatchId === 'all') return allProfiles;
    return allProfiles.filter((p) => p.batch.id === selectedBatchId);
  }, [allProfiles, selectedBatchId]);

  const totalCount = filteredProfiles.length;
  const sampleCount = filteredProfiles.filter((p) => p.alumni.isSampleRecord).length;
  const verifiedCount = filteredProfiles.filter((p) => p.alumni.verificationStatus === 'verified').length;

  const industryStats = useMemo(() => {
    const counts = new Map<string, number>();
    let missing = 0;
    filteredProfiles.forEach((p) => {
      const ind = p.alumni.primaryIndustry?.trim();
      if (!ind) {
        missing += 1;
      } else {
        counts.set(ind, (counts.get(ind) || 0) + 1);
      }
    });
    const list = Array.from(counts.entries())
      .map(([label, count]) => ({
        label,
        count,
        pct: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
        isMissing: false,
      }))
      .sort((a, b) => b.count - a.count);

    if (missing > 0) {
      list.push({
        label: 'Industry Not Yet Specified (Missing Field)',
        count: missing,
        pct: totalCount > 0 ? Math.round((missing / totalCount) * 100) : 0,
        isMissing: true,
      });
    }
    return list;
  }, [filteredProfiles, totalCount]);

  const careerLevelStats = useMemo(() => {
    const counts = new Map<string, number>();
    let missing = 0;
    filteredProfiles.forEach((p) => {
      const lvl = p.currentPosition?.careerLevel;
      if (!lvl) {
        missing += 1;
      } else {
        counts.set(lvl, (counts.get(lvl) || 0) + 1);
      }
    });
    const list = Array.from(counts.entries())
      .map(([label, count]) => ({
        label,
        count,
        pct: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
        isMissing: false,
      }))
      .sort((a, b) => b.count - a.count);

    if (missing > 0) {
      list.push({
        label: 'No Active Employment / Level Unspecified',
        count: missing,
        pct: totalCount > 0 ? Math.round((missing / totalCount) * 100) : 0,
        isMissing: true,
      });
    }
    return list;
  }, [filteredProfiles, totalCount]);

  const geoStats = useMemo(() => {
    const counts = new Map<string, { count: number; cities: Set<string> }>();
    let missing = 0;
    filteredProfiles.forEach((p) => {
      if (!p.location || p.location.visibility === 'hidden' || !p.location.country) {
        missing += 1;
      } else {
        const c = p.location.country;
        const curr = counts.get(c) || { count: 0, cities: new Set<string>() };
        curr.count += 1;
        if (p.location.visibility === 'city_and_country' && p.location.city) {
          curr.cities.add(p.location.city);
        }
        counts.set(c, curr);
      }
    });
    const list = Array.from(counts.entries())
      .map(([country, data]) => ({
        country,
        cities: Array.from(data.cities),
        count: data.count,
        pct: totalCount > 0 ? Math.round((data.count / totalCount) * 100) : 0,
        isMissing: false,
      }))
      .sort((a, b) => b.count - a.count);

    if (missing > 0) {
      list.push({
        country: 'Location Not Disclosed / Missing',
        cities: [],
        count: missing,
        pct: totalCount > 0 ? Math.round((missing / totalCount) * 100) : 0,
        isMissing: true,
      });
    }
    return list;
  }, [filteredProfiles, totalCount]);

  const orgStats = useMemo(() => {
    const counts = new Map<string, { count: number; industry?: string }>();
    filteredProfiles.forEach((p) => {
      const org = p.currentPosition?.organization?.trim();
      if (org) {
        const curr = counts.get(org) || { count: 0, industry: p.currentPosition?.industry };
        curr.count += 1;
        counts.set(org, curr);
      }
    });
    return Array.from(counts.entries())
      .map(([organization, info]) => ({
        organization,
        count: info.count,
        industry: info.industry,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredProfiles]);

  const entrepreneurStats = useMemo(() => {
    const founders = filteredProfiles.filter((p) => p.alumni.isEntrepreneur);
    const employed = filteredProfiles.filter((p) => !p.alumni.isEntrepreneur && Boolean(p.currentPosition));
    const unspecified = filteredProfiles.filter((p) => !p.alumni.isEntrepreneur && !p.currentPosition);
    return {
      foundersCount: founders.length,
      employedCount: employed.length,
      unspecifiedCount: unspecified.length,
      founders,
    };
  }, [filteredProfiles]);

  const completenessMetrics = useMemo(() => {
    if (totalCount === 0) return [];
    const withCurrentRole = filteredProfiles.filter((p) => Boolean(p.currentPosition)).length;
    const withEducation = filteredProfiles.filter((p) => p.educations.length > 0).length;
    const withLocation = filteredProfiles.filter(
      (p) => p.location && p.location.visibility !== 'hidden'
    ).length;
    const withPublicLinks = filteredProfiles.filter((p) => p.alumni.publicLinks.length > 0).length;
    const withSummary = filteredProfiles.filter((p) => Boolean(p.alumni.professionalSummary)).length;

    return [
      {
        label: 'Current Position Recorded',
        count: withCurrentRole,
        total: totalCount,
        pct: Math.round((withCurrentRole / totalCount) * 100),
      },
      {
        label: 'Academic Education Verified',
        count: withEducation,
        total: totalCount,
        pct: Math.round((withEducation / totalCount) * 100),
      },
      {
        label: 'Geographic Location Available',
        count: withLocation,
        total: totalCount,
        pct: Math.round((withLocation / totalCount) * 100),
      },
      {
        label: 'Public Professional Links Provided',
        count: withPublicLinks,
        total: totalCount,
        pct: Math.round((withPublicLinks / totalCount) * 100),
      },
      {
        label: 'Professional Summary Completed',
        count: withSummary,
        total: totalCount,
        pct: Math.round((withSummary / totalCount) * 100),
      },
    ];
  }, [filteredProfiles, totalCount]);

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
        <span className="text-[#25212B] dark:text-[#F7F3F9] font-medium">Career Insights</span>
      </nav>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E8DFED] dark:border-[#2E1A3B]">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
            Quantitative Directory Telemetry
          </div>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-[#32143F] dark:text-[#F7F3F9]">
            Career Insights &amp; Cohort Analytics
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-[#716A79] dark:text-[#B69AD8]/90 max-w-2xl leading-relaxed">
            All charts and distributions below are computed directly from the active records stored in the
            application. Missing fields are explicitly surfaced rather than assigned to arbitrary categories.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2 shrink-0">
          <span className="text-xs font-mono text-[#716A79] dark:text-[#B69AD8]">Filter Analytics by Cohort</span>
          <div
            role="group"
            aria-label="Filter analytics by batch"
            className="flex flex-wrap items-center gap-1 p-1 btm-glass-subtle rounded-lg"
          >
            <button
              type="button"
              onClick={() => setSelectedBatchId('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedBatchId === 'all'
                  ? 'bg-[#663078] text-[#FFFFFF]'
                  : 'text-[#716A79] dark:text-[#B69AD8] hover:text-[#25212B] dark:hover:text-[#FFFFFF]'
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
                    : 'text-[#716A79] dark:text-[#B69AD8] hover:text-[#25212B] dark:hover:text-[#FFFFFF]'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="my-8 p-5 rounded-xl btm-glass-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="space-y-1 text-[#716A79] dark:text-[#B69AD8]">
          <strong className="text-[#32143F] dark:text-[#F7F3F9]">
            Dataset Provenance &amp; Illustrative Labeling:
          </strong>{' '}
          Currently analyzing <span className="font-mono font-semibold tabular-nums">{totalCount}</span>{' '}
          {totalCount === 1 ? 'record' : 'records'} ({sampleCount} labeled as Prototype Sample Records,{' '}
          {verifiedCount} marked Verified). No external or fabricated real-world statistics are injected.
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="p-14 rounded-2xl btm-glass text-center space-y-4 my-8">
          <h2 className="font-serif text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
            Insufficient Cohort Data for Visualization
          </h2>
          <p className="text-sm text-[#716A79] dark:text-[#B69AD8]/85 max-w-lg mx-auto leading-relaxed">
            The selected cohort currently has 0 published alumni records. In adherence to departmental
            analytics rules, charts are not rendered with placeholder numbers when underlying records are
            unavailable.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSelectedBatchId('all')}
              className="px-4 py-2 text-xs font-semibold text-[#FFFFFF] bg-[#663078] rounded-lg cursor-pointer"
            >
              View All Available Batches
            </button>
            <button
              type="button"
              onClick={() => navigate('/batch/17')}
              className="px-4 py-2 text-xs font-semibold text-[#32143F] dark:text-[#F7F3F9] btm-glass-subtle rounded-lg cursor-pointer"
            >
              Open BTM 17 Directory
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="p-7 rounded-2xl btm-glass space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-[#E8DFED]/80 dark:border-[#2E1A3B] pb-4">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                    01. Industry Distribution
                  </h2>
                  <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/80 mt-0.5">
                    Primary sector classification across {totalCount} available alumni records
                  </p>
                </div>
                <span className="font-mono text-xs text-[#663078] dark:text-[#B69AD8] tabular-nums">
                  n = {totalCount}
                </span>
              </div>

              <div className="space-y-4">
                {industryStats.map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span
                        className={
                          item.isMissing
                            ? 'italic text-[#716A79] dark:text-[#9A8FA6]'
                            : 'font-medium text-[#25212B] dark:text-[#E8DFED]'
                        }
                      >
                        {item.label}
                      </span>
                      <span className="font-mono text-[#716A79] dark:text-[#B69AD8] tabular-nums shrink-0">
                        {item.count} ({item.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#F7F3F9]/80 dark:bg-[#120917]/80 overflow-hidden">
                      <div
                        style={{ width: `${Math.max(item.pct, 4)}%` }}
                        className={`h-full rounded-full ${
                          item.isMissing
                            ? 'bg-[#716A79]/40 dark:bg-[#716A79]/50'
                            : 'bg-[#663078] dark:bg-[#B69AD8]'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="p-7 rounded-2xl btm-glass space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-[#E8DFED]/80 dark:border-[#2E1A3B] pb-4">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                    02. Career-Level &amp; Track Distribution
                  </h2>
                  <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/80 mt-0.5">
                    Derived from explicitly designated current positions
                  </p>
                </div>
                <span className="font-mono text-xs text-[#663078] dark:text-[#B69AD8] tabular-nums">
                  n = {totalCount}
                </span>
              </div>

              <div className="space-y-4">
                {careerLevelStats.map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span
                        className={
                          item.isMissing
                            ? 'italic text-[#716A79] dark:text-[#9A8FA6]'
                            : 'font-medium text-[#25212B] dark:text-[#E8DFED]'
                        }
                      >
                        {item.label}
                      </span>
                      <span className="font-mono text-[#716A79] dark:text-[#B69AD8] tabular-nums shrink-0">
                        {item.count} ({item.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#F7F3F9]/80 dark:bg-[#120917]/80 overflow-hidden">
                      <div
                        style={{ width: `${Math.max(item.pct, 4)}%` }}
                        className={`h-full rounded-full ${
                          item.isMissing
                            ? 'bg-[#716A79]/40 dark:bg-[#716A79]/50'
                            : 'bg-[#32143F] dark:bg-[#9D75C9]'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <section className="lg:col-span-7 p-7 rounded-2xl btm-glass space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-[#E8DFED]/80 dark:border-[#2E1A3B] pb-4">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                    03. Geographic Distribution
                  </h2>
                  <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/80 mt-0.5">
                    Country and city representation from public location records
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/map')}
                  className="text-xs font-semibold text-[#663078] dark:text-[#B69AD8] hover:underline cursor-pointer"
                >
                  Open Interactive Map &rarr;
                </button>
              </div>

              <div className="divide-y divide-[#E8DFED]/70 dark:divide-[#2E1A3B]">
                {geoStats.map((g) => (
                  <div key={g.country} className="py-3 flex items-center justify-between gap-4 text-sm">
                    <div>
                      <span
                        className={
                          g.isMissing
                            ? 'italic text-[#716A79] dark:text-[#9A8FA6]'
                            : 'font-medium text-[#25212B] dark:text-[#F7F3F9]'
                        }
                      >
                        {g.country}
                      </span>
                      {g.cities.length > 0 && (
                        <span className="text-xs text-[#716A79] dark:text-[#B69AD8]/75 ml-2">
                          ({g.cities.join(', ')})
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs text-[#663078] dark:text-[#B69AD8] tabular-nums shrink-0">
                      {g.count} {g.count === 1 ? 'record' : 'records'} · {g.pct}%
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="lg:col-span-5 p-7 rounded-2xl btm-glass flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="border-b border-[#E8DFED]/80 dark:border-[#2E1A3B] pb-4">
                  <h2 className="font-serif text-xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                    04. Entrepreneurship &amp; Pathways
                  </h2>
                  <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/80 mt-0.5">
                    Founders vs. organizational roles vs. pending employment records
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-4 rounded-xl btm-glass-subtle">
                    <div className="font-mono text-2xl font-semibold text-[#663078] dark:text-[#C8B2E6] tabular-nums">
                      {entrepreneurStats.foundersCount}
                    </div>
                    <div className="text-[11px] text-[#716A79] dark:text-[#B69AD8] mt-1">
                      Founders / Co-Founders
                    </div>
                  </div>

                  <div className="p-4 rounded-xl btm-glass-subtle">
                    <div className="font-mono text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9] tabular-nums">
                      {entrepreneurStats.employedCount}
                    </div>
                    <div className="text-[11px] text-[#716A79] dark:text-[#B69AD8] mt-1">
                      Industry &amp; Academic Roles
                    </div>
                  </div>

                  <div className="p-4 rounded-xl btm-glass-subtle">
                    <div className="font-mono text-2xl font-semibold text-[#716A79] dark:text-[#9A8FA6] tabular-nums">
                      {entrepreneurStats.unspecifiedCount}
                    </div>
                    <div className="text-[11px] text-[#716A79] dark:text-[#9A8FA6] mt-1">
                      Employment Pending
                    </div>
                  </div>
                </div>

                {entrepreneurStats.founders.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <div className="text-xs font-mono uppercase tracking-wider text-[#716A79] dark:text-[#B69AD8]">
                      Recorded Venture Profiles
                    </div>
                    {entrepreneurStats.founders.map((f) => (
                      <div
                        key={f.alumni.id}
                        onClick={() => navigate(`/alumni/${f.alumni.studentId}`)}
                        className="p-3 rounded-lg btm-glass-card cursor-pointer"
                      >
                        <div className="text-sm font-semibold text-[#25212B] dark:text-[#F7F3F9]">
                          {f.alumni.fullName}
                        </div>
                        <div className="text-xs text-[#716A79] dark:text-[#B69AD8]">
                          {f.currentPosition
                            ? `${f.currentPosition.designation} · ${f.currentPosition.organization}`
                            : f.alumni.professionalHeadline}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <section className="lg:col-span-6 p-7 rounded-2xl btm-glass space-y-5">
              <div className="border-b border-[#E8DFED]/80 dark:border-[#2E1A3B] pb-4">
                <h2 className="font-serif text-xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                  05. Organization &amp; Employer Representation
                </h2>
                <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/80 mt-0.5">
                  Organizations linked to current positions in the active dataset
                </p>
              </div>

              {orgStats.length === 0 ? (
                <p className="text-sm text-[#716A79]">No current organizations recorded.</p>
              ) : (
                <div className="divide-y divide-[#E8DFED]/70 dark:divide-[#2E1A3B]">
                  {orgStats.map((item) => (
                    <div
                      key={item.organization}
                      className="py-2.5 flex items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-sm text-[#25212B] dark:text-[#F7F3F9]">
                          {item.organization}
                        </div>
                        {item.industry && (
                          <div className="text-[#716A79] dark:text-[#B69AD8]/75">{item.industry}</div>
                        )}
                      </div>
                      <span className="font-mono text-[#663078] dark:text-[#B69AD8] tabular-nums shrink-0">
                        {item.count} {item.count === 1 ? 'alumnus' : 'alumni'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="lg:col-span-6 p-7 rounded-2xl btm-glass space-y-5">
              <div className="border-b border-[#E8DFED] dark:border-[#2E1A3B] pb-4">
                <h2 className="font-serif text-xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                  06. Archival Data Completeness
                </h2>
                <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/80 mt-0.5">
                  Field population health across {totalCount} directory profiles
                </p>
              </div>

              <div className="space-y-4">
                {completenessMetrics.map((m) => (
                  <div key={m.label} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span className="font-medium text-[#25212B] dark:text-[#E8DFED]">{m.label}</span>
                      <span className="font-mono text-[#716A79] dark:text-[#B69AD8] tabular-nums">
                        {m.count}/{m.total} ({m.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#F7F3F9] dark:bg-[#120917] overflow-hidden">
                      <div
                        style={{ width: `${m.pct}%` }}
                        className="h-full rounded-full bg-[#663078] dark:bg-[#B69AD8]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};
