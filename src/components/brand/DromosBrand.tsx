import React from 'react';

export type BrandVariant = 'favicon' | 'horizontal' | 'vertical' | 'text';

interface DromosBrandProps {
  variant?: BrandVariant;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const DromosRunnerGlyph: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-8 h-8',
  color = '#FF6700',
}) => {
  return (
    <svg
      viewBox="0 0 120 135"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Dromos Runner Icon"
    >
      {/* Dynamic Runner Silhouette - faithfully matching dromos run_favicon-01.png */}
      {/* Head */}
      <path
        d="M74 18 C85 10 102 16 98 30 C94 40 80 40 73 34 C66 28 66 22 74 18 Z"
        fill={color}
      />
      {/* Upper speed streak behind head & neck */}
      <path
        d="M44 32 C58 27 75 22 88 23 C76 28 60 32 49 35 C42 36 38 35 44 32 Z"
        fill={color}
      />
      {/* Middle trailing speed blade */}
      <path
        d="M8 45 C32 40 65 32 86 32 C78 37 60 42 42 47 C25 51 12 49 8 45 Z"
        fill={color}
      />
      {/* Lower trailing speed blade */}
      <path
        d="M26 65 C48 61 74 57 88 59 C74 65 52 70 36 72 C28 73 24 70 26 65 Z"
        fill={color}
      />
      {/* Main athletic body & forward bent leg */}
      <path
        d="M58 40 C75 35 92 41 85 58 C78 72 65 83 74 94 C82 103 94 92 98 81 C102 71 100 61 95 56 C90 51 86 49 81 48 C78 45 84 37 92 37 C104 38 108 55 103 72 C97 91 84 107 68 107 C54 107 48 94 56 81 C64 69 72 58 64 51 C57 45 49 48 42 49 C48 44 53 41 58 40 Z"
        fill={color}
      />
      {/* Back extended leg pointing down-left with sharp athletic trail */}
      <path
        d="M48 83 C54 75 62 70 70 68 C61 77 48 93 38 111 C26 127 10 144 2 153 C9 140 26 113 40 94 C44 88 46 85 48 83 Z"
        transform="translate(2, -18)"
        fill={color}
      />
    </svg>
  );
};

export const DromosTextWordmark: React.FC<{
  className?: string;
  textColor?: string;
  accentColor?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({
  className = '',
  textColor = 'text-white',
  accentColor = 'text-[#FF6700]',
  size = 'md',
}) => {
  const sizeMap = {
    sm: { dromos: 'text-lg', run: 'text-base', speedStreak: 'h-1.5' },
    md: { dromos: 'text-2xl', run: 'text-xl', speedStreak: 'h-2' },
    lg: { dromos: 'text-4xl', run: 'text-3xl', speedStreak: 'h-2.5' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex flex-col select-none leading-none tracking-tighter ${className}`}>
      {/* Top line: DROMOS in heavy italic sans */}
      <span
        className={`font-athletic font-black italic tracking-wide ${textColor} ${currentSize.dromos}`}
        style={{ letterSpacing: '0.04em' }}
      >
        DROMOS
      </span>
      {/* Bottom line: Speed Streaks + RUN */}
      <div className="flex items-center gap-1.5 mt-0.5">
        {/* Speed streak accents in orange */}
        <div className="flex flex-col gap-0.5 w-7 shrink-0">
          <div className="h-0.5 bg-[#FF6700] rounded-full w-full transform -skew-x-25" />
          <div className="h-0.5 bg-[#FF6700] rounded-full w-4/5 transform -skew-x-25 self-start" />
        </div>
        {/* RUN in vibrant orange */}
        <span
          className={`font-athletic font-black italic tracking-widest ${accentColor} ${currentSize.run}`}
          style={{ letterSpacing: '0.08em' }}
        >
          RUN
        </span>
      </div>
    </div>
  );
};

export const DromosBrand: React.FC<DromosBrandProps> = ({
  variant = 'horizontal',
  className = '',
  size = 'md',
}) => {
  // Sizing definitions
  const glyphSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const textSizes: Record<string, 'sm' | 'md' | 'lg'> = {
    xs: 'sm',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'lg',
  };

  // 1. FAVICON VARIANT: runner glyph alone (for badges, circular avatars, compact marks)
  if (variant === 'favicon') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <DromosRunnerGlyph className={glyphSizes[size]} />
      </div>
    );
  }

  // 2. TEXT VARIANT: wordmark only (for footer, minimal cards without duplicate glyph)
  if (variant === 'text') {
    return (
      <div className={`inline-flex items-center shrink-0 ${className}`}>
        <DromosTextWordmark size={textSizes[size]} />
      </div>
    );
  }

  // 3. VERTICAL VARIANT: runner glyph centered above wordmark (for splash, welcome screen, completion screen)
  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center justify-center gap-2 select-none ${className}`}>
        <DromosRunnerGlyph className={glyphSizes[size === 'sm' ? 'md' : size === 'md' ? 'lg' : 'xl']} />
        <DromosTextWordmark size={textSizes[size]} className="items-center" />
      </div>
    );
  }

  // 4. HORIZONTAL VARIANT (Default): runner glyph on left + wordmark on right (for top app bar / header)
  return (
    <div className={`inline-flex items-center gap-2.5 select-none shrink-0 ${className}`}>
      <DromosRunnerGlyph className={glyphSizes[size]} />
      <DromosTextWordmark size={textSizes[size]} />
    </div>
  );
};

export default DromosBrand;
