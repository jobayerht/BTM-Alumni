import React, { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useRouter, updateDocumentMeta } from '../utils/router';
import { EditorialPlate } from '../components/EditorialMedia';

export const AboutPage: React.FC = () => {
  const { navigate } = useRouter();

  useEffect(() => {
    updateDocumentMeta(
      'About the Platform & Data Integrity Charter',
      'Learn about the BTM Alumni directory architecture, privacy charter, and departmental context at Islamic University of Technology (IUT), Bangladesh.'
    );
  }, []);

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
        <span className="text-[#25212B] dark:text-[#F7F3F9] font-medium">About the Platform</span>
      </nav>

      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-[#E8DFED] dark:border-[#2E1A3B] items-center">
        <div className="lg:col-span-7 space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
            Departmental Monograph &amp; Governance Charter
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-[#32143F] dark:text-[#F7F3F9] text-balance">
            Preserving the Professional Legacy of BTM at IUT
          </h1>
          <p className="text-base sm:text-lg text-[#716A79] dark:text-[#B69AD8]/90 leading-relaxed max-w-2xl">
            BTM Alumni is a centralized directory, career archive, and professional insight platform built for
            graduates of the Department of Business and Technology Management (BTM) at Islamic University of
            Technology (IUT), Gazipur, Bangladesh.
          </p>
        </div>

        <div className="lg:col-span-5 h-64 rounded-2xl overflow-hidden btm-glass">
          <EditorialPlate
            variant="quadrangle"
            alt="Architectural representation of the BTM Departmental Archive"
            caption="DEPARTMENT OF BUSINESS & TECHNOLOGY MANAGEMENT"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Core Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-14">
        <div className="lg:col-span-8 space-y-12">
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
              01. Purpose &amp; Departmental Identity
            </h2>
            <p className="text-base text-[#25212B]/90 dark:text-[#E8DFED]/90 leading-relaxed max-w-[68ch]">
              The Department of Business and Technology Management (BTM) at Islamic University of Technology
              was established to bridge quantitative business administration, industrial engineering, and
              modern information systems. Beginning with its pioneering undergraduate cohort—BTM 17—graduates
              have entered product management, global supply chain analytics, technology advisory, venture
              building, and academic research.
            </p>
            <p className="text-base text-[#25212B]/90 dark:text-[#E8DFED]/90 leading-relaxed max-w-[68ch]">
              This platform organizes cohort directories (starting with BTM 17 through BTM 20), documents
              chronological career progressions, highlights verified achievements, and aggregates cohort-level
              career telemetry in a cohesive Purple-centered visual identity.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-[#E8DFED] dark:border-[#2E1A3B]">
            <h2 className="font-serif text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
              02. Privacy &amp; Data Integrity Charter
            </h2>
            <p className="text-base text-[#25212B]/90 dark:text-[#E8DFED]/90 leading-relaxed max-w-[68ch]">
              Because BTM Alumni is designed as a public-facing professional directory, strict data boundaries
              are enforced across the data model and user interface:
            </p>
            <ul className="space-y-3 text-sm text-[#716A79] dark:text-[#B69AD8]/90 max-w-[68ch]">
              <li>
                <strong className="text-[#25212B] dark:text-[#F7F3F9]">Public Professional Scope Only:</strong>{' '}
                Personal phone numbers, private email addresses, residential street addresses, and confidential
                academic transcripts are excluded from public directory schemas.
              </li>
              <li>
                <strong className="text-[#25212B] dark:text-[#F7F3F9]">Explicit Verification Taxonomy:</strong>{' '}
                Every profile carries an explicit provenance status (<em>Verified Departmental Record</em>,{' '}
                <em>Partially Verified Record</em>, <em>Prototype Sample Record</em>, or{' '}
                <em>Unverified Archival Entry</em>).
              </li>
              <li>
                <strong className="text-[#25212B] dark:text-[#F7F3F9]">Honest Missing-Data Handling:</strong>{' '}
                Alumni are never excluded from their batch roll simply because current employment data is
                unavailable, nor are missing fields silently assigned to arbitrary analytics categories.
              </li>
            </ul>
          </section>

          <section className="space-y-4 pt-6 border-t border-[#E8DFED] dark:border-[#2E1A3B]">
            <h2 className="font-serif text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
              03. Prototype Status &amp; Production Roadmap
            </h2>
            <p className="text-base text-[#25212B]/90 dark:text-[#E8DFED]/90 leading-relaxed max-w-[68ch]">
              This application is currently operating in its <strong>Frontend Architecture &amp; Prototype Phase</strong>.
              Its relational TypeScript data layer separates `Batch`, `Alumni`, `Education`, `Experience`,
              `Achievement`, `LocationRecord`, and `SourceRecord` entities so that the local store
              can be connected directly to a production PostgreSQL / Cloud SQL or Firestore backend, role-based
              authentication, and cloud media storage when authorized by the department.
            </p>
          </section>
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl btm-glass-subtle space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
              Institutional Disclaimer
            </div>
            <p className="text-xs text-[#716A79] dark:text-[#B69AD8]/90 leading-relaxed">
              This website is a prototype developed for the BTM alumni community. It does not claim to be an
              officially operated university system of Islamic University of Technology (IUT) unless formal
              institutional authorization is established.
            </p>
          </div>

          <div className="p-6 rounded-2xl btm-glass space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-[#32143F] dark:text-[#E8DFED]">
              Explore Platform Capabilities
            </div>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => navigate('/batch/17')}
                className="w-full py-2.5 px-4 text-xs font-semibold text-[#FFFFFF] bg-[#663078] hover:bg-[#32143F] rounded-lg transition-colors inline-flex items-center justify-between cursor-pointer"
              >
                <span>Browse BTM 17 Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/overview')}
                className="w-full py-2.5 px-4 text-xs font-semibold text-[#32143F] dark:text-[#F7F3F9] btm-glass-subtle hover:bg-[#E8DFED]/70 dark:hover:bg-[#23122E] rounded-lg transition-colors inline-flex items-center justify-between cursor-pointer"
              >
                <span>Explore Overview Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
