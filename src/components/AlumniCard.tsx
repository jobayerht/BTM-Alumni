import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { CompleteAlumniProfile } from '../types/models';
import { VerificationLabel } from './EditorialMedia';
import { useRouter } from '../utils/router';

interface AlumniCardProps {
  profile: CompleteAlumniProfile;
  viewMode?: 'grid' | 'list' | 'short';
}

export const AlumniCard: React.FC<AlumniCardProps> = ({ profile, viewMode = 'grid' }) => {
  const { navigate } = useRouter();
  const { alumni, batch, currentPosition, experiences, educations, location } = profile;

  const latestExperience = currentPosition || experiences[0];
  const latestHigherEd = educations[0];

  const handleOpenProfile = () => {
    navigate(`/alumni/${alumni.studentId}`);
  };

  if (viewMode === 'short') {
    return (
      <article
        onClick={handleOpenProfile}
        className="group cursor-pointer btm-glass-card rounded-lg px-4 py-3 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4 min-w-0">
          <span className="font-mono text-xs sm:text-sm font-semibold text-[#663078] dark:text-[#B69AD8] tabular-nums shrink-0">
            {alumni.studentId}
          </span>
          <h3 className="text-sm sm:text-base font-medium text-[#25212B] dark:text-[#F7F3F9] group-hover:text-[#663078] dark:group-hover:text-[#B69AD8] transition-colors truncate">
            {alumni.fullName}
          </h3>
        </div>
        <ArrowUpRight className="w-4 h-4 text-[#716A79] group-hover:text-[#663078] dark:text-[#B69AD8] shrink-0" />
      </article>
    );
  }

  if (viewMode === 'list') {
    return (
      <article
        onClick={handleOpenProfile}
        className="group cursor-pointer btm-glass-card rounded-xl p-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#716A79] dark:text-[#B69AD8]/80 font-mono tabular-nums">
              <span>{batch.name}</span>
              <span aria-hidden="true">·</span>
              <span>ID {alumni.studentId}</span>
              {location && location.visibility !== 'hidden' && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-sans">
                    {location.visibility === 'city_and_country' && location.city
                      ? `${location.city}, ${location.country}`
                      : location.country}
                  </span>
                </>
              )}
            </div>

            <h3 className="mt-1 text-base font-semibold text-[#25212B] dark:text-[#F7F3F9] group-hover:text-[#663078] dark:group-hover:text-[#B69AD8] transition-colors truncate">
              {alumni.fullName}
            </h3>

            {currentPosition ? (
              <p className="mt-0.5 text-sm text-[#25212B]/90 dark:text-[#E8DFED]/90 truncate">
                {currentPosition.designation}{' '}
                <span className="text-[#716A79] dark:text-[#B69AD8]/70">at</span>{' '}
                <span className="font-medium">{currentPosition.organization}</span>
              </p>
            ) : latestHigherEd ? (
              <p className="mt-0.5 text-sm text-[#25212B]/90 dark:text-[#E8DFED]/90 truncate">
                {latestHigherEd.institution}
                {latestHigherEd.degree && !/not specified/i.test(latestHigherEd.degree)
                  ? ` · ${latestHigherEd.degree}`
                  : ''}
              </p>
            ) : latestExperience ? (
              <p className="mt-0.5 text-sm text-[#25212B]/90 dark:text-[#E8DFED]/90 truncate">
                {latestExperience.designation}{' '}
                <span className="text-[#716A79] dark:text-[#B69AD8]/70">·</span>{' '}
                <span className="font-medium">{latestExperience.organization}</span>
              </p>
            ) : (
              <p className="mt-0.5 text-sm text-[#716A79] dark:text-[#9A8FA6]">
                {batch.name}
              </p>
            )}
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E8DFED]/70 dark:border-[#321E3E]">
            <VerificationLabel status={alumni.verificationStatus} />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenProfile();
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#663078] dark:text-[#B69AD8] group-hover:underline whitespace-nowrap shrink-0"
            >
              <span>View Profile</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={handleOpenProfile}
      className="group cursor-pointer flex flex-col justify-between btm-glass-card rounded-xl p-6"
    >
      <div>
        <div className="flex items-center justify-between gap-4 font-mono text-xs text-[#663078] dark:text-[#B69AD8] tabular-nums">
          <span className="font-semibold">{batch.name}</span>
          <span className="text-[#716A79] dark:text-[#B69AD8]/80">ID {alumni.studentId}</span>
        </div>

        <div className="mt-3">
          <h3 className="text-lg font-semibold tracking-tight text-[#25212B] dark:text-[#F7F3F9] group-hover:text-[#663078] dark:group-hover:text-[#B69AD8] transition-colors">
            {alumni.fullName}
          </h3>

          {currentPosition ? (
            <div className="mt-1.5">
              <p className="text-sm font-medium text-[#25212B] dark:text-[#E8DFED] line-clamp-1">
                {currentPosition.designation}
              </p>
              <p className="text-sm text-[#716A79] dark:text-[#B69AD8]/80 line-clamp-1">
                {currentPosition.organization}
              </p>
            </div>
          ) : latestHigherEd ? (
            <div className="mt-1.5">
              <p className="text-sm font-medium text-[#25212B] dark:text-[#E8DFED] line-clamp-1">
                {latestHigherEd.institution}
              </p>
              <p className="text-sm text-[#716A79] dark:text-[#B69AD8]/80 line-clamp-1">
                {latestHigherEd.degree}
              </p>
            </div>
          ) : latestExperience ? (
            <div className="mt-1.5">
              <p className="text-sm font-medium text-[#25212B] dark:text-[#E8DFED] line-clamp-1">
                {latestExperience.designation}
              </p>
              <p className="text-sm text-[#716A79] dark:text-[#B69AD8]/80 line-clamp-1">
                {latestExperience.organization}
              </p>
            </div>
          ) : (
            <div className="mt-1.5">
              <p className="text-xs text-[#716A79] dark:text-[#9A8FA6]">
                {batch.name}
              </p>
            </div>
          )}
        </div>

        {location && location.visibility !== 'hidden' && (
          <div className="mt-4 pt-3 border-t border-[#E8DFED]/70 dark:border-[#321E3E] flex flex-wrap items-center gap-1.5 text-xs text-[#716A79] dark:text-[#B69AD8]/75">
            <span>
              {location.visibility === 'city_and_country' && location.city
                ? `${location.city}, ${location.country}`
                : location.country}
            </span>
          </div>
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-[#E8DFED]/70 dark:border-[#321E3E] flex items-center justify-between gap-2">
        <VerificationLabel status={alumni.verificationStatus} />
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#663078] dark:text-[#B69AD8] group-hover:translate-x-0.5 transition-transform whitespace-nowrap shrink-0">
          <span>View Profile</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </article>
  );
};

