import {
  Batch,
  CompleteAlumniProfile,
  Story,
  CareerStatusCategory,
  StudyLevel,
} from '../types/models';

export interface OverviewFilterState {
  selectedBatchIds: string[]; // Empty array means ALL batches selected
  country: string; // 'all' or specific country
  city: string; // 'all' or specific city
  careerStatus: string; // 'all' or CareerStatusCategory
  industry: string; // 'all' or specific industry
  studyLevel: string; // 'all' or StudyLevel
  organization: string; // 'all' or specific organization
}

export interface KpiMetric {
  id: string;
  label: string;
  confirmedCount: number;
  eligibleDenominator: number;
  unknownOrMissingCount: number;
  percentageOfEligible: number | null;
  denominatorLabel: string;
  subtext: string;
}

export interface CountryDistributionItem {
  country: string;
  count: number;
  pctOfKnownLocations: number;
  pctOfTotalScope: number;
  cities: string[];
  byBatch: Record<string, number>;
}

export interface CityDistributionItem {
  city: string;
  country: string;
  count: number;
  pctOfKnownCities: number;
}

export interface HigherStudyRecordSummary {
  alumniId: string;
  studentId: string;
  fullName: string;
  batchName: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  studyLevel: StudyLevel;
  enrollmentStatus: 'currently_enrolled' | 'completed';
  country: string;
  startYear: number;
  endYear?: number;
  scholarshipOrFunding?: string;
}

export interface UniversityRepresentationItem {
  institution: string;
  country: string;
  currentlyEnrolledCount: number;
  completedAlumniCount: number;
  totalUniqueAlumni: number;
  levels: string[];
  batches: string[];
}

export interface CompanyRepresentationItem {
  organization: string;
  industry: string;
  currentUniqueAlumniCount: number;
  historicalUniqueAlumniCount: number;
  totalUniqueAlumniCount: number;
  batches: string[];
}

export interface IndustryDistributionItem {
  industry: string;
  count: number;
  pctOfKnownIndustry: number;
  pctOfTotalScope: number;
  domesticCount: number;
  internationalCount: number;
  unknownLocationCount: number;
  byBatch: Record<string, number>;
}

export interface BatchComparisonRow {
  batch: Batch;
  totalRecords: number;
  knownLocationCount: number;
  knownLocationPct: number;
  domesticCount: number;
  internationalCount: number;
  unknownLocationCount: number;
  currentlyEmployedCount: number;
  currentlyEmployedPct: number;
  currentlyHigherStudiesCount: number;
  completedPostgradCount: number;
  entrepreneursCount: number;
  uniqueIndustriesCount: number;
  uniqueCompaniesCount: number;
  uniqueCountriesCount: number;
  avgCompletenessPct: number;
  verifiedOrPartialCount: number;
  verifiedOrPartialPct: number;
  sampleRecordCount: number;
  publishedStoriesCount: number;
}

/**
 * Determines whether an education record represents a postgraduate / higher-study program
 * (i.e. beyond the foundational BTM undergraduate degree).
 */
export function isPostgraduateEducation(
  studyLevel?: StudyLevel,
  degree?: string,
  institution?: string
): boolean {
  if (studyLevel) {
    return studyLevel !== 'Bachelors';
  }
  const d = (degree || '').toLowerCase();
  if (
    d.includes('master') ||
    d.includes('msc') ||
    d.includes('mba') ||
    d.includes('phd') ||
    d.includes('doctor') ||
    d.includes('postgraduate')
  ) {
    return true;
  }
  if (institution && !institution.toLowerCase().includes('islamic university of technology')) {
    return true;
  }
  return false;
}

/**
 * Determines if an alumnus is currently enrolled in higher studies based on explicit fields.
 */
export function isCurrentlyInHigherStudies(profile: CompleteAlumniProfile): boolean {
  return profile.educations.some(
    (ed) =>
      isPostgraduateEducation(ed.studyLevel, ed.degree, ed.institution) &&
      ed.enrollmentStatus === 'currently_enrolled'
  );
}

/**
 * Determines if an alumnus has completed at least one postgraduate qualification.
 */
export function hasCompletedHigherStudies(profile: CompleteAlumniProfile): boolean {
  return profile.educations.some(
    (ed) =>
      isPostgraduateEducation(ed.studyLevel, ed.degree, ed.institution) &&
      ed.enrollmentStatus === 'completed'
  );
}

/**
 * Resolves the primary career status of an alumnus without unsupported assumptions.
 */
export function resolvePrimaryCareerStatus(profile: CompleteAlumniProfile): CareerStatusCategory {
  if (profile.alumni.careerStatus) {
    return profile.alumni.careerStatus;
  }
  if (profile.alumni.isEntrepreneur) {
    return 'Entrepreneur / Founder';
  }
  const studyingNow = isCurrentlyInHigherStudies(profile);
  const hasCurrentJob = Boolean(profile.currentPosition);
  if (studyingNow && (!hasCurrentJob || profile.currentPosition?.employmentType === 'Research')) {
    return 'Higher studies';
  }
  if (hasCurrentJob) {
    return 'Employed';
  }
  if (studyingNow) {
    return 'Higher studies';
  }
  return 'Unknown';
}

/**
 * Calculates profile field completeness percentage (out of 7 core public dossier dimensions).
 */
export function calculateProfileCompletenessPct(profile: CompleteAlumniProfile): number {
  let score = 0;
  const totalDimensions = 7;
  if (profile.alumni.professionalHeadline?.trim()) score += 1;
  if (profile.alumni.professionalSummary?.trim()) score += 1;
  if (profile.currentPosition) score += 1;
  if (profile.educations.length > 0) score += 1;
  if (profile.location && profile.location.visibility !== 'hidden' && profile.location.country) score += 1;
  if (profile.alumni.skills.length > 0) score += 1;
  if (profile.alumni.publicLinks.length > 0) score += 1;
  return Math.round((score / totalDimensions) * 100);
}

/**
 * Applies the active Overview global filters to the public profiles list.
 */
export function filterOverviewProfiles(
  profiles: CompleteAlumniProfile[],
  filters: OverviewFilterState
): CompleteAlumniProfile[] {
  return profiles.filter((p) => {
    // 1. Batch filter (empty selectedBatchIds means all batches)
    if (
      filters.selectedBatchIds.length > 0 &&
      !filters.selectedBatchIds.includes(p.batch.id)
    ) {
      return false;
    }

    // 2. Country filter
    if (filters.country !== 'all') {
      const c =
        p.location && p.location.visibility !== 'hidden' ? p.location.country : 'Unknown';
      if (c !== filters.country) return false;
    }

    // 3. City filter
    if (filters.city !== 'all') {
      const city =
        p.location && p.location.visibility === 'city_and_country' ? p.location.city : 'Unknown';
      if (city !== filters.city) return false;
    }

    // 4. Career Status filter
    if (filters.careerStatus !== 'all') {
      const status = resolvePrimaryCareerStatus(p);
      // Also match if filtering by 'Higher studies' and the person is concurrently enrolled in higher studies
      if (filters.careerStatus === 'Higher studies') {
        if (status !== 'Higher studies' && !isCurrentlyInHigherStudies(p)) return false;
      } else if (status !== filters.careerStatus) {
        return false;
      }
    }

    // 5. Industry filter
    if (filters.industry !== 'all') {
      const ind = p.alumni.primaryIndustry || 'Unknown';
      if (ind !== filters.industry) return false;
    }

    // 6. Study Level filter
    if (filters.studyLevel !== 'all') {
      const hasLevel = p.educations.some((ed) => (ed.studyLevel || 'Bachelors') === filters.studyLevel);
      if (!hasLevel) return false;
    }

    // 7. Current Organization filter
    if (filters.organization !== 'all') {
      const org = p.currentPosition?.organization || '';
      if (org !== filters.organization) return false;
    }

    return true;
  });
}

/**
 * Computes all Overview analytics from the filtered profiles and full cohort list.
 */
export function computeOverviewAnalytics(
  filteredProfiles: CompleteAlumniProfile[],
  allPublicProfiles: CompleteAlumniProfile[],
  batches: Batch[],
  stories: Story[],
  selectedBatchIds: string[]
) {
  const totalAlumni = filteredProfiles.length;

  // Location breakdown (counting each person at most once by their current LocationRecord)
  const withKnownLocation = filteredProfiles.filter(
    (p) => p.location && p.location.visibility !== 'hidden' && Boolean(p.location.country?.trim())
  );
  const knownLocationCount = withKnownLocation.length;
  const unknownLocationCount = totalAlumni - knownLocationCount;

  const inBangladesh = withKnownLocation.filter(
    (p) => p.location!.country.trim().toLowerCase() === 'bangladesh'
  );
  const outsideBangladesh = withKnownLocation.filter(
    (p) => p.location!.country.trim().toLowerCase() !== 'bangladesh'
  );

  // Higher studies breakdown (person-level & program-level)
  const currentlyPursuingHigherStudies = filteredProfiles.filter(isCurrentlyInHigherStudies);
  const completedHigherStudies = filteredProfiles.filter(hasCompletedHigherStudies);

  // Career & Employment breakdown (person-level)
  const currentlyEmployed = filteredProfiles.filter((p) => Boolean(p.currentPosition));
  const unknownEmployment = filteredProfiles.filter(
    (p) => !p.currentPosition && !isCurrentlyInHigherStudies(p)
  );
  const entrepreneurs = filteredProfiles.filter(
    (p) => p.alumni.isEntrepreneur || resolvePrimaryCareerStatus(p) === 'Entrepreneur / Founder'
  );
  const workingAndStudyingSimultaneously = filteredProfiles.filter(
    (p) =>
      Boolean(p.currentPosition) &&
      p.currentPosition?.employmentType !== 'Research' &&
      isCurrentlyInHigherStudies(p)
  );

  // Distinct companies, countries, industries
  const uniqueCurrentCompanies = new Set<string>();
  const uniqueAllTimeCompanies = new Set<string>();
  filteredProfiles.forEach((p) => {
    if (p.currentPosition?.organization?.trim()) {
      uniqueCurrentCompanies.add(p.currentPosition.organization.trim());
    }
    p.experiences.forEach((exp) => {
      if (exp.organization?.trim()) {
        uniqueAllTimeCompanies.add(exp.organization.trim());
      }
    });
  });

  const uniqueCountries = new Set(withKnownLocation.map((p) => p.location!.country.trim()));
  const withKnownIndustry = filteredProfiles.filter((p) => Boolean(p.alumni.primaryIndustry?.trim()));
  const uniqueIndustries = new Set(withKnownIndustry.map((p) => p.alumni.primaryIndustry!.trim()));

  const pct = (num: number, den: number): number | null =>
    den > 0 ? Math.round((num / den) * 100) : null;

  // 10 Prominent KPIs
  const kpis: KpiMetric[] = [
    {
      id: 'total-alumni',
      label: 'Total Alumni Records',
      confirmedCount: totalAlumni,
      eligibleDenominator: totalAlumni,
      unknownOrMissingCount: 0,
      percentageOfEligible: totalAlumni > 0 ? 100 : null,
      denominatorLabel: 'Active filter scope',
      subtext: `${filteredProfiles.filter((p) => p.alumni.isSampleRecord).length} prototype sample records`,
    },
    {
      id: 'known-locations',
      label: 'Known Current Locations',
      confirmedCount: knownLocationCount,
      eligibleDenominator: totalAlumni,
      unknownOrMissingCount: unknownLocationCount,
      percentageOfEligible: pct(knownLocationCount, totalAlumni),
      denominatorLabel: `of ${totalAlumni} total records`,
      subtext: `${unknownLocationCount} unreported / hidden`,
    },
    {
      id: 'in-bangladesh',
      label: 'Currently in Bangladesh',
      confirmedCount: inBangladesh.length,
      eligibleDenominator: knownLocationCount,
      unknownOrMissingCount: unknownLocationCount,
      percentageOfEligible: pct(inBangladesh.length, knownLocationCount),
      denominatorLabel: `of ${knownLocationCount} known locations`,
      subtext: `${pct(inBangladesh.length, totalAlumni) ?? 0}% of all ${totalAlumni} records`,
    },
    {
      id: 'outside-bangladesh',
      label: 'Currently Outside Bangladesh',
      confirmedCount: outsideBangladesh.length,
      eligibleDenominator: knownLocationCount,
      unknownOrMissingCount: unknownLocationCount,
      percentageOfEligible: pct(outsideBangladesh.length, knownLocationCount),
      denominatorLabel: `of ${knownLocationCount} known locations`,
      subtext: `Across ${Math.max(0, uniqueCountries.size - (inBangladesh.length > 0 ? 1 : 0))} international countries`,
    },
    {
      id: 'higher-studies-current',
      label: 'Pursuing Higher Studies',
      confirmedCount: currentlyPursuingHigherStudies.length,
      eligibleDenominator: totalAlumni,
      unknownOrMissingCount: 0,
      percentageOfEligible: pct(currentlyPursuingHigherStudies.length, totalAlumni),
      denominatorLabel: `of ${totalAlumni} total records`,
      subtext: `Plus ${completedHigherStudies.length} with completed postgrad degrees`,
    },
    {
      id: 'currently-employed',
      label: 'Currently Employed / Active Role',
      confirmedCount: currentlyEmployed.length,
      eligibleDenominator: totalAlumni,
      unknownOrMissingCount: unknownEmployment.length,
      percentageOfEligible: pct(currentlyEmployed.length, totalAlumni),
      denominatorLabel: `of ${totalAlumni} total records`,
      subtext: `${unknownEmployment.length} with unrecorded employment`,
    },
    {
      id: 'entrepreneurs',
      label: 'Entrepreneurs / Founders',
      confirmedCount: entrepreneurs.length,
      eligibleDenominator: currentlyEmployed.length,
      unknownOrMissingCount: unknownEmployment.length,
      percentageOfEligible: pct(entrepreneurs.length, currentlyEmployed.length),
      denominatorLabel: `of ${currentlyEmployed.length} active role records`,
      subtext: 'Explicitly recorded venture founders',
    },
    {
      id: 'companies-represented',
      label: 'Companies Represented',
      confirmedCount: uniqueCurrentCompanies.size,
      eligibleDenominator: currentlyEmployed.length,
      unknownOrMissingCount: unknownEmployment.length,
      percentageOfEligible: null,
      denominatorLabel: `current employers (${uniqueAllTimeCompanies.size} incl. historical)`,
      subtext: 'Distinct organizations (no duplicate roles)',
    },
    {
      id: 'countries-represented',
      label: 'Countries Represented',
      confirmedCount: uniqueCountries.size,
      eligibleDenominator: knownLocationCount,
      unknownOrMissingCount: unknownLocationCount,
      percentageOfEligible: null,
      denominatorLabel: `across ${knownLocationCount} located alumni`,
      subtext: 'Confirmed public country records',
    },
    {
      id: 'industries-represented',
      label: 'Industries Represented',
      confirmedCount: uniqueIndustries.size,
      eligibleDenominator: withKnownIndustry.length,
      unknownOrMissingCount: totalAlumni - withKnownIndustry.length,
      percentageOfEligible: pct(withKnownIndustry.length, totalAlumni),
      denominatorLabel: `${withKnownIndustry.length}/${totalAlumni} records with industry`,
      subtext: `${totalAlumni - withKnownIndustry.length} missing industry classification`,
    },
  ];

  // Country Distribution Table
  const countryMap = new Map<
    string,
    { count: number; cities: Set<string>; byBatch: Record<string, number> }
  >();
  withKnownLocation.forEach((p) => {
    const c = p.location!.country.trim();
    const entry = countryMap.get(c) || { count: 0, cities: new Set<string>(), byBatch: {} };
    entry.count += 1;
    if (p.location!.visibility === 'city_and_country' && p.location!.city?.trim()) {
      entry.cities.add(p.location!.city.trim());
    }
    entry.byBatch[p.batch.name] = (entry.byBatch[p.batch.name] || 0) + 1;
    countryMap.set(c, entry);
  });

  const countryDistribution: CountryDistributionItem[] = Array.from(countryMap.entries())
    .map(([country, data]) => ({
      country,
      count: data.count,
      pctOfKnownLocations: knownLocationCount > 0 ? Math.round((data.count / knownLocationCount) * 100) : 0,
      pctOfTotalScope: totalAlumni > 0 ? Math.round((data.count / totalAlumni) * 100) : 0,
      cities: Array.from(data.cities).sort(),
      byBatch: data.byBatch,
    }))
    .sort((a, b) => b.count - a.count);

  // City Distribution (strictly from city_and_country records)
  const withKnownCity = withKnownLocation.filter(
    (p) => p.location!.visibility === 'city_and_country' && Boolean(p.location!.city?.trim())
  );
  const cityMap = new Map<string, { city: string; country: string; count: number }>();
  withKnownCity.forEach((p) => {
    const city = p.location!.city.trim();
    const country = p.location!.country.trim();
    const key = `${city}__${country}`;
    const curr = cityMap.get(key) || { city, country, count: 0 };
    curr.count += 1;
    cityMap.set(key, curr);
  });
  const cityDistribution: CityDistributionItem[] = Array.from(cityMap.values())
    .map((item) => ({
      ...item,
      pctOfKnownCities:
        withKnownCity.length > 0 ? Math.round((item.count / withKnownCity.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Higher Studies Detailed Breakdown
  const postgradRecords: HigherStudyRecordSummary[] = [];
  filteredProfiles.forEach((p) => {
    p.educations.forEach((ed) => {
      if (isPostgraduateEducation(ed.studyLevel, ed.degree, ed.institution)) {
        postgradRecords.push({
          alumniId: p.alumni.id,
          studentId: p.alumni.studentId,
          fullName: p.alumni.fullName,
          batchName: p.batch.name,
          institution: ed.institution,
          degree: ed.degree,
          fieldOfStudy: ed.fieldOfStudy,
          studyLevel: ed.studyLevel || 'Masters',
          enrollmentStatus: ed.enrollmentStatus || (ed.endYear && ed.endYear <= 2026 ? 'completed' : 'currently_enrolled'),
          country: ed.country || 'Not specified',
          startYear: ed.startYear,
          endYear: ed.endYear,
          scholarshipOrFunding: ed.scholarshipOrFunding,
        });
      }
    });
  });

  const currentHigherStudiesInBD = postgradRecords.filter(
    (r) => r.enrollmentStatus === 'currently_enrolled' && r.country.toLowerCase() === 'bangladesh'
  );
  const currentHigherStudiesAbroad = postgradRecords.filter(
    (r) =>
      r.enrollmentStatus === 'currently_enrolled' &&
      r.country.toLowerCase() !== 'bangladesh' &&
      r.country !== 'Not specified'
  );

  // Study level distribution across postgraduate records
  const studyLevelMap = new Map<string, { current: number; completed: number; total: number }>();
  postgradRecords.forEach((r) => {
    const cur = studyLevelMap.get(r.studyLevel) || { current: 0, completed: 0, total: 0 };
    if (r.enrollmentStatus === 'currently_enrolled') cur.current += 1;
    else cur.completed += 1;
    cur.total += 1;
    studyLevelMap.set(r.studyLevel, cur);
  });
  const studyLevelDistribution = Array.from(studyLevelMap.entries()).map(([level, counts]) => ({
    level,
    ...counts,
  }));

  // Countries hosting higher-study alumni (both current & completed postgraduate)
  const studyCountryMap = new Map<string, { current: number; completed: number; total: number }>();
  postgradRecords.forEach((r) => {
    const cur = studyCountryMap.get(r.country) || { current: 0, completed: 0, total: 0 };
    if (r.enrollmentStatus === 'currently_enrolled') cur.current += 1;
    else cur.completed += 1;
    cur.total += 1;
    studyCountryMap.set(r.country, cur);
  });
  const studyCountryDistribution = Array.from(studyCountryMap.entries())
    .map(([country, counts]) => ({
      country,
      ...counts,
    }))
    .sort((a, b) => b.total - a.total);

  // Universities represented (postgraduate & undergraduate)
  const uniMap = new Map<
    string,
    {
      country: string;
      currentAlumniIds: Set<string>;
      completedAlumniIds: Set<string>;
      allAlumniIds: Set<string>;
      levels: Set<string>;
      batches: Set<string>;
    }
  >();
  filteredProfiles.forEach((p) => {
    p.educations.forEach((ed) => {
      const inst = ed.institution.trim();
      const entry = uniMap.get(inst) || {
        country: ed.country || 'Bangladesh',
        currentAlumniIds: new Set<string>(),
        completedAlumniIds: new Set<string>(),
        allAlumniIds: new Set<string>(),
        levels: new Set<string>(),
        batches: new Set<string>(),
      };
      entry.allAlumniIds.add(p.alumni.id);
      if (ed.enrollmentStatus === 'currently_enrolled') {
        entry.currentAlumniIds.add(p.alumni.id);
      } else {
        entry.completedAlumniIds.add(p.alumni.id);
      }
      entry.levels.add(ed.studyLevel || 'Bachelors');
      entry.batches.add(p.batch.name);
      uniMap.set(inst, entry);
    });
  });

  const universitiesRepresented: UniversityRepresentationItem[] = Array.from(uniMap.entries())
    .map(([institution, info]) => ({
      institution,
      country: info.country,
      currentlyEnrolledCount: info.currentAlumniIds.size,
      completedAlumniCount: info.completedAlumniIds.size,
      totalUniqueAlumni: info.allAlumniIds.size,
      levels: Array.from(info.levels),
      batches: Array.from(info.batches),
    }))
    .sort((a, b) => b.totalUniqueAlumni - a.totalUniqueAlumni);

  // Career Status Distribution (Person-level mutually exclusive primary status)
  const careerStatusMap = new Map<CareerStatusCategory, number>();
  filteredProfiles.forEach((p) => {
    const st = resolvePrimaryCareerStatus(p);
    careerStatusMap.set(st, (careerStatusMap.get(st) || 0) + 1);
  });
  const careerStatusDistribution = Array.from(careerStatusMap.entries())
    .map(([status, count]) => ({
      status,
      count,
      pct: totalAlumni > 0 ? Math.round((count / totalAlumni) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Seniority / Career-Level Distribution (from explicit currentPosition.careerLevel)
  const seniorityMap = new Map<string, number>();
  filteredProfiles.forEach((p) => {
    const lvl = p.currentPosition?.careerLevel || 'Unknown / No Active Position';
    seniorityMap.set(lvl, (seniorityMap.get(lvl) || 0) + 1);
  });
  const seniorityDistribution = Array.from(seniorityMap.entries())
    .map(([level, count]) => ({
      level,
      count,
      pct: totalAlumni > 0 ? Math.round((count / totalAlumni) * 100) : 0,
      isUnknown: level === 'Unknown / No Active Position',
    }))
    .sort((a, b) => (a.isUnknown === b.isUnknown ? b.count - a.count : a.isUnknown ? 1 : -1));

  // Career Progression & Mobility Metrics
  const multiExperienceProfiles = filteredProfiles.filter((p) => p.experiences.length > 1);
  const totalExperienceRecords = filteredProfiles.reduce((acc, p) => acc + p.experiences.length, 0);
  const domesticEmploymentCount = currentlyEmployed.filter((p) => {
    const c = p.currentPosition?.country || (p.currentPosition?.location.toLowerCase().includes('bangladesh') ? 'Bangladesh' : '');
    return c.toLowerCase() === 'bangladesh';
  }).length;
  const internationalEmploymentCount = currentlyEmployed.length - domesticEmploymentCount;

  // Industry Distribution
  const indMap = new Map<
    string,
    {
      count: number;
      domesticCount: number;
      internationalCount: number;
      unknownLocationCount: number;
      byBatch: Record<string, number>;
    }
  >();
  filteredProfiles.forEach((p) => {
    const ind = p.alumni.primaryIndustry?.trim() || 'Unknown / Unspecified';
    const cur = indMap.get(ind) || {
      count: 0,
      domesticCount: 0,
      internationalCount: 0,
      unknownLocationCount: 0,
      byBatch: {},
    };
    cur.count += 1;
    if (!p.location || p.location.visibility === 'hidden' || !p.location.country) {
      cur.unknownLocationCount += 1;
    } else if (p.location.country.toLowerCase() === 'bangladesh') {
      cur.domesticCount += 1;
    } else {
      cur.internationalCount += 1;
    }
    cur.byBatch[p.batch.name] = (cur.byBatch[p.batch.name] || 0) + 1;
    indMap.set(ind, cur);
  });

  const industryDistribution: IndustryDistributionItem[] = Array.from(indMap.entries())
    .map(([industry, data]) => ({
      industry,
      count: data.count,
      pctOfKnownIndustry:
        industry !== 'Unknown / Unspecified' && withKnownIndustry.length > 0
          ? Math.round((data.count / withKnownIndustry.length) * 100)
          : 0,
      pctOfTotalScope: totalAlumni > 0 ? Math.round((data.count / totalAlumni) * 100) : 0,
      domesticCount: data.domesticCount,
      internationalCount: data.internationalCount,
      unknownLocationCount: data.unknownLocationCount,
      byBatch: data.byBatch,
    }))
    .sort((a, b) =>
      a.industry === 'Unknown / Unspecified'
        ? 1
        : b.industry === 'Unknown / Unspecified'
        ? -1
        : b.count - a.count
    );

  // Company & Organization Insights (counting UNIQUE alumni, never double-counting multiple roles at the same company)
  const companyMap = new Map<
    string,
    {
      industry: string;
      currentAlumniIds: Set<string>;
      historicalAlumniIds: Set<string>;
      allAlumniIds: Set<string>;
      batches: Set<string>;
    }
  >();
  filteredProfiles.forEach((p) => {
    p.experiences.forEach((exp) => {
      const org = exp.organization?.trim();
      if (!org) return;
      const entry = companyMap.get(org) || {
        industry: exp.industry || p.alumni.primaryIndustry || 'Unspecified',
        currentAlumniIds: new Set<string>(),
        historicalAlumniIds: new Set<string>(),
        allAlumniIds: new Set<string>(),
        batches: new Set<string>(),
      };
      entry.allAlumniIds.add(p.alumni.id);
      if (p.currentPosition?.id === exp.id || exp.isCurrent) {
        entry.currentAlumniIds.add(p.alumni.id);
      } else {
        entry.historicalAlumniIds.add(p.alumni.id);
      }
      entry.batches.add(p.batch.name);
      companyMap.set(org, entry);
    });
  });

  const companyRepresentation: CompanyRepresentationItem[] = Array.from(companyMap.entries())
    .map(([organization, info]) => ({
      organization,
      industry: info.industry,
      currentUniqueAlumniCount: info.currentAlumniIds.size,
      historicalUniqueAlumniCount: info.historicalAlumniIds.size,
      totalUniqueAlumniCount: info.allAlumniIds.size,
      batches: Array.from(info.batches),
    }))
    .sort((a, b) => b.currentUniqueAlumniCount - a.currentUniqueAlumniCount || b.totalUniqueAlumniCount - a.totalUniqueAlumniCount);

  // Skills & Certifications Aggregation
  const skillCounts = new Map<string, number>();
  const certCounts = new Map<string, number>();
  filteredProfiles.forEach((p) => {
    p.alumni.skills.forEach((sk) => {
      const clean = sk.trim();
      if (clean) skillCounts.set(clean, (skillCounts.get(clean) || 0) + 1);
    });
    p.educations.forEach((ed) => {
      (ed.certifications || []).forEach((c) => {
        const clean = c.trim();
        if (clean) certCounts.set(clean, (certCounts.get(clean) || 0) + 1);
      });
    });
  });

  const topSkills = Array.from(skillCounts.entries())
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count);

  const certificationsList = Array.from(certCounts.entries())
    .map(([certification, count]) => ({ certification, count }))
    .sort((a, b) => b.count - a.count);

  // Highest Recorded Qualification Distribution (Completed vs Currently Enrolled)
  const highestQualificationDistribution = (() => {
    let completedPhd = 0;
    let enrolledPhd = 0;
    let completedMasters = 0;
    let enrolledMasters = 0;
    let completedBachelorsOnly = 0;
    let unrecorded = 0;

    filteredProfiles.forEach((p) => {
      if (p.educations.length === 0) {
        unrecorded += 1;
        return;
      }
      const hasEnrolledPhd = p.educations.some(
        (e) => e.studyLevel === 'PhD / Doctoral' && e.enrollmentStatus === 'currently_enrolled'
      );
      const hasCompletedPhd = p.educations.some(
        (e) => e.studyLevel === 'PhD / Doctoral' && e.enrollmentStatus === 'completed'
      );
      const hasEnrolledMasters = p.educations.some(
        (e) => e.studyLevel === 'Masters' && e.enrollmentStatus === 'currently_enrolled'
      );
      const hasCompletedMasters = p.educations.some(
        (e) => e.studyLevel === 'Masters' && e.enrollmentStatus === 'completed'
      );

      if (hasCompletedPhd) completedPhd += 1;
      else if (hasEnrolledPhd) enrolledPhd += 1;
      else if (hasCompletedMasters) completedMasters += 1;
      else if (hasEnrolledMasters) enrolledMasters += 1;
      else completedBachelorsOnly += 1;
    });

    return [
      { label: 'Completed PhD / Doctoral Degree', count: completedPhd, category: 'completed' },
      { label: 'Currently Enrolled PhD / Doctoral Researcher', count: enrolledPhd, category: 'enrolled' },
      { label: 'Completed Master’s Degree (MSc / MBA)', count: completedMasters, category: 'completed' },
      { label: 'Currently Enrolled Master’s Candidate', count: enrolledMasters, category: 'enrolled' },
      { label: 'Completed Bachelor’s (BSc in BTM)', count: completedBachelorsOnly, category: 'completed' },
      { label: 'No Education Record Populated', count: unrecorded, category: 'missing' },
    ].filter((x) => x.count > 0);
  })();

  // Batch Comparison Table across all 4 batches (BTM 17, 18, 19, 20)
  const batchComparisons: BatchComparisonRow[] = batches.map((batch) => {
    const bProfiles = allPublicProfiles.filter((p) => p.batch.id === batch.id);
    const n = bProfiles.length;
    const bLoc = bProfiles.filter(
      (p) => p.location && p.location.visibility !== 'hidden' && Boolean(p.location.country?.trim())
    );
    const bDom = bLoc.filter((p) => p.location!.country.trim().toLowerCase() === 'bangladesh');
    const bIntl = bLoc.filter((p) => p.location!.country.trim().toLowerCase() !== 'bangladesh');
    const bEmp = bProfiles.filter((p) => Boolean(p.currentPosition));
    const bHigher = bProfiles.filter(isCurrentlyInHigherStudies);
    const bPostgradDone = bProfiles.filter(hasCompletedHigherStudies);
    const bEnt = bProfiles.filter((p) => p.alumni.isEntrepreneur);
    const bInd = new Set(bProfiles.map((p) => p.alumni.primaryIndustry?.trim()).filter(Boolean));
    const bComp = new Set(bProfiles.map((p) => p.currentPosition?.organization?.trim()).filter(Boolean));
    const bCountries = new Set(bLoc.map((p) => p.location!.country.trim()));
    const avgComp =
      n > 0
        ? Math.round(
            bProfiles.reduce((acc, p) => acc + calculateProfileCompletenessPct(p), 0) / n
          )
        : 0;
    const bVerified = bProfiles.filter(
      (p) =>
        p.alumni.verificationStatus === 'verified' ||
        p.alumni.verificationStatus === 'partially_verified'
    );
    const bSample = bProfiles.filter((p) => p.alumni.isSampleRecord);
    const bStories = stories.filter((s) => s.batchId === batch.id && s.status === 'published');

    return {
      batch,
      totalRecords: n,
      knownLocationCount: bLoc.length,
      knownLocationPct: n > 0 ? Math.round((bLoc.length / n) * 100) : 0,
      domesticCount: bDom.length,
      internationalCount: bIntl.length,
      unknownLocationCount: n - bLoc.length,
      currentlyEmployedCount: bEmp.length,
      currentlyEmployedPct: n > 0 ? Math.round((bEmp.length / n) * 100) : 0,
      currentlyHigherStudiesCount: bHigher.length,
      completedPostgradCount: bPostgradDone.length,
      entrepreneursCount: bEnt.length,
      uniqueIndustriesCount: bInd.size,
      uniqueCompaniesCount: bComp.size,
      uniqueCountriesCount: bCountries.size,
      avgCompletenessPct: avgComp,
      verifiedOrPartialCount: bVerified.length,
      verifiedOrPartialPct: n > 0 ? Math.round((bVerified.length / n) * 100) : 0,
      sampleRecordCount: bSample.length,
      publishedStoriesCount: bStories.length,
    };
  });

  // Data Quality & Coverage Metrics
  const dataQualityMetrics = [
    {
      field: 'Profile Photograph Uploaded',
      populatedCount: filteredProfiles.filter((p) => Boolean(p.alumni.profileImage?.trim())).length,
      denominator: totalAlumni,
      note: 'Profiles without uploaded photos render monogram portrait plates',
    },
    {
      field: 'Recorded Current Employment Position',
      populatedCount: currentlyEmployed.length,
      denominator: totalAlumni,
      note: 'Explicit current role reference (currentPositionId or isCurrent)',
    },
    {
      field: 'Known Public Geographic Location',
      populatedCount: knownLocationCount,
      denominator: totalAlumni,
      note: 'City or country approved for public directory display',
    },
    {
      field: 'Academic Education Records',
      populatedCount: filteredProfiles.filter((p) => p.educations.length > 0).length,
      denominator: totalAlumni,
      note: 'At least one undergraduate or postgraduate record on file',
    },
    {
      field: 'Chronological Career History',
      populatedCount: filteredProfiles.filter((p) => p.experiences.length > 0).length,
      denominator: totalAlumni,
      note: 'At least one current or historical professional role recorded',
    },
    {
      field: 'Public Professional Links (LinkedIn / Scholar / Portfolio)',
      populatedCount: filteredProfiles.filter((p) => p.alumni.publicLinks.length > 0).length,
      denominator: totalAlumni,
      note: 'Approved external professional profile links',
    },
    {
      field: 'Documented Information Source Citation',
      populatedCount: filteredProfiles.filter((p) => Boolean(p.alumni.informationSource?.trim())).length,
      denominator: totalAlumni,
      note: 'Provenance citation recorded on profile',
    },
  ].map((item) => ({
    ...item,
    missingCount: item.denominator - item.populatedCount,
    pct: item.denominator > 0 ? Math.round((item.populatedCount / item.denominator) * 100) : 0,
  }));

  const verificationBreakdown = [
    {
      status: 'verified',
      label: 'Verified Departmental Record',
      count: filteredProfiles.filter((p) => p.alumni.verificationStatus === 'verified').length,
    },
    {
      status: 'partially_verified',
      label: 'Partially Verified Record',
      count: filteredProfiles.filter((p) => p.alumni.verificationStatus === 'partially_verified').length,
    },
    {
      status: 'sample_prototype',
      label: 'Prototype Sample Record (Illustrative)',
      count: filteredProfiles.filter((p) => p.alumni.verificationStatus === 'sample_prototype').length,
    },
    {
      status: 'unverified',
      label: 'Unverified Archival Entry',
      count: filteredProfiles.filter((p) => p.alumni.verificationStatus === 'unverified').length,
    },
  ].map((v) => ({
    ...v,
    pct: totalAlumni > 0 ? Math.round((v.count / totalAlumni) * 100) : 0,
  }));

  // Scope Label
  const activeScopeLabel =
    selectedBatchIds.length === 0 || selectedBatchIds.length === batches.length
      ? 'All 4 Batches Combined (BTM 17–20)'
      : batches
          .filter((b) => selectedBatchIds.includes(b.id))
          .map((b) => b.name)
          .join(' + ');

  return {
    activeScopeLabel,
    totalAlumni,
    kpis,
    geographic: {
      knownLocationCount,
      unknownLocationCount,
      inBangladeshCount: inBangladesh.length,
      outsideBangladeshCount: outsideBangladesh.length,
      inBangladeshPctOfKnown: pct(inBangladesh.length, knownLocationCount) ?? 0,
      outsideBangladeshPctOfKnown: pct(outsideBangladesh.length, knownLocationCount) ?? 0,
      countryDistribution,
      cityDistribution,
    },
    higherStudies: {
      currentlyEnrolledProfiles: currentlyPursuingHigherStudies,
      completedPostgradProfiles: completedHigherStudies,
      postgradRecords,
      currentInBangladeshCount: currentHigherStudiesInBD.length,
      currentAbroadCount: currentHigherStudiesAbroad.length,
      studyLevelDistribution,
      studyCountryDistribution,
      universitiesRepresented,
    },
    career: {
      currentlyEmployedCount: currentlyEmployed.length,
      unknownEmploymentCount: unknownEmployment.length,
      workingAndStudyingCount: workingAndStudyingSimultaneously.length,
      domesticEmploymentCount,
      internationalEmploymentCount,
      multiExperienceProfilesCount: multiExperienceProfiles.length,
      totalExperienceRecords,
      careerStatusDistribution,
      seniorityDistribution,
    },
    industryDistribution,
    companyRepresentation,
    batchComparisons,
    educationAndSkills: {
      highestQualificationDistribution,
      topSkills,
      certificationsList,
    },
    entrepreneurshipAndAchievements: {
      entrepreneurs,
      achievements: filteredProfiles.flatMap((p) =>
        p.achievements.map((ach) => ({
          ...ach,
          alumniName: p.alumni.fullName,
          studentId: p.alumni.studentId,
          batchName: p.batch.name,
        }))
      ),
      featuredProfiles: filteredProfiles.filter((p) => p.alumni.featured),
      publishedStories: stories.filter(
        (s) =>
          s.status === 'published' &&
          (selectedBatchIds.length === 0 || selectedBatchIds.includes(s.batchId))
      ),
    },
    dataQuality: {
      dataQualityMetrics,
      verificationBreakdown,
    },
  };
}
