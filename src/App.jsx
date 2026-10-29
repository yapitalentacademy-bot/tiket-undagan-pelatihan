import React, { useState, useEffect, useRef, useMemo } from 'react';
import { toPng } from 'html-to-image';
import {
  Ticket,
  Users,
  QrCode,
  Download,
  Printer,
  ShieldCheck,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Upload,
  Copy,
  Check,
  FileSpreadsheet,
  Eye,
  Sliders,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import TicketCard from './components/TicketCard';
import VerificationModal from './components/VerificationModal';
import QrScannerPanel from './components/QrScannerModal';
import YapiLogo from './components/YapiLogo';
import {
  DEFAULT_EVENT_CONFIG,
  loadEventConfig,
  saveEventConfig,
  loadParticipants,
  saveParticipants,
  buildVerificationUrl,
  parseScannedPayload,
} from './utils/ticketStorage';

export default function App() {
  const [eventConfig, setEventConfig] = useState(() => loadEventConfig());
  const [participants, setParticipants] = useState(() => loadParticipants());
  const [selectedParticipantId, setSelectedParticipantId] = useState(() => {
    const initial = loadParticipants();
    return initial[0]?.id || '';
  });

  const [activeTab, setActiveTab] = useState('designer'); // 'designer' | 'participants' | 'scanner'
  const [verificationModalData, setVerificationModalData] = useState(null);
  const [isUrlVerifyMode, setIsUrlVerifyMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [printAllMode, setPrintAllMode] = useState(false);

  // New participant form state
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Peserta Undangan');
  const [newInstitution, setNewInstitution] = useState('YAPI Talent Academy');
  const [newTicketId, setNewTicketId] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Responsive preview scaling
  const previewContainerRef = useRef(null);
  const ticketRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(1);

  // Save changes to localStorage
  useEffect(() => {
    saveEventConfig(eventConfig);
  }, [eventConfig]);

  useEffect(() => {
    saveParticipants(participants);
  }, [participants]);

  // Check if URL has ?verify=1 from QR Code scan
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verify') === '1' && params.get('id')) {
      const parsed = parseScannedPayload(window.location.href, participants, eventConfig);
      setVerificationModalData(parsed);
      setIsUrlVerifyMode(true);
    }
  }, []);

  // Responsive scale observer for ticket preview
  useEffect(() => {
    const updateScale = () => {
      if (!previewContainerRef.current) return;
      const availableWidth = previewContainerRef.current.clientWidth - 24;
      const targetWidth = 1116;
      const nextScale = Math.min(1, Math.max(0.32, availableWidth / targetWidth));
      setPreviewScale(nextScale);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [activeTab]);

  const activeParticipant = useMemo(() => {
    return (
      participants.find((p) => p.id === selectedParticipantId) ||
      participants[0] || {
        id: 'default',
        ticketId: 'YAPI-2026-001',
        name: 'M. Kholid Syaifulloh',
        role: 'Peserta Undangan',
        institution: 'YAPI Talent Academy',
        checkedIn: false,
      }
    );
  }, [participants, selectedParticipantId]);

  const activeIndex = useMemo(() => {
    return Math.max(
      0,
      participants.findIndex((p) => p.id === activeParticipant.id)
    );
  }, [participants, activeParticipant]);

  const handleConfigChange = (field, value) => {
    setEventConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (field, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleConfigChange(field, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadPng = async () => {
    if (!ticketRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(ticketRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
        width: 1116,
        height: 426,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
      });
      const link = document.createElement('a');
      const safeName = activeParticipant.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      link.download = `Tiket_${activeParticipant.ticketId}_${safeName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert('Gagal mengunduh gambar tiket. Anda juga dapat menggunakan tombol Cetak / Simpan PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyVerifyUrl = () => {
    const url = buildVerificationUrl(activeParticipant, eventConfig);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleVerifyParticipant = (participantToVerify) => {
    const url = buildVerificationUrl(participantToVerify, eventConfig);
    const parsed = parseScannedPayload(url, participants, eventConfig);
    setVerificationModalData(parsed);
  };

  const handleScanResult = (rawScannedString) => {
    const parsed = parseScannedPayload(rawScannedString, participants, eventConfig);
    setVerificationModalData(parsed);
  };

  const handleToggleCheckIn = (ticketId) => {
    const nowStr = new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setParticipants((prev) =>
      prev.map((p) => {
        if (p.ticketId.toLowerCase() === ticketId.toLowerCase()) {
          const nextChecked = !p.checkedIn;
          return {
            ...p,
            checkedIn: nextChecked,
            checkedInAt: nextChecked ? `${nowStr} WIB` : null,
          };
        }
        return p;
      })
    );

    setVerificationModalData((prev) => {
      if (!prev || prev.ticketId.toLowerCase() !== ticketId.toLowerCase()) return prev;
      const nextChecked = !prev.checkedIn;
      return {
        ...prev,
        checkedIn: nextChecked,
        checkedInAt: nextChecked ? `${nowStr} WIB` : null,
      };
    });
  };

  const generateNextTicketId = (currentList = participants) => {
    const nextNum = currentList.length + 1;
    return `YAPI-2026-${String(nextNum).padStart(3, '0')}`;
  };

  const handleAddParticipant = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const generatedId = newTicketId.trim() || generateNextTicketId();
    const newEntry = {
      id: `p-${Date.now()}`,
      ticketId: generatedId,
      name: newName.trim(),
      role: newRole.trim() || 'Peserta Undangan',
      institution: newInstitution.trim() || 'YAPI Talent Academy',
      status: 'Terdaftar Resmi',
      checkedIn: false,
      checkedInAt: null,
    };
    setParticipants((prev) => [...prev, newEntry]);
    setSelectedParticipantId(newEntry.id);
    setNewName('');
    setNewTicketId('');
  };

  const handleBulkImport = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const added = [];
    lines.forEach((line, idx) => {
      const parts = line.split(/[;,\t]/).map((s) => s.trim());
      const name = parts[0];
      if (!name) return;
      const role = parts[1] || 'Peserta Undangan';
      const institution = parts[2] || `${eventConfig.orgNameTop} ${eventConfig.orgNameBottom}`;
      const ticketId =
        parts[3] || `YAPI-2026-${String(participants.length + idx + 1).padStart(3, '0')}`;

      added.push({
        id: `p-${Date.now()}-${idx}`,
        ticketId,
        name,
        role,
        institution,
        status: 'Terdaftar Resmi',
        checkedIn: false,
        checkedInAt: null,
      });
    });

    if (added.length > 0) {
      setParticipants((prev) => [...prev, ...added]);
      setSelectedParticipantId(added[0].id);
      setBulkText('');
      setShowBulkModal(false);
    }
  };

  const handleDeleteParticipant = (id) => {
    if (participants.length <= 1) {
      alert('Minimal harus ada 1 peserta dalam daftar.');
      return;
    }
    const next = participants.filter((p) => p.id !== id);
    setParticipants(next);
    if (selectedParticipantId === id) {
      setSelectedParticipantId(next[0].id);
    }
  };

  const handleExportCsv = () => {
    const headers = ['ID Tiket', 'Nama Peserta', 'Jabatan/Peran', 'Instansi', 'Status Kehadiran', 'Waktu Check-In', 'Link Verifikasi QR'];
    const rows = participants.map((p) => [
      p.ticketId,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${(p.role || '').replace(/"/g, '""')}"`,
      `"${(p.institution || '').replace(/"/g, '""')}"`,
      p.checkedIn ? 'Sudah Hadir' : 'Belum Check-In',
      p.checkedInAt || '-',
      `"${buildVerificationUrl(p, eventConfig)}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Peserta_${eventConfig.titleLine1.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If opened directly from QR scan (?verify=1), show full-screen official legality verification
  if (isUrlVerifyMode && verificationModalData) {
    return (
      <VerificationModal
        verificationData={verificationModalData}
        isStandalonePage={true}
        onToggleCheckIn={handleToggleCheckIn}
        onClose={() => {
          window.history.replaceState({}, '', window.location.pathname);
          setIsUrlVerifyMode(false);
          setVerificationModalData(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand Title */}
          <div className="flex items-center gap-3.5">
            <YapiLogo variant="white" size={42} showText={false} customLogoUrl={eventConfig.customLogoUrl} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-extrabold text-base sm:text-lg text-white tracking-tight">
                  YAPI Ticket & Invitation Studio
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  QR Legalitas Aktif
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generator Undangan & Tiket Pelatihan Resmi dengan Verifikasi QR Kriptografis
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('designer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'designer'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Ticket className="w-4 h-4" />
              Desain & Cetak Tiket
            </button>

            <button
              onClick={() => setActiveTab('participants')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'participants'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              Peserta ({participants.length})
            </button>

            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'scanner'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <QrCode className="w-4 h-4" />
              Scan & Verifikasi QR
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* ==================== TAB 1: DESIGNER & PREVIEW ==================== */}
        {activeTab === 'designer' && (
          <>
            {/* Live Ticket Preview Stage */}
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
              {/* Top Action Bar above Ticket */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                {/* Participant Selector Switcher */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Peserta Aktif:</span>
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => {
                        const prevIdx = (activeIndex - 1 + participants.length) % participants.length;
                        setSelectedParticipantId(participants[prevIdx].id);
                      }}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                      title="Peserta Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <select
                      value={activeParticipant.id}
                      onChange={(e) => setSelectedParticipantId(e.target.value)}
                      className="bg-transparent text-xs font-bold text-white px-2 py-1 focus:outline-none cursor-pointer"
                    >
                      {participants.map((p) => (
                        <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                          {p.ticketId} — {p.name}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        const nextIdx = (activeIndex + 1) % participants.length;
                        setSelectedParticipantId(participants[nextIdx].id);
                      }}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                      title="Peserta Berikutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Export & Verification Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleVerifyParticipant(activeParticipant)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition"
                  >
                    <Eye className="w-4 h-4" />
                    Simulasi Scan QR Legalitas
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyVerifyUrl}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        Link Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-sky-400" />
                        Salin Link Verifikasi
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                  >
                    <Printer className="w-4 h-4 text-sky-400" />
                    Cetak / PDF
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPng}
                    disabled={isExporting}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-sky-600/25 transition"
                  >
                    <Download className="w-4 h-4" />
                    {isExporting ? 'Memproses Gambar HD...' : 'Download Tiket (PNG HD)'}
                  </button>
                </div>
              </div>

              {/* Scaled Ticket Container */}
              <div
                ref={previewContainerRef}
                className="w-full overflow-hidden flex justify-center items-center py-2"
              >
                <div
                  style={{
                    width: 1116 * previewScale,
                    height: 426 * previewScale,
                  }}
                  className="relative flex items-start justify-start"
                >
                  <div
                    style={{
                      transform: `scale(${previewScale})`,
                      transformOrigin: 'top left',
                    }}
                  >
                    <TicketCard
                      eventConfig={eventConfig}
                      participant={activeParticipant}
                      ticketRef={ticketRef}
                      onClickVerify={() => handleVerifyParticipant(activeParticipant)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
                <span>
                  ✨ <strong>Interaktif:</strong> Klik langsung pada <strong>QR Code di bagian kanan tiket</strong> untuk menguji tampilan halaman Legalitas Peserta Undangan.
                </span>
                <span>Resolusi Cetak Asli: 2790 × 1065 px (300 DPI Ready)</span>
              </div>
            </section>

            {/* Customization Form Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 Cols: Event Details Editor */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-sky-400" />
                    Kustomisasi Informasi Pelatihan & Undangan
                  </h2>
                  <button
                    type="button"
                    onClick={() => setEventConfig(DEFAULT_EVENT_CONFIG)}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset ke Contoh YAPI
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Label Kategori Acara
                    </label>
                    <input
                      type="text"
                      value={eventConfig.categoryLabel}
                      onChange={(e) => handleConfigChange('categoryLabel', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Nama Penyelenggara (Baris 1)
                    </label>
                    <input
                      type="text"
                      value={eventConfig.orgNameTop}
                      onChange={(e) => handleConfigChange('orgNameTop', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Nama Penyelenggara (Baris 2)
                    </label>
                    <input
                      type="text"
                      value={eventConfig.orgNameBottom}
                      onChange={(e) => handleConfigChange('orgNameBottom', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Judul Pelatihan (Baris Utama 1)
                    </label>
                    <input
                      type="text"
                      value={eventConfig.titleLine1}
                      onChange={(e) => handleConfigChange('titleLine1', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Kata Hubung
                    </label>
                    <input
                      type="text"
                      value={eventConfig.titleConnector}
                      onChange={(e) => handleConfigChange('titleConnector', e.target.value)}
                      placeholder="dan"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-sky-400 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Judul Pelatihan (Baris Utama 2)
                    </label>
                    <input
                      type="text"
                      value={eventConfig.titleLine2}
                      onChange={(e) => handleConfigChange('titleLine2', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Hari
                    </label>
                    <input
                      type="text"
                      value={eventConfig.dayName}
                      onChange={(e) => handleConfigChange('dayName', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Tanggal Pelatihan
                    </label>
                    <input
                      type="text"
                      value={eventConfig.dateStr}
                      onChange={(e) => handleConfigChange('dateStr', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Lokasi (Baris 1)
                    </label>
                    <input
                      type="text"
                      value={eventConfig.locationLine1}
                      onChange={(e) => handleConfigChange('locationLine1', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Lokasi (Baris 2)
                    </label>
                    <input
                      type="text"
                      value={eventConfig.locationLine2}
                      onChange={(e) => handleConfigChange('locationLine2', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Waktu Pelaksanaan
                    </label>
                    <input
                      type="text"
                      value={eventConfig.timeStr}
                      onChange={(e) => handleConfigChange('timeStr', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Right 5 Cols: Visuals & Active Participant Quick Edit */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <ImageIcon className="w-4 h-4 text-sky-400" />
                  Tampilan Visual & Identitas Peserta
                </h2>

                {/* Quick Edit Active Participant */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-sky-400 flex items-center justify-between">
                    <span>Edit Cepat Peserta pada Tiket Ini</span>
                    <span className="font-mono text-[11px] text-slate-400">{activeParticipant.ticketId}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Nama Peserta</label>
                      <input
                        type="text"
                        value={activeParticipant.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setParticipants((prev) =>
                            prev.map((p) => (p.id === activeParticipant.id ? { ...p, name: val } : p))
                          );
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Jabatan / Status</label>
                      <input
                        type="text"
                        value={activeParticipant.role}
                        onChange={(e) => {
                          const val = e.target.value;
                          setParticipants((prev) =>
                            prev.map((p) => (p.id === activeParticipant.id ? { ...p, role: val } : p))
                          );
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Upload Custom Background & Logo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-sky-500 cursor-pointer transition text-center">
                    <Upload className="w-4 h-4 text-sky-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-200">Ganti Foto Ilustrasi</span>
                    <span className="text-[10px] text-slate-500">PNG / JPG (Kanan Tiket)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('customBgUrl', e)}
                      className="hidden"
                    />
                  </label>

                  <label className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-sky-500 cursor-pointer transition text-center">
                    <Upload className="w-4 h-4 text-sky-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-200">Upload Logo Kustom</span>
                    <span className="text-[10px] text-slate-500">Opsional (Default: YAPI)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('customLogoUrl', e)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Checkboxes for visual elements */}
                <div className="space-y-2.5 pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={eventConfig.showParticipantOnMain}
                      onChange={(e) => handleConfigChange('showParticipantOnMain', e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500"
                    />
                    Tampilkan badge nama peserta &ldquo;Kepada Yth&rdquo; di halaman utama tiket
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={eventConfig.showSpeechBubbles}
                      onChange={(e) => handleConfigChange('showSpeechBubbles', e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500"
                    />
                    Tampilkan elemen ikon balon diskusi (Active Listening)
                  </label>
                </div>

                {/* Vercel Domain Configuration for QR Code */}
                <div className="pt-2 border-t border-slate-800">
                  <label className="block text-[11px] font-semibold text-emerald-400 mb-1">
                    Domain Publik Vercel (Target Link saat QR Di-Scan HP)
                  </label>
                  <input
                    type="url"
                    value={eventConfig.publicBaseUrl || ''}
                    onChange={(e) => handleConfigChange('publicBaseUrl', e.target.value)}
                    placeholder="https://tiket-undangan-pelatihan.vercel.app"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-sky-300 focus:outline-none focus:border-sky-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Kosongkan untuk otomatis mengikuti domain aktif, atau isi dengan domain Vercel Anda agar QR yang dicetak dari localhost langsung mengarah ke Vercel.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ==================== TAB 2: PARTICIPANTS & BULK GENERATOR ==================== */}
        {activeTab === 'participants' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Add Participant Form */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 h-fit">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-sky-400" />
                  Tambah Peserta Undangan
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Setiap peserta otomatis mendapatkan ID Tiket & QR Code Legalitas unik.
                </p>
              </div>

              <form onSubmit={handleAddParticipant} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nama Lengkap & Gelar *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Contoh: Budi Santoso, S.E."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Status / Jabatan Peserta
                  </label>
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="Peserta Undangan / Pembicara / VIP"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Unit / Instansi
                  </label>
                  <input
                    type="text"
                    value={newInstitution}
                    onChange={(e) => setNewInstitution(e.target.value)}
                    placeholder="YAPI Talent Academy"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nomor ID Tiket (Kosongkan untuk Otomatis)
                  </label>
                  <input
                    type="text"
                    value={newTicketId}
                    onChange={(e) => setNewTicketId(e.target.value)}
                    placeholder={generateNextTicketId()}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-sky-400 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Tambahkan & Buat QR Tiket
                </button>
              </form>

              <div className="pt-3 border-t border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(!showBulkModal)}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  Import Banyak Peserta Sekaligus (Copy-Paste Excel)
                </button>

                {showBulkModal && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <p className="text-[11px] text-slate-400">
                      Tempel daftar peserta (1 baris per peserta). Format: <code className="text-sky-300">Nama, Jabatan, Instansi</code>
                    </p>
                    <textarea
                      rows={4}
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      placeholder={`Rina Wulandari, Peserta Undangan, Divisi HRD\nBagus Setiawan, Manajer Operasional, YAPI`}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleBulkImport}
                      className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                    >
                      Proses Import Daftar Peserta
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Participant Table */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-white">
                    Daftar Resmi Peserta Undangan ({participants.length})
                  </h2>
                  <p className="text-xs text-slate-400">
                    Pilih peserta untuk melihat/mengunduh tiketnya, atau kelola status kehadiran.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    Export Excel/CSV
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400">
                      <th className="py-3 px-3">ID Tiket</th>
                      <th className="py-3 px-3">Nama Peserta</th>
                      <th className="py-3 px-3">Jabatan / Instansi</th>
                      <th className="py-3 px-3">Status Legalitas & Hadir</th>
                      <th className="py-3 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-xs">
                    {participants.map((p) => {
                      const isSelected = p.id === activeParticipant.id;
                      return (
                        <tr
                          key={p.id}
                          className={`transition ${
                            isSelected ? 'bg-sky-950/30' : 'hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="py-3 px-3 font-mono font-bold text-sky-400 whitespace-nowrap">
                            {p.ticketId}
                          </td>
                          <td className="py-3 px-3 font-bold text-white">
                            {p.name}
                          </td>
                          <td className="py-3 px-3 text-slate-300">
                            <div>{p.role}</div>
                            <div className="text-[10px] text-slate-500">{p.institution}</div>
                          </td>
                          <td className="py-3 px-3">
                            <button
                              type="button"
                              onClick={() => handleToggleCheckIn(p.ticketId)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                                p.checkedIn
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {p.checkedIn ? 'Hadir / Checked-In' : 'Terdaftar (Klik Check-in)'}
                            </button>
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap space-x-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedParticipantId(p.id);
                                setActiveTab('designer');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-semibold transition"
                            >
                              Lihat Tiket
                            </button>
                            <button
                              type="button"
                              onClick={() => handleVerifyParticipant(p)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition"
                              title="Cek Sertifikat Legalitas QR"
                            >
                              Cek QR
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteParticipant(p.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: QR SCANNER & LEGALITY CHECKER ==================== */}
        {activeTab === 'scanner' && (
          <QrScannerPanel
            onScanResult={handleScanResult}
            participants={participants}
            onSelectParticipantVerify={handleVerifyParticipant}
          />
        )}
      </main>

      {/* Official Legality Verification Modal */}
      {verificationModalData && (
        <VerificationModal
          verificationData={verificationModalData}
          onClose={() => setVerificationModalData(null)}
          onToggleCheckIn={handleToggleCheckIn}
        />
      )}
    </div>
  );
}

