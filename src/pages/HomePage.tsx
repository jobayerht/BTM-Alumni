import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, ArrowUpRight, Globe, BarChart3 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useRouter, updateDocumentMeta } from '../utils/router';
import { EditorialPlate, AlumniPortrait } from '../components/EditorialMedia';

export const HomePage: React.FC = () => {
  const { batches, getAllPublicProfiles, getBatchProfiles, stories } = useData();
  const { navigate } = useRouter();
  const [heroSearch, setHeroSearch] = useState('');

  useEffect(() => {
    updateDocumentMeta(
      'Home — One Department. Generations of Impact.',
      'Discover the people, careers, and achievements shaping the BTM alumni community at Islamic University of Technology (IUT), Bangladesh.'
    );
  }, []);

  const publicProfiles = getAllPublicProfiles();

  const totalProfiles = publicProfiles.length;
  const uniqueCompanies = new Set(
    publicProfiles
      .map((p) => p.currentPosition?.organization?.trim())
      .filter((org): org is string => Boolean(org))
  ).size;
  const uniqueIndustries = new Set(
    publicProfiles
      .map((p) => p.alumni.primaryIndustry?.trim())
      .filter((ind): ind is string => Boolean(ind))
  ).size;
  const uniqueCountries = new Set(
    publicProfiles
      .filter((p) => p.location && p.location.visibility !== 'hidden')
      .map((p) => p.location!.country.trim())
      .filter(Boolean)
  ).size;

  const featuredProfiles = publicProfiles.filter((p) => p.alumni.featured);
  const publishedStories = stories.filter((s) => s.status === 'published').slice(0, 3);

  const countryMap = new Map<string, { count: number; cities: Set<string> }>();
  publicProfiles.forEach((p) => {
    if (p.location && p.location.visibility !== 'hidden') {
      const country = p.location.country;
      const existing = countryMap.get(country) || { count: 0, cities: new Set<string>() };
      existing.count += 1;
      if (p.location.visibility === 'city_and_country' && p.location.city) {
        existing.cities.add(p.location.city);
      }
      countryMap.set(country, existing);
    }
  });
  const countryFootprint = Array.from(countryMap.entries())
    .map(([country, info]) => ({
      country,
      count: info.count,
      cities: Array.from(info.cities),
    }))
    .sort((a, b) => b.count - a.count);

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
      {/* A. Editorial Split-Screen Hero */}
      <section className="border-b border-[#E8DFED] dark:border-[#2E1A3B] bg-gradient-to-b from-[#F7F3F9]/80 to-[#FFFFFF] dark:from-[#1A0D22] dark:to-[#120917]">
        <div className="max-w-[1280px] mx-auto px-6 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
              <div className="space-y-5">
                <div className="text-xs font-mono tracking-wider uppercase text-[#663078] dark:text-[#B69AD8]">
                  Department of Business &amp; Technology Management · IUT
                </div>

                <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold tracking-tight leading-[1.08] text-[#32143F] dark:text-[#F7F3F9] text-balance">
                  One Department. Generations of Impact.
                </h1>

                <p className="text-base sm:text-lg text-[#716A79] dark:text-[#B69AD8]/90 max-w-2xl leading-relaxed">
                  Discover the people, careers, and achievements shaping the BTM alumni community at Islamic
                  University of Technology.
                </p>
              </div>

              <div className="space-y-4">
                <form
                  onSubmit={handleHeroSearchSubmit}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-[#FFFFFF] dark:bg-[#1C0F26] p-2 rounded-xl border border-[#E8DFED] dark:border-[#392249] shadow-xs"
                >
                  <div className="flex items-center gap-3 flex-1 px-3 py-2">
                    <Search className="w-4 h-4 text-[#663078] dark:text-[#B69AD8] shrink-0" />
                    <input
                      type="text"
                      value={heroSearch}
                      onChange={(e) => setHeroSearch(e.target.value)}
                      placeholder="Search by alumni name, student ID (170061...), company, or industry..."
                      aria-label="Search alumni directory"
                      className="w-full bg-transparent text-sm text-[#25212B] dark:text-[#F7F3F9] placeholder-[#716A79] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] bg-[#663078] hover:bg-[#32143F] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Search Alumni
                  </button>
                </form>

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <button
                    type="button"
                    onClick={() => navigate('/batch/17')}
                    className="px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] bg-[#32143F] hover:bg-[#663078] dark:bg-[#663078] dark:hover:bg-[#7D3C94] rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Explore BTM 17 Directory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/batches')}
                    className="px-5 py-2.5 text-xs font-semibold text-[#32143F] dark:text-[#F7F3F9] bg-[#F7F3F9] dark:bg-[#1E1028] hover:bg-[#E8DFED] dark:hover:bg-[#2B1738] border border-[#E8DFED] dark:border-[#362046] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Browse All Batches
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/insights')}
                    className="text-xs font-semibold text-[#663078] dark:text-[#B69AD8] hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>View Career Insights</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col">
              <div className="flex-1 min-h-[320px] lg:h-full rounded-2xl overflow-hidden border border-[#E8DFED] dark:border-[#362046] flex flex-col">
                <EditorialPlate
                  variant="campus-arch"
                  alt="Architectural illustration representing the Department of Business and Technology Management at IUT"
                  caption="FIG. 01 — ACADEMIC ARCHIVE & COHORT REGISTRY"
                  className="flex-1 w-full h-full min-h-[300px]"
                />
              </div>
            </div>
          </div>

          {/* C. BTM at a Glance */}
          <div className="mt-12 pt-10 border-t border-[#E8DFED] dark:border-[#2E1A3B]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <h2 className="text-xs font-mono uppercase tracking-wider text-[#716A79] dark:text-[#B69AD8]">
                BTM at a Glance — Aggregated from Active Directory Records
              </h2>
              <span className="text-xs text-[#716A79] dark:text-[#9A8FA6]">
                BTM 17 Archival Records Active · BTM 18–20 Pending Intake
              </span>
            </div>

            {totalProfiles === 0 ? (
              <div className="p-6 rounded-xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#F7F3F9]/50 dark:bg-[#190D21] text-sm text-[#716A79] dark:text-[#B69AD8]">
                No alumni records are currently published in the active dataset. Use the Admin Workspace to
                add verified alumni profiles or restore the default BTM 17 records.
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-xl bg-[#FFFFFF] dark:bg-[#190D21] border border-[#E8DFED] dark:border-[#321E3E]">
                  <div className="font-mono text-3xl sm:text-4xl font-semibold text-[#32143F] dark:text-[#F7F3F9] tabular-nums">
                    {totalProfiles}
                  </div>
                  <div className="mt-2 text-sm font-medium text-[#25212B] dark:text-[#E8DFED]">
                    Alumni Profiles
                  </div>
                  <div className="mt-0.5 text-xs text-[#716A79] dark:text-[#9A8FA6]">
                    Recorded in BTM 17 cohort
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-[#FFFFFF] dark:bg-[#190D21] border border-[#E8DFED] dark:border-[#321E3E]">
                  <div className="font-mono text-3xl sm:text-4xl font-semibold text-[#32143F] dark:text-[#F7F3F9] tabular-nums">
                    {uniqueCompanies}
                  </div>
                  <div className="mt-2 text-sm font-medium text-[#25212B] dark:text-[#E8DFED]">
                    Organizations Represented
                  </div>
                  <div className="mt-0.5 text-xs text-[#716A79] dark:text-[#9A8FA6]">
                    Active &amp; archival employers
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-[#FFFFFF] dark:bg-[#190D21] border border-[#E8DFED] dark:border-[#321E3E]">
                  <div className="font-mono text-3xl sm:text-4xl font-semibold text-[#32143F] dark:text-[#F7F3F9] tabular-nums">
                    {uniqueIndustries}
                  </div>
                  <div className="mt-2 text-sm font-medium text-[#25212B] dark:text-[#E8DFED]">
                    Industries Represented
                  </div>
                  <div className="mt-0.5 text-xs text-[#716A79] dark:text-[#9A8FA6]">
                    Across tech, supply chain &amp; research
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-[#FFFFFF] dark:bg-[#190D21] border border-[#E8DFED] dark:border-[#321E3E]">
                  <div className="font-mono text-3xl sm:text-4xl font-semibold text-[#32143F] dark:text-[#F7F3F9] tabular-nums">
                    {uniqueCountries}
                  </div>
                  <div className="mt-2 text-sm font-medium text-[#25212B] dark:text-[#E8DFED]">
                    Countries Represented
                  </div>
                  <div className="mt-0.5 text-xs text-[#716A79] dark:text-[#9A8FA6]">
                    Based on public location records
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* B. Batch Showcase */}
      <section className="max-w-[1280px] mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
              01. Cohort Directories
            </div>
            <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#32143F] dark:text-[#F7F3F9]">
              Undergraduate Batches (BTM 17 — BTM 20)
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/batches')}
            className="text-sm font-semibold text-[#663078] dark:text-[#B69AD8] hover:underline inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>View Cohort Overview</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {batches.map((batch) => {
            const batchProfiles = getBatchProfiles(batch.id);
            const count = batchProfiles.length;
            const isActiveBatch = batch.status === 'active';

            return (
              <article
                key={batch.id}
                onClick={() => navigate(`/batch/${batch.code}`)}
                className="group cursor-pointer flex flex-col justify-between rounded-xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] overflow-hidden hover:border-[#663078] dark:hover:border-[#B69AD8] transition-colors"
              >
                <div>
                  <div className="h-44 overflow-hidden border-b border-[#E8DFED] dark:border-[#321E3E]">
                    <EditorialPlate
                      variant={batch.coverPlateVariant}
                      imageUrl={batch.coverImage}
                      alt={`${batch.name} cohort cover`}
                      className="w-full h-full group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2 text-xs font-mono text-[#716A79] dark:text-[#B69AD8]/80 tabular-nums">
                      <span>
                        Intake {batch.intakeYear} · Grad {batch.graduationYear}
                      </span>
                    </div>

                    <h3 className="mt-2 font-serif text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9] group-hover:text-[#663078] dark:group-hover:text-[#B69AD8] transition-colors">
                      {batch.name}
                    </h3>

                    <p className="mt-2 text-sm text-[#716A79] dark:text-[#B69AD8]/85 line-clamp-3 leading-relaxed">
                      {batch.description}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 bg-[#F7F3F9]/60 dark:bg-[#140A1B] border-t border-[#E8DFED] dark:border-[#2E1A3B] flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-[#25212B] dark:text-[#E8DFED] tabular-nums">
                    {isActiveBatch || count > 0
                      ? `${count} Available ${count === 1 ? 'Record' : 'Records'}`
                      : 'Coming Soon · 0 Records'}
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#663078] dark:text-[#B69AD8] whitespace-nowrap shrink-0">
                    <span>{isActiveBatch ? 'View Alumni' : 'Cohort Status'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* D. Alumni Spotlight */}
      <section className="bg-[#F7F3F9] dark:bg-[#170C1E] border-y border-[#E8DFED] dark:border-[#2E1A3B] py-20">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
                02. Featured Profiles
              </div>
              <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#32143F] dark:text-[#F7F3F9]">
                Alumni Spotlight
              </h2>
              <p className="mt-1.5 text-sm text-[#716A79] dark:text-[#B69AD8]/85 max-w-2xl">
                Selected profiles demonstrating diverse career pathways across product management, operations
                research, and technology entrepreneurship. Featured status is curated via the Admin Workspace.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/alumni')}
              className="text-sm font-semibold text-[#663078] dark:text-[#B69AD8] hover:underline inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Browse Full Directory</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {featuredProfiles.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#FFFFFF] dark:bg-[#1D1026] border border-[#E8DFED] dark:border-[#321E3E] text-sm text-[#716A79] dark:text-[#B69AD8]">
              No alumni profiles are currently designated as Featured Spotlight. Administrators can mark
              profiles as featured in the Admin Workspace.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredProfiles.map(({ alumni, batch, currentPosition, location }) => (
                <article
                  key={alumni.id}
                  onClick={() => navigate(`/alumni/${alumni.studentId}`)}
                  className="group cursor-pointer flex flex-col justify-between bg-[#FFFFFF] dark:bg-[#1C0F26] border border-[#E8DFED] dark:border-[#352044] rounded-xl p-6 hover:border-[#663078] dark:hover:border-[#B69AD8] transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <AlumniPortrait
                        profileImage={alumni.profileImage}
                        initials={alumni.portraitInitials}
                        fullName={alumni.fullName}
                        tone={alumni.portraitTone}
                        size="lg"
                      />
                      <div className="text-right font-mono text-xs text-[#716A79] dark:text-[#B69AD8]/80 tabular-nums">
                        <div>{batch.name}</div>
                        <div className="mt-0.5">ID {alumni.studentId}</div>
                      </div>
                    </div>

                    <div className="mt-5">
                      <h3 className="font-serif text-xl font-semibold text-[#32143F] dark:text-[#F7F3F9] group-hover:text-[#663078] dark:group-hover:text-[#B69AD8] transition-colors">
                        {alumni.fullName}
                      </h3>

                      {currentPosition ? (
                        <p className="mt-1 text-sm font-medium text-[#25212B] dark:text-[#E8DFED]">
                          {currentPosition.designation} · {currentPosition.organization}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm italic text-[#716A79]">Position not listed</p>
                      )}

                      <p className="mt-3 text-sm text-[#716A79] dark:text-[#B69AD8]/85 leading-relaxed">
                        {alumni.featuredNote || alumni.professionalSummary}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#E8DFED] dark:border-[#321E3E] flex items-center justify-between gap-2 text-xs">
                    <div className="text-[#716A79] dark:text-[#B69AD8]/75 truncate">
                      {location && location.visibility !== 'hidden'
                        ? `${location.city}, ${location.country}`
                        : alumni.primaryIndustry || 'BTM Archive'}
                    </div>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#663078] dark:text-[#B69AD8] whitespace-nowrap shrink-0">
                      <span>Read Dossier</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* E. Alumni Stories Preview */}
      <section className="max-w-[1280px] mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
              03. Editorial Features
            </div>
            <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#32143F] dark:text-[#F7F3F9]">
              Alumni Stories &amp; Field Notes
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/stories')}
            className="text-sm font-semibold text-[#663078] dark:text-[#B69AD8] hover:underline inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>All Published Stories</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {publishedStories.length === 0 ? (
          <div className="p-8 rounded-xl border border-[#E8DFED] dark:border-[#321E3E] text-sm text-[#716A79]">
            No editorial stories are currently published.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {publishedStories.map((story) => {
              const authorProfile = publicProfiles.find((p) => p.alumni.id === story.associatedAlumniId);
              const storyBatch = batches.find((b) => b.id === story.batchId);

              return (
                <article
                  key={story.id}
                  onClick={() => navigate(`/stories/${story.slug}`)}
                  className="group cursor-pointer flex flex-col justify-between rounded-xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] overflow-hidden hover:border-[#663078] dark:hover:border-[#B69AD8] transition-colors"
                >
                  <div>
                    <div className="h-48 overflow-hidden border-b border-[#E8DFED] dark:border-[#321E3E]">
                      <EditorialPlate
                        variant={story.coverPlateVariant}
                        imageUrl={story.coverImage}
                        alt={story.title}
                        className="w-full h-full group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    </div>

                    <div className="p-6">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#716A79] dark:text-[#B69AD8]/80">
                        <span className="font-medium text-[#663078] dark:text-[#C8B2E6]">
                          {story.category}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{storyBatch?.name || 'BTM 17'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{story.publishedAt}</span>
                      </div>

                      <h3 className="mt-2.5 font-serif text-xl font-semibold leading-snug text-[#32143F] dark:text-[#F7F3F9] group-hover:text-[#663078] dark:group-hover:text-[#B69AD8] transition-colors">
                        {story.title}
                      </h3>

                      <p className="mt-2.5 text-sm text-[#716A79] dark:text-[#B69AD8]/85 line-clamp-3 leading-relaxed">
                        {story.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t border-[#E8DFED] dark:border-[#2E1A3B] flex items-center justify-between gap-3 text-xs">
                    <span className="text-[#25212B] dark:text-[#E8DFED] truncate">
                      {authorProfile ? authorProfile.alumni.fullName : 'BTM Editorial Desk'}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#663078] dark:text-[#B69AD8] whitespace-nowrap shrink-0">
                      <span>Read Story</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* F. Global Alumni Footprint & Insights Preview */}
      <section className="max-w-[1280px] mx-auto px-6 pb-12">
        <div className="rounded-2xl border border-[#E8DFED] dark:border-[#352044] bg-[#32143F] text-[#F7F3F9] p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="text-xs font-mono uppercase tracking-wider text-[#B69AD8]">
                04. Geographic Distribution &amp; Career Analytics
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
                Global Alumni Footprint
              </h2>
              <p className="text-sm sm:text-base text-[#E8DFED]/85 leading-relaxed">
                Explore where BTM graduates are building careers and pursuing postgraduate research. Location
                data reflects only city and country records approved for public directory display.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/map')}
                  className="px-5 py-2.5 text-xs font-semibold text-[#32143F] bg-[#F7F3F9] hover:bg-[#FFFFFF] rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Globe className="w-4 h-4" />
                  <span>Open Interactive Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/insights')}
                  className="px-5 py-2.5 text-xs font-semibold text-[#F7F3F9] bg-[#663078] hover:bg-[#7B3B90] border border-[#B69AD8]/30 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Explore Career Insights</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              {countryFootprint.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#240D2E] border border-[#B69AD8]/25 text-sm text-[#E8DFED]/80">
                  No geographic location records are currently populated.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {countryFootprint.map((item) => (
                    <button
                      key={item.country}
                      type="button"
                      onClick={() => navigate(`/map?country=${encodeURIComponent(item.country)}`)}
                      className="p-4 text-left rounded-xl bg-[#240D2E]/90 hover:bg-[#663078]/60 border border-[#B69AD8]/25 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm text-[#FFFFFF]">{item.country}</span>
                        <span className="font-mono text-xs text-[#B69AD8] tabular-nums">
                          {item.count} {item.count === 1 ? 'Alumnus' : 'Alumni'}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-[#E8DFED]/75 truncate">
                        {item.cities.length > 0 ? item.cities.join(' · ') : 'Country-level record'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
