// Digital signature & verification utility for official participant legality

const SECRET_SALT = 'YAPI-TALENT-ACADEMY-LEGAL-2026-OFFICIAL';

export const STORAGE_KEYS = {
  EVENT_CONFIG: 'yapi_ticket_event_config_v1',
  PARTICIPANTS: 'yapi_ticket_participants_v1',
};

export const DEFAULT_EVENT_CONFIG = {
  orgNameTop: 'YAPI TALENT',
  orgNameBottom: 'ACADEMY',
  categoryLabel: 'PELATIHAN',
  titleLine1: 'Active Listening',
  titleConnector: 'dan',
  titleLine2: 'Komunikasi Efektif',
  dayName: "Jum'at",
  dateStr: '30 Oktober 2026',
  locationLine1: 'Ruang Rapat',
  locationLine2: 'YAPI',
  timeStr: '13.00 – selesai',
  customLogoUrl: '',
  customBgUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=900&q=80',
  showSpeechBubbles: true,
  showParticipantOnMain: true,
  stubStyle: 'qr_with_brand', // 'qr_with_brand' | 'qr_large' | 'classic_logo_qr'
  signatoryName: 'Direktur YAPI Talent Academy',
  publicBaseUrl: 'https://tiket-undangan-pelatihan.vercel.app',
};

export const DEFAULT_PARTICIPANTS = [
  {
    id: 'p-1',
    ticketId: 'YAPI-2026-001',
    name: 'M. Kholid Syaifulloh',
    role: 'Peserta Undangan VIP',
    institution: 'YAPI Talent Academy',
    status: 'Terdaftar Resmi',
    checkedIn: false,
    checkedInAt: null,
  },
  {
    id: 'p-2',
    ticketId: 'YAPI-2026-002',
    name: 'Dr. Siti Aminah, M.Psi.',
    role: 'Peserta Undangan',
    institution: 'Divisi Pengembangan SDM',
    status: 'Terdaftar Resmi',
    checkedIn: true,
    checkedInAt: '30 Okt 2026, 12:45 WIB',
  },
  {
    id: 'p-3',
    ticketId: 'YAPI-2026-003',
    name: 'Ahmad Fauzi Pratama, S.Kom.',
    role: 'Peserta Undangan',
    institution: 'Unit Komunikasi Korporat',
    status: 'Terdaftar Resmi',
    checkedIn: false,
    checkedInAt: null,
  },
  {
    id: 'p-4',
    ticketId: 'YAPI-2026-004',
    name: 'Nadia Putri Maharani',
    role: 'Koordinator Pelatihan',
    institution: 'YAPI Talent Academy',
    status: 'Terdaftar Resmi',
    checkedIn: false,
    checkedInAt: null,
  },
];

export function loadEventConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENT_CONFIG);
    if (!raw) return DEFAULT_EVENT_CONFIG;
    return { ...DEFAULT_EVENT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_EVENT_CONFIG;
  }
}

export function saveEventConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENT_CONFIG, JSON.stringify(config));
  } catch {
    // ignore storage errors
  }
}

export function loadParticipants() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
    if (!raw) return DEFAULT_PARTICIPANTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PARTICIPANTS;
  } catch {
    return DEFAULT_PARTICIPANTS;
  }
}

export function saveParticipants(list) {
  try {
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(list));
  } catch {
    // ignore storage errors
  }
}

/**
 * Generates an 8-character uppercase deterministic signature hash
 * so any device scanning the QR URL can verify authenticity even offline/cross-device.
 */
export function generateSignature(ticketId, name, eventTitle, dateText) {
  const raw = `${(ticketId || '').trim()}|${(name || '').trim()}|${(eventTitle || '').trim()}|${(dateText || '').trim()}|${SECRET_SALT}`;
  let h1 = 0xdeadbeef ^ raw.length;
  let h2 = 0x41c6ce57 ^ raw.length;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const combined = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return combined.toString(36).toUpperCase().padStart(8, '0').slice(0, 8);
}

/**
 * Builds the verification URL encoded inside the Ticket QR Code.
 * Contains signed payload so scanning with ANY phone camera opens the official legality verification page.
 */
export function buildVerificationUrl(participant, eventConfig, baseUrl) {
  const configuredUrl = (baseUrl || eventConfig?.publicBaseUrl || '').trim().replace(/\/+$/, '');
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const origin =
    configuredUrl ||
    (typeof window !== 'undefined' && !isLocalhost
      ? window.location.origin + window.location.pathname
      : typeof window !== 'undefined'
      ? window.location.origin + window.location.pathname
      : 'https://tiket-undangan-pelatihan.vercel.app');
  const fullTitle = `${eventConfig.titleLine1} ${eventConfig.titleConnector} ${eventConfig.titleLine2}`.trim();
  const dateText = `${eventConfig.dayName}, ${eventConfig.dateStr}`;
  const orgFull = `${eventConfig.orgNameTop || 'YAPI TALENT'} ${eventConfig.orgNameBottom || 'ACADEMY'}`.trim();
  const sig = generateSignature(participant.ticketId, participant.name, fullTitle, dateText);

  const params = new URLSearchParams({
    verify: '1',
    id: participant.ticketId,
    name: participant.name,
    role: participant.role || 'Peserta Undangan',
    inst: participant.institution || orgFull,
    event: fullTitle,
    cat: eventConfig.categoryLabel || 'PELATIHAN',
    date: dateText,
    loc: `${eventConfig.locationLine1} ${eventConfig.locationLine2}`.trim(),
    time: eventConfig.timeStr,
    org: orgFull,
    sig,
  });

  return `${origin}?${params.toString()}`;
}

/**
 * Parses a scanned QR string (either a verification URL, JSON, or raw ticket ID)
 */
export function parseScannedPayload(rawText, participants = [], eventConfig = {}) {
  const trimmed = (rawText || '').trim();
  if (!trimmed) return { valid: false, reason: 'Data QR kosong' };

  const defaultOrg = `${eventConfig.orgNameTop || 'YAPI TALENT'} ${eventConfig.orgNameBottom || 'ACADEMY'}`.trim();

  // 1. Check if it's a URL with ?verify=1
  if (trimmed.includes('verify=1') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed);
      const params = url.searchParams;
      if (params.get('id') && params.get('name')) {
        const id = params.get('id');
        const name = params.get('name');
        const event = params.get('event') || '';
        const date = params.get('date') || '';
        const sig = params.get('sig') || '';
        const expectedSig = generateSignature(id, name, event, date);
        const isSignatureValid = sig === expectedSig;

        // Also check local database if available
        const localMatch = participants.find(
          (p) => p.ticketId.toLowerCase() === id.toLowerCase()
        );

        return {
          valid: isSignatureValid || Boolean(localMatch),
          signatureVerified: isSignatureValid,
          inLocalDb: Boolean(localMatch),
          ticketId: id,
          name: localMatch ? localMatch.name : name,
          role: localMatch ? localMatch.role : params.get('role') || 'Peserta Undangan',
          institution: localMatch ? localMatch.institution : params.get('inst') || defaultOrg,
          status: localMatch ? localMatch.status : 'Terdaftar Resmi',
          checkedIn: localMatch ? Boolean(localMatch.checkedIn) : false,
          checkedInAt: localMatch ? localMatch.checkedInAt : null,
          eventTitle: event,
          categoryLabel: params.get('cat') || 'PELATIHAN',
          dateText: date,
          locationText: params.get('loc') || '',
          timeText: params.get('time') || '',
          orgName: params.get('org') || defaultOrg,
          signature: sig || expectedSig,
          reason: isSignatureValid
            ? 'Tanda tangan digital kriptografis cocok & sah'
            : localMatch
            ? 'Terdaftar di database peserta lokal'
            : 'Tanda tangan digital tidak cocok / QR dimodifikasi',
        };
      }
    } catch {
      // Fallback if URL parsing fails
    }
  }

  // 2. Check if rawText matches a ticketId or signature in local participants list
  const fullTitle = `${eventConfig.titleLine1 || ''} ${eventConfig.titleConnector || ''} ${eventConfig.titleLine2 || ''}`.trim();
  const dateText = `${eventConfig.dayName || ''}, ${eventConfig.dateStr || ''}`;

  const localMatch = participants.find(
    (p) =>
      p.ticketId.toLowerCase() === trimmed.toLowerCase() ||
      generateSignature(p.ticketId, p.name, fullTitle, dateText).toLowerCase() === trimmed.toLowerCase()
  );

  if (localMatch) {
    const sig = generateSignature(localMatch.ticketId, localMatch.name, fullTitle, dateText);
    return {
      valid: true,
      signatureVerified: true,
      inLocalDb: true,
      ticketId: localMatch.ticketId,
      name: localMatch.name,
      role: localMatch.role || 'Peserta Undangan',
      institution: localMatch.institution || defaultOrg,
      status: localMatch.status || 'Terdaftar Resmi',
      checkedIn: Boolean(localMatch.checkedIn),
      checkedInAt: localMatch.checkedInAt || null,
      eventTitle: fullTitle,
      categoryLabel: eventConfig.categoryLabel || 'PELATIHAN',
      dateText,
      locationText: `${eventConfig.locationLine1 || ''} ${eventConfig.locationLine2 || ''}`.trim(),
      timeText: eventConfig.timeStr || '',
      orgName: defaultOrg,
      signature: sig,
      reason: 'Data peserta ditemukan dalam daftar resmi penyelenggara',
    };
  }

  return {
    valid: false,
    signatureVerified: false,
    inLocalDb: false,
    ticketId: trimmed.slice(0, 32),
    reason: 'Kode Tiket / QR tidak terdaftar atau tidak memiliki legalitas resmi.',
  };
}
