import React from 'react';

/**
 * Recreates the YAPI TALENT ACADEMY emblem from the reference image:
 * Circular emblem with dynamic flame/wing silhouette and human figures.
 */
export default function YapiLogo({
  variant = 'color', // 'color' | 'white'
  size = 64,
  orgNameTop = 'YAPI TALENT',
  orgNameBottom = 'ACADEMY',
  customLogoUrl = '',
  showText = true,
  className = '',
}) {
  const isWhite = variant === 'white';

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {customLogoUrl ? (
        <img
          src={customLogoUrl}
          alt={`${orgNameTop} ${orgNameBottom}`}
          style={{ width: size, height: size }}
          className="object-contain rounded-full"
          crossOrigin="anonymous"
        />
      ) : (
        <svg
          width={size}
          height={size}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`ringGrad-${variant}`} x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
              {isWhite ? (
                <>
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#bae6fd" />
                  <stop offset="100%" stopColor="#ffffff" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="50%" stopColor="#082f6d" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </>
              )}
            </linearGradient>

            <linearGradient id={`flameGrad-${variant}`} x1="60" y1="8" x2="60" y2="108" gradientUnits="userSpaceOnUse">
              {isWhite ? (
                <>
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#e0f2fe" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="45%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#0a2e6e" />
                </>
              )}
            </linearGradient>

            <radialGradient id={`bgGlow-${variant}`} cx="50%" cy="50%" r="50%">
              {isWhite ? (
                <>
                  <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#07193f" stopOpacity="0.9" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#f0f9ff" />
                  <stop offset="100%" stopColor="#ffffff" />
                </>
              )}
            </radialGradient>
          </defs>

          {/* Outer circle ring */}
          <circle
            cx="60"
            cy="60"
            r="49"
            fill={`url(#bgGlow-${variant})`}
            stroke={`url(#ringGrad-${variant})`}
            strokeWidth="3.5"
          />

          {/* Inner subtle arc */}
          <path
            d="M 22 78 A 42 42 0 0 0 98 78"
            stroke={isWhite ? 'rgba(255,255,255,0.4)' : '#38bdf8'}
            strokeWidth="1.5"
            fill="none"
          />

          {/* Dynamic Flame / Wing rising above the circle top */}
          <path
            d="M58 104 C54 88, 38 72, 41 50 C43 35, 58 26, 62 7 C68 20, 74 32, 70 46 C76 38, 82 28, 80 17 C89 31, 88 53, 76 69 C68 80, 64 92, 62 104 Z"
            fill={`url(#flameGrad-${variant})`}
          />

          {/* Highlight swoosh inside flame */}
          <path
            d="M60 96 C58 80, 50 66, 54 48 C56 36, 65 27, 67 16 C69 30, 64 44, 66 58 C68 70, 64 84, 60 96 Z"
            fill={isWhite ? '#38bdf8' : '#7dd3fc'}
            fillOpacity={isWhite ? '0.45' : '0.65'}
          />

          {/* Main leader head dot */}
          <circle
            cx="53"
            cy="35"
            r="5.5"
            fill={isWhite ? '#ffffff' : '#0284c7'}
          />

          {/* Left person silhouette */}
          <circle
            cx="39"
            cy="72"
            r="5.5"
            fill={isWhite ? '#ffffff' : '#0b357a'}
          />
          <path
            d="M27 84 C32 79, 44 79, 51 88 L46 96 C39 89, 32 88, 27 84 Z"
            fill={isWhite ? '#ffffff' : '#0284c7'}
          />

          {/* Right person silhouette */}
          <circle
            cx="77"
            cy="72"
            r="5.5"
            fill={isWhite ? '#ffffff' : '#0b357a'}
          />
          <path
            d="M93 84 C88 79, 76 79, 69 88 L74 96 C81 89, 88 88, 93 84 Z"
            fill={isWhite ? '#ffffff' : '#0284c7'}
          />
        </svg>
      )}

      {showText && (
        <div
          className={`mt-1.5 text-center font-display font-extrabold tracking-wider leading-[1.12] ${
            isWhite ? 'text-white' : 'text-[#0a2e6e]'
          }`}
          style={{ fontSize: Math.max(9, Math.round(size * 0.19)) }}
        >
          <div>{orgNameTop}</div>
          <div>{orgNameBottom}</div>
        </div>
      )}
    </div>
  );
}

