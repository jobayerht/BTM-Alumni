import React, { useState } from 'react';
import { Building2, GraduationCap } from 'lucide-react';

interface OrganizationLogoProps {
  name: string;
  category?: 'organization' | 'institution';
  size?: 'sm' | 'md';
}

const VERIFIED_ORGANIZATION_DOMAINS: Array<{ match: RegExp; domain: string }> = [
  { match: /singer/i, domain: 'singerbd.com' },
  { match: /\bdaraz\b/i, domain: 'daraz.com.bd' },
  { match: /\bigloo\b/i, domain: 'igloobd.com' },
  { match: /\bbkash\b/i, domain: 'bkash.com' },
  { match: /\bmindshare\b/i, domain: 'mindshareworld.com' },
  { match: /\bfbcci\b/i, domain: 'fbcci.org' },
  { match: /\bmalamal\b/i, domain: 'malamal.xyz' },
  { match: /\bbanglamark\b/i, domain: 'banglamark.com' },
  { match: /\bjetpatcher\b/i, domain: 'jetpatcher.co.uk' },
  { match: /\bsaif\s+powertec\b/i, domain: 'saifpowertecltd.com' },
  { match: /\bbrac\s+university\b/i, domain: 'bracu.ac.bd' },
  { match: /\bislamic\s+university\s+of\s+technology|\biut\b/i, domain: 'iutoic-dhaka.edu' },
  { match: /\bysse\b|youth\s+school\s+for\s+social\s+entrepreneurs/i, domain: 'ysseglobal.org' },
  { match: /\bjanata\s+bank\b/i, domain: 'janatabank-bd.com' },
  { match: /\bipdc\b/i, domain: 'ipdcbd.com' },
  { match: /\beast\s+west\s+university\b/i, domain: 'ewubd.edu' },
  { match: /\bnorth\s+south\s+university\b/i, domain: 'northsouth.edu' },
  { match: /\bkona\s+software\b/i, domain: 'konasl.com' },
  { match: /\bdeakin\s+university\b/i, domain: 'deakin.edu.au' },
  { match: /\bscaler\b/i, domain: 'scaler.com' },
];

function getVerifiedLogoUrl(name: string): string | null {
  const clean = name.trim();
  if (!clean) return null;
  for (const entry of VERIFIED_ORGANIZATION_DOMAINS) {
    if (entry.match.test(clean)) {
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(entry.domain)}&sz=128`;
    }
  }
  return null;
}

function getOrganizationInitials(name: string): string {
  const cleaned = name
    .replace(/\(.*?\)/g, ' ')
    .replace(/\b(Ltd\.?|Limited|Corporation|Inc\.?|Department|of|the|and|for|in|at)\b/gi, ' ')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim();

  const tokens = cleaned.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return name.slice(0, 2).toUpperCase() || 'ORG';
  if (tokens.length === 1) {
    const word = tokens[0];
    if (word.length <= 4 && word === word.toUpperCase()) return word;
    return word.slice(0, 2).toUpperCase();
  }
  return (tokens[0][0] + tokens[1][0]).toUpperCase();
}

export const OrganizationLogo: React.FC<OrganizationLogoProps> = ({
  name,
  category = 'organization',
  size = 'md',
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const logoUrl = getVerifiedLogoUrl(name);
  const initials = getOrganizationInitials(name);

  const dimensions = size === 'sm' ? 'w-9 h-9 rounded-lg' : 'w-11 h-11 rounded-xl';

  if (logoUrl && !imageFailed) {
    return (
      <div
        className={`${dimensions} shrink-0 border border-[#E8DFED] dark:border-[#352044] bg-[#FFFFFF] dark:bg-[#22122D] p-1.5 flex items-center justify-center overflow-hidden shadow-2xs`}
        title={name}
      >
        <img
          src={logoUrl}
          alt={`${name} logo`}
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="w-full h-full object-contain rounded-sm"
        />
      </div>
    );
  }

  return (
    <div
      className={`${dimensions} shrink-0 border border-[#E8DFED] dark:border-[#392249] bg-[#F7F3F9] dark:bg-[#241330] text-[#663078] dark:text-[#C8B9D6] flex flex-col items-center justify-center select-none`}
      title={name}
      role="img"
      aria-label={`${name} monogram`}
    >
      { initials.length <= 3 ? (
        <span className="font-mono text-xs font-semibold tracking-tight leading-none">
          {initials}
        </span>
      ) : category === 'institution' ? (
        <GraduationCap className="w-4 h-4" />
      ) : (
        <Building2 className="w-4 h-4" />
      )}
    </div>
  );
};
