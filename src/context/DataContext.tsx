import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  Batch,
  Alumni,
  Education,
  Experience,
  Achievement,
  LocationRecord,
  SourceRecord,
  Story,
  CompleteAlumniProfile,
} from '../types/models';
import {
  INITIAL_BATCHES,
  INITIAL_ALUMNI,
  INITIAL_EXPERIENCES,
  INITIAL_EDUCATIONS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_LOCATIONS,
  INITIAL_SOURCE_RECORDS,
  INITIAL_STORIES,
} from '../data/initialDataset';

const STORAGE_KEY = 'btm_alumni_store_v8_no_170061005';
const LEGACY_KEYS = [
  'btm_alumni_store_v1',
  'btm_alumni_store_v2',
  'btm_alumni_store_v3',
  'btm_alumni_store_btm17_real_v4',
  'btm_alumni_store_v5_json',
  'btm_alumni_store_v6',
  'btm_alumni_store_v7_all_batches',
];
const THEME_KEY = 'btm_alumni_theme';

interface StoreState {
  batches: Batch[];
  alumni: Alumni[];
  experiences: Experience[];
  educations: Education[];
  achievements: Achievement[];
  locations: LocationRecord[];
  sourceRecords: SourceRecord[];
  stories: Story[];
}

export interface SaveAlumniPayload {
  alumni: Alumni;
  experiences: Experience[];
  educations: Education[];
  achievements: Achievement[];
  location?: LocationRecord;
  sourceRecord?: SourceRecord;
}

interface DataContextValue extends StoreState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  getCompleteProfile: (studentIdOrId: string) => CompleteAlumniProfile | undefined;
  getAllPublicProfiles: () => CompleteAlumniProfile[];
  getAllAdminProfiles: () => CompleteAlumniProfile[];
  getBatchByCodeOrId: (codeOrId: string) => Batch | undefined;
  getBatchProfiles: (batchId: string, includeHidden?: boolean) => CompleteAlumniProfile[];
  saveAlumniProfile: (payload: SaveAlumniPayload) => { ok: boolean; error?: string };
  deleteAlumniProfile: (alumniId: string) => void;
  toggleFeaturedAlumni: (alumniId: string) => void;
  updateBatch: (batch: Batch) => void;
  saveStory: (story: Story) => { ok: boolean; error?: string };
  deleteStory: (storyId: string) => void;
  resetToSampleData: () => void;
  clearSampleRecordsOnly: () => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

function getDefaultStore(): StoreState {
  return {
    batches: INITIAL_BATCHES,
    alumni: INITIAL_ALUMNI,
    experiences: INITIAL_EXPERIENCES,
    educations: INITIAL_EDUCATIONS,
    achievements: INITIAL_ACHIEVEMENTS,
    locations: INITIAL_LOCATIONS,
    sourceRecords: INITIAL_SOURCE_RECORDS,
    stories: INITIAL_STORIES,
  };
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // ignore storage errors
    }
    return 'light';
  });

  const [store, setStore] = useState<StoreState>(() => {
    try {
      LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          Array.isArray(parsed.batches) &&
          Array.isArray(parsed.alumni) &&
          parsed.alumni.length >= 200 &&
          !parsed.alumni.some((a: Alumni) => a.studentId === '170061005')
        ) {
          return parsed;
        }
      }
    } catch {
      // fallback to default
    }
    return getDefaultStore();
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      // ignore
    }
  }, [store]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const buildCompleteProfile = (alum: Alumni): CompleteAlumniProfile => {
    const batch =
      store.batches.find((b) => b.id === alum.batchId) ||
      store.batches[0] || {
        id: alum.batchId,
        code: '17',
        name: 'BTM 17',
        intakeYear: 2018,
        graduationYear: 2022,
        description: '',
        coverPlateVariant: 'campus-arch',
        status: 'active',
      };

    // Sort experiences from most recent to oldest
    const experiences = store.experiences
      .filter((e) => e.alumniId === alum.id)
      .sort((a, b) => {
        if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
        const endA = a.endDate || a.startDate;
        const endB = b.endDate || b.startDate;
        if (endA !== endB) return endB.localeCompare(endA);
        return b.startDate.localeCompare(a.startDate);
      });

    // Explicit current position resolution: only use currentPositionId or explicit isCurrent flag
    const currentPosition =
      (alum.currentPositionId
        ? experiences.find((e) => e.id === alum.currentPositionId)
        : undefined) || experiences.find((e) => e.isCurrent);

    const educations = store.educations
      .filter((ed) => ed.alumniId === alum.id)
      .sort((a, b) => (b.endYear || b.startYear) - (a.endYear || a.startYear));

    const achievements = store.achievements
      .filter((ac) => ac.alumniId === alum.id)
      .sort((a, b) => b.year - a.year);

    const location = store.locations.find((loc) => loc.alumniId === alum.id);

    const sourceRecords = store.sourceRecords.filter((sr) => sr.alumniId === alum.id);

    const stories = store.stories.filter(
      (st) => st.associatedAlumniId === alum.id && st.status === 'published'
    );

    return {
      alumni: alum,
      batch,
      currentPosition,
      experiences,
      educations,
      achievements,
      location,
      sourceRecords,
      stories,
    };
  };

  const allAdminProfiles = useMemo(
    () => store.alumni.map(buildCompleteProfile),
    [store]
  );

  const allPublicProfiles = useMemo(
    () =>
      allAdminProfiles.filter(
        (p) => p.alumni.publicVisibility === 'public' || p.alumni.publicVisibility === 'directory_only'
      ),
    [allAdminProfiles]
  );

  const getCompleteProfile = (studentIdOrId: string): CompleteAlumniProfile | undefined => {
    const normalized = studentIdOrId.trim().toLowerCase();
    return allAdminProfiles.find(
      (p) =>
        p.alumni.studentId.toLowerCase() === normalized ||
        p.alumni.id.toLowerCase() === normalized
    );
  };

  const getAllPublicProfiles = () => allPublicProfiles;
  const getAllAdminProfiles = () => allAdminProfiles;

  const getBatchByCodeOrId = (codeOrId: string): Batch | undefined => {
    const clean = codeOrId.trim().toLowerCase();
    return store.batches.find(
      (b) =>
        b.code.toLowerCase() === clean ||
        b.id.toLowerCase() === clean ||
        b.name.toLowerCase().replace(/\s+/g, '-') === clean
    );
  };

  const getBatchProfiles = (batchId: string, includeHidden = false): CompleteAlumniProfile[] => {
    const source = includeHidden ? allAdminProfiles : allPublicProfiles;
    return source.filter((p) => p.alumni.batchId === batchId);
  };

  const saveAlumniProfile = (payload: SaveAlumniPayload): { ok: boolean; error?: string } => {
    const { alumni, experiences, educations, achievements, location, sourceRecord } = payload;

    if (!alumni.studentId.trim() || !alumni.fullName.trim()) {
      return { ok: false, error: 'Full Name and Student ID are required fields.' };
    }

    // Check duplicate studentId across other records
    const duplicate = store.alumni.find(
      (existing) =>
        existing.studentId.trim().toLowerCase() === alumni.studentId.trim().toLowerCase() &&
        existing.id !== alumni.id
    );
    if (duplicate) {
      return {
        ok: false,
        error: `Duplicate Student ID detected: ${alumni.studentId} is already assigned to ${duplicate.fullName}.`,
      };
    }

    const updatedAlumni: Alumni = {
      ...alumni,
      lastUpdated: new Date().toISOString().slice(0, 10),
    };

    setStore((prev) => {
      const exists = prev.alumni.some((a) => a.id === updatedAlumni.id);
      const nextAlumni = exists
        ? prev.alumni.map((a) => (a.id === updatedAlumni.id ? updatedAlumni : a))
        : [updatedAlumni, ...prev.alumni];

      const otherExperiences = prev.experiences.filter((e) => e.alumniId !== updatedAlumni.id);
      const otherEducations = prev.educations.filter((ed) => ed.alumniId !== updatedAlumni.id);
      const otherAchievements = prev.achievements.filter((ac) => ac.alumniId !== updatedAlumni.id);
      const otherLocations = prev.locations.filter((loc) => loc.alumniId !== updatedAlumni.id);
      const otherSources = prev.sourceRecords.filter((sr) => sr.alumniId !== updatedAlumni.id);

      return {
        ...prev,
        alumni: nextAlumni,
        experiences: [...otherExperiences, ...experiences],
        educations: [...otherEducations, ...educations],
        achievements: [...otherAchievements, ...achievements],
        locations: location ? [...otherLocations, location] : otherLocations,
        sourceRecords: sourceRecord ? [...otherSources, sourceRecord] : otherSources,
      };
    });

    return { ok: true };
  };

  const deleteAlumniProfile = (alumniId: string) => {
    setStore((prev) => ({
      ...prev,
      alumni: prev.alumni.filter((a) => a.id !== alumniId),
      experiences: prev.experiences.filter((e) => e.alumniId !== alumniId),
      educations: prev.educations.filter((ed) => ed.alumniId !== alumniId),
      achievements: prev.achievements.filter((ac) => ac.alumniId !== alumniId),
      locations: prev.locations.filter((loc) => loc.alumniId !== alumniId),
      sourceRecords: prev.sourceRecords.filter((sr) => sr.alumniId !== alumniId),
    }));
  };

  const toggleFeaturedAlumni = (alumniId: string) => {
    setStore((prev) => ({
      ...prev,
      alumni: prev.alumni.map((a) =>
        a.id === alumniId
          ? { ...a, featured: !a.featured, lastUpdated: new Date().toISOString().slice(0, 10) }
          : a
      ),
    }));
  };

  const updateBatch = (batch: Batch) => {
    setStore((prev) => ({
      ...prev,
      batches: prev.batches.map((b) => (b.id === batch.id ? batch : b)),
    }));
  };

  const saveStory = (story: Story): { ok: boolean; error?: string } => {
    if (!story.title.trim() || !story.slug.trim()) {
      return { ok: false, error: 'Story title and URL slug are required.' };
    }
    const duplicateSlug = store.stories.find(
      (s) => s.slug.toLowerCase() === story.slug.toLowerCase() && s.id !== story.id
    );
    if (duplicateSlug) {
      return { ok: false, error: `URL slug "${story.slug}" is already used by another story.` };
    }

    setStore((prev) => {
      const exists = prev.stories.some((s) => s.id === story.id);
      return {
        ...prev,
        stories: exists
          ? prev.stories.map((s) => (s.id === story.id ? story : s))
          : [story, ...prev.stories],
      };
    });
    return { ok: true };
  };

  const deleteStory = (storyId: string) => {
    setStore((prev) => ({
      ...prev,
      stories: prev.stories.filter((s) => s.id !== storyId),
    }));
  };

  const resetToSampleData = () => {
    const fresh = getDefaultStore();
    setStore(fresh);
  };

  const clearSampleRecordsOnly = () => {
    setStore((prev) => {
      const realAlumni = prev.alumni.filter((a) => !a.isSampleRecord);
      const realIds = new Set(realAlumni.map((a) => a.id));
      return {
        ...prev,
        alumni: realAlumni,
        experiences: prev.experiences.filter((e) => realIds.has(e.alumniId)),
        educations: prev.educations.filter((ed) => realIds.has(ed.alumniId)),
        achievements: prev.achievements.filter((ac) => realIds.has(ac.alumniId)),
        locations: prev.locations.filter((loc) => realIds.has(loc.alumniId)),
        sourceRecords: prev.sourceRecords.filter((sr) => realIds.has(sr.alumniId)),
        stories: prev.stories.filter((s) => !s.isSampleStory),
      };
    });
  };

  return (
    <DataContext.Provider
      value={{
        ...store,
        theme,
        toggleTheme,
        getCompleteProfile,
        getAllPublicProfiles,
        getAllAdminProfiles,
        getBatchByCodeOrId,
        getBatchProfiles,
        saveAlumniProfile,
        deleteAlumniProfile,
        toggleFeaturedAlumni,
        updateBatch,
        saveStory,
        deleteStory,
        resetToSampleData,
        clearSampleRecordsOnly,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextValue => {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within a DataProvider');
  }
  return ctx;
};
