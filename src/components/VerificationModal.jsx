import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  UserCheck,
  Building2,
  Hash,
  KeyRound,
  X,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import YapiLogo from './YapiLogo';

export default function VerificationModal({
  verificationData,
  onClose,
  onToggleCheckIn,
  isStandalonePage = false,
}) {
  if (!verificationData) return null;

  const {
    valid,
    signatureVerified,
    ticketId,
    name,
    role,
    institution,
    checkedIn,
    checkedInAt,
    eventTitle,
    categoryLabel,
    dateText,
    locationText,
    timeText,
    orgName,
    signature,
    reason,
  } = verificationData;

  return (
    <div
      className={`${
        isStandalonePage
          ? 'min-h-screen bg-slate-950 py-10 px-4 flex items-center justify-center'
          : 'fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md p-4 flex items-center justify-center overflow-y-auto'
      }`}
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-auto">
        {/* Top Official Banner */}
        <div
          className={`relative px-6 pt-7 pb-6 text-center overflow-hidden ${
            valid
              ? 'bg-gradient-to-br from-[#062350] via-[#0a367c] to-[#0284c7]'
              : 'bg-gradient-to-br from-rose-950 via-red-900 to-rose-800'
          }`}
        >
          {!isStandalonePage && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-3 shadow-lg">
            {valid ? (
              <ShieldCheck className="w-11 h-11 text-emerald-300" />
            ) : (
              <ShieldAlert className="w-11 h-11 text-rose-300" />
            )}
          </div>

          <div className="flex items-center justify-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-widest uppercase border ${
                valid
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                  : 'bg-rose-500/20 text-rose-200 border-rose-400/40'
              }`}
            >
              {valid ? '✓ LEGALITAS PESERTA TERVERIFIKASI SAH' : '✕ TIDAK TERDAFTAR / TIDAK VALID'}
            </span>
          </div>

          <h2 className="mt-3 font-display font-extrabold text-xl sm:text-2xl text-white">
            {valid ? 'Dokumen Undangan & Tiket Resmi' : 'Verifikasi Legalitas Gagal'}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-sky-100/85 max-w-md mx-auto">
            {reason}
          </p>
        </div>

        {valid ? (
          <div className="p-6 space-y-5">
            {/* Participant Identity Card */}
            <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">
                    Nama Peserta Undangan
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                    {name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-300">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-sky-500/15 text-sky-300 border border-sky-500/30 font-medium">
                      <Sparkles className="w-3 h-3" />
                      {role}
                    </span>
                    {institution && (
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        {institution}
                      </span>
                    )}
                  </div>
                </div>

                <YapiLogo variant="white" size={44} showText={false} />
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-700/70 text-xs">
                <div className="bg-slate-900/70 rounded-xl p-2.5 border border-slate-800">
                  <div className="text-slate-400 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-sky-400" />
                    ID Tiket Resmi
                  </div>
                  <div className="font-mono font-bold text-white text-sm mt-0.5">
                    {ticketId}
                  </div>
                </div>

                <div className="bg-slate-900/70 rounded-xl p-2.5 border border-slate-800">
                  <div className="text-slate-400 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                    Digital Signature
                  </div>
                  <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5 flex items-center gap-1.5">
                    {signature}
                    {signatureVerified && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded">
                        ASLI
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Event Details Card */}
            <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-widest uppercase text-sky-400">
                  {categoryLabel || 'PELATIHAN'} • {orgName || 'YAPI TALENT ACADEMY'}
                </span>
              </div>
              <div className="font-display font-extrabold text-base sm:text-lg text-white leading-snug">
                {eventTitle}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
                <div className="flex items-center gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                  <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">Tanggal</div>
                    <div className="font-semibold text-slate-200">{dateText}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                  <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">Lokasi</div>
                    <div className="font-semibold text-slate-200">{locationText}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                  <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">Waktu</div>
                    <div className="font-semibold text-slate-200">{timeText}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Check-In / Attendance Status Box */}
            <div
              className={`rounded-2xl p-4 border flex flex-col sm:flex-row items-center justify-between gap-3 ${
                checkedIn
                  ? 'bg-emerald-950/40 border-emerald-500/40'
                  : 'bg-slate-800/60 border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    checkedIn
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {checkedIn ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <UserCheck className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-300">
                    Status Kehadiran Peserta
                  </div>
                  <div
                    className={`text-sm font-extrabold ${
                      checkedIn ? 'text-emerald-400' : 'text-amber-300'
                    }`}
                  >
                    {checkedIn
                      ? `SUDAH CHECK-IN (${checkedInAt || 'Hadir'})`
                      : 'TERDAFTAR RESMI • BELUM CHECK-IN'}
                  </div>
                </div>
              </div>

              {onToggleCheckIn && (
                <button
                  onClick={() => onToggleCheckIn(ticketId)}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-md ${
                    checkedIn
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {checkedIn ? 'Batalkan Check-In' : 'Konfirmasi Kehadiran (Check-In)'}
                </button>
              )}
            </div>

            {/* Footer Action */}
            <div className="pt-1 flex items-center justify-between gap-3">
              <div className="text-[11px] text-slate-400">
                Sistem Verifikasi E-Ticket Resmi • {orgName}
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {isStandalonePage ? 'Ke Dashboard Pembuat Tiket' : 'Tutup'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center space-y-4">
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-sm text-rose-200">
              Kode QR atau ID Tiket <span className="font-mono font-bold">({ticketId || 'Unknown'})</span> tidak ditemukan dalam daftar peserta resmi atau tanda tangan kriptografis tidak sesuai.
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-white transition"
              >
                Kembali
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

