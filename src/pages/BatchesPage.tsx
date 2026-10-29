import React, { useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useRouter, updateDocumentMeta } from '../utils/router';
import { EditorialPlate } from '../components/EditorialMedia';

export const BatchesPage: React.FC = () => {
  const { batches, getBatchProfiles } = useData();
  const { navigate } = useRouter();

  useEffect(() => {
    updateDocumentMeta(
      'Batches (BTM 17 — BTM 20)',
      'Browse the batch directories of the Department of Business and Technology Management (BTM) at Islamic University of Technology (IUT).'
    );
  }, []);

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-12 lg:py-16">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-[#716A79] dark:text-[#B69AD8]/80 mb-6">
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
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <span className="text-[#25212B] dark:text-[#F7F3F9] font-medium">Batches</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b border-[#E8DFED] dark:border-[#2E1A3B]">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
            Departmental Batch Archive
          </div>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-[#32143F] dark:text-[#F7F3F9]">
            BTM Batches
          </h1>
          <p className="mt-3 text-base text-[#716A79] dark:text-[#B69AD8]/90 max-w-2xl leading-relaxed">
            The BTM Alumni platform is structured around batch directories beginning with the pioneering BTM
            17 intake. BTM 17 is currently active in this prototype; BTM 18, BTM 19, and BTM 20 share the
            same archival schema and are prepared for incremental record onboarding.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/alumni')}
            className="px-4 py-2.5 text-xs font-semibold text-[#FFFFFF] bg-[#663078] hover:bg-[#32143F] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Search All Alumni
          </button>
        </div>
      </div>

      {/* Batch Cards */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        {batches.map((batch) => {
          const profiles = getBatchProfiles(batch.id);
          const count = profiles.length;

          return (
            <article
              key={batch.id}
              onClick={() => navigate(`/batch/${batch.code}`)}
              className="group cursor-pointer flex flex-col justify-between rounded-2xl btm-glass-card overflow-hidden"
            >
              <div>
                <div className="h-56 overflow-hidden border-b border-[#E8DFED]/80 dark:border-[#321E3E]">
                  <EditorialPlate
                    variant={batch.coverPlateVariant}
                    imageUrl={batch.coverImage}
                    alt={`${batch.name} cover`}
                    caption={`BATCH ${batch.code} · INTAKE ${batch.intakeYear} – GRADUATION ${batch.graduationYear}`}
                    className="w-full h-full group-hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>

                <div className="p-8">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#716A79] dark:text-[#B69AD8]/80 tabular-nums">
                    <span>
                      Academic Years {batch.intakeYear}–{batch.graduationYear}
                    </span>
                    <span className="text-[#663078] dark:text-[#C8B2E6] font-semibold">
                      B.Sc. in BTM · IUT
                    </span>
                  </div>

                  <h2 className="mt-2 font-serif text-3xl font-semibold text-[#32143F] dark:text-[#F7F3F9] group-hover:text-[#663078] dark:group-hover:text-[#B69AD8] transition-colors">
                    {batch.name}
                  </h2>

                  <p className="mt-3 text-sm text-[#716A79] dark:text-[#B69AD8]/85 leading-relaxed">
                    {batch.description}
                  </p>
                </div>
              </div>

              <div className="px-8 py-4 bg-[#F7F3F9]/55 dark:bg-[#140A1B]/55 backdrop-blur-xs border-t border-[#E8DFED]/80 dark:border-[#2E1A3B] flex items-center justify-between gap-4">
                <span className="font-mono text-xs text-[#25212B] dark:text-[#E8DFED] tabular-nums">
                  {count} Available Alumni {count === 1 ? 'Profile' : 'Profiles'}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#663078] dark:text-[#B69AD8] whitespace-nowrap shrink-0">
                  <span>{batch.status === 'active' || count > 0 ? `Open ${batch.name} Directory` : `View ${batch.name} Status`}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
