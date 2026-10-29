import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Upload, Search, QrCode, CheckCircle2, AlertCircle } from 'lucide-react';

export default function QrScannerPanel({
  onScanResult,
  participants = [],
  onSelectParticipantVerify,
}) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [manualInput, setManualInput] = useState('');
  const scannerRef = useRef(null);
  const regionId = 'yapi-qr-reader-region';

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch {
        // ignore stop errors
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const startScanner = async () => {
    setCameraError('');
    try {
      await stopScanner();
      const html5QrCode = new Html5Qrcode(regionId);
      scannerRef.current = html5QrCode;
      setIsScanning(true);

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
        },
        (decodedText) => {
          stopScanner();
          onScanResult(decodedText);
        },
        () => {
          // ignore frame scan miss
        }
      );
    } catch (err) {
      setIsScanning(false);
      setCameraError(
        'Kamera tidak dapat diakses atau izin ditolak. Anda tetap dapat mengunggah gambar tiket QR atau memasukkan ID Tiket di bawah.'
      );
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCameraError('');
    try {
      await stopScanner();
      const html5QrCode = new Html5Qrcode(regionId);
      const decodedText = await html5QrCode.scanFile(file, true);
      await html5QrCode.clear();
      onScanResult(decodedText);
    } catch {
      setCameraError('Tidak ditemukan QR Code yang valid pada gambar yang diunggah.');
    } finally {
      e.target.value = '';
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    onScanResult(manualInput.trim());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Camera / Image / Manual Scanner */}
      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-sky-400" />
              Scanner QR Legalitas Peserta
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Arahkan kamera ke QR di bagian kanan tiket undangan peserta, atau unggah gambar E-Ticket untuk memverifikasi keaslian.
            </p>
          </div>
        </div>

        {/* Camera Viewport */}
        <div className="relative bg-slate-950 border-2 border-dashed border-slate-800 rounded-2xl overflow-hidden min-h-[280px] flex flex-col items-center justify-center p-4">
          <div id={regionId} className="w-full max-w-sm mx-auto overflow-hidden rounded-xl" />

          {!isScanning && (
            <div className="text-center space-y-4 py-6">
              <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-200">
                  Siap Memindai QR Code Tiket Undangan
                </div>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Gunakan kamera perangkat ini atau unggah tangkapan layar tiket peserta.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={startScanner}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-lg shadow-sky-600/20"
                >
                  <Camera className="w-4 h-4" />
                  Aktifkan Kamera Scanner
                </button>

                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer transition">
                  <Upload className="w-4 h-4 text-sky-400" />
                  Scan dari File Gambar QR
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {isScanning && (
            <div className="mt-4">
              <button
                type="button"
                onClick={stopScanner}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
              >
                Matikan Kamera
              </button>
            </div>
          )}
        </div>

        {cameraError && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-950/40 border border-amber-700/50 text-amber-200 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Manual Ticket ID / Signature Verification */}
        <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-800">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Verifikasi Cepat via Nomor ID Tiket / Kode Signature / URL QR
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Contoh: YAPI-2026-001 atau tempel URL hasil scan..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shrink-0"
            >
              Cek Legalitas
            </button>
          </div>
        </form>
      </div>

      {/* Right: Quick Simulation & Live Attendance Status */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Daftar Peserta & Simulasi Scan</span>
            <span className="text-xs font-normal text-slate-400">
              {participants.filter((p) => p.checkedIn).length} / {participants.length} Hadir
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Klik tombol <strong>&ldquo;Uji Scan&rdquo;</strong> pada salah satu peserta untuk melihat tampilan halaman verifikasi legalitas saat QR di-scan.
          </p>

          <div className="mt-4 space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{p.name}</div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                    <span className="font-mono text-sky-400">{p.ticketId}</span>
                    <span>•</span>
                    <span className="truncate">{p.role}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {p.checkedIn && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      Hadir
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onSelectParticipantVerify(p)}
                    className="px-2.5 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 text-[11px] font-semibold transition"
                  >
                    Uji Scan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-800/40 text-[11px] text-sky-200/90 leading-relaxed">
          💡 <strong>Tips Penggunaan di Hari-H:</strong> QR Code pada tiket juga dapat langsung di-scan menggunakan <strong>Kamera Bawaan HP / Google Lens</strong> tanpa perlu membuka menu scanner ini, karena setiap QR telah ditanamkan tanda tangan kriptografis.
        </div>
      </div>
    </div>
  );
}

