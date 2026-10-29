export type BatchStatus = 'active' | 'coming_soon' | 'archived';

export type VerificationStatus = 'verified' | 'partially_verified' | 'sample_prototype' | 'unverified';

export type ProfileVisibility = 'public' | 'directory_only' | 'hidden';

export type StoryCategory =
  | 'Career Journeys'
  | 'Founder Stories'
  | 'Lessons Learned'
  | 'Professional Achievements'
  | 'Alumni Spotlight';

export type StoryStatus = 'published' | 'draft';

export type StudyLevel =
  | 'Bachelors'
  | 'Masters'
  | 'PhD / Doctoral'
  | 'Postgraduate Diploma / Certificate'
  | 'Postgraduate Diploma'
  | 'Professional Qualification'
  | 'Other';

export type EnrollmentStatus = 'completed' | 'currently_enrolled';

export type CareerStatusCategory =
  | 'Employed'
  | 'Higher studies'
  | 'Entrepreneur / Founder'
  | 'Seeking employment'
  | 'Career transition'
  | 'Other'
  | 'Unknown';

export interface Batch {
  id: string; // e.g. 'btm-17'
  code: string; // e.g. '17'
  name: string; // e.g. 'BTM 17'
  intakeYear: number;
  graduationYear: number;
  description: string;
  coverImage?: string;
  coverPlateVariant: 'campus-arch' | 'seminar-hall' | 'quadrangle' | 'library-wing';
  status: BatchStatus;
}

export interface PublicLink {
  id: string;
  label: string;
  url: string;
}

export interface Education {
  id: string;
  alumniId: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  studyLevel?: StudyLevel;
  enrollmentStatus?: EnrollmentStatus;
  country?: string;
  locationLabel?: string;
  periodLabel?: string;
  isPostIutHigherEd?: boolean;
  startYear: number;
  endYear?: number;
  description?: string;
  certifications?: string[];
  scholarshipOrFunding?: string;
}

export interface Experience {
  id: string;
  alumniId: string;
  organization: string;
  designation: string;
  employmentType?:
    | 'Full-time'
    | 'Part-time'
    | 'Contract'
    | 'Internship'
    | 'Founder / Self-employed'
    | 'Apprenticeship'
    | 'Research'
    | 'Other';
  employmentStatusLabel?: 'Full-Time' | 'Internship' | 'Other';
  periodLabel?: string;
  industry: string;
  careerLevel?:
    | 'Entry / Associate'
    | 'Mid-Level / Specialist'
    | 'Senior / Lead'
    | 'Management / Director'
    | 'Founder / Executive'
    | 'Academic / Research';
  startDate: string; // YYYY-MM for sorting
  endDate?: string; // YYYY-MM or undefined
  isCurrent: boolean;
  location: string;
  country?: string;
  description?: string;
}

export interface Achievement {
  id: string;
  alumniId: string;
  title: string;
  category:
    | 'Award'
    | 'Project'
    | 'Publication'
    | 'Leadership'
    | 'Entrepreneurship'
    | 'Milestone'
    | 'Certification';
  year: number;
  issuerOrContext: string;
  description: string;
}

export interface LocationRecord {
  id: string;
  alumniId: string;
  country: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  visibility: 'city_and_country' | 'country_only' | 'hidden';
}

export interface SourceRecord {
  id: string;
  alumniId: string;
  sourceType: string;
  sourceReference: string;
  verificationStatus: VerificationStatus;
  checkedAt: string; // YYYY-MM-DD
}

export interface Alumni {
  id: string;
  studentId: string; // e.g. '170061001'
  fullName: string;
  batchId: string; // e.g. 'btm-17'
  profileImage?: string;
  portraitInitials: string;
  portraitTone: 'plum' | 'amethyst' | 'mulberry' | 'slate-violet' | 'indigo-orchid';
  facebookUrl?: string;
  linkedinUrl?: string;
  researchProfileUrl?: string;
  currentCity?: string;
  currentCountry?: string;
  professionalHeadline?: string;
  professionalSummary?: string;
  areasOfInterest?: string[];
  currentPositionId?: string; // Explicit reference to Experience.id
  primaryIndustry?: string;
  careerStatus?: CareerStatusCategory;
  isEntrepreneur?: boolean;
  skills: string[];
  publicLinks: PublicLink[];
  publicVisibility: ProfileVisibility;
  featured: boolean;
  featuredNote?: string;
  verificationStatus: VerificationStatus;
  informationSource: string;
  lastUpdated: string; // YYYY-MM-DD
  isSampleRecord: boolean;
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: StoryCategory;
  excerpt: string;
  pullQuote?: string;
  content: string[]; // Paragraphs
  coverImage?: string;
  coverPlateVariant: 'executive-desk' | 'strategy-studio' | 'global-supply' | 'campus-dusk';
  associatedAlumniId: string;
  batchId: string;
  status: StoryStatus;
  publishedAt: string; // YYYY-MM-DD
  readTimeMinutes: number;
  isSampleStory: boolean;
}

export interface CompleteAlumniProfile {
  alumni: Alumni;
  batch: Batch;
  currentPosition?: Experience;
  experiences: Experience[];
  educations: Education[];
  achievements: Achievement[];
  location?: LocationRecord;
  sourceRecords: SourceRecord[];
  stories: Story[];
}
