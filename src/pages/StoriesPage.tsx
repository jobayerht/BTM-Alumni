import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, ArrowUpRight, PlusCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useRouter, updateDocumentMeta } from '../utils/router';
import { StoryCategory } from '../types/models';
import { EditorialPlate, AlumniPortrait } from '../components/EditorialMedia';

const CATEGORIES: ('All' | StoryCategory)[] = [
  'All',
  'Career Journeys',
  'Founder Stories',
  'Lessons Learned',
  'Professional Achievements',
  'Alumni Spotlight',
];

export const StoriesPage: React.FC<{ slug?: string }> = ({ slug }) => {
  const { stories, batches, getAllPublicProfiles } = useData();
  const { navigate } = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<'All' | StoryCategory>('All');

  const publicProfiles = getAllPublicProfiles();
  const publishedStories = useMemo(
    () => stories.filter((s) => s.status === 'published'),
    [stories]
  );

  const activeStory = useMemo(
    () => (slug ? stories.find((s) => s.slug.toLowerCase() === slug.toLowerCase()) : undefined),
    [slug, stories]
  );

  useEffect(() => {
    if (activeStory) {
      updateDocumentMeta(activeStory.title, activeStory.excerpt);
    } else {
      updateDocumentMeta(
        'Alumni Stories & Editorial Field Notes',
        'Editorial essays, career journeys, founder stories, and lessons learned from BTM alumni at Islamic University of Technology (IUT).'
      );
    }
  }, [activeStory]);

  const filteredStories = useMemo(() => {
    if (selectedCategory === 'All') return publishedStories;
    return publishedStories.filter((s) => s.category === selectedCategory);
  }, [publishedStories, selectedCategory]);

  // Individual Story Reader View (/stories/:slug)
  if (slug) {
    if (!activeStory) {
      return (
        <div className="max-w-[1280px] mx-auto px-6 py-20 text-center space-y-4">
          <h1 className="font-serif text-3xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
            Editorial Story Not Found
          </h1>
          <p className="text-sm text-[#716A79] dark:text-[#B69AD8]">
            No published story matches the slug &ldquo;{slug}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => navigate('/stories')}
            className="px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] bg-[#663078] rounded-lg cursor-pointer"
          >
            Back to All Stories
          </button>
        </div>
      );
    }

    const associatedAlumnus = publicProfiles.find(
      (p) => p.alumni.id === activeStory.associatedAlumniId
    );
    const storyBatch = batches.find((b) => b.id === activeStory.batchId);

    return (
      <article className="max-w-[1280px] mx-auto px-6 py-10 lg:py-14">
        {/* Top Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <nav aria-label="Breadcrumb" className="text-xs text-[#716A79] dark:text-[#B69AD8]/80 flex items-center gap-2">
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
            <a
              href="/stories"
              onClick={(e) => {
                e.preventDefault();
                navigate('/stories');
              }}
              className="hover:text-[#663078] dark:hover:text-[#FFFFFF]"
            >
              Alumni Stories
            </a>
            <span aria-hidden="true">/</span>
            <span className="text-[#25212B] dark:text-[#F7F3F9] font-medium truncate max-w-xs">
              {activeStory.title}
            </span>
          </nav>

          <button
            type="button"
            onClick={() => navigate('/stories')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#716A79] dark:text-[#B69AD8] hover:text-[#25212B] dark:hover:text-[#FFFFFF] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Stories</span>
          </button>
        </div>

        {/* Editorial Header */}
        <header className="max-w-4xl space-y-5 pb-10 border-b border-[#E8DFED] dark:border-[#2E1A3B]">
          {/* Zero-pill metadata line */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8] tabular-nums">
            <span>{activeStory.category}</span>
            <span aria-hidden="true">·</span>
            <span>{storyBatch?.name || 'BTM 17'}</span>
            <span aria-hidden="true">·</span>
            <span>PUBLISHED {activeStory.publishedAt}</span>
            <span aria-hidden="true">·</span>
            <span>{activeStory.readTimeMinutes} MIN READ</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.12] text-[#32143F] dark:text-[#F7F3F9] text-balance">
            {activeStory.title}
          </h1>

          {activeStory.subtitle && (
            <p className="text-lg sm:text-xl text-[#716A79] dark:text-[#B69AD8]/90 leading-relaxed">
              {activeStory.subtitle}
            </p>
          )}
        </header>

        {/* Cover Plate */}
        <figure className="my-10">
          <div className="h-[340px] sm:h-[440px] rounded-2xl overflow-hidden border border-[#E8DFED] dark:border-[#352044]">
            <EditorialPlate
              variant={activeStory.coverPlateVariant}
              imageUrl={activeStory.coverImage}
              alt={activeStory.title}
              caption={`EDITORIAL ARCHIVE · ${activeStory.category.toUpperCase()}`}
              className="w-full h-full"
            />
          </div>
          <figcaption className="mt-2.5 text-xs font-serif italic text-[#716A79] dark:text-[#B69AD8]/80">
            Fig. 01 — Architectural plate accompanying &ldquo;{activeStory.title}&rdquo; ({storyBatch?.name || 'BTM Archive'}).
          </figcaption>
        </figure>

        {/* Asymmetric Reading Canvas (70% Body / 30% Margin Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
          <div className="lg:col-span-8 space-y-6">
            {activeStory.content.map((paragraph, idx) => (
              <React.Fragment key={idx}>
                <p
                  className={`text-base sm:text-[17px] text-[#25212B] dark:text-[#E8DFED] leading-[1.8] max-w-[68ch] ${
                    idx === 1
                      ? 'first-letter:text-5xl first-letter:font-serif first-letter:font-semibold first-letter:text-[#663078] dark:first-letter:text-[#B69AD8] first-letter:float-left first-letter:mr-3 first-letter:mt-1'
                      : idx === 0 && activeStory.isSampleStory
                      ? 'p-4 rounded-xl bg-[#F7F3F9] dark:bg-[#1A0D22] border border-[#E8DFED] dark:border-[#352044] text-xs font-mono text-[#716A79] dark:text-[#B69AD8]'
                      : ''
                  }`}
                >
                  {paragraph}
                </p>

                {/* Pull Quote with Top/Bottom Hairline Dividers (No thick left border) */}
                {idx === 1 && activeStory.pullQuote && (
                  <blockquote className="my-10 py-8 border-y border-[#E8DFED] dark:border-[#352044] max-w-[65ch]">
                    <p className="font-serif text-2xl sm:text-3xl italic text-[#32143F] dark:text-[#F7F3F9] leading-snug">
                      &ldquo;{activeStory.pullQuote}&rdquo;
                    </p>
                  </blockquote>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Margin Sidebar: Associated Alumnus & Cohort Context */}
          <aside className="lg:col-span-4 space-y-6">
            {associatedAlumnus && (
              <div className="p-6 rounded-xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#F7F3F9]/70 dark:bg-[#190D21] space-y-4">
                <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
                  Associated Alumnus Profile
                </div>

                <div className="flex items-center gap-4">
                  <AlumniPortrait
                    profileImage={associatedAlumnus.alumni.profileImage}
                    initials={associatedAlumnus.alumni.portraitInitials}
                    fullName={associatedAlumnus.alumni.fullName}
                    tone={associatedAlumnus.alumni.portraitTone}
                    size="md"
                  />
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                      {associatedAlumnus.alumni.fullName}
                    </h3>
                    <div className="text-xs font-mono text-[#716A79] dark:text-[#B69AD8] tabular-nums">
                      {associatedAlumnus.batch.name} · ID {associatedAlumnus.alumni.studentId}
                    </div>
                  </div>
                </div>

                {associatedAlumnus.currentPosition && (
                  <p className="text-xs text-[#25212B] dark:text-[#E8DFED]">
                    {associatedAlumnus.currentPosition.designation} at{' '}
                    <strong>{associatedAlumnus.currentPosition.organization}</strong>
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => navigate(`/alumni/${associatedAlumnus.alumni.studentId}`)}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-[#FFFFFF] bg-[#663078] hover:bg-[#32143F] rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>View Complete Alumni Profile</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="p-6 rounded-xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-[#32143F] dark:text-[#E8DFED]">
                Editorial Standards
              </div>
              <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/85 leading-relaxed">
                Stories in the BTM Alumni Archive are curated and approved by departmental administrators. No
                automated AI summaries or unverified personal quotes are published as factual records.
              </p>
            </div>
          </aside>
        </div>
      </article>
    );
  }

  // Stories Listing View (/stories)
  const leadStory = filteredStories[0];
  const secondaryStories = filteredStories.slice(1);

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
        <span className="text-[#25212B] dark:text-[#F7F3F9] font-medium">Alumni Stories</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E8DFED] dark:border-[#2E1A3B]">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
            Departmental Monograph &amp; Essays
          </div>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-[#32143F] dark:text-[#F7F3F9]">
            Alumni Stories &amp; Career Field Notes
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-[#716A79] dark:text-[#B69AD8]/90 max-w-2xl leading-relaxed">
            Long-form reflections on career transitions, venture building, quantitative operations, and
            postgraduate research contributed by the BTM community.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin?tab=stories')}
          className="px-4 py-2.5 text-xs font-semibold text-[#32143F] dark:text-[#F7F3F9] bg-[#F7F3F9] dark:bg-[#190D21] border border-[#E8DFED] dark:border-[#352044] hover:border-[#663078] rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Publish Story in Admin</span>
        </button>
      </div>

      {/* Interactive Category Filter Segmented Bar */}
      <div
        role="group"
        aria-label="Filter stories by category"
        className="my-8 flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F7F3F9] dark:bg-[#180C20] border border-[#E8DFED] dark:border-[#321E3E] rounded-xl w-fit"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              selectedCategory === cat
                ? 'bg-[#663078] text-[#FFFFFF]'
                : 'text-[#716A79] dark:text-[#B69AD8] hover:text-[#25212B] dark:hover:text-[#FFFFFF]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredStories.length === 0 ? (
        <div className="p-12 rounded-xl border border-[#E8DFED] dark:border-[#321E3E] text-center space-y-3">
          <h2 className="font-serif text-xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
            No Published Stories in This Category
          </h2>
          <p className="text-sm text-[#716A79] dark:text-[#B69AD8]/80">
            Select another editorial category or publish a new story in the Admin Workspace.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Tier 1: Lead Editorial Story */}
          {leadStory && (
            <article
              onClick={() => navigate(`/stories/${leadStory.slug}`)}
              className="group cursor-pointer rounded-2xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] overflow-hidden hover:border-[#663078] dark:hover:border-[#B69AD8] transition-colors"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                <div className="lg:col-span-6 min-h-[280px] border-b lg:border-b-0 lg:border-r border-[#E8DFED] dark:border-[#321E3E] overflow-hidden">
                  <EditorialPlate
                    variant={leadStory.coverPlateVariant}
                    imageUrl={leadStory.coverImage}
                    alt={leadStory.title}
                    caption="LEAD FEATURE · BTM EDITORIAL ARCHIVE"
                    className="w-full h-full min-h-[280px] group-hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>

                <div className="lg:col-span-6 p-8 lg:p-10 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#716A79] dark:text-[#B69AD8]">
                      <span className="font-semibold text-[#663078] dark:text-[#C8B2E6]">
                        {leadStory.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{leadStory.publishedAt}</span>
                      <span aria-hidden="true">·</span>
                      <span>{leadStory.readTimeMinutes} min read</span>
                    </div>

                    <h2 className="font-serif text-2xl sm:text-3xl font-semibold leading-tight text-[#32143F] dark:text-[#F7F3F9] group-hover:text-[#663078] dark:group-hover:text-[#B69AD8] transition-colors">
                      {leadStory.title}
                    </h2>

                    <p className="text-sm sm:text-base text-[#716A79] dark:text-[#B69AD8]/90 leading-relaxed">
                      {leadStory.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E8DFED] dark:border-[#2E1A3B] flex items-center justify-between gap-4 text-xs">
                    <span className="text-[#25212B] dark:text-[#E8DFED] font-medium">
                      {publicProfiles.find((p) => p.alumni.id === leadStory.associatedAlumniId)?.alumni
                        .fullName || 'BTM Editorial'}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#663078] dark:text-[#B69AD8]">
                      <span>Read Full Essay</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* Tier 2: Secondary Story Grid */}
          {secondaryStories.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {secondaryStories.map((story) => {
                const author = publicProfiles.find((p) => p.alumni.id === story.associatedAlumniId);
                return (
                  <article
                    key={story.id}
                    onClick={() => navigate(`/stories/${story.slug}`)}
                    className="group cursor-pointer flex flex-col justify-between rounded-xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] overflow-hidden hover:border-[#663078] dark:hover:border-[#B69AD8] transition-colors"
                  >
                    <div>
                      <div className="h-48 border-b border-[#E8DFED] dark:border-[#321E3E] overflow-hidden">
                        <EditorialPlate
                          variant={story.coverPlateVariant}
                          imageUrl={story.coverImage}
                          alt={story.title}
                          className="w-full h-full group-hover:scale-[1.02] transition-transform duration-300"
                        />
                      </div>
                      <div className="p-6 space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#716A79] dark:text-[#B69AD8]">
                          <span className="font-medium text-[#663078] dark:text-[#C8B2E6]">
                            {story.category}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{story.publishedAt}</span>
                        </div>
                        <h3 className="font-serif text-xl font-semibold text-[#32143F] dark:text-[#F7F3F9] group-hover:text-[#663078] dark:group-hover:text-[#B69AD8] transition-colors">
                          {story.title}
                        </h3>
                        <p className="text-sm text-[#716A79] dark:text-[#B69AD8]/85 line-clamp-3 leading-relaxed">
                          {story.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 py-4 border-t border-[#E8DFED] dark:border-[#2E1A3B] flex items-center justify-between text-xs">
                      <span className="text-[#25212B] dark:text-[#E8DFED] truncate">
                        {author ? author.alumni.fullName : 'BTM Archive'}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-[#663078] dark:text-[#B69AD8] shrink-0">
                        <span>Read Story</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
