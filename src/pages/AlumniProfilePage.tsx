import React, { useEffect } from 'react';
import { ArrowLeft, ArrowUpRight, Edit3 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useRouter, updateDocumentMeta } from '../utils/router';
import { AlumniPortrait, VerificationLabel } from '../components/EditorialMedia';

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
        <p className="text-sm text-[#716A79] dark:text-[#B69AD8]">
          No alumni record matching Student ID &ldquo;{studentId}&rdquo; was found in the active directory.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/alumni')}
            className="px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] bg-[#663078] rounded-lg cursor-pointer"
          >
            Browse Alumni Directory
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-5 py-2.5 text-xs font-semibold text-[#32143F] dark:text-[#F7F3F9] border border-[#E8DFED] dark:border-[#352044] rounded-lg cursor-pointer"
          >
            Create Record in Admin
          </button>
        </div>
      </div>
    );
  }

  const {
    alumni,
    batch,
    currentPosition,
    experiences,
    educations,
    achievements,
    location,
    sourceRecords,
    stories,
  } = profile;

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-10 lg:py-14">
      {/* Breadcrumb & Back Navigation */}
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
            href={`/batch/${batch.code}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/batch/${batch.code}`);
            }}
            className="hover:text-[#663078] dark:hover:text-[#FFFFFF]"
          >
            {batch.name}
          </a>
          <span aria-hidden="true">/</span>
          <span className="text-[#25212B] dark:text-[#F7F3F9] font-medium font-mono tabular-nums">
            {alumni.studentId}
          </span>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/batch/${batch.code}`)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#716A79] dark:text-[#B69AD8] hover:text-[#25212B] dark:hover:text-[#FFFFFF] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {batch.name} Directory</span>
          </button>
          <span aria-hidden="true" className="text-[#E8DFED] dark:text-[#352044]">
            |
          </span>
          <button
            type="button"
            onClick={() => navigate(`/admin?edit=${encodeURIComponent(alumni.studentId)}`)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#663078] dark:text-[#B69AD8] hover:underline cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Record in Admin</span>
          </button>
        </div>
      </div>

      {/* Prototype Sample Transparency Banner if Sample Record */}
      {alumni.isSampleRecord && (
        <div className="mb-8 px-5 py-3.5 rounded-xl bg-[#F7F3F9] dark:bg-[#1B0E24] border border-[#E8DFED] dark:border-[#362046] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#716A79] dark:text-[#B69AD8]">
          <div>
            <strong className="text-[#32143F] dark:text-[#F7F3F9]">Prototype Sample Dossier:</strong> This
            entry is an illustrative profile demonstrating the BTM 17 archival schema and career timeline
            structure. It does not depict an actual individual.
          </div>
          <span className="font-mono uppercase tracking-wider text-[11px] text-[#663078] dark:text-[#C8B2E6] shrink-0">
            SCHEMA VALIDATION RECORD
          </span>
        </div>
      )}

      {/* A. Profile Header */}
      <section className="rounded-2xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] p-8 lg:p-10 mb-10">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <AlumniPortrait
              profileImage={alumni.profileImage}
              initials={alumni.portraitInitials}
              fullName={alumni.fullName}
              tone={alumni.portraitTone}
              size="xl"
            />

            <div className="space-y-3">
              {/* Unboxed Metadata Line */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#716A79] dark:text-[#B69AD8] tabular-nums">
                <a
                  href={`/batch/${batch.code}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/batch/${batch.code}`);
                  }}
                  className="font-semibold text-[#663078] dark:text-[#C8B2E6] hover:underline"
                >
                  {batch.name}
                </a>
                <span aria-hidden="true">·</span>
                <span>Student ID {alumni.studentId}</span>
                {location && location.visibility !== 'hidden' && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-sans">
                      {location.visibility === 'city_and_country'
                        ? `${location.city}, ${location.country}`
                        : location.country}
                    </span>
                  </>
                )}
                {alumni.primaryIndustry && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-sans">{alumni.primaryIndustry}</span>
                  </>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#32143F] dark:text-[#F7F3F9]">
                {alumni.fullName}
              </h1>

              {alumni.professionalHeadline ? (
                <p className="text-base sm:text-lg font-medium text-[#25212B] dark:text-[#E8DFED]">
                  {alumni.professionalHeadline}
                </p>
              ) : (
                <p className="text-sm italic text-[#716A79] dark:text-[#9A8FA6]">
                  Professional headline not yet provided
                </p>
              )}

              {/* Explicit Current Position Box */}
              <div className="pt-2">
                {currentPosition ? (
                  <div className="text-sm text-[#716A79] dark:text-[#B69AD8]">
                    <span className="font-medium text-[#25212B] dark:text-[#F7F3F9]">
                      Current Position:{' '}
                    </span>
                    <span>
                      {currentPosition.designation} at{' '}
                      <strong className="text-[#32143F] dark:text-[#F7F3F9]">
                        {currentPosition.organization}
                      </strong>
                    </span>
                    {currentPosition.location && (
                      <span className="text-xs ml-1.5">({currentPosition.location})</span>
                    )}
                  </div>
                ) : (
                  <div className="text-sm italic text-[#716A79] dark:text-[#9A8FA6]">
                    Current employment information not available in the directory archive.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Public Professional Links & Verification Status */}
          <div className="flex flex-col lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#E8DFED] dark:border-[#2E1A3B] shrink-0">
            <div className="lg:text-right space-y-1">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#716A79] dark:text-[#9A8FA6]">
                Record Verification Status
              </div>
              <VerificationLabel status={alumni.verificationStatus} />
            </div>

            {alumni.publicLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-2.5">
                {alumni.publicLinks.map((lnk) => (
                  <a
                    key={lnk.id}
                    href={lnk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 text-xs font-semibold text-[#32143F] dark:text-[#F7F3F9] bg-[#F7F3F9] dark:bg-[#23122E] hover:bg-[#663078] hover:text-[#FFFFFF] dark:hover:bg-[#663078] border border-[#E8DFED] dark:border-[#392249] rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <span>{lnk.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Two-Column Editorial Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left / Main Column (8 cols): About, Career Journey, Education, Achievements */}
        <div className="lg:col-span-8 space-y-12">
          {/* B. About */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9] pb-3 border-b border-[#E8DFED] dark:border-[#2E1A3B]">
              01. Professional Summary
            </h2>
            {alumni.professionalSummary ? (
              <p className="text-base text-[#25212B]/90 dark:text-[#E8DFED]/90 leading-relaxed max-w-[70ch]">
                {alumni.professionalSummary}
              </p>
            ) : (
              <p className="text-sm italic text-[#716A79]">
                No extended professional summary is on file for this alumnus.
              </p>
            )}

            {alumni.areasOfInterest && alumni.areasOfInterest.length > 0 && (
              <div className="pt-2">
                <div className="text-xs font-mono uppercase tracking-wider text-[#716A79] dark:text-[#B69AD8] mb-1.5">
                  Areas of Professional Focus
                </div>
                <div className="text-sm font-medium text-[#32143F] dark:text-[#E8DFED]">
                  {alumni.areasOfInterest.join(' · ')}
                </div>
              </div>
            )}
          </section>

          {/* D. Career Journey (Chronological Career Timeline) */}
          <section className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFED] dark:border-[#2E1A3B]">
              <h2 className="font-serif text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                02. Career Journey
              </h2>
              <span className="text-xs font-mono text-[#716A79] dark:text-[#B69AD8] tabular-nums">
                {experiences.length} Recorded {experiences.length === 1 ? 'Role' : 'Roles'}
              </span>
            </div>

            {experiences.length === 0 ? (
              <div className="p-6 rounded-xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#F7F3F9]/40 dark:bg-[#190D21] text-sm text-[#716A79] dark:text-[#B69AD8]">
                No employment history records have been added to this profile yet.
              </div>
            ) : (
              <div className="space-y-6">
                {experiences.map((exp) => {
                  const isDesignatedCurrent =
                    alumni.currentPositionId === exp.id || (!alumni.currentPositionId && exp.isCurrent);

                  return (
                    <article
                      key={exp.id}
                      className="p-6 rounded-xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#716A79] dark:text-[#B69AD8] tabular-nums">
                        <div>
                          <span>
                            {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate || 'Completed'}
                          </span>
                          {isDesignatedCurrent && (
                            <>
                              <span aria-hidden="true"> · </span>
                              <span className="font-semibold text-[#663078] dark:text-[#C8B2E6]">
                                Current Verified Role
                              </span>
                            </>
                          )}
                        </div>
                        <span>{exp.location}</span>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-[#25212B] dark:text-[#F7F3F9]">
                          {exp.designation}
                        </h3>
                        <div className="text-sm font-medium text-[#663078] dark:text-[#B69AD8] flex flex-wrap items-center gap-2 mt-0.5">
                          <span>{exp.organization}</span>
                          {exp.employmentType && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-xs text-[#716A79] dark:text-[#9A8FA6]">
                                {exp.employmentType}
                              </span>
                            </>
                          )}
                          {exp.industry && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-xs text-[#716A79] dark:text-[#9A8FA6]">
                                {exp.industry}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {exp.description && (
                        <p className="text-sm text-[#716A79] dark:text-[#E8DFED]/80 leading-relaxed pt-1">
                          {exp.description}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* C. Education */}
          <section className="space-y-6">
            <h2 className="font-serif text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9] pb-3 border-b border-[#E8DFED] dark:border-[#2E1A3B]">
              03. Academic Education &amp; Credentials
            </h2>

            {educations.length === 0 ? (
              <div className="p-6 rounded-xl border border-[#E8DFED] dark:border-[#321E3E] text-sm text-[#716A79]">
                No education records listed.
              </div>
            ) : (
              <div className="space-y-4">
                {educations.map((edu) => (
                  <article
                    key={edu.id}
                    className="p-6 rounded-xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#716A79] dark:text-[#B69AD8] tabular-nums">
                      <span>{edu.fieldOfStudy}</span>
                      <span>
                        {edu.startYear} — {edu.endYear || 'Ongoing'}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-[#25212B] dark:text-[#F7F3F9]">
                      {edu.degree}
                    </h3>
                    <p className="text-sm font-medium text-[#663078] dark:text-[#B69AD8]">
                      {edu.institution}
                    </p>
                    {edu.description && (
                      <p className="text-sm text-[#716A79] dark:text-[#E8DFED]/80 leading-relaxed pt-1">
                        {edu.description}
                      </p>
                    )}
                    {edu.certifications && edu.certifications.length > 0 && (
                      <div className="pt-2 text-xs text-[#716A79] dark:text-[#B69AD8]">
                        <span className="font-semibold text-[#25212B] dark:text-[#E8DFED]">
                          Certifications:{' '}
                        </span>
                        <span>{edu.certifications.join(' · ')}</span>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* F. Achievements and Projects */}
          <section className="space-y-6">
            <h2 className="font-serif text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9] pb-3 border-b border-[#E8DFED] dark:border-[#2E1A3B]">
              04. Selected Projects, Publications &amp; Milestones
            </h2>

            {achievements.length === 0 ? (
              <div className="p-6 rounded-xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#F7F3F9]/40 dark:bg-[#190D21] text-sm text-[#716A79] dark:text-[#B69AD8]">
                No notable projects, awards, or publications have been cataloged for this profile yet.
              </div>
            ) : (
              <div className="space-y-4">
                {achievements.map((ach) => (
                  <article
                    key={ach.id}
                    className="p-6 rounded-xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs text-[#716A79] dark:text-[#B69AD8]">
                      <span className="font-semibold text-[#663078] dark:text-[#C8B2E6]">
                        {ach.category} · {ach.issuerOrContext}
                      </span>
                      <span className="font-mono tabular-nums">{ach.year}</span>
                    </div>
                    <h3 className="text-base font-semibold text-[#25212B] dark:text-[#F7F3F9]">
                      {ach.title}
                    </h3>
                    <p className="text-sm text-[#716A79] dark:text-[#E8DFED]/80 leading-relaxed">
                      {ach.description}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right / Archival Sidebar Column (4 cols): Skills, Associated Stories, Provenance & Metadata */}
        <aside className="lg:col-span-4 space-y-8">
          {/* E. Skills and Expertise */}
          <div className="p-6 rounded-xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#F7F3F9]/60 dark:bg-[#190D21] space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#32143F] dark:text-[#E8DFED]">
              Skills &amp; Domain Expertise
            </h3>
            {alumni.skills.length === 0 ? (
              <p className="text-xs italic text-[#716A79]">No skills listed.</p>
            ) : (
              <p className="text-sm text-[#25212B] dark:text-[#E8DFED] leading-relaxed">
                {alumni.skills.join(' · ')}
              </p>
            )}
          </div>

          {/* Associated Editorial Stories */}
          {stories.length > 0 && (
            <div className="p-6 rounded-xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#32143F] dark:text-[#E8DFED]">
                Associated Alumni Stories
              </h3>
              <div className="space-y-3">
                {stories.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => navigate(`/stories/${st.slug}`)}
                    className="group cursor-pointer p-3.5 rounded-lg border border-[#E8DFED] dark:border-[#2E1A3B] hover:border-[#663078] transition-colors"
                  >
                    <div className="text-[11px] text-[#663078] dark:text-[#B69AD8] font-medium">
                      {st.category} · {st.publishedAt}
                    </div>
                    <div className="mt-1 text-sm font-serif font-semibold text-[#25212B] dark:text-[#F7F3F9] group-hover:text-[#663078] dark:group-hover:text-[#B69AD8]">
                      {st.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* H. Archival Metadata & Provenance */}
          <div className="p-6 rounded-xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#32143F] dark:text-[#E8DFED]">
              Archival Metadata &amp; Provenance
            </h3>

            <dl className="divide-y divide-[#E8DFED] dark:divide-[#2E1A3B] text-xs">
              <div className="py-2.5 flex items-center justify-between gap-4">
                <dt className="text-[#716A79] dark:text-[#9A8FA6]">Verification Status</dt>
                <dd className="text-right">
                  <VerificationLabel status={alumni.verificationStatus} />
                </dd>
              </div>

              <div className="py-2.5 flex items-center justify-between gap-4">
                <dt className="text-[#716A79] dark:text-[#9A8FA6]">Last Updated</dt>
                <dd className="font-mono text-[#25212B] dark:text-[#F7F3F9] tabular-nums">
                  {alumni.lastUpdated}
                </dd>
              </div>

              <div className="py-2.5 flex items-center justify-between gap-4">
                <dt className="text-[#716A79] dark:text-[#9A8FA6]">Directory Visibility</dt>
                <dd className="font-mono text-[#25212B] dark:text-[#F7F3F9] uppercase">
                  {alumni.publicVisibility}
                </dd>
              </div>

              <div className="py-2.5 space-y-1">
                <dt className="text-[#716A79] dark:text-[#9A8FA6]">Primary Source Citation</dt>
                <dd className="text-[#25212B] dark:text-[#E8DFED] leading-relaxed">
                  {alumni.informationSource}
                </dd>
              </div>

              {sourceRecords.length > 0 && (
                <div className="py-2.5 space-y-1">
                  <dt className="text-[#716A79] dark:text-[#9A8FA6]">Audit Log Reference</dt>
                  {sourceRecords.map((sr) => (
                    <dd key={sr.id} className="font-mono text-[11px] text-[#716A79] dark:text-[#B69AD8] tabular-nums">
                      {sr.sourceReference} (Checked {sr.checkedAt})
                    </dd>
                  ))}
                </div>
              )}
            </dl>

            <p className="text-[11px] text-[#716A79] dark:text-[#9A8FA6] leading-relaxed pt-2 border-t border-[#E8DFED] dark:border-[#2E1A3B]">
              Data Integrity Note: Creating or editing a profile via the Admin interface does not
              automatically mark it as verified. Verification requires independent review of departmental or
              alumnus-submitted documentation.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
