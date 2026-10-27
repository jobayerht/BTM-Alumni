import React, { useState } from 'react';
import { VerificationStatus } from '../types/models';

interface EditorialPlateProps {
  variant:
    | 'campus-arch'
    | 'seminar-hall'
    | 'quadrangle'
    | 'library-wing'
    | 'executive-desk'
    | 'strategy-studio'
    | 'global-supply'
    | 'campus-dusk';
  imageUrl?: string;
  alt: string;
  caption?: string;
  className?: string;
}

export const EditorialPlate: React.FC<EditorialPlateProps> = ({
  variant,
  imageUrl,
  alt,
  caption,
  className = 'w-full h-full',
}) => {
  const [imgError, setImgError] = useState(false);

  if (imageUrl && !imgError) {
    return (
      <div className={`relative overflow-hidden bg-[#32143F] ${className}`}>
        <img
          src={imageUrl}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#190920]/70 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative overflow-hidden bg-[#261031] dark:bg-[#190A21] text-[#F7F3F9] select-none ${className}`}
    >
      {/* Architectural SVG Composition */}
      {variant === 'campus-arch' && (
        <svg
          viewBox="0 0 800 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          <rect width="800" height="500" fill="#2A1237" />
          <circle cx="650" cy="110" r="180" fill="#663078" fillOpacity="0.35" />
          <circle cx="160" cy="420" r="240" fill="#4A2059" fillOpacity="0.4" />
          {/* Architectural Grid Lines */}
          <line x1="0" y1="120" x2="800" y2="120" stroke="#B69AD8" strokeOpacity="0.14" strokeWidth="1" />
          <line x1="0" y1="380" x2="800" y2="380" stroke="#B69AD8" strokeOpacity="0.18" strokeWidth="1" />
          <line x1="160" y1="0" x2="160" y2="500" stroke="#B69AD8" strokeOpacity="0.14" strokeWidth="1" />
          <line x1="640" y1="0" x2="640" y2="500" stroke="#B69AD8" strokeOpacity="0.14" strokeWidth="1" />
          {/* Islamic University Architectural Pointed Arches */}
          <path
            d="M200 380 V230 C200 175 260 140 260 140 C260 140 320 175 320 230 V380"
            stroke="#B69AD8"
            strokeOpacity="0.55"
            strokeWidth="1.5"
            fill="#32143F"
            fillOpacity="0.7"
          />
          <path
            d="M340 380 V200 C340 135 400 95 400 95 C400 95 460 135 460 200 V380"
            stroke="#F7F3F9"
            strokeOpacity="0.75"
            strokeWidth="1.75"
            fill="#663078"
            fillOpacity="0.45"
          />
          <path
            d="M480 380 V230 C480 175 540 140 540 140 C540 140 600 175 600 230 V380"
            stroke="#B69AD8"
            strokeOpacity="0.55"
            strokeWidth="1.5"
            fill="#32143F"
            fillOpacity="0.7"
          />
          {/* Courtyard Perspective Steps */}
          <line x1="120" y1="410" x2="680" y2="410" stroke="#B69AD8" strokeOpacity="0.3" strokeWidth="1" />
          <line x1="80" y1="440" x2="720" y2="440" stroke="#B69AD8" strokeOpacity="0.2" strokeWidth="1" />
          <circle cx="400" cy="175" r="18" stroke="#F7F3F9" strokeOpacity="0.5" strokeWidth="1.2" />
        </svg>
      )}

      {variant === 'seminar-hall' && (
        <svg
          viewBox="0 0 800 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          <rect width="800" height="500" fill="#23102E" />
          <rect x="90" y="70" width="620" height="360" stroke="#B69AD8" strokeOpacity="0.25" strokeWidth="1.2" />
          <rect x="140" y="110" width="520" height="280" fill="#32143F" fillOpacity="0.6" stroke="#B69AD8" strokeOpacity="0.35" />
          {/* Acoustic Slats & Colonade */}
          {[190, 250, 310, 370, 430, 490, 550, 610].map((x) => (
            <line
              key={x}
              x1={x}
              y1="110"
              x2={x}
              y2="390"
              stroke="#B69AD8"
              strokeOpacity="0.22"
              strokeWidth="1.5"
            />
          ))}
          <circle cx="400" cy="250" r="85" fill="#663078" fillOpacity="0.45" stroke="#F7F3F9" strokeOpacity="0.5" strokeWidth="1.5" />
        </svg>
      )}

      {variant === 'quadrangle' && (
        <svg
          viewBox="0 0 800 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          <rect width="800" height="500" fill="#281134" />
          <path d="M0 360 L400 180 L800 360" stroke="#B69AD8" strokeOpacity="0.35" strokeWidth="1.5" />
          <path d="M0 420 L400 240 L800 420" stroke="#B69AD8" strokeOpacity="0.25" strokeWidth="1.2" />
          <rect x="290" y="130" width="220" height="220" stroke="#F7F3F9" strokeOpacity="0.45" strokeWidth="1.5" fill="#663078" fillOpacity="0.28" />
          <rect x="330" y="170" width="140" height="140" stroke="#B69AD8" strokeOpacity="0.4" strokeWidth="1" />
        </svg>
      )}

      {variant === 'library-wing' && (
        <svg
          viewBox="0 0 800 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          <rect width="800" height="500" fill="#1F0D29" />
          <circle cx="400" cy="500" r="340" stroke="#B69AD8" strokeOpacity="0.3" strokeWidth="1.5" fill="#32143F" fillOpacity="0.5" />
          <circle cx="400" cy="500" r="240" stroke="#F7F3F9" strokeOpacity="0.4" strokeWidth="1.5" fill="#663078" fillOpacity="0.35" />
          <circle cx="400" cy="500" r="140" stroke="#B69AD8" strokeOpacity="0.5" strokeWidth="1.2" />
          <line x1="400" y1="60" x2="400" y2="500" stroke="#B69AD8" strokeOpacity="0.25" strokeWidth="1" />
        </svg>
      )}

      {(variant === 'executive-desk' ||
        variant === 'strategy-studio' ||
        variant === 'global-supply' ||
        variant === 'campus-dusk') && (
        <svg
          viewBox="0 0 800 450"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          <rect width="800" height="450" fill="#271033" />
          <circle
            cx={variant === 'executive-desk' ? 620 : variant === 'strategy-studio' ? 200 : 400}
            cy="160"
            r="210"
            fill="#663078"
            fillOpacity="0.4"
          />
          {/* Isometric Systems & Editorial Lines */}
          <line x1="60" y1="90" x2="740" y2="90" stroke="#B69AD8" strokeOpacity="0.2" strokeWidth="1" />
          <line x1="60" y1="360" x2="740" y2="360" stroke="#B69AD8" strokeOpacity="0.25" strokeWidth="1" />
          <rect
            x="140"
            y="130"
            width="520"
            height="190"
            fill="#32143F"
            fillOpacity="0.65"
            stroke="#B69AD8"
            strokeOpacity="0.4"
            strokeWidth="1.2"
          />
          {variant === 'executive-desk' && (
            <>
              <path d="M190 270 L310 190 L420 235 L580 165" stroke="#F7F3F9" strokeWidth="2" strokeOpacity="0.8" />
              <circle cx="310" cy="190" r="5" fill="#B69AD8" />
              <circle cx="420" cy="235" r="5" fill="#B69AD8" />
              <circle cx="580" cy="165" r="5" fill="#F7F3F9" />
            </>
          )}
          {variant === 'strategy-studio' && (
            <>
              <circle cx="310" cy="225" r="55" stroke="#F7F3F9" strokeOpacity="0.65" strokeWidth="1.5" />
              <circle cx="400" cy="225" r="55" stroke="#B69AD8" strokeOpacity="0.65" strokeWidth="1.5" />
              <circle cx="490" cy="225" r="55" stroke="#F7F3F9" strokeOpacity="0.65" strokeWidth="1.5" />
            </>
          )}
          {variant === 'global-supply' && (
            <>
              <ellipse cx="400" cy="225" rx="180" ry="65" stroke="#B69AD8" strokeOpacity="0.55" strokeWidth="1.4" />
              <ellipse cx="400" cy="225" rx="90" ry="65" stroke="#F7F3F9" strokeOpacity="0.65" strokeWidth="1.4" />
              <line x1="220" y1="225" x2="580" y2="225" stroke="#B69AD8" strokeOpacity="0.45" strokeWidth="1.2" />
            </>
          )}
          {variant === 'campus-dusk' && (
            <>
              <path
                d="M280 320 V210 C280 165 400 135 400 135 C400 135 520 165 520 210 V320"
                stroke="#F7F3F9"
                strokeOpacity="0.7"
                strokeWidth="1.6"
              />
              <line x1="400" y1="135" x2="400" y2="320" stroke="#B69AD8" strokeOpacity="0.35" strokeWidth="1.2" />
            </>
          )}
        </svg>
      )}

      {caption && (
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono tracking-wider uppercase text-[#E8DFED]/80">
          <span>{caption}</span>
          <span>IUT · BTM ARCHIVE</span>
        </div>
      )}
    </div>
  );
};

interface AlumniPortraitProps {
  profileImage?: string;
  initials: string;
  fullName: string;
  tone?: 'plum' | 'amethyst' | 'mulberry' | 'slate-violet' | 'indigo-orchid';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AlumniPortrait: React.FC<AlumniPortraitProps> = ({
  profileImage,
  initials,
  fullName,
  tone = 'plum',
  size = 'md',
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-11 h-11 text-xs',
    md: 'w-16 h-16 text-base',
    lg: 'w-24 h-24 text-xl',
    xl: 'w-32 h-32 text-2xl',
  }[size];

  const toneClasses = {
    plum: 'bg-[#32143F] text-[#F7F3F9] border-[#663078]/40',
    amethyst: 'bg-[#4B225B] text-[#F7F3F9] border-[#B69AD8]/40',
    mulberry: 'bg-[#582669] text-[#F7F3F9] border-[#B69AD8]/40',
    'slate-violet': 'bg-[#2C1E38] text-[#E8DFED] border-[#716A79]/40',
    'indigo-orchid': 'bg-[#3B1B4E] text-[#F7F3F9] border-[#B69AD8]/40',
  }[tone];

  if (profileImage && !imgError) {
    return (
      <div className={`${sizeClasses} relative shrink-0 overflow-hidden rounded-lg border border-[#E8DFED] dark:border-[#352044] bg-[#32143F]`}>
        <img
          src={profileImage}
          alt={`Portrait of ${fullName}`}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`Monogram portrait placeholder for ${fullName}`}
      className={`${sizeClasses} ${toneClasses} relative shrink-0 rounded-lg border flex flex-col items-center justify-center font-serif font-semibold tracking-tight select-none overflow-hidden`}
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_top_right,#B69AD8,transparent_70%)]" />
      <span className="relative z-10">{initials}</span>
    </div>
  );
};

export const VerificationLabel: React.FC<{ status: VerificationStatus }> = ({ status }) => {
  switch (status) {
    case 'verified':
      return (
        <span className="text-xs font-medium text-[#663078] dark:text-[#C8B2E6]">
          Verified Departmental Record
        </span>
      );
    case 'partially_verified':
      return (
        <span className="text-xs font-medium text-[#716A79] dark:text-[#B69AD8]">
          Partially Verified Record
        </span>
      );
    case 'sample_prototype':
      return (
        <span className="text-xs font-medium text-[#663078] dark:text-[#B69AD8]">
          Prototype Sample Record
        </span>
      );
    case 'unverified':
    default:
      return (
        <span className="text-xs font-medium text-[#716A79] dark:text-[#9A8FA6]">
          Unverified Archival Entry
        </span>
      );
  }
};
