import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Download,
  RotateCcw,
  Check,
  AlertTriangle,
  Star,
  ArrowUpRight,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useRouter, updateDocumentMeta } from '../utils/router';
import {
  Alumni,
  Experience,
  Education,
  Achievement,
  PublicLink,
  VerificationStatus,
  ProfileVisibility,
  Story,
  StoryCategory,
  BatchStatus,
} from '../types/models';
import { AlumniPortrait, VerificationLabel } from '../components/EditorialMedia';

type AdminTab = 'alumni' | 'batches' | 'stories' | 'data-quality';

export const AdminPage: React.FC = () => {
  const {
    batches,
    stories,
    getAllAdminProfiles,
    saveAlumniProfile,
    deleteAlumniProfile,
    toggleFeaturedAlumni,
    updateBatch,
    saveStory,
    deleteStory,
    resetToSampleData,
    clearSampleRecordsOnly,
  } = useData();
  const { navigate } = useRouter();

  const allProfiles = getAllAdminProfiles();

  const initialParams = useMemo(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      return {
        editStudentId: p.get('edit') || '',
        tab: (p.get('tab') as AdminTab) || 'alumni',
      };
    } catch {
      return { editStudentId: '', tab: 'alumni' as AdminTab };
    }
  }, []);

  const [activeTab, setActiveTab] = useState<AdminTab>(initialParams.tab);
  const [adminSearch, setAdminSearch] = useState('');
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Confirmation modal state for destructive actions
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);

  // Alumni Editor Modal / Drawer State
  const [editingAlumniId, setEditingAlumniId] = useState<string | null>(null);
  const [formAlumni, setFormAlumni] = useState<Alumni | null>(null);
  const [formExperiences, setFormExperiences] = useState<Experience[]>([]);
  const [formEducations, setFormEducations] = useState<Education[]>([]);
  const [formAchievements, setFormAchievements] = useState<Achievement[]>([]);
  const [formSkillsText, setFormSkillsText] = useState('');
  const [formInterestsText, setFormInterestsText] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formCountry, setFormCountry] = useState('');
  const [formLocationVisibility, setFormLocationVisibility] = useState<
    'city_and_country' | 'country_only' | 'hidden'
  >('city_and_country');

  // Story Editor State
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [storyParagraphsText, setStoryParagraphsText] = useState('');

  useEffect(() => {
    updateDocumentMeta(
      'Prototype Administration Workspace',
      'Admin interface for managing BTM alumni records, batches, editorial stories, verification statuses, and data quality.'
    );
  }, []);

  // Open editor automatically if ?edit=<studentId> is present
  useEffect(() => {
    if (initialParams.editStudentId) {
      const found = allProfiles.find(
        (p) => p.alumni.studentId.toLowerCase() === initialParams.editStudentId.toLowerCase()
      );
      if (found) {
        openEditAlumni(found.alumni.id);
      }
    }
  }, [initialParams.editStudentId]);

  const openCreateAlumni = () => {
    const newId = `alum-${Date.now()}`;
    const blank: Alumni = {
      id: newId,
      studentId: '',
      fullName: '',
      batchId: 'btm-17',
      portraitInitials: 'BT',
      portraitTone: 'plum',
      professionalHeadline: '',
      professionalSummary: '',
      areasOfInterest: [],
      currentPositionId: undefined,
      primaryIndustry: '',
      isEntrepreneur: false,
      skills: [],
      publicLinks: [],
      publicVisibility: 'public',
      featured: false,
      featuredNote: '',
      verificationStatus: 'unverified',
      informationSource: 'Direct Admin Entry (Pending Documentation Review)',
      lastUpdated: new Date().toISOString().slice(0, 10),
      isSampleRecord: false,
    };
    setEditingAlumniId(newId);
    setFormAlumni(blank);
    setFormExperiences([]);
    setFormEducations([
      {
        id: `edu-${Date.now()}`,
        alumniId: newId,
        institution: 'Islamic University of Technology (IUT)',
        degree: 'Bachelor of Science in Business and Technology Management (BTM)',
        fieldOfStudy: 'Business and Technology Management',
        startYear: 2018,
        endYear: 2022,
      },
    ]);
    setFormAchievements([]);
    setFormSkillsText('');
    setFormInterestsText('');
    setFormCity('Dhaka');
    setFormCountry('Bangladesh');
    setFormLocationVisibility('city_and_country');
    setStatusBanner(null);
  };

  const openEditAlumni = (alumniId: string) => {
    const target = allProfiles.find((p) => p.alumni.id === alumniId);
    if (!target) return;
    setEditingAlumniId(alumniId);
    setFormAlumni({ ...target.alumni });
    setFormExperiences(target.experiences.map((e) => ({ ...e })));
    setFormEducations(target.educations.map((ed) => ({ ...ed })));
    setFormAchievements(target.achievements.map((ac) => ({ ...ac })));
    setFormSkillsText(target.alumni.skills.join(', '));
    setFormInterestsText((target.alumni.areasOfInterest || []).join(', '));
    setFormCity(target.location?.city || '');
    setFormCountry(target.location?.country || '');
    setFormLocationVisibility(target.location?.visibility || 'city_and_country');
    setStatusBanner(null);
  };

  // Real-time duplicate Student ID detector
  const duplicateStudentIdWarning = useMemo(() => {
    if (!formAlumni || !formAlumni.studentId.trim()) return null;
    const conflict = allProfiles.find(
      (p) =>
        p.alumni.studentId.trim().toLowerCase() === formAlumni.studentId.trim().toLowerCase() &&
        p.alumni.id !== formAlumni.id
    );
    return conflict ? conflict.alumni.fullName : null;
  }, [formAlumni, allProfiles]);

  const handleSaveAlumniSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAlumni) return;

    const initials =
      formAlumni.fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('') || 'BT';

    const skills = formSkillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const interests = formInterestsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const currentExp = formExperiences.find((ex) => ex.isCurrent);

    const finalAlumni: Alumni = {
      ...formAlumni,
      portraitInitials: initials,
      skills,
      areasOfInterest: interests,
      currentPositionId: currentExp?.id,
    };

    const cityCoords: Record<string, { lat: number; lng: number }> = {
      dhaka: { lat: 23.8103, lng: 90.4125 },
      singapore: { lat: 1.3521, lng: 103.8198 },
      munich: { lat: 48.1351, lng: 11.582 },
      london: { lat: 51.5072, lng: -0.1276 },
      'kuala lumpur': { lat: 3.139, lng: 101.6869 },
      dubai: { lat: 25.2048, lng: 55.2708 },
      toronto: { lat: 43.6532, lng: -79.3832 },
      sydney: { lat: -33.8688, lng: 151.2093 },
    };

    const coords =
      cityCoords[formCity.trim().toLowerCase()] ||
      cityCoords[formCountry.trim().toLowerCase()] || { lat: 23.8103, lng: 90.4125 };

    const locationRecord = formCountry.trim()
      ? {
          id: `loc-${finalAlumni.id}`,
          alumniId: finalAlumni.id,
          country: formCountry.trim(),
          city: formCity.trim() || formCountry.trim(),
          coordinates: coords,
          visibility: formLocationVisibility,
        }
      : undefined;

    const sourceRecord = {
      id: `src-${finalAlumni.id}`,
      alumniId: finalAlumni.id,
      sourceType: finalAlumni.isSampleRecord
        ? ('Prototype Sample Dataset' as const)
        : ('Departmental Archive' as const),
      sourceReference: finalAlumni.informationSource || 'Admin Workspace Update',
      verificationStatus: finalAlumni.verificationStatus,
      checkedAt: new Date().toISOString().slice(0, 10),
    };

    const result = saveAlumniProfile({
      alumni: finalAlumni,
      experiences: formExperiences,
      educations: formEducations,
      achievements: formAchievements,
      location: locationRecord,
      sourceRecord,
    });

    if (!result.ok) {
      setStatusBanner({ type: 'error', message: result.error || 'Validation failed.' });
      return;
    }

    setStatusBanner({
      type: 'success',
      message: `Saved alumni record for ${finalAlumni.fullName} (ID ${finalAlumni.studentId}).`,
    });
    setEditingAlumniId(null);
    setFormAlumni(null);
  };

  // Export CSV utility
  const handleExportCSV = () => {
    const headers = [
      'StudentID',
      'FullName',
      'Batch',
      'CurrentDesignation',
      'CurrentOrganization',
      'PrimaryIndustry',
      'Country',
      'City',
      'VerificationStatus',
      'Visibility',
      'IsSampleRecord',
      'LastUpdated',
    ];
    const rows = allProfiles.map((p) => [
      p.alumni.studentId,
      `"${p.alumni.fullName.replace(/"/g, '""')}"`,
      p.batch.name,
      `"${(p.currentPosition?.designation || '').replace(/"/g, '""')}"`,
      `"${(p.currentPosition?.organization || '').replace(/"/g, '""')}"`,
      `"${(p.alumni.primaryIndustry || '').replace(/"/g, '""')}"`,
      `"${(p.location?.country || '').replace(/"/g, '""')}"`,
      `"${(p.location?.city || '').replace(/"/g, '""')}"`,
      p.alumni.verificationStatus,
      p.alumni.publicVisibility,
      String(p.alumni.isSampleRecord),
      p.alumni.lastUpdated,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `btm_alumni_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredAdminProfiles = useMemo(() => {
    const q = adminSearch.trim().toLowerCase();
    if (!q) return allProfiles;
    return allProfiles.filter(
      (p) =>
        p.alumni.fullName.toLowerCase().includes(q) ||
        p.alumni.studentId.toLowerCase().includes(q) ||
        p.batch.name.toLowerCase().includes(q) ||
        (p.currentPosition?.organization || '').toLowerCase().includes(q)
    );
  }, [allProfiles, adminSearch]);

  // Missing-field audit helper
  const getMissingFields = (p: (typeof allProfiles)[number]): string[] => {
    const missing: string[] = [];
    if (!p.currentPosition) missing.push('Current Position');
    if (!p.alumni.primaryIndustry) missing.push('Primary Industry');
    if (!p.location || !p.location.country) missing.push('Geographic Location');
    if (!p.alumni.professionalHeadline) missing.push('Headline');
    if (p.alumni.publicLinks.length === 0) missing.push('Public Links');
    return missing;
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-10 lg:py-14">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E8DFED] dark:border-[#2E1A3B]">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
            Prototype Administration Interface · Local Persistence Active
          </div>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-[#32143F] dark:text-[#F7F3F9]">
            BTM Alumni Admin Workspace
          </h1>
          <p className="mt-2 text-sm text-[#716A79] dark:text-[#B69AD8]/90 max-w-2xl leading-relaxed">
            Demonstrates the complete administrative workflow for managing alumni dossiers, cohort statuses,
            editorial stories, verification audits, and CSV exports. Changes persist in local browser storage
            during this prototype phase.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={openCreateAlumni}
            className="px-4 py-2.5 text-xs font-semibold text-[#FFFFFF] bg-[#663078] hover:bg-[#32143F] rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Alumni Record</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 text-xs font-semibold text-[#32143F] dark:text-[#F7F3F9] bg-[#F7F3F9] dark:bg-[#190D21] border border-[#E8DFED] dark:border-[#352044] hover:border-[#663078] rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Status Notification Banner */}
      {statusBanner && (
        <div
          className={`my-6 p-4 rounded-xl border flex items-center justify-between gap-4 text-xs font-medium ${
            statusBanner.type === 'success'
              ? 'bg-[#F7F3F9] dark:bg-[#1D1026] border-[#663078] text-[#32143F] dark:text-[#F7F3F9]'
              : 'bg-red-50 dark:bg-red-950/30 border-red-400 text-red-800 dark:text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusBanner.type === 'success' ? (
              <Check className="w-4 h-4 text-[#663078] dark:text-[#B69AD8]" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            <span>{statusBanner.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div
        role="tablist"
        aria-label="Admin workspace sections"
        className="my-8 flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F7F3F9] dark:bg-[#180C20] border border-[#E8DFED] dark:border-[#321E3E] rounded-xl w-fit"
      >
        {[
          { id: 'alumni', label: `Alumni Records (${allProfiles.length})` },
          { id: 'batches', label: `Batches (${batches.length})` },
          { id: 'stories', label: `Editorial Stories (${stories.length})` },
          { id: 'data-quality', label: 'Data Quality & Reset' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={activeTab === t.id}
            onClick={() => setActiveTab(t.id as AdminTab)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === t.id
                ? 'bg-[#663078] text-[#FFFFFF]'
                : 'text-[#716A79] dark:text-[#B69AD8] hover:text-[#25212B] dark:hover:text-[#FFFFFF]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: ALUMNI MANAGEMENT */}
      {activeTab === 'alumni' && (
        <div className="space-y-8">
          {/* Alumni Editor Panel (when creating or editing) */}
          {formAlumni && (
            <form
              onSubmit={handleSaveAlumniSubmit}
              className="p-8 rounded-2xl border-2 border-[#663078] dark:border-[#B69AD8] bg-[#FFFFFF] dark:bg-[#190D21] space-y-8 shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-[#E8DFED] dark:border-[#2E1A3B] pb-4">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
                    {allProfiles.some((p) => p.alumni.id === editingAlumniId)
                      ? 'Edit Existing Alumni Dossier'
                      : 'Create New Alumni Dossier'}
                  </div>
                  <h2 className="font-serif text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                    {formAlumni.fullName || 'Untitled Alumnus Record'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAlumniId(null);
                    setFormAlumni(null);
                  }}
                  className="text-xs font-semibold text-[#716A79] hover:text-[#25212B] dark:hover:text-[#FFFFFF] cursor-pointer"
                >
                  Cancel Editing
                </button>
              </div>

              {/* Duplicate Student ID Alert */}
              {duplicateStudentIdWarning && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-400 text-xs text-red-800 dark:text-red-200 flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Duplicate Student ID Detected:</strong> ID{' '}
                    <code className="font-mono">{formAlumni.studentId}</code> is already assigned to{' '}
                    <strong>{duplicateStudentIdWarning}</strong>. Student IDs must be unique.
                  </span>
                </div>
              )}

              {/* Core Identity Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#32143F] dark:text-[#E8DFED] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formAlumni.fullName}
                    onChange={(e) => setFormAlumni({ ...formAlumni, fullName: e.target.value })}
                    placeholder="e.g. Ayman Rahman Chowdhury"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#32143F] dark:text-[#E8DFED] mb-1">
                    Student ID (Unique) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formAlumni.studentId}
                    onChange={(e) => setFormAlumni({ ...formAlumni, studentId: e.target.value })}
                    placeholder="e.g. 170061101"
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#32143F] dark:text-[#E8DFED] mb-1">
                    Assigned Cohort / Batch *
                  </label>
                  <select
                    value={formAlumni.batchId}
                    onChange={(e) => setFormAlumni({ ...formAlumni, batchId: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.intakeYear}–{b.graduationYear})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#32143F] dark:text-[#E8DFED] mb-1">
                    Primary Industry
                  </label>
                  <input
                    type="text"
                    value={formAlumni.primaryIndustry || ''}
                    onChange={(e) => setFormAlumni({ ...formAlumni, primaryIndustry: e.target.value })}
                    placeholder="e.g. Financial Technology (FinTech)"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                  />
                </div>
              </div>

              {/* Headline, Summary, Skills & Location */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#32143F] dark:text-[#E8DFED] mb-1">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    value={formAlumni.professionalHeadline || ''}
                    onChange={(e) =>
                      setFormAlumni({ ...formAlumni, professionalHeadline: e.target.value })
                    }
                    placeholder="e.g. Senior Product Manager — Digital Financial Infrastructure"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#32143F] dark:text-[#E8DFED] mb-1">
                    Profile Image URL (Optional — Uses Monogram Plate if Blank)
                  </label>
                  <input
                    type="url"
                    value={formAlumni.profileImage || ''}
                    onChange={(e) => setFormAlumni({ ...formAlumni, profileImage: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#32143F] dark:text-[#E8DFED] mb-1">
                  Professional Summary
                </label>
                <textarea
                  rows={3}
                  value={formAlumni.professionalSummary || ''}
                  onChange={(e) =>
                    setFormAlumni({ ...formAlumni, professionalSummary: e.target.value })
                  }
                  placeholder="Concise editorial summary of career focus and domain expertise..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#32143F] dark:text-[#E8DFED] mb-1">
                    Skills (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formSkillsText}
                    onChange={(e) => setFormSkillsText(e.target.value)}
                    placeholder="Product Strategy, SQL, SAP IBP..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#32143F] dark:text-[#E8DFED] mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="e.g. Dhaka, Munich, Singapore"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#32143F] dark:text-[#E8DFED] mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    placeholder="e.g. Bangladesh, Germany"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#32143F] dark:text-[#E8DFED] mb-1">
                    Location Privacy
                  </label>
                  <select
                    value={formLocationVisibility}
                    onChange={(e) =>
                      setFormLocationVisibility(e.target.value as typeof formLocationVisibility)
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                  >
                    <option value="city_and_country">Show City &amp; Country</option>
                    <option value="country_only">Show Country Only</option>
                    <option value="hidden">Hide Location Publicly</option>
                  </select>
                </div>
              </div>

              {/* Verification, Visibility & Spotlight Controls */}
              <div className="p-5 rounded-xl bg-[#F7F3F9] dark:bg-[#140A1B] border border-[#E8DFED] dark:border-[#2E1A3B] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#32143F] dark:text-[#E8DFED] mb-1">
                    Verification Status
                  </label>
                  <select
                    value={formAlumni.verificationStatus}
                    onChange={(e) =>
                      setFormAlumni({
                        ...formAlumni,
                        verificationStatus: e.target.value as VerificationStatus,
                      })
                    }
                    className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                  >
                    <option value="unverified">Unverified Archival Entry</option>
                    <option value="partially_verified">Partially Verified Record</option>
                    <option value="verified">Verified Departmental Record</option>
                    <option value="sample_prototype">Prototype Sample Record</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#32143F] dark:text-[#E8DFED] mb-1">
                    Profile Visibility
                  </label>
                  <select
                    value={formAlumni.publicVisibility}
                    onChange={(e) =>
                      setFormAlumni({
                        ...formAlumni,
                        publicVisibility: e.target.value as ProfileVisibility,
                      })
                    }
                    className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                  >
                    <option value="public">Public (Directory &amp; Search)</option>
                    <option value="directory_only">Batch Directory Only</option>
                    <option value="hidden">Hidden / Archived (Admin Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#32143F] dark:text-[#E8DFED] mb-1">
                    Information Source Citation
                  </label>
                  <input
                    type="text"
                    value={formAlumni.informationSource}
                    onChange={(e) =>
                      setFormAlumni({ ...formAlumni, informationSource: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                  />
                </div>

                <div className="flex flex-col justify-center gap-2 pt-3">
                  <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formAlumni.featured}
                      onChange={(e) =>
                        setFormAlumni({ ...formAlumni, featured: e.target.checked })
                      }
                      className="rounded accent-[#663078]"
                    />
                    <span>Designate as Featured Spotlight</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formAlumni.isEntrepreneur)}
                      onChange={(e) =>
                        setFormAlumni({ ...formAlumni, isEntrepreneur: e.target.checked })
                      }
                      className="rounded accent-[#663078]"
                    />
                    <span>Founder / Entrepreneur Track</span>
                  </label>
                </div>
              </div>

              {/* Career Experiences Sub-Editor */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                    Career Journey Experiences ({formExperiences.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setFormExperiences([
                        ...formExperiences,
                        {
                          id: `exp-${Date.now()}`,
                          alumniId: formAlumni.id,
                          organization: '',
                          designation: '',
                          employmentType: 'Full-time',
                          industry: formAlumni.primaryIndustry || 'Technology',
                          careerLevel: 'Mid-Level / Specialist',
                          startDate: '2024-01',
                          isCurrent: formExperiences.length === 0,
                          location: `${formCity || 'Dhaka'}, ${formCountry || 'Bangladesh'}`,
                          description: '',
                        },
                      ])
                    }
                    className="px-3 py-1.5 text-xs font-semibold text-[#663078] dark:text-[#B69AD8] border border-[#E8DFED] dark:border-[#352044] rounded-lg hover:border-[#663078] cursor-pointer"
                  >
                    + Add Experience Role
                  </button>
                </div>

                {formExperiences.map((exp, idx) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#F7F3F9]/40 dark:bg-[#140A1B] space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Designation / Role *"
                        value={exp.designation}
                        onChange={(e) => {
                          const next = [...formExperiences];
                          next[idx] = { ...exp, designation: e.target.value };
                          setFormExperiences(next);
                        }}
                        className="px-3 py-1.5 text-xs rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Organization *"
                        value={exp.organization}
                        onChange={(e) => {
                          const next = [...formExperiences];
                          next[idx] = { ...exp, organization: e.target.value };
                          setFormExperiences(next);
                        }}
                        className="px-3 py-1.5 text-xs rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                      />
                      <input
                        type="text"
                        placeholder="Start YYYY-MM (e.g. 2023-06)"
                        value={exp.startDate}
                        onChange={(e) => {
                          const next = [...formExperiences];
                          next[idx] = { ...exp, startDate: e.target.value };
                          setFormExperiences(next);
                        }}
                        className="px-3 py-1.5 text-xs font-mono rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                      />
                      <div className="flex items-center justify-between gap-2">
                        <label className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={exp.isCurrent}
                            onChange={(e) => {
                              const next = formExperiences.map((item, i) => ({
                                ...item,
                                isCurrent: i === idx ? e.target.checked : item.isCurrent,
                              }));
                              setFormExperiences(next);
                            }}
                            className="accent-[#663078]"
                          />
                          <span>Current Position</span>
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setFormExperiences(formExperiences.filter((_, i) => i !== idx))
                          }
                          className="text-xs text-red-600 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Role description & responsibilities..."
                      value={exp.description || ''}
                      onChange={(e) => {
                        const next = [...formExperiences];
                        next[idx] = { ...exp, description: e.target.value };
                        setFormExperiences(next);
                      }}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#E8DFED] dark:border-[#2E1A3B] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingAlumniId(null);
                    setFormAlumni(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-[#716A79] hover:text-[#25212B] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-semibold text-[#FFFFFF] bg-[#663078] hover:bg-[#32143F] rounded-lg transition-colors cursor-pointer"
                >
                  Save Alumni Dossier
                </button>
              </div>
            </form>
          )}

          {/* Alumni Records Table */}
          <div className="rounded-2xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] overflow-hidden">
            <div className="p-5 border-b border-[#E8DFED] dark:border-[#2E1A3B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <input
                type="text"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="Filter records by name, Student ID, batch, or organization..."
                className="w-full sm:max-w-md px-3.5 py-2 text-xs rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#F7F3F9] dark:bg-[#120917]"
              />
              <span className="text-xs font-mono text-[#716A79] dark:text-[#B69AD8] tabular-nums">
                {filteredAdminProfiles.length} Records Listed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E8DFED] dark:border-[#2E1A3B] bg-[#F7F3F9]/60 dark:bg-[#140A1B] text-[11px] font-mono uppercase tracking-wider text-[#716A79] dark:text-[#B69AD8]">
                    <th className="py-3.5 px-5">Alumnus &amp; Student ID</th>
                    <th className="py-3.5 px-4">Batch</th>
                    <th className="py-3.5 px-4">Current Position</th>
                    <th className="py-3.5 px-4">Verification &amp; Quality</th>
                    <th className="py-3.5 px-4">Spotlight</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DFED] dark:divide-[#2E1A3B] text-xs">
                  {filteredAdminProfiles.map((p) => {
                    const missing = getMissingFields(p);
                    return (
                      <tr
                        key={p.alumni.id}
                        className="hover:bg-[#F7F3F9]/40 dark:hover:bg-[#22122D] transition-colors"
                      >
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <AlumniPortrait
                              profileImage={p.alumni.profileImage}
                              initials={p.alumni.portraitInitials}
                              fullName={p.alumni.fullName}
                              tone={p.alumni.portraitTone}
                              size="sm"
                            />
                            <div>
                              <div className="font-semibold text-sm text-[#25212B] dark:text-[#F7F3F9]">
                                {p.alumni.fullName}
                              </div>
                              <div className="font-mono text-[#716A79] dark:text-[#B69AD8] tabular-nums">
                                ID {p.alumni.studentId} · {p.alumni.publicVisibility}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono tabular-nums text-[#25212B] dark:text-[#E8DFED]">
                          {p.batch.name}
                        </td>
                        <td className="py-4 px-4">
                          {p.currentPosition ? (
                            <div>
                              <div className="font-medium text-[#25212B] dark:text-[#E8DFED]">
                                {p.currentPosition.designation}
                              </div>
                              <div className="text-[#716A79] dark:text-[#B69AD8]/80">
                                {p.currentPosition.organization}
                              </div>
                            </div>
                          ) : (
                            <span className="italic text-[#716A79]">Not recorded</span>
                          )}
                        </td>
                        <td className="py-4 px-4 space-y-1">
                          <div>
                            <VerificationLabel status={p.alumni.verificationStatus} />
                          </div>
                          {missing.length > 0 ? (
                            <div className="text-[11px] text-amber-700 dark:text-amber-300">
                              Missing: {missing.join(', ')}
                            </div>
                          ) : (
                            <div className="text-[11px] text-[#716A79]">All core fields populated</div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <button
                            type="button"
                            onClick={() => toggleFeaturedAlumni(p.alumni.id)}
                            className={`inline-flex items-center gap-1 font-medium cursor-pointer ${
                              p.alumni.featured
                                ? 'text-[#663078] dark:text-[#C8B2E6] font-semibold'
                                : 'text-[#716A79] hover:text-[#25212B]'
                            }`}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${p.alumni.featured ? 'fill-current' : ''}`}
                            />
                            <span>{p.alumni.featured ? 'Featured' : 'Standard'}</span>
                          </button>
                        </td>
                        <td className="py-4 px-5 text-right whitespace-nowrap space-x-3">
                          <button
                            type="button"
                            onClick={() => navigate(`/alumni/${p.alumni.studentId}`)}
                            className="text-[#716A79] hover:text-[#25212B] dark:hover:text-[#FFFFFF] inline-flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>View</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditAlumni(p.alumni.id)}
                            className="font-semibold text-[#663078] dark:text-[#B69AD8] hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmDialog({
                                title: `Delete ${p.alumni.fullName}?`,
                                description: `Are you sure you want to permanently remove the record for ${p.alumni.fullName} (Student ID ${p.alumni.studentId})? This action will remove their career timeline, education records, and location pin.`,
                                confirmLabel: 'Confirm Delete',
                                onConfirm: () => {
                                  deleteAlumniProfile(p.alumni.id);
                                  setConfirmDialog(null);
                                  setStatusBanner({
                                    type: 'success',
                                    message: `Deleted record for ${p.alumni.fullName}.`,
                                  });
                                },
                              })
                            }
                            className="font-semibold text-red-600 dark:text-red-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BATCH MANAGEMENT */}
      {activeTab === 'batches' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {batches.map((b) => (
            <div
              key={b.id}
              className="p-6 rounded-2xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                  {b.name}
                </h3>
                <select
                  aria-label={`Status for ${b.name}`}
                  value={b.status}
                  onChange={(e) => {
                    updateBatch({ ...b, status: e.target.value as BatchStatus });
                    setStatusBanner({
                      type: 'success',
                      message: `Updated ${b.name} status to ${e.target.value}.`,
                    });
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#F7F3F9] dark:bg-[#120917]"
                >
                  <option value="active">Active Directory</option>
                  <option value="coming_soon">Coming Soon</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#716A79] mb-1">
                    Intake Year
                  </label>
                  <input
                    type="number"
                    value={b.intakeYear}
                    onChange={(e) =>
                      updateBatch({ ...b, intakeYear: Number(e.target.value) || b.intakeYear })
                    }
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#716A79] mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    value={b.graduationYear}
                    onChange={(e) =>
                      updateBatch({
                        ...b,
                        graduationYear: Number(e.target.value) || b.graduationYear,
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#716A79] mb-1">
                  Cohort Description
                </label>
                <textarea
                  rows={3}
                  value={b.description}
                  onChange={(e) => updateBatch({ ...b, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: STORY MANAGEMENT */}
      {activeTab === 'stories' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
              Editorial Story Management
            </h2>
            <button
              type="button"
              onClick={() => {
                setEditingStory({
                  id: `sty-${Date.now()}`,
                  slug: `btm-story-${Date.now()}`,
                  title: '',
                  subtitle: '',
                  category: 'Career Journeys',
                  excerpt: '',
                  pullQuote: '',
                  content: [''],
                  coverPlateVariant: 'executive-desk',
                  associatedAlumniId: allProfiles[0]?.alumni.id || '',
                  batchId: 'btm-17',
                  status: 'published',
                  publishedAt: new Date().toISOString().slice(0, 10),
                  readTimeMinutes: 4,
                  isSampleStory: false,
                });
                setStoryParagraphsText('');
              }}
              className="px-4 py-2 text-xs font-semibold text-[#FFFFFF] bg-[#663078] rounded-lg cursor-pointer"
            >
              + Create New Story
            </button>
          </div>

          {editingStory && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const paragraphs = storyParagraphsText
                  .split('\n\n')
                  .map((p) => p.trim())
                  .filter(Boolean);
                const res = saveStory({
                  ...editingStory,
                  content: paragraphs.length > 0 ? paragraphs : ['Story content pending.'],
                });
                if (!res.ok) {
                  setStatusBanner({ type: 'error', message: res.error || 'Could not save story.' });
                  return;
                }
                setStatusBanner({
                  type: 'success',
                  message: `Saved story "${editingStory.title}".`,
                });
                setEditingStory(null);
              }}
              className="p-6 rounded-2xl border-2 border-[#663078] bg-[#FFFFFF] dark:bg-[#190D21] space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Story Title *</label>
                  <input
                    type="text"
                    required
                    value={editingStory.title}
                    onChange={(e) => setEditingStory({ ...editingStory, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={editingStory.slug}
                    onChange={(e) => setEditingStory({ ...editingStory, slug: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Category</label>
                  <select
                    value={editingStory.category}
                    onChange={(e) =>
                      setEditingStory({ ...editingStory, category: e.target.value as StoryCategory })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                  >
                    <option value="Career Journeys">Career Journeys</option>
                    <option value="Founder Stories">Founder Stories</option>
                    <option value="Lessons Learned">Lessons Learned</option>
                    <option value="Professional Achievements">Professional Achievements</option>
                    <option value="Alumni Spotlight">Alumni Spotlight</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Associated Alumnus</label>
                  <select
                    value={editingStory.associatedAlumniId}
                    onChange={(e) =>
                      setEditingStory({ ...editingStory, associatedAlumniId: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                  >
                    {allProfiles.map((p) => (
                      <option key={p.alumni.id} value={p.alumni.id}>
                        {p.alumni.fullName} ({p.alumni.studentId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Publication Status</label>
                  <select
                    value={editingStory.status}
                    onChange={(e) =>
                      setEditingStory({
                        ...editingStory,
                        status: e.target.value as 'published' | 'draft',
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft (Hidden from Public)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Pull Quote</label>
                  <input
                    type="text"
                    value={editingStory.pullQuote || ''}
                    onChange={(e) =>
                      setEditingStory({ ...editingStory, pullQuote: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Short Excerpt *</label>
                <input
                  type="text"
                  required
                  value={editingStory.excerpt}
                  onChange={(e) => setEditingStory({ ...editingStory, excerpt: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Story Paragraphs (Separate paragraphs with a blank line)
                </label>
                <textarea
                  rows={5}
                  value={storyParagraphsText}
                  onChange={(e) => setStoryParagraphsText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#120917]"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStory(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#716A79] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-[#FFFFFF] bg-[#663078] rounded-lg cursor-pointer"
                >
                  Save Story
                </button>
              </div>
            </form>
          )}

          <div className="divide-y divide-[#E8DFED] dark:divide-[#2E1A3B] rounded-2xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21]">
            {stories.map((st) => (
              <div key={st.id} className="p-5 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono text-[#716A79] dark:text-[#B69AD8] tabular-nums">
                    {st.category} · {st.publishedAt} ·{' '}
                    <span className="uppercase font-semibold text-[#663078] dark:text-[#C8B2E6]">
                      {st.status}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-[#32143F] dark:text-[#F7F3F9]">
                    {st.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3 text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingStory({ ...st });
                      setStoryParagraphsText(st.content.join('\n\n'));
                    }}
                    className="font-semibold text-[#663078] dark:text-[#B69AD8] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmDialog({
                        title: `Delete story "${st.title}"?`,
                        description:
                          'Are you sure you want to permanently delete this story from the archive?',
                        confirmLabel: 'Delete Story',
                        onConfirm: () => {
                          deleteStory(st.id);
                          setConfirmDialog(null);
                        },
                      })
                    }
                    className="font-semibold text-red-600 hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DATA QUALITY & DATASET CONTROLS */}
      {activeTab === 'data-quality' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-7 rounded-2xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#FFFFFF] dark:bg-[#190D21] space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
              Prototype Sample Dataset Controls
            </h2>
            <p className="text-sm text-[#716A79] dark:text-[#B69AD8]/90 leading-relaxed">
              To begin entering real verified BTM 17 alumni records from a clean slate, you can clear all
              illustrative sample records (`isSampleRecord: true`) while preserving any custom records you
              created. Or you can restore the initial demonstration dataset at any time.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  setConfirmDialog({
                    title: 'Clear All Sample Demonstration Records?',
                    description:
                      'This will remove all preloaded illustrative sample profiles and sample stories so you can populate only verified real alumni records. You can restore the sample dataset later if needed.',
                    confirmLabel: 'Clear Sample Records',
                    onConfirm: () => {
                      clearSampleRecordsOnly();
                      setConfirmDialog(null);
                      setStatusBanner({
                        type: 'success',
                        message: 'Removed all illustrative sample records.',
                      });
                    },
                  })
                }
                className="px-4 py-2.5 text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-lg cursor-pointer"
              >
                Clear Sample Demonstration Records
              </button>

              <button
                type="button"
                onClick={() =>
                  setConfirmDialog({
                    title: 'Restore Default Sample Dataset?',
                    description:
                      'This will reset the local store back to the default BTM 17 prototype dataset.',
                    confirmLabel: 'Restore Default Dataset',
                    onConfirm: () => {
                      resetToSampleData();
                      setConfirmDialog(null);
                      setStatusBanner({
                        type: 'success',
                        message: 'Restored default BTM 17 prototype sample dataset.',
                      });
                    },
                  })
                }
                className="px-4 py-2.5 text-xs font-semibold text-[#32143F] dark:text-[#F7F3F9] bg-[#F7F3F9] dark:bg-[#23122E] border border-[#E8DFED] dark:border-[#352044] rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Default Sample Dataset</span>
              </button>
            </div>
          </div>

          <div className="p-7 rounded-2xl border border-[#E8DFED] dark:border-[#321E3E] bg-[#F7F3F9]/60 dark:bg-[#190D21] space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
              Production Architecture Readiness
            </h2>
            <p className="text-sm text-[#716A79] dark:text-[#B69AD8]/90 leading-relaxed">
              This Admin interface is structured for seamless transition to production infrastructure:
            </p>
            <ul className="space-y-2 text-xs text-[#716A79] dark:text-[#B69AD8] leading-relaxed">
              <li>
                • <strong>Database Layer:</strong> Entity schemas (`Batch`, `Alumni`, `Education`,
                `Experience`, `Achievement`, `Story`, `LocationRecord`, `SourceRecord`) map 1:1 to relational
                SQL tables or Firestore collections.
              </li>
              <li>
                • <strong>Authentication &amp; RBAC:</strong> Ready to wrap `/admin` routes with verified
                departmental administrator credentials.
              </li>
              <li>
                • <strong>Audit &amp; Verification:</strong> Separates profile creation from verification
                status (`SourceRecord` audit trail).
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Destructive Action Confirmation Modal */}
      {confirmDialog && (
        <div
          className="fixed inset-0 z-50 bg-[#190920]/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setConfirmDialog(null)}
        >
          <div
            className="max-w-md w-full bg-[#FFFFFF] dark:bg-[#1C0F26] border border-[#E8DFED] dark:border-[#392249] rounded-2xl p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
              {confirmDialog.title}
            </h3>
            <p className="text-sm text-[#716A79] dark:text-[#B69AD8] leading-relaxed">
              {confirmDialog.description}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 text-xs font-semibold text-[#716A79] hover:text-[#25212B] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 text-xs font-semibold text-[#FFFFFF] bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
