import React, { useEffect } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  MapPin,
  Building2,
  BookOpen,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useRouter, updateDocumentMeta } from '../utils/router';
import { Education, Experience } from '../types/models';
import { expandMonthNames } from '../data/initialDataset';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function isValidHttpUrl(value?: string | null): value is string {
  if (!value || !value.trim()) return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function formatYearMonth(ym?: string): string {
  if (!ym) return '';
  const match = ym.trim().match(/^(\d{4})-(\d{2})$/);
  if (!match) return expandMonthNames(ym);
  const year = Number(match[1]);
  const monthIdx = Number(match[2]) - 1;
  if (year <= 1905) return '';
  if (monthIdx >= 0 && monthIdx < 12) {
    return `${MONTH_NAMES[monthIdx]} ${year}`;
  }
  return String(year);
}

function getExperiencePeriodDisplay(exp: Experience): string {
  if (exp.periodLabel !== undefined) {
    return expandMonthNames(exp.periodLabel.trim());
  }
  const start = formatYearMonth(exp.startDate);
  if (!start) return '';
  if (exp.isCurrent) return `${start} – Present`;
  const end = formatYearMonth(exp.endDate);
  return end && end !== start ? `${start} – ${end}` : start;
}

function getEmploymentStatusDisplay(exp: Experience): string {
  const rawLabel = (exp.employmentStatusLabel ?? exp.employmentType ?? '').trim();
  if (!rawLabel) return '';
  const cleaned = rawLabel
    .replace(/\bother\b/gi, '')
    .replace(/^\s*[/·,-]\s*|\s*[/·,-]\s*$/g, '')
    .trim();
  if (!cleaned) return '';
  if (/^intern$/i.test(cleaned)) return 'Internship';
  if (/^full[\s-]*time$/i.test(cleaned)) return 'Full-Time';
  if (/^part[\s-]*time$/i.test(cleaned)) return 'Part-Time';
  return cleaned;
}

function isPostIutHigherEducation(edu: Education): boolean {
  if (edu.isPostIutHigherEd === true) return true;
  if (edu.isPostIutHigherEd === false) return false;
  const inst = (edu.institution || '').toLowerCase();
  const deg = (edu.degree || '').toLowerCase();
  const level = (edu.studyLevel || '').toLowerCase();

  if (inst.includes('islamic university of technology') || /\biut\b/.test(inst)) {
    return false;
  }
  if (
    /\b(ssc|hsc|high school|secondary school|higher secondary|o levels|a levels|school|college)\b/i.test(
      deg
    ) &&
    !/\b(master|mba|msc|phd|doctoral|graduate certificate|postgraduate)\b/i.test(deg)
  ) {
    return false;
  }
  if (level === 'bachelors' || level === 'other') {
    return false;
  }
  return true;
}

function getEducationPeriodDisplay(edu: Education): string {
  if (edu.periodLabel !== undefined) {
    return expandMonthNames(edu.periodLabel.trim());
  }
  if (edu.startYear && edu.endYear) {
    return edu.startYear === edu.endYear
      ? `${edu.startYear}`
      : `${edu.startYear} – ${edu.endYear}`;
  }
  if (edu.startYear) return `${edu.startYear}`;
  return '';
}

export const AlumniProfilePage: React.FC<{ studentId: string }> = ({ studentId }) => {
  const { getCompleteProfile } = useData();
  const { navigate } = useRouter();

  const profile = getCompleteProfile(studentId);

  useEffect(() => {
    if (profile) {
      updateDocumentMeta(
        `${profile.alumni.fullName} (${profile.batch.name})`,
        profile.alumni.professionalHeadline ||
          `Alumni profile for ${profile.alumni.fullName}, ${profile.batch.name}, Department of Business and Technology Management at IUT.`
      );
    } else {
      updateDocumentMeta('Alumni Profile Not Found', 'The requested alumni record could not be found.');
    }
  }, [profile]);

  if (!profile) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-20 text-center space-y-4">
        <h1 className="font-serif text-3xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
          Alumni Profile Not Found
        </h1>
        <p className="text-sm text-[#716A79] dark:text-[#C8B9D6]">
          No alumni record matching Student ID &ldquo;{studentId}&rdquo; was found in the active directory.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/alumni')}
            className="px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] bg-[#663078] hover:bg-[#32143F] rounded-lg cursor-pointer transition-colors"
          >
            Browse Alumni Directory
          </button>
        </div>
      </div>
    );
  }

  const { alumni, batch, currentPosition, experiences, educations, location } = profile;

  // Resolve social & research URLs strictly from JSON / profile fields
  const linkedinUrl =
    alumni.linkedinUrl ||
    alumni.publicLinks.find((l) => l.label.toLowerCase() === 'linkedin')?.url ||
    '';
  const facebookUrl =
    alumni.facebookUrl ||
    alumni.publicLinks.find((l) => l.label.toLowerCase() === 'facebook')?.url ||
    '';
  const researchProfileUrl =
    alumni.researchProfileUrl ||
    alumni.publicLinks.find((l) =>
      ['research profile', 'researchgate', 'google scholar', 'orcid'].includes(
        l.label.toLowerCase()
      )
    )?.url ||
    '';

  const hasValidLinkedIn = isValidHttpUrl(linkedinUrl);
  const hasValidFacebook = isValidHttpUrl(facebookUrl);
  const hasValidResearch = isValidHttpUrl(researchProfileUrl);
  const hasAnySocialButton = hasValidLinkedIn || hasValidFacebook || hasValidResearch;

  // Resolve current city and country strictly from actual data
  const currentCity =
    alumni.currentCity !== undefined
      ? alumni.currentCity
      : location && location.visibility === 'city_and_country'
      ? location.city
      : '';
  const currentCountry =
    alumni.currentCountry !== undefined
      ? alumni.currentCountry
      : location && location.visibility !== 'hidden'
      ? location.country
      : '';

  const formattedLocation =
    currentCity && currentCountry
      ? `${currentCity}, ${currentCountry}`
      : currentCountry || currentCity || '';

  // Filter higher education strictly to post-IUT entries
  const higherEducationList = educations.filter(isPostIutHigherEducation);

  return (
    <div className="min-h-screen transition-colors">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 lg:py-12">
        {/* A. Return Navigation (Left) & Breadcrumbs (Right) */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <button
            type="button"
            onClick={() => navigate(`/batch/${batch.code}`, { restoreScroll: true })}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg btm-glass-subtle text-xs sm:text-sm font-semibold text-[#32143F] dark:text-[#F7F3F9] hover:border-[#663078] dark:hover:border-[#B69AD8] hover:text-[#663078] dark:hover:text-[#B69AD8] transition-colors cursor-pointer group"
          >
            <ArrowLeft
              className="w-5 h-5 text-[#663078] dark:text-[#B69AD8] group-hover:-translate-x-0.5 transition-transform shrink-0"
              strokeWidth={2.4}
            />
            <span>Back to {batch.name} Directory</span>
          </button>

          <nav
            aria-label="Breadcrumb"
            className="text-xs text-[#716A79] dark:text-[#C8B9D6] flex items-center gap-2"
          >
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/', { restoreScroll: true });
              }}
              className="hover:text-[#663078] dark:hover:text-[#FFFFFF] transition-colors"
            >
              Home
            </a>
            <span aria-hidden="true">/</span>
            <a
              href={`/batch/${batch.code}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/batch/${batch.code}`, { restoreScroll: true });
              }}
              className="hover:text-[#663078] dark:hover:text-[#FFFFFF] transition-colors font-medium"
            >
              {batch.name}
            </a>
            <span aria-hidden="true">/</span>
            <span className="text-[#25212B] dark:text-[#F7F3F9] font-medium font-mono tabular-nums">
              {alumni.studentId}
            </span>
          </nav>
        </div>

        {/* B. Alumni Profile Header */}
        <header className="rounded-2xl btm-glass p-6 sm:p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 min-w-0">
              {/* Identity Metadata Row */}
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-mono text-[#663078] dark:text-[#B69AD8] tabular-nums">
                <a
                  href={`/batch/${batch.code}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/batch/${batch.code}`, { restoreScroll: true });
                  }}
                  className="font-semibold hover:underline"
                >
                  {batch.name}
                </a>
                <span aria-hidden="true" className="text-[#716A79] dark:text-[#C8B9D6]/50">
                  ·
                </span>
                <span className="text-[#716A79] dark:text-[#C8B9D6]">
                  ID {alumni.studentId}
                </span>
                {formattedLocation && (
                  <>
                    <span aria-hidden="true" className="text-[#716A79] dark:text-[#C8B9D6]/50">
                      ·
                    </span>
                    <span className="font-sans inline-flex items-center gap-1 text-[#716A79] dark:text-[#C8B9D6]">
                      <MapPin className="w-3 h-3 text-[#663078] dark:text-[#B69AD8] shrink-0" />
                      <span>{formattedLocation}</span>
                    </span>
                  </>
                )}
              </div>

              {/* Full Name */}
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[#32143F] dark:text-[#F7F3F9] break-words">
                {alumni.fullName}
              </h1>

              {/* Current Position & Current Organization */}
              {currentPosition ? (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm sm:text-base text-[#25212B] dark:text-[#F7F3F9]">
                  <span className="font-medium">{currentPosition.designation}</span>
                  <span className="text-[#716A79] dark:text-[#C8B9D6]">at</span>
                  <span className="font-semibold text-[#663078] dark:text-[#B69AD8]">
                    {currentPosition.organization}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-[#716A79] dark:text-[#C8B9D6]">
                  {batch.name}
                </p>
              )}
            </div>

            {/* C. Conditional Social and Research Profile Buttons */}
            {hasAnySocialButton && (
              <div className="flex flex-wrap items-center gap-2.5 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#E8DFED] dark:border-[#B69AD8]/15 shrink-0">
                {hasValidLinkedIn && (
                  <a
                    href={linkedinUrl.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 text-xs font-semibold text-[#FFFFFF] bg-[#663078]/90 hover:bg-[#32143F] dark:bg-[#663078]/85 dark:hover:bg-[#7D3C94] backdrop-blur-md border border-[#FFFFFF]/20 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 shadow-xs"
                  >
                    <svg
                      className="w-3.5 h-3.5 fill-current shrink-0"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                    <span>LinkedIn</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}

                {hasValidFacebook && (
                  <a
                    href={facebookUrl.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 text-xs font-semibold text-[#32143F] dark:text-[#F7F3F9] btm-glass-subtle hover:bg-[#663078] hover:text-[#FFFFFF] dark:hover:bg-[#663078] rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                  >
                    <svg
                      className="w-3.5 h-3.5 fill-current shrink-0"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                    </svg>
                    <span>Facebook</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}

                {hasValidResearch && (
                  <a
                    href={researchProfileUrl.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 text-xs font-semibold text-[#32143F] dark:text-[#F7F3F9] btm-glass-subtle hover:bg-[#663078] hover:text-[#FFFFFF] dark:hover:bg-[#663078] rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                  >
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>Research Profile</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column (8 cols): Career Journey & Higher Education (only rendered when data exists) */}
          {(experiences.length > 0 || higherEducationList.length > 0) && (
            <div className="lg:col-span-8 space-y-10 order-2 lg:order-1">
              {/* 4. Career Journey */}
              {experiences.length > 0 && (
                <section aria-labelledby="career-journey-heading" className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8DFED] dark:border-[#B69AD8]/15">
                    <h2
                      id="career-journey-heading"
                      className="font-serif text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9]"
                    >
                      Career Journey
                    </h2>
                    <span className="text-xs font-mono text-[#716A79] dark:text-[#C8B9D6] tabular-nums">
                      {experiences.length} {experiences.length === 1 ? 'Experience' : 'Experiences'}
                    </span>
                  </div>

                  <div className="relative pl-5 sm:pl-6 border-l-2 border-[#E8DFED] dark:border-[#663078]/40 space-y-5">
                    {experiences.map((exp) => {
                      const periodText = getExperiencePeriodDisplay(exp);
                      const statusLabel = getEmploymentStatusDisplay(exp);
                      const locationText = (exp.location || '').trim();
                      const isCurrentRole =
                        alumni.currentPositionId === exp.id ||
                        (!alumni.currentPositionId && exp.isCurrent);

                      return (
                        <article
                          key={exp.id}
                          className="relative rounded-xl btm-glass-card p-5 sm:p-6"
                        >
                          {/* Timeline Node Dot */}
                          <span
                            aria-hidden="true"
                            className={`absolute -left-[27px] sm:-left-[31px] top-6 w-3 h-3 rounded-full border-2 ${
                              isCurrentRole
                                ? 'bg-[#663078] border-[#B69AD8] dark:bg-[#B69AD8] dark:border-[#32143F]'
                                : 'bg-[#FFFFFF] dark:bg-[#180C22] border-[#B69AD8] dark:border-[#663078]'
                            }`}
                          />

                          {/* Work Period */}
                          {periodText && (
                            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#663078] dark:text-[#B69AD8] mb-2 tabular-nums">
                              {periodText}
                            </div>
                          )}

                          {/* Organization Name, Designation, Status & Location */}
                          <div className="min-w-0 space-y-1">
                            <h3 className="text-base sm:text-lg font-semibold text-[#32143F] dark:text-[#F7F3F9] leading-snug break-words">
                              {exp.organization}
                            </h3>

                            <p className="text-sm sm:text-base font-medium text-[#25212B] dark:text-[#E8DFED] break-words">
                              {exp.designation}
                            </p>

                            {(statusLabel || locationText) && (
                              <div className="pt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-[#716A79] dark:text-[#C8B9D6]">
                                {statusLabel && <span>{statusLabel}</span>}
                                {statusLabel && locationText && <span aria-hidden="true">·</span>}
                                {locationText && <span>{locationText}</span>}
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* 5. Higher Education */}
              {higherEducationList.length > 0 && (
                <section aria-labelledby="higher-education-heading" className="space-y-5">
                  <div className="pb-3 border-b border-[#E8DFED] dark:border-[#B69AD8]/15">
                    <h2
                      id="higher-education-heading"
                      className="font-serif text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9]"
                    >
                      Higher Education
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {higherEducationList.map((edu) => {
                      const periodText = getEducationPeriodDisplay(edu);
                      const locationText = (edu.locationLabel || '').trim();

                      return (
                        <article
                          key={edu.id}
                          className="rounded-xl btm-glass-card p-5 sm:p-6"
                        >
                          {periodText && (
                            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#663078] dark:text-[#B69AD8] mb-2 tabular-nums">
                              {periodText}
                            </div>
                          )}

                          <div className="min-w-0 space-y-1">
                            <h3 className="text-base sm:text-lg font-semibold text-[#32143F] dark:text-[#F7F3F9] leading-snug break-words">
                              {edu.institution}
                            </h3>

                            <p className="text-sm sm:text-base font-medium text-[#25212B] dark:text-[#E8DFED] break-words">
                              {edu.degree}
                            </p>

                            {locationText && (
                              <p className="pt-0.5 text-xs sm:text-sm text-[#716A79] dark:text-[#C8B9D6]">
                                {locationText}
                              </p>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Right Column: Compact Alumni Information Card */}
          <aside
            className={
              experiences.length > 0 || higherEducationList.length > 0
                ? 'lg:col-span-4 order-1 lg:order-2'
                : 'lg:col-span-6 order-1'
            }
          >
            <div className="rounded-xl btm-glass p-6 space-y-4">
              <h2 className="font-serif text-lg font-semibold text-[#32143F] dark:text-[#F7F3F9] pb-3 border-b border-[#E8DFED] dark:border-[#B69AD8]/15">
                Alumni Information
              </h2>

              <dl className="divide-y divide-[#E8DFED] dark:divide-[#B69AD8]/15 text-sm">
                <div className="py-3 flex items-center justify-between gap-4">
                  <dt className="text-[#716A79] dark:text-[#C8B9D6]">Batch</dt>
                  <dd className="font-semibold text-[#32143F] dark:text-[#F7F3F9] text-right">
                    {batch.name}
                  </dd>
                </div>

                <div className="py-3 flex items-center justify-between gap-4">
                  <dt className="text-[#716A79] dark:text-[#C8B9D6]">Student ID</dt>
                  <dd className="font-mono font-semibold text-[#25212B] dark:text-[#F7F3F9] tabular-nums text-right">
                    {alumni.studentId}
                  </dd>
                </div>

                {currentCity && (
                  <div className="py-3 flex items-center justify-between gap-4">
                    <dt className="text-[#716A79] dark:text-[#C8B9D6]">Current City</dt>
                    <dd className="font-medium text-[#25212B] dark:text-[#F7F3F9] text-right">
                      {currentCity}
                    </dd>
                  </div>
                )}

                {currentCountry && (
                  <div className="py-3 flex items-center justify-between gap-4">
                    <dt className="text-[#716A79] dark:text-[#C8B9D6]">Current Country</dt>
                    <dd className="font-medium text-[#25212B] dark:text-[#F7F3F9] text-right">
                      {currentCountry}
                    </dd>
                  </div>
                )}

                {currentPosition && (
                  <div className="py-3 flex items-start justify-between gap-4">
                    <dt className="text-[#716A79] dark:text-[#C8B9D6] shrink-0 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#663078] dark:text-[#B69AD8]" />
                      <span>Current Organization</span>
                    </dt>
                    <dd className="font-medium text-[#25212B] dark:text-[#F7F3F9] text-right break-words">
                      {currentPosition.organization}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
