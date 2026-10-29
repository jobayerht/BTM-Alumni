import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Globe,
  BarChart3,
  LayoutDashboard,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useRouter, updateDocumentMeta } from '../utils/router';
import { EditorialPlate } from '../components/EditorialMedia';

export const HomePage: React.FC = () => {
  const { batches, getAllPublicProfiles, getBatchProfiles } = useData();
  const { navigate } = useRouter();

  const [heroSearch, setHeroSearch] = useState('');

  useEffect(() => {
    updateDocumentMeta(
      'Home',
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

  return (
    <div>
      {/* 1. Asymmetric 60/40 Editorial Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#230E2D] via-[#32143F] to-[#4A1F5C] text-[#F7F3F9] border-b border-[#4A235A]">
        {/* Ambient Hero Glows for Frosted Glass Depth */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 left-[12%] w-80 h-80 rounded-full bg-[#B69AD8]/20 blur-[90px]" />
          <div className="absolute bottom-[-10%] right-[10%] w-96 h-96 rounded-full bg-[#9D59B8]/25 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-[1280px] mx-auto px-6 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left 60% Editorial & Search Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#D8C2F0]">
                <span>Department of Business &amp; Technology Management · IUT</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold tracking-tight leading-[1.08] text-balance">
                Connecting the Generations of BTM at IUT
              </h1>

              <p className="text-base sm:text-lg text-[#E8DFED]/90 max-w-2xl leading-relaxed">
                Discover the people, careers, higher studies, and achievements shaping the Business
                and Technology Management alumni community at Islamic University of Technology (IUT),
                Gazipur, Bangladesh.
              </p>

              {/* Hero Search Form (Glass) */}
              <form
                onSubmit={handleHeroSearchSubmit}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 btm-glass-dark p-2 rounded-xl max-w-xl"
              >
                <div className="flex items-center gap-2.5 flex-1 px-3 py-2">
                  <Search className="w-4 h-4 text-[#B69AD8] shrink-0" />
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search by name, student ID (e.g. 170061...), or organization..."
                    aria-label="Search alumni directory"
                    className="w-full bg-transparent text-sm text-[#FFFFFF] placeholder-[#B69AD8]/70 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] bg-[#663078]/90 hover:bg-[#7D3C94] border border-[#FFFFFF]/20 backdrop-blur-md rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Search Directory
                </button>
              </form>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/batch/17')}
                  className="px-5 py-2.5 text-xs font-semibold text-[#32143F] bg-[#F7F3F9]/95 hover:bg-[#FFFFFF] backdrop-blur-md rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
                >
                  <span>Explore BTM 17 Directory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/batches')}
                  className="px-4 py-2.5 text-xs font-semibold text-[#F7F3F9] bg-[#FFFFFF]/12 hover:bg-[#FFFFFF]/20 backdrop-blur-md border border-[#FFFFFF]/25 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Browse All Batches
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/overview')}
                  className="px-4 py-2.5 text-xs font-semibold text-[#F7F3F9] bg-[#FFFFFF]/12 hover:bg-[#FFFFFF]/20 backdrop-blur-md border border-[#FFFFFF]/25 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Overview Dashboard</span>
                </button>
              </div>
            </div>

            {/* Right 40% Architectural Feature Plate (Glass) */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden btm-glass-dark">
                <div className="h-64 sm:h-72 border-b border-[#B69AD8]/25">
                  <EditorialPlate
                    variant="campus-arch"
                    alt="Islamic University of Technology BTM Architectural Plate"
                    caption="ISLAMIC UNIVERSITY OF TECHNOLOGY · GAZIPUR"
                    className="w-full h-full"
                  />
                </div>
                <div className="p-6 grid grid-cols-3 gap-4 divide-x divide-[#B69AD8]/25 text-center bg-[#FFFFFF]/5 backdrop-blur-md">
                  <div>
                    <div className="font-serif text-2xl sm:text-3xl font-semibold text-[#FFFFFF] tabular-nums">
                      {totalProfiles}
                    </div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#D8C2F0] mt-1">
                      Alumni Records
                    </div>
                  </div>
                  <div className="pl-4">
                    <div className="font-serif text-2xl sm:text-3xl font-semibold text-[#FFFFFF] tabular-nums">
                      {batches.length}
                    </div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#D8C2F0] mt-1">
                      BTM Batches
                    </div>
                  </div>
                  <div className="pl-4">
                    <div className="font-serif text-2xl sm:text-3xl font-semibold text-[#FFFFFF] tabular-nums">
                      {uniqueCompanies}
                    </div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#D8C2F0] mt-1">
                      Organizations
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Batch Directories Section */}
      <section className="max-w-[1280px] mx-auto px-6 py-16 lg:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-[#E8DFED] dark:border-[#2E1A3B]">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
              Cohort Directories
            </div>
            <h2 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#32143F] dark:text-[#F7F3F9]">
              Browse by Batch (BTM 17 — BTM 20)
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/batches')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#663078] dark:text-[#B69AD8] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>View All Batch Archives</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {batches.map((batch) => {
            const count = getBatchProfiles(batch.id).length;
            return (
              <article
                key={batch.id}
                onClick={() => navigate(`/batch/${batch.code}`)}
                className="group cursor-pointer rounded-2xl btm-glass-card overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="h-36 overflow-hidden border-b border-[#E8DFED]/80 dark:border-[#321E3E]">
                    <EditorialPlate
                      variant={batch.coverPlateVariant}
                      imageUrl={batch.coverImage}
                      alt={`${batch.name} cover`}
                      caption={`BATCH ${batch.code}`}
                      className="w-full h-full group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between text-xs font-mono text-[#716A79] dark:text-[#B69AD8]/80 tabular-nums">
                      <span>
                        {batch.intakeYear}–{batch.graduationYear}
                      </span>
                      <span className="text-[#663078] dark:text-[#C8B2E6] font-semibold">
                        {count} Profiles
                      </span>
                    </div>
                    <h3 className="mt-2 font-serif text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9] group-hover:text-[#663078] dark:group-hover:text-[#B69AD8] transition-colors">
                      {batch.name}
                    </h3>
                    <p className="mt-2 text-xs text-[#716A79] dark:text-[#B69AD8]/85 line-clamp-3 leading-relaxed">
                      {batch.description}
                    </p>
                  </div>
                </div>
                <div className="px-5 py-3.5 bg-[#F7F3F9]/55 dark:bg-[#140A1B]/55 backdrop-blur-xs border-t border-[#E8DFED]/80 dark:border-[#2E1A3B] flex items-center justify-between text-xs font-semibold text-[#663078] dark:text-[#B69AD8]">
                  <span>Open {batch.name}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 3. Platform Navigation Overview (Global Map, Overview, Insights, About) */}
      <section className="btm-glass-subtle border-y border-[#E8DFED] dark:border-[#2E1A3B]">
        <div className="max-w-[1280px] mx-auto px-6 py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-[#E8DFED]/80 dark:border-[#2E1A3B]">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
                Explore the Portal
              </div>
              <h2 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#32143F] dark:text-[#F7F3F9]">
                Platform Overview &amp; Quick Links
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/alumni')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#663078] dark:text-[#B69AD8] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Search Full Alumni Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Global Map Preview Card */}
            <article
              onClick={() => navigate('/map')}
              className="group cursor-pointer rounded-xl btm-glass-card p-6 flex flex-col justify-between gap-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-lg btm-glass-subtle flex items-center justify-center text-[#663078] dark:text-[#B69AD8]">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#663078] dark:text-[#C8B2E6] tabular-nums">
                    {countryFootprint.length} {countryFootprint.length === 1 ? 'Country' : 'Countries'}
                  </span>
                </div>

                <h3 className="font-serif text-xl font-semibold text-[#32143F] dark:text-[#F7F3F9] group-hover:text-[#663078] dark:group-hover:text-[#B69AD8] transition-colors">
                  Global Map
                </h3>

                <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/85 leading-relaxed">
                  Explore the geographic distribution of BTM alumni across countries worldwide on an interactive map.
                </p>
              </div>

              <div className="pt-3.5 border-t border-[#E8DFED]/80 dark:border-[#2E1A3B] flex items-center justify-between text-xs font-semibold text-[#663078] dark:text-[#B69AD8]">
                <span>Open Global Map</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </article>

            {/* Overview Dashboard Preview Card */}
            <article
              onClick={() => navigate('/overview')}
              className="group cursor-pointer rounded-xl btm-glass-card p-6 flex flex-col justify-between gap-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-lg btm-glass-subtle flex items-center justify-center text-[#663078] dark:text-[#B69AD8]">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#663078] dark:text-[#C8B2E6] tabular-nums">
                    {totalProfiles} Alumni
                  </span>
                </div>

                <h3 className="font-serif text-xl font-semibold text-[#32143F] dark:text-[#F7F3F9] group-hover:text-[#663078] dark:group-hover:text-[#B69AD8] transition-colors">
                  Overview
                </h3>

                <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/85 leading-relaxed">
                  View departmental metrics, batch breakdowns, higher education summaries, and community-wide statistics at a glance.
                </p>
              </div>

              <div className="pt-3.5 border-t border-[#E8DFED]/80 dark:border-[#2E1A3B] flex items-center justify-between text-xs font-semibold text-[#663078] dark:text-[#B69AD8]">
                <span>View Overview</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </article>

            {/* Career Insights Preview Card */}
            <article
              onClick={() => navigate('/insights')}
              className="group cursor-pointer rounded-xl btm-glass-card p-6 flex flex-col justify-between gap-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-lg btm-glass-subtle flex items-center justify-center text-[#663078] dark:text-[#B69AD8]">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#663078] dark:text-[#C8B2E6] tabular-nums">
                    {uniqueCompanies} Orgs
                  </span>
                </div>

                <h3 className="font-serif text-xl font-semibold text-[#32143F] dark:text-[#F7F3F9] group-hover:text-[#663078] dark:group-hover:text-[#B69AD8] transition-colors">
                  Insights
                </h3>

                <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/85 leading-relaxed">
                  Discover top employers, industry representation, designations, and post-graduation academic pathways across BTM graduates.
                </p>
              </div>

              <div className="pt-3.5 border-t border-[#E8DFED]/80 dark:border-[#2E1A3B] flex items-center justify-between text-xs font-semibold text-[#663078] dark:text-[#B69AD8]">
                <span>Explore Insights</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </article>

            {/* About & Archival Charter Preview Card */}
            <article
              onClick={() => navigate('/about')}
              className="group cursor-pointer rounded-xl btm-glass-card p-6 flex flex-col justify-between gap-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-lg btm-glass-subtle flex items-center justify-center text-[#663078] dark:text-[#B69AD8]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#663078] dark:text-[#C8B2E6]">
                    IUT · BTM
                  </span>
                </div>

                <h3 className="font-serif text-xl font-semibold text-[#32143F] dark:text-[#F7F3F9] group-hover:text-[#663078] dark:group-hover:text-[#B69AD8] transition-colors">
                  About
                </h3>

                <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/85 leading-relaxed">
                  Learn about the Department of Business and Technology Management at IUT, archival standards, and data privacy principles.
                </p>
              </div>

              <div className="pt-3.5 border-t border-[#E8DFED]/80 dark:border-[#2E1A3B] flex items-center justify-between text-xs font-semibold text-[#663078] dark:text-[#B69AD8]">
                <span>Read About BTM</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 4. Career Insights & Global Footprint */}
      <section className="max-w-[1280px] mx-auto px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Top Organizations */}
          <div className="lg:col-span-6 rounded-2xl btm-glass p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E8DFED]/80 dark:border-[#2E1A3B]">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
                    Career Representation
                  </div>
                  <h2 className="mt-1 font-serif text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                    Leading Organizations
                  </h2>
                </div>
                <BarChart3 className="w-5 h-5 text-[#663078] dark:text-[#B69AD8] shrink-0" />
              </div>

              <div className="mt-4 divide-y divide-[#E8DFED]/70 dark:divide-[#2E1A3B]">
                {topOrganizations.map((org) => (
                  <button
                    key={org.organization}
                    type="button"
                    onClick={() => navigate(`/alumni?org=${encodeURIComponent(org.organization)}`)}
                    className="w-full py-3.5 flex items-center justify-between gap-4 text-left hover:text-[#663078] dark:hover:text-[#B69AD8] transition-colors cursor-pointer"
                  >
                    <span className="text-sm font-medium text-[#25212B] dark:text-[#F7F3F9] truncate">
                      {org.organization}
                    </span>
                    <span className="text-xs font-mono text-[#663078] dark:text-[#B69AD8] tabular-nums shrink-0">
                      {org.count} {org.count === 1 ? 'Alumnus' : 'Alumni'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E8DFED]/80 dark:border-[#2E1A3B]">
              <button
                type="button"
                onClick={() => navigate('/insights')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#663078] dark:text-[#B69AD8] hover:underline cursor-pointer"
              >
                <span>Open Full Career Insights</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: Global Footprint */}
          <div className="lg:col-span-6 rounded-2xl btm-glass p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E8DFED]/80 dark:border-[#2E1A3B]">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
                    Geographic Reach
                  </div>
                  <h2 className="mt-1 font-serif text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                    Global Alumni Footprint
                  </h2>
                </div>
                <Globe className="w-5 h-5 text-[#663078] dark:text-[#B69AD8] shrink-0" />
              </div>

              <div className="mt-4 divide-y divide-[#E8DFED]/70 dark:divide-[#2E1A3B]">
                {countryFootprint.slice(0, 6).map((item) => (
                  <button
                    key={item.country}
                    type="button"
                    onClick={() => navigate(`/map?country=${encodeURIComponent(item.country)}`)}
                    className="w-full py-3.5 flex items-center justify-between gap-4 text-left hover:text-[#663078] dark:hover:text-[#B69AD8] transition-colors cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#25212B] dark:text-[#F7F3F9]">
                        {item.country}
                      </div>
                      {item.cities.length > 0 && (
                        <div className="text-xs text-[#716A79] dark:text-[#B69AD8]/75 truncate">
                          {item.cities.join(' · ')}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-mono text-[#663078] dark:text-[#B69AD8] tabular-nums shrink-0">
                      {item.count} {item.count === 1 ? 'Alumnus' : 'Alumni'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E8DFED]/80 dark:border-[#2E1A3B]">
              <button
                type="button"
                onClick={() => navigate('/map')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#663078] dark:text-[#B69AD8] hover:underline cursor-pointer"
              >
                <span>Explore Interactive Global Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
