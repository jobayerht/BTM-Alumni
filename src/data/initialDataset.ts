import {
  Batch,
  Alumni,
  Education,
  Experience,
  Achievement,
  LocationRecord,
  SourceRecord,
  Story,
  CareerStatusCategory,
} from '../types/models';
import rawAlumniJson from './btmAlumniData.json';
import batchRosterJson from './btmBatchRoster.json';

export const INITIAL_BATCHES: Batch[] = [
  {
    id: 'btm-17',
    code: '17',
    name: 'BTM 17',
    intakeYear: 2018,
    graduationYear: 2022,
    description:
      'The first graduating batch of the Department of Business and Technology Management at Islamic University of Technology (IUT), integrating business strategy with systems engineering, supply chain analytics, and technology management.',
    coverPlateVariant: 'campus-arch',
    status: 'active',
  },
  {
    id: 'btm-18',
    code: '18',
    name: 'BTM 18',
    intakeYear: 2019,
    graduationYear: 2023,
    description:
      'The second graduating batch of the Department of Business and Technology Management at Islamic University of Technology (IUT).',
    coverPlateVariant: 'seminar-hall',
    status: 'active',
  },
  {
    id: 'btm-19',
    code: '19',
    name: 'BTM 19',
    intakeYear: 2020,
    graduationYear: 2024,
    description:
      'The third graduating batch of the Department of Business and Technology Management at Islamic University of Technology (IUT).',
    coverPlateVariant: 'quadrangle',
    status: 'active',
  },
  {
    id: 'btm-20',
    code: '20',
    name: 'BTM 20',
    intakeYear: 2021,
    graduationYear: 2025,
    description:
      'The fourth graduating batch of the Department of Business and Technology Management at Islamic University of Technology (IUT).',
    coverPlateVariant: 'library-wing',
    status: 'active',
  },
];

const MONTH_MAP: Record<string, { full: string; num: string }> = {
  jan: { full: 'January', num: '01' },
  january: { full: 'January', num: '01' },
  feb: { full: 'February', num: '02' },
  february: { full: 'February', num: '02' },
  mar: { full: 'March', num: '03' },
  march: { full: 'March', num: '03' },
  apr: { full: 'April', num: '04' },
  april: { full: 'April', num: '04' },
  may: { full: 'May', num: '05' },
  jun: { full: 'June', num: '06' },
  june: { full: 'June', num: '06' },
  jul: { full: 'July', num: '07' },
  july: { full: 'July', num: '07' },
  aug: { full: 'August', num: '08' },
  august: { full: 'August', num: '08' },
  sep: { full: 'September', num: '09' },
  sept: { full: 'September', num: '09' },
  september: { full: 'September', num: '09' },
  oct: { full: 'October', num: '10' },
  october: { full: 'October', num: '10' },
  nov: { full: 'November', num: '11' },
  november: { full: 'November', num: '11' },
  dec: { full: 'December', num: '12' },
  december: { full: 'December', num: '12' },
};

export function expandMonthNames(input: string): string {
  if (!input) return '';
  const isoMatch = input.trim().match(/^(\d{4})-(\d{2})-\d{2}(?:\s+\d{2}:\d{2}:\d{2})?$/);
  if (isoMatch) {
    const year = isoMatch[1];
    const monthNum = isoMatch[2];
    const entry = Object.values(MONTH_MAP).find((m) => m.num === monthNum);
    return entry ? `${entry.full} ${year}` : year;
  }

  return input
    .replace(
      /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.?(\s+\d{4})/gi,
      (_, m, rest) => {
        const mapped = MONTH_MAP[m.toLowerCase()];
        return mapped ? `${mapped.full}${rest}` : `${m}${rest}`;
      }
    )
    .replace(/\s*[–—-]\s*/g, ' – ');
}

function parseSortableDate(
  periodLabel: string,
  orderIndex: number,
  totalItems: number
): {
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
} {
  const clean = periodLabel.trim();
  const isCurrent = /\bpresent\b|\bcurrent\b/i.test(clean);

  // Use a descending synthetic key based on array order so undated entries stay in their exact JSON sequence
  const orderKey = String(Math.max(1, 99 - orderIndex)).padStart(2, '0');
  void totalItems;

  const monthYearMatches = Array.from(
    clean.matchAll(
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b/gi
    )
  );

  if (monthYearMatches.length >= 2) {
    const m1 = MONTH_MAP[monthYearMatches[0][1].toLowerCase()]?.num || '01';
    const y1 = monthYearMatches[0][2];
    const m2 = MONTH_MAP[monthYearMatches[1][1].toLowerCase()]?.num || '01';
    const y2 = monthYearMatches[1][2];
    return {
      startDate: `${y1}-${m1}`,
      endDate: isCurrent ? undefined : `${y2}-${m2}`,
      isCurrent,
    };
  }

  if (monthYearMatches.length === 1) {
    const m1 = MONTH_MAP[monthYearMatches[0][1].toLowerCase()]?.num || '01';
    const y1 = monthYearMatches[0][2];
    const secondYearMatch = clean.match(/–\s*(\d{4})\b/);
    return {
      startDate: `${y1}-${m1}`,
      endDate: isCurrent ? undefined : secondYearMatch ? `${secondYearMatch[1]}-01` : `${y1}-${m1}`,
      isCurrent,
    };
  }

  if (isCurrent) {
    return {
      startDate: `2026-${orderKey}`,
      endDate: undefined,
      isCurrent: true,
    };
  }

  return {
    startDate: `2024-${orderKey}`,
    endDate: `2024-${orderKey}`,
    isCurrent: false,
  };
}

function normalizeOrganizationName(org: string): string {
  const trimmed = org.trim();
  if (/^Singer Bangladesh Ltd\s*\/\s*Singer Beko$/i.test(trimmed)) {
    return 'Singer Bangladesh Ltd. (Singer Beko)';
  }
  return trimmed;
}

function parseRawWorkExperience(raw: {
  organization: string;
  designation: string;
  employmentType: string;
  period: string;
  location: string;
}): {
  skip: boolean;
  organization: string;
  designation: string;
  employmentStatusLabel: 'Full-Time' | 'Internship' | 'Other';
  employmentType: Experience['employmentType'];
  periodLabel: string;
  location: string;
} {
  if (/\(second entry in source\)/i.test(raw.designation)) {
    return {
      skip: true,
      organization: '',
      designation: '',
      employmentStatusLabel: 'Other',
      employmentType: 'Other',
      periodLabel: '',
      location: '',
    };
  }

  const organization = normalizeOrganizationName(raw.organization);
  let designation = raw.designation.trim();
  let location = (raw.location || '').trim();
  let periodRaw = (raw.period || '').trim();

  designation = designation
    .replace(/\s*\(profile also describes duties.*?\)/i, '')
    .replace(/\s*\(source also lists.*?\)/i, '')
    .trim();

  if (designation.includes('—')) {
    const [leftPart, rightPart = ''] = designation.split(/\s*—\s*/, 2);
    designation = leftPart.trim();

    if (rightPart.includes(';')) {
      const [dateFragment, locFragment] = rightPart.split(/\s*;\s*/, 2);
      if (locFragment && !location) {
        location = locFragment.trim();
      }
      if (dateFragment) {
        const df = dateFragment.trim();
        if (/^current$/i.test(df)) {
          periodRaw = 'Present';
        } else if (
          !periodRaw ||
          periodRaw === raw.designation.trim() ||
          /^\d{4}-\d{2}-\d{2}/.test(periodRaw)
        ) {
          periodRaw = df;
        }
      }
    } else if (
      /dates? and role not provided/i.test(rightPart) ||
      /dates? not provided/i.test(rightPart)
    ) {
      periodRaw = 'Dates not provided';
    }
  }

  if (/^Internship report:\s*/i.test(designation)) {
    designation = designation.replace(/^Internship report:\s*/i, 'Internship — ');
  }

  let periodLabel = '';
  if (!periodRaw || /dates? (and role )?not provided/i.test(periodRaw)) {
    periodLabel = 'Dates not provided';
  } else if (/^current$/i.test(periodRaw)) {
    periodLabel = 'Present';
  } else {
    periodLabel = expandMonthNames(periodRaw);
  }

  const rawType = (raw.employmentType || '').trim().toLowerCase();
  let employmentStatusLabel: 'Full-Time' | 'Internship' | 'Other' = 'Other';
  let employmentType: Experience['employmentType'] = 'Other';

  if (rawType === 'full-time' || rawType === 'full time') {
    employmentStatusLabel = 'Full-Time';
    employmentType = 'Full-time';
  } else if (rawType === 'intern' || rawType === 'internship') {
    employmentStatusLabel = 'Internship';
    employmentType = 'Internship';
  } else {
    employmentStatusLabel = 'Other';
    employmentType = 'Other';
  }

  return {
    skip: false,
    organization,
    designation,
    employmentStatusLabel,
    employmentType,
    periodLabel,
    location,
  };
}

function parseRawHigherEducation(raw: {
  institution: string;
  degreeProgram: string;
  period: string;
}): {
  exclude: boolean;
  institution: string;
  degree: string;
  periodLabel: string;
  locationLabel: string;
  country?: string;
  startYear: number;
  endYear?: number;
  enrollmentStatus: 'completed' | 'currently_enrolled';
} {
  const institution = (raw.institution || '').trim();
  const degreeRaw = (raw.degreeProgram || '').trim();
  const periodRaw = (raw.period || '').trim();

  if (
    /islamic university of technology|\biut\b/i.test(institution) ||
    /\b(ssc|hsc|high school|secondary school|higher secondary|o levels|a levels)\b/i.test(degreeRaw)
  ) {
    return {
      exclude: true,
      institution: '',
      degree: '',
      periodLabel: '',
      locationLabel: '',
      startYear: 2022,
      enrollmentStatus: 'completed',
    };
  }

  let degree = degreeRaw
    .replace(/\s*\(as listed\)/gi, '')
    .replace(/\s*\(listed\)/gi, '')
    .trim();

  let periodLabel = '';

  const listedDateMatch = degree.match(/listed as ['"](?:In\s+)?([^'"]+)['"]/i);
  if (listedDateMatch) {
    periodLabel = expandMonthNames(listedDateMatch[1].trim());
    degree = 'Degree / program not specified';
  } else if (/exact qualification\/year unclear/i.test(degree)) {
    degree = 'Degree / program not specified';
    periodLabel = '';
  } else if (degree.includes('—')) {
    const [degPart, datePart = ''] = degree.split(/\s*—\s*/, 2);
    degree = degPart.trim();
    if (datePart && !/dates? not provided/i.test(datePart)) {
      periodLabel = expandMonthNames(datePart.trim());
    }
  }

  if (!periodLabel && periodRaw && !periodRaw.includes('/')) {
    if (!/dates? not provided/i.test(periodRaw)) {
      periodLabel = expandMonthNames(periodRaw);
    }
  }

  let locationLabel = '';
  let country: string | undefined = undefined;
  if (/east west university|north south university|brac university/i.test(institution)) {
    locationLabel = 'Dhaka, Bangladesh';
    country = 'Bangladesh';
  } else if (/deakin university/i.test(institution) || /australia\/melbourne/i.test(periodRaw)) {
    locationLabel = 'Melbourne, Australia';
    country = 'Australia';
  } else if (/scaler/i.test(institution)) {
    country = 'India';
  }

  const years = Array.from(periodLabel.matchAll(/\b(20\d{2})\b/g)).map((m) => Number(m[1]));
  const startYear = years[0] || 2023;
  const endYear = years.length > 1 ? years[1] : years[0];
  const enrollmentStatus: 'completed' | 'currently_enrolled' =
    (endYear && endYear >= 2026) || /march 2025/i.test(periodLabel)
      ? 'currently_enrolled'
      : 'completed';

  return {
    exclude: false,
    institution,
    degree,
    periodLabel,
    locationLabel,
    country,
    startYear,
    endYear,
    enrollmentStatus,
  };
}

function getInitials(fullName: string): string {
  const cleaned = fullName.replace(/^Md\.?\s+/i, '').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'BA';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const PORTRAIT_TONES: Alumni['portraitTone'][] = [
  'plum',
  'amethyst',
  'mulberry',
  'slate-violet',
  'indigo-orchid',
];

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Dhaka|Bangladesh': { lat: 23.8103, lng: 90.4125 },
  '|Bangladesh': { lat: 23.8103, lng: 90.4125 },
  'Melbourne|Australia': { lat: -37.8136, lng: 144.9631 },
};

const builtAlumni: Alumni[] = [];
const builtExperiences: Experience[] = [];
const builtEducations: Education[] = [];
const builtLocations: LocationRecord[] = [];
const builtSourceRecords: SourceRecord[] = [];

// Index detailed records from btmAlumniData.json by studentId
const detailedByStudentId = new Map<string, (typeof rawAlumniJson.alumni)[number]>();
rawAlumniJson.alumni.forEach((rec) => {
  detailedByStudentId.set(rec.studentId.trim(), rec);
});

// Merge full batch roster (BTM 17, 18, 19, 20) with detailed records
const mergedRoster: {
  studentId: string;
  fullName: string;
  batchLabel?: string;
  detailed?: (typeof rawAlumniJson.alumni)[number];
}[] = [];
const seenStudentIds = new Set<string>();

batchRosterJson.forEach((entry) => {
  const sid = entry.studentId.trim();
  if (!sid || seenStudentIds.has(sid)) return;
  seenStudentIds.add(sid);
  const detailed = detailedByStudentId.get(sid);
  mergedRoster.push({
    studentId: sid,
    fullName: (detailed?.fullName || entry.name || '').trim(),
    batchLabel: entry.batch,
    detailed,
  });
});

rawAlumniJson.alumni.forEach((rec) => {
  const sid = rec.studentId.trim();
  if (!sid || seenStudentIds.has(sid)) return;
  seenStudentIds.add(sid);
  mergedRoster.push({
    studentId: sid,
    fullName: rec.fullName.trim(),
    detailed: rec,
  });
});

mergedRoster.forEach((item, index) => {
  const studentId = item.studentId;
  const alumniId = `alum-${studentId}`;
  const batchMatch = item.batchLabel?.match(/\b(17|18|19|20)\b/);
  const batchPrefix = batchMatch ? batchMatch[1] : studentId.slice(0, 2);
  const batchId = ['17', '18', '19', '20'].includes(batchPrefix) ? `btm-${batchPrefix}` : 'btm-17';

  const record = item.detailed;
  const seenExpKeys = new Set<string>();
  const parsedExps: Experience[] = [];

  if (record && Array.isArray(record.workExperience)) {
    record.workExperience.forEach((rawExp, expIdx) => {
      const parsed = parseRawWorkExperience(rawExp);
      if (parsed.skip) return;

      const dedupeKey = `${parsed.organization.toLowerCase()}|${parsed.designation.toLowerCase()}|${parsed.periodLabel.toLowerCase()}`;
      if (seenExpKeys.has(dedupeKey)) return;
      seenExpKeys.add(dedupeKey);

      const sortMeta = parseSortableDate(parsed.periodLabel, expIdx, record.workExperience.length);
      const expId = `exp-${studentId}-${expIdx + 1}`;
      const country = parsed.location.includes('United Kingdom')
        ? 'United Kingdom'
        : parsed.location.includes('Bangladesh')
        ? 'Bangladesh'
        : undefined;

      parsedExps.push({
        id: expId,
        alumniId,
        organization: parsed.organization,
        designation: parsed.designation,
        employmentType: parsed.employmentType,
        employmentStatusLabel: parsed.employmentStatusLabel,
        periodLabel: parsed.periodLabel,
        industry: '',
        startDate: sortMeta.startDate,
        endDate: sortMeta.endDate,
        isCurrent: sortMeta.isCurrent,
        location: parsed.location,
        country,
      });
    });
  }

  parsedExps.sort((a, b) => {
    if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
    const endA = a.endDate || a.startDate;
    const endB = b.endDate || b.startDate;
    if (endA !== endB) return endB.localeCompare(endA);
    return b.startDate.localeCompare(a.startDate);
  });

  parsedExps.forEach((e) => builtExperiences.push(e));

  const currentExp = parsedExps.find((e) => e.isCurrent);
  const latestExp = currentExp || parsedExps[0];

  const parsedEdus: Education[] = [];
  if (record && Array.isArray(record.higherEducation)) {
    record.higherEducation.forEach((rawEdu, eduIdx) => {
      const parsed = parseRawHigherEducation(rawEdu);
      if (parsed.exclude) return;

      const eduObj: Education = {
        id: `edu-${studentId}-${eduIdx + 1}`,
        alumniId,
        institution: parsed.institution,
        degree: parsed.degree,
        fieldOfStudy: parsed.degree,
        studyLevel: /certificate|diploma/i.test(parsed.degree)
          ? 'Postgraduate Diploma / Certificate'
          : 'Masters',
        enrollmentStatus: parsed.enrollmentStatus,
        country: parsed.country,
        locationLabel: parsed.locationLabel,
        periodLabel: parsed.periodLabel,
        isPostIutHigherEd: true,
        startYear: parsed.startYear,
        endYear: parsed.endYear,
      };
      parsedEdus.push(eduObj);
      builtEducations.push(eduObj);
    });
  }

  let careerStatus: CareerStatusCategory = 'Unknown';
  if (currentExp) {
    careerStatus = 'Employed';
  } else if (parsedEdus.some((ed) => ed.enrollmentStatus === 'currently_enrolled')) {
    careerStatus = 'Higher studies';
  }

  const isEntrepreneur = parsedExps.some((e) =>
    /\bfounder\b|\bco-founder\b|\bdirector\b/i.test(e.designation)
  );

  const publicLinks: Alumni['publicLinks'] = [];
  const linkedinUrl = (record?.linkedinUrl || '').trim();
  const facebookUrl = (record?.facebookUrl || '').trim();
  const researchProfileUrl = (record?.researchProfileUrl || '').trim();

  if (linkedinUrl) {
    publicLinks.push({ id: `lnk-${studentId}-li`, label: 'LinkedIn', url: linkedinUrl });
  }
  if (facebookUrl) {
    publicLinks.push({ id: `lnk-${studentId}-fb`, label: 'Facebook', url: facebookUrl });
  }
  if (researchProfileUrl) {
    publicLinks.push({
      id: `lnk-${studentId}-res`,
      label: 'Research Profile',
      url: researchProfileUrl,
    });
  }

  const currentCity = (record?.currentCity || '').trim();
  const currentCountry = (record?.currentCountry || '').trim();

  if (currentCountry) {
    const coordKey = `${currentCity}|${currentCountry}`;
    const coords = CITY_COORDINATES[coordKey] || { lat: 23.8103, lng: 90.4125 };
    builtLocations.push({
      id: `loc-${studentId}`,
      alumniId,
      country: currentCountry,
      city: currentCity,
      coordinates: coords,
      visibility: currentCity ? 'city_and_country' : 'country_only',
    });
  }

  const hasDetailedRecords = parsedExps.length > 0 || parsedEdus.length > 0;
  const verificationStatus = hasDetailedRecords ? 'verified' : 'unverified';

  const professionalHeadline = currentExp
    ? `${currentExp.designation} at ${currentExp.organization}`
    : parsedEdus[0]
    ? `${parsedEdus[0].institution}${
        parsedEdus[0].degree && !/not specified/i.test(parsedEdus[0].degree)
          ? ` — ${parsedEdus[0].degree}`
          : ''
      }`
    : latestExp
    ? `${latestExp.designation} — ${latestExp.organization}`
    : undefined;

  builtAlumni.push({
    id: alumniId,
    studentId,
    fullName: item.fullName,
    batchId,
    profileImage: undefined,
    portraitInitials: getInitials(item.fullName),
    portraitTone: PORTRAIT_TONES[index % PORTRAIT_TONES.length],
    facebookUrl: facebookUrl || undefined,
    linkedinUrl: linkedinUrl || undefined,
    researchProfileUrl: researchProfileUrl || undefined,
    currentCity: currentCity || undefined,
    currentCountry: currentCountry || undefined,
    professionalHeadline,
    currentPositionId: currentExp?.id,
    primaryIndustry: undefined,
    careerStatus,
    isEntrepreneur,
    skills: [],
    publicLinks,
    publicVisibility: 'public',
    featured: ['170061001', '170061002', '170061006', '170061011'].includes(studentId),
    verificationStatus,
    informationSource: record
      ? 'BTM Alumni Website Data JSON (v2)'
      : 'BTM Alumni Batch Roster JSON',
    lastUpdated: '2026-10-29',
    isSampleRecord: false,
  });

  builtSourceRecords.push({
    id: `src-${studentId}`,
    alumniId,
    sourceType: 'BTM Alumni Structured JSON Dataset',
    sourceReference: record
      ? `BTM_Alumni_Data_for_AI_Studio_v2 (${studentId})`
      : `BTM_Alumni_ID_Name_Batches (${studentId})`,
    verificationStatus,
    checkedAt: '2026-10-29',
  });
});

export const INITIAL_ALUMNI: Alumni[] = builtAlumni;
export const INITIAL_EXPERIENCES: Experience[] = builtExperiences;
export const INITIAL_EDUCATIONS: Education[] = builtEducations;
export const INITIAL_ACHIEVEMENTS: Achievement[] = [];
export const INITIAL_LOCATIONS: LocationRecord[] = builtLocations;
export const INITIAL_SOURCE_RECORDS: SourceRecord[] = builtSourceRecords;

export const INITIAL_STORIES: Story[] = [
  {
    id: 'sty-1',
    slug: 'from-btm-to-university-faculty-and-mis-research',
    title: 'From BTM Systems Coursework to University Faculty & MIS Research',
    subtitle:
      'How Tasnim Ahmed Jarin (BTM 17) bridged software business analysis, an MBA in MIS, and academic leadership as a Lecturer at East West University.',
    category: 'Alumni Spotlight',
    excerpt:
      'Tracing a path from BTM 17 at IUT through commercial software analysis at Kona Software Lab Ltd. to university teaching and research in Management Information Systems.',
    pullQuote:
      'Working at the intersection of technology, data, and business management allows us to transform emerging analytical methods into organizational decisions.',
    content: [
      'After completing her studies with BTM 17 at the Islamic University of Technology (IUT), Tasnim Ahmed Jarin worked as a Commercial Intern and Business Analyst (Commercial Department) at Kona Software Lab Ltd. in Gulshan, Dhaka.',
      'Pursuing her Master of Business Administration (MBA) in Management & Information Systems at North South University, she served as a Graduate Teaching Assistant before joining East West University as a Lecturer in the Department of Business Administration.',
    ],
    coverPlateVariant: 'campus-dusk',
    associatedAlumniId: 'alum-170061011',
    batchId: 'btm-17',
    status: 'published',
    publishedAt: '2026-10-27',
    readTimeMinutes: 4,
    isSampleStory: false,
  },
  {
    id: 'sty-2',
    slug: 'combating-financial-fraud-with-data-science-and-hybrid-ai',
    title: 'Safeguarding Digital Financial Services Through Fraud Analytics & Data Science',
    subtitle:
      'Samia Jahan Ilma (BTM 17) on fraud and dispute management at bKash Limited, research at IUT, and postgraduate studies in Data Science and Machine Learning.',
    category: 'Career Journeys',
    excerpt:
      'An inside look at how transaction analysis, research assistance at IUT, and advanced training in Data Science and Machine Learning connect business and technology.',
    pullQuote:
      'Combining domain proficiency in mobile financial services with machine learning opens new opportunities for data-driven impact.',
    content: [
      'During her tenure as an Officer in Fraud and Dispute Management at bKash Limited, Samia Jahan Ilma (ID 170061006) worked at the forefront of digital transaction compliance in Dhaka, Bangladesh.',
      'Previously a Research Assistant at Islamic University of Technology (IUT) and an intern across bKash Limited and Janata Bank Limited, she is completing a Graduate Certificate in Data Science and Machine Learning with AI specialization at Scaler.',
    ],
    coverPlateVariant: 'executive-desk',
    associatedAlumniId: 'alum-170061006',
    batchId: 'btm-17',
    status: 'published',
    publishedAt: '2026-10-27',
    readTimeMinutes: 4,
    isSampleStory: false,
  },
  {
    id: 'sty-3',
    slug: 'quantitative-demand-planning-and-supply-chain-leadership',
    title: 'Quantitative Demand Planning Across E-Commerce and Consumer Durables',
    subtitle:
      'Maisha Maliha (BTM 17) on progressing from Igloo Ice Cream and Daraz DFLP’22 to Demand Planning at Singer Bangladesh Ltd. alongside a Master’s in Data Science.',
    category: 'Lessons Learned',
    excerpt:
      'How combining a BTM foundation with a Master’s in Data Science and Analytics supports supply chain management and demand planning.',
    pullQuote:
      'Aligning demand, production, and inventory control requires pairing supply chain operations with rigorous data analytics.',
    content: [
      'Starting with supply chain roles at Igloo Ice Cream and completing her tenure as a Management Trainee (DFLP’22) at Daraz, Maisha Maliha (ID 170061001) built operational experience across FMCG and e-commerce supply networks.',
      'Alongside earning a Master’s in Data Science and Analytics (Statistics) from East West University, she serves as a Demand Planner at Singer Bangladesh Ltd. (Singer Beko) in Dhaka.',
    ],
    coverPlateVariant: 'global-supply',
    associatedAlumniId: 'alum-170061001',
    batchId: 'btm-17',
    status: 'published',
    publishedAt: '2026-10-27',
    readTimeMinutes: 4,
    isSampleStory: false,
  },
  {
    id: 'sty-4',
    slug: 'technology-procurement-in-fintech-and-venture-building',
    title: 'Driving Technology & General Procurement in Mobile Financial Services',
    subtitle:
      'Saad Mahmud (BTM 17) on technology procurement at bKash Limited, media strategy at Mindshare Bangladesh, and co-founding BakeVille.',
    category: 'Founder Stories',
    excerpt:
      'From co-founding BakeVille and planning strategy at Mindshare Bangladesh to serving as Senior Officer in Technology & General Procurement at bKash Limited.',
    pullQuote:
      'Solving real-world procurement and operational challenges starts with structured negotiation and clear cross-functional alignment.',
    content: [
      'Across roles spanning Catalytic Interactive, Malamal.xyz, FBCCI, Daraz, and co-founding BakeVille, Saad Mahmud (ID 170061002) developed a versatile foundation in business development and operations.',
      'After serving as a Planning Strategist at Mindshare Bangladesh, he joined bKash Limited in September 2022 and advanced to Senior Officer – Technology & General Procurement in May 2025.',
    ],
    coverPlateVariant: 'strategy-studio',
    associatedAlumniId: 'alum-170061002',
    batchId: 'btm-17',
    status: 'published',
    publishedAt: '2026-10-27',
    readTimeMinutes: 4,
    isSampleStory: false,
  },
];
