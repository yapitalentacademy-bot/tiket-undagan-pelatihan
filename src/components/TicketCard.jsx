import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, Clock, ShieldCheck } from 'lucide-react';
import YapiLogo from './YapiLogo';
import { buildVerificationUrl, generateSignature } from '../utils/ticketStorage';

export default function TicketCard({
  eventConfig,
  participant,
  ticketRef,
  baseUrl,
  onClickVerify,
}) {
  const activeParticipant = participant || {
    ticketId: 'YAPI-2026-001',
    name: 'Peserta Undangan Resmi',
    role: 'Peserta Pelatihan',
    institution: `${eventConfig.orgNameTop} ${eventConfig.orgNameBottom}`,
  };

  const fullTitle = `${eventConfig.titleLine1} ${eventConfig.titleConnector} ${eventConfig.titleLine2}`.trim();
  const dateText = `${eventConfig.dayName}, ${eventConfig.dateStr}`;
  const signature = generateSignature(
    activeParticipant.ticketId,
    activeParticipant.name,
    fullTitle,
    dateText
  );
  const qrUrl = buildVerificationUrl(activeParticipant, eventConfig, baseUrl);

  // Mask style for the authentic ticket notches (left 2 notches, perforation top/bottom notches, right 2 notches)
  const maskId = `ticket-mask-${activeParticipant.ticketId.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div
      ref={ticketRef}
      id="printable-ticket-area"
      className="relative inline-block p-5 sm:p-7 bg-gradient-to-br from-[#eef4fb] via-[#f6f9fc] to-[#e5eef9] rounded-3xl select-none"
      style={{ width: 1116, height: 426 }}
    >
      {/* Subtle decorative background waves behind the ticket (like reference mockup) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-45"
        viewBox="0 0 1116 426"
        fill="none"
      >
        <path
          d="M0 70 Q180 20 340 0 L0 0 Z"
          fill="#dbeafe"
        />
        <path
          d="M1116 340 Q940 390 790 426 L1116 426 Z"
          fill="#dbeafe"
        />
      </svg>

      {/* SVG Mask definition for exact ticket cutouts */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="1060" height="370">
            {/* Base rounded rectangle */}
            <rect x="0" y="0" width="1060" height="370" rx="24" fill="white" />
            {/* Left edge 2 semicircular notches */}
            <circle cx="0" cy="96" r="22" fill="black" />
            <circle cx="0" cy="274" r="22" fill="black" />
            {/* Right edge 2 semicircular notches */}
            <circle cx="1060" cy="96" r="22" fill="black" />
            <circle cx="1060" cy="274" r="22" fill="black" />
            {/* Perforation divider top & bottom notches at x = 800 */}
            <circle cx="800" cy="0" r="15" fill="black" />
            <circle cx="800" cy="370" r="15" fill="black" />
          </mask>
        </defs>
      </svg>

      {/* Drop shadow wrapper */}
      <div
        className="relative"
        style={{
          width: 1060,
          height: 370,
          filter: 'drop-shadow(0 14px 26px rgba(6, 28, 73, 0.22)) drop-shadow(0 3px 8px rgba(6, 28, 73, 0.12))',
        }}
      >
        {/* Main Masked Ticket Body */}
        <div
          className="relative flex w-[1060px] h-[370px] bg-white overflow-hidden"
          style={{
            mask: `url(#${maskId})`,
            WebkitMask: `url(#${maskId})`,
          }}
        >
          {/* ================= LEFT MAIN TICKET SECTION (800px) ================= */}
          <div className="relative w-[800px] h-full bg-white overflow-hidden">
            {/* Right-side photography with soft white gradient fade */}
            <div className="absolute inset-y-0 right-0 w-[410px] overflow-hidden pointer-events-none">
              {eventConfig.customBgUrl ? (
                <img
                  src={eventConfig.customBgUrl}
                  alt="Training Background"
                  className="w-full h-full object-cover object-center scale-105"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-200 via-blue-100 to-slate-300" />
              )}
              {/* Smooth left-to-right & bottom gradient blend to match the reference photo fade */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.96) 16%, rgba(255,255,255,0.65) 40%, rgba(219,234,254,0.18) 72%, rgba(15,35,66,0.15) 100%)',
                }}
              />
              <div
                className="absolute inset-x-0 top-0 h-24"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(226,236,249,0.75) 0%, rgba(255,255,255,0) 100%)',
                }}
              />
            </div>

            {/* Frosted Speech Bubbles Overlay (Active Listening visual motif from reference image) */}
            {eventConfig.showSpeechBubbles && (
              <div className="absolute top-[36px] right-[96px] pointer-events-none z-10 flex items-start gap-3">
                {/* Main large speech bubble */}
                <div className="relative">
                  <svg width="112" height="96" viewBox="0 0 112 96" fill="none">
                    <path
                      d="M24 6 H88 A18 18 0 0 1 106 24 V56 A18 18 0 0 1 88 74 H44 L22 91 V74 H24 A18 18 0 0 1 6 56 V24 A18 18 0 0 1 24 6 Z"
                      fill="rgba(255, 255, 255, 0.32)"
                      stroke="rgba(255, 255, 255, 0.82)"
                      strokeWidth="3.5"
                    />
                    <circle cx="38" cy="40" r="6" fill="rgba(255, 255, 255, 0.85)" />
                    <circle cx="56" cy="40" r="6" fill="rgba(255, 255, 255, 0.85)" />
                    <circle cx="74" cy="40" r="6" fill="rgba(255, 255, 255, 0.85)" />
                  </svg>
                </div>
                {/* Secondary smaller blurred speech bubble */}
                <div className="mt-9 -ml-2 opacity-75">
                  <svg width="78" height="68" viewBox="0 0 78 68" fill="none">
                    <path
                      d="M18 4 H60 A14 14 0 0 1 74 18 V38 A14 14 0 0 1 60 52 H52 L62 64 L38 52 H18 A14 14 0 0 1 4 38 V18 A14 14 0 0 1 18 4 Z"
                      fill="rgba(255, 255, 255, 0.28)"
                      stroke="rgba(255, 255, 255, 0.55)"
                      strokeWidth="2.5"
                    />
                    <circle cx="27" cy="28" r="4" fill="rgba(255, 255, 255, 0.75)" />
                    <circle cx="39" cy="28" r="4" fill="rgba(255, 255, 255, 0.75)" />
                    <circle cx="51" cy="28" r="4" fill="rgba(255, 255, 255, 0.75)" />
                  </svg>
                </div>
              </div>
            )}

            {/* Subtle top background diagonal highlight */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 800 370"
              fill="none"
            >
              <path
                d="M180 0 L340 0 L120 220 L0 220 Z"
                fill="url(#softDiag)"
                opacity="0.45"
              />
              <defs>
                <linearGradient id="softDiag" x1="0" y1="0" x2="300" y2="220" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#eff6ff" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Bottom & Left Multi-Layered Blue Waves (Exact match to reference image) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 800 370"
              fill="none"
            >
              <defs>
                <linearGradient id="waveLight" x1="100" y1="260" x2="780" y2="370" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#93c5fd" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="waveMid" x1="0" y1="180" x2="760" y2="370" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1d4ed8" />
                  <stop offset="45%" stopColor="#3b82f6" />
                  <stop offset="75%" stopColor="#1e40af" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
                <linearGradient id="waveDark" x1="0" y1="210" x2="550" y2="370" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#071e48" />
                  <stop offset="55%" stopColor="#082f6d" />
                  <stop offset="100%" stopColor="#0d47a1" />
                </linearGradient>
              </defs>

              {/* Soft light-blue background wave */}
              <path
                d="M0 190 C75 210, 125 320, 245 325 C375 330, 440 275, 580 285 C680 292, 745 335, 795 370 L0 370 Z"
                fill="url(#waveLight)"
              />

              {/* Mid royal-blue sweeping wave */}
              <path
                d="M0 178 C65 190, 95 275, 185 325 C280 375, 390 365, 490 322 C585 280, 685 295, 765 370 L0 370 Z"
                fill="url(#waveMid)"
                opacity="0.88"
              />

              {/* Translucent white/cyan overlapping ribbon on bottom-right */}
              <path
                d="M310 370 C410 330, 520 265, 650 288 C715 300, 755 335, 785 370 L695 370 C645 325, 545 315, 430 370 Z"
                fill="#ffffff"
                fillOpacity="0.45"
              />

              {/* Deep navy bottom-left corner wave */}
              <path
                d="M0 228 C55 238, 82 290, 145 335 C185 362, 235 368, 285 370 L0 370 Z"
                fill="url(#waveDark)"
              />

              {/* Deep navy bottom-right accent wave */}
              <path
                d="M520 370 C585 332, 665 328, 742 370 Z"
                fill="#07214d"
              />

              {/* Subtle 4x3 dot grid in bottom-left dark wave */}
              {[0, 1, 2, 3].map((col) =>
                [0, 1, 2].map((row) => (
                  <circle
                    key={`bl-dot-${col}-${row}`}
                    cx={26 + col * 18}
                    cy={312 + row * 16}
                    r="1.6"
                    fill="#93c5fd"
                    fillOpacity="0.55"
                  />
                ))
              )}
            </svg>

            {/* Left Ticket Content Layer */}
            <div className="relative z-20 h-full flex flex-col justify-between pt-8 pb-9 pl-12 pr-8">
              {/* Top Row: Logo + Title Block */}
              <div className="flex items-start gap-7">
                {/* YAPI Talent Academy Logo */}
                <div className="pt-1 shrink-0">
                  <YapiLogo
                    variant="color"
                    size={76}
                    orgNameTop={eventConfig.orgNameTop}
                    orgNameBottom={eventConfig.orgNameBottom}
                    customLogoUrl={eventConfig.customLogoUrl}
                  />
                </div>

                {/* Main Heading Block */}
                <div className="flex-1 pt-2">
                  {/* Category Label + Line */}
                  <div className="flex items-center gap-4 mb-1.5">
                    <span className="font-display font-semibold text-[13px] tracking-[0.42em] text-[#0b2b5c] uppercase">
                      {eventConfig.categoryLabel}
                    </span>
                    <div className="h-[1.5px] w-36 bg-gradient-to-r from-[#0b2b5c]/40 to-transparent" />
                  </div>

                  {/* Title Line 1 */}
                  <h1 className="font-display font-extrabold text-[50px] text-[#062350] tracking-[-0.02em] leading-[1.05]">
                    {eventConfig.titleLine1}
                  </h1>

                  {/* Title Line 2 with Script Connector */}
                  <div className="flex items-baseline gap-2.5 -mt-0.5">
                    {eventConfig.titleConnector && (
                      <span
                        className="font-script font-bold text-[44px] text-[#0284c7] leading-none -ml-6 pr-1"
                        style={{ transform: 'rotate(-4deg)', display: 'inline-block' }}
                      >
                        {eventConfig.titleConnector}
                      </span>
                    )}
                    <h2 className="font-display font-extrabold text-[44px] text-[#062350] tracking-[-0.02em] leading-[1.08]">
                      {eventConfig.titleLine2}
                    </h2>
                  </div>

                  {/* Personalized Participant Pill on Main Ticket (optional, great for official invitation) */}
                  {eventConfig.showParticipantOnMain && (
                    <div className="mt-3.5 inline-flex items-center gap-2.5 bg-white/90 backdrop-blur-sm border border-[#0284c7]/25 shadow-sm rounded-xl px-3.5 py-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <div className="text-[11px] font-medium text-slate-500">
                        Kepada Yth:
                      </div>
                      <div className="text-[13px] font-bold text-[#062350]">
                        {activeParticipant.name}
                      </div>
                      <span className="text-slate-300">|</span>
                      <div className="text-[11.5px] font-semibold text-[#0284c7]">
                        {activeParticipant.role}
                      </div>
                      <span className="ml-1 px-2 py-0.5 text-[10px] font-mono font-bold bg-[#062350] text-white rounded-md">
                        {activeParticipant.ticketId}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Info Bar (Date | Location | Time) */}
              <div className="flex items-center gap-6 pl-[86px] pb-3">
                {/* Date */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#09357a] text-white flex items-center justify-center shadow-sm shrink-0">
                    <Calendar className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="leading-[1.2] text-[#062350]">
                    <div className="text-[13.5px] font-medium">{eventConfig.dayName},</div>
                    <div className="text-[14.5px] font-extrabold">{eventConfig.dateStr}</div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-10 w-[1.5px] bg-[#062350]/30" />

                {/* Location */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#09357a] text-white flex items-center justify-center shadow-sm shrink-0">
                    <MapPin className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="leading-[1.2] text-[#062350]">
                    <div className="text-[13.5px] font-medium">{eventConfig.locationLine1}</div>
                    <div className="text-[14.5px] font-extrabold">{eventConfig.locationLine2}</div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-10 w-[1.5px] bg-[#062350]/30" />

                {/* Time */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#09357a] text-white flex items-center justify-center shadow-sm shrink-0">
                    <Clock className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="leading-[1.2] text-[#062350]">
                    <div className="text-[14.5px] font-extrabold">{eventConfig.timeStr}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= PERFORATION DIVIDER LINE ================= */}
          <div className="relative z-30 h-full w-0">
            <div className="absolute inset-y-4 -left-[2px] border-l-[3.5px] border-dashed border-white/95" />
          </div>

          {/* ================= RIGHT STUB SECTION WITH QR LEGALITAS (260px) ================= */}
          <div className="relative w-[260px] h-full bg-[#062052] text-white overflow-hidden flex flex-col items-center justify-between py-4 px-5">
            {/* Deep Blue Layered Ribbon Background (Matches Right Stub in Reference Image) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 260 370"
              fill="none"
            >
              <defs>
                <linearGradient id="stubBase" x1="0" y1="0" x2="260" y2="370" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#072156" />
                  <stop offset="50%" stopColor="#051942" />
                  <stop offset="100%" stopColor="#041232" />
                </linearGradient>
                <linearGradient id="stubRibbon1" x1="0" y1="0" x2="260" y2="140" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1d4ed8" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.35" />
                </linearGradient>
                <linearGradient id="stubRibbon2" x1="0" y1="240" x2="260" y2="370" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#0a347a" />
                  <stop offset="100%" stopColor="#1e40af" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              <rect width="260" height="370" fill="url(#stubBase)" />

              {/* Top sweeping blue ribbon */}
              <path
                d="M0 95 C75 75, 135 20, 210 0 L260 0 L260 58 C180 65, 95 105, 0 118 Z"
                fill="url(#stubRibbon1)"
              />
              <path
                d="M110 0 C165 25, 210 45, 260 48 L260 0 Z"
                fill="#38bdf8"
                fillOpacity="0.22"
              />

              {/* Bottom sweeping blue wave */}
              <path
                d="M0 285 C75 295, 155 245, 260 255 L260 370 L0 370 Z"
                fill="url(#stubRibbon2)"
              />
              <path
                d="M0 315 C85 305, 175 335, 260 310 L260 370 L0 370 Z"
                fill="#04153b"
                fillOpacity="0.85"
              />

              {/* Dot grids matching the right stub of the reference image */}
              {[0, 1, 2].map((col) =>
                [0, 1, 2].map((row) => (
                  <circle
                    key={`tr-dot-${col}-${row}`}
                    cx={188 + col * 16}
                    cy={22 + row * 15}
                    r="1.5"
                    fill="#93c5fd"
                    fillOpacity="0.45"
                  />
                ))
              )}
              {[0, 1, 2, 3].map((col) =>
                [0, 1, 2].map((row) => (
                  <circle
                    key={`bc-dot-${col}-${row}`}
                    cx={88 + col * 18}
                    cy={318 + row * 15}
                    r="1.6"
                    fill="#93c5fd"
                    fillOpacity="0.5"
                  />
                ))
              )}
            </svg>

            {/* Stub Content Layer */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-between">
              {/* Top Brand Header on Stub */}
              <div className="flex items-center gap-2.5 pt-0.5">
                <YapiLogo
                  variant="white"
                  size={38}
                  showText={false}
                  customLogoUrl={eventConfig.customLogoUrl}
                />
                <div className="text-left leading-tight">
                  <div className="font-display font-extrabold text-[11.5px] tracking-wider text-white">
                    {eventConfig.orgNameTop}
                  </div>
                  <div className="font-display font-extrabold text-[11.5px] tracking-wider text-sky-300">
                    {eventConfig.orgNameBottom}
                  </div>
                </div>
              </div>

              {/* Center Scannable QR Code Card for Participant Legality */}
              <div
                onClick={onClickVerify}
                title="Klik untuk simulasi hasil scan QR Legalitas Peserta"
                className="group relative bg-white p-2.5 rounded-2xl shadow-xl border-2 border-sky-300/80 cursor-pointer transition-transform hover:scale-[1.03]"
              >
                <QRCodeSVG
                  value={qrUrl}
                  size={146}
                  level="M"
                  includeMargin={false}
                  fgColor="#051b44"
                  bgColor="#ffffff"
                />

                {/* Center mini verification shield overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 rounded-lg bg-white p-0.5 shadow-md flex items-center justify-center border border-sky-200">
                    <div className="w-full h-full rounded-md bg-[#062350] flex items-center justify-center text-sky-300">
                      <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>
                </div>

                <div className="mt-1.5 flex items-center justify-center gap-1 text-[9.5px] font-extrabold tracking-wider text-[#062350] uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  SCAN LEGALITAS RESMI
                </div>
              </div>

              {/* Bottom Participant Legality Metadata */}
              <div className="w-full text-center pb-0.5">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2">
                  <div className="text-[12px] font-bold text-white truncate" title={activeParticipant.name}>
                    {activeParticipant.name}
                  </div>
                  <div className="text-[10px] text-sky-200/90 truncate">
                    {activeParticipant.role}
                  </div>
                  <div className="mt-1 pt-1 border-t border-white/15 flex items-center justify-between text-[9.5px] font-mono">
                    <span className="text-sky-300 font-bold">{activeParticipant.ticketId}</span>
                    <span className="text-emerald-300 font-semibold">SIG:{signature.slice(0, 6)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

