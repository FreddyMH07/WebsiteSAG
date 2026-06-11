const ACCESS_KEY = (import.meta.env.PUBLIC_WEB3FORMS_KEY_CAREER ?? import.meta.env.VITE_WEB3FORMS_ACCESS_KEY) as string | undefined;
const ENDPOINT = 'https://api.web3forms.com/submit';

interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
}

interface ApplyNotificationPayload {
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  jobTitle: string;
  appliedAt: string;
  cvUrl?: string;
  adminDetailUrl?: string;
}

async function submitForm(data: Record<string, string>) {
  if (!ACCESS_KEY) throw new Error('Web3Forms key not configured');
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ access_key: ACCESS_KEY, ...data }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Form submission failed');
  return json;
}

export async function sendContactForm(payload: ContactPayload) {
  return submitForm({
    subject: `[SAG Contact] ${payload.subject}`,
    name: payload.name,
    email: payload.email,
    phone: payload.phone ?? '',
    company: payload.company ?? '',
    message: payload.message,
  });
}

export async function sendPartnershipForm(payload: ContactPayload) {
  return submitForm({
    subject: `[SAG Partnership] ${payload.subject}`,
    name: payload.name,
    email: payload.email,
    phone: payload.phone ?? '',
    company: payload.company ?? '',
    message: payload.message,
  });
}

interface HelpdeskPayload {
  hrName: string;
  hrEmail: string;
  pageUrl: string;
  kategori: string;
  subjek: string;
  deskripsi: string;
}

export async function sendHelpdeskTicket(payload: HelpdeskPayload) {
  const message = [
    `Kategori : ${payload.kategori}`,
    `Subjek   : ${payload.subjek}`,
    ``,
    `Deskripsi:`,
    payload.deskripsi,
    ``,
    `--- Info Teknis ---`,
    `Pengirim : ${payload.hrName} <${payload.hrEmail}>`,
    `Halaman  : ${payload.pageUrl}`,
    `Waktu    : ${new Date().toLocaleString('id-ID')}`,
  ].join('\n');

  return submitForm({
    subject: `[Helpdesk SAG] ${payload.kategori}: ${payload.subjek}`,
    name:    payload.hrName,
    email:   payload.hrEmail,
    message,
  });
}

export async function sendApplyNotification(payload: ApplyNotificationPayload) {
  const message = [
    `Kandidat Baru Melamar`,
    ``,
    `Nama: ${payload.candidateName}`,
    `Email: ${payload.candidateEmail}`,
    `WhatsApp: ${payload.candidatePhone}`,
    `Posisi: ${payload.jobTitle}`,
    `Tanggal Apply: ${payload.appliedAt}`,
    payload.cvUrl ? `CV: ${payload.cvUrl}` : '',
    payload.adminDetailUrl ? `Admin Detail: ${payload.adminDetailUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return submitForm({
    subject: `[SAG Career] Lamaran Baru – ${payload.jobTitle} – ${payload.candidateName}`,
    name: payload.candidateName,
    email: payload.candidateEmail,
    message,
  });
}
