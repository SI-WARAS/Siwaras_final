/**
 * Utilitas penanggalan untuk SI-WARAS.
 *
 * Masalah: JavaScript's `new Date().toISOString()` selalu menghasilkan waktu UTC
 * (misal 06:00 UTC = 13:00 WIB), sehingga waktu input menjadi tidak akurat.
 *
 * Solusi: Semua timestamp yang dikirim ke backend dibentuk dari waktu lokal
 * (tanpa konversi UTC), dan semua tampilan tanggal menggunakan `toLocaleString`
 * dengan locale dan timezone Indonesia.
 */

/**
 * Mendapatkan waktu sekarang dalam format ISO yang merepresentasikan
 * waktu LOKAL pengguna (bukan UTC). Format: "YYYY-MM-DDTHH:mm:ss"
 * Aman untuk dikirim ke backend Laravel yang sudah dikonfigurasi Asia/Jakarta.
 *
 * @returns {string} Waktu lokal dalam format "2026-06-17T13:45:00"
 */
export function getNowLocalISO() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    now.getFullYear() +
    "-" +
    pad(now.getMonth() + 1) +
    "-" +
    pad(now.getDate()) +
    "T" +
    pad(now.getHours()) +
    ":" +
    pad(now.getMinutes()) +
    ":" +
    pad(now.getSeconds())
  );
}

/**
 * Mendapatkan waktu sekarang dalam format untuk input `datetime-local` HTML.
 * Format: "YYYY-MM-DDTHH:mm"
 *
 * @returns {string} Waktu lokal dalam format "2026-06-17T13:45"
 */
export function getNowForDatetimeInput() {
  return getNowLocalISO().slice(0, 16);
}

/**
 * Memformat string tanggal dari backend menjadi tampilan bahasa Indonesia.
 * Mencegah masalah double-conversion UTC dengan memperlakukan string tanpa
 * suffix timezone sebagai waktu lokal.
 *
 * @param {string|Date} dateInput - String tanggal dari database atau objek Date
 * @param {object} options - Opsi tambahan: { showTime: true/false }
 * @returns {string} Tanggal dalam format Indonesia, misal "17 Jun 2026, 13:45"
 */
export function formatDisplayDate(dateInput, { showTime = true } = {}) {
  if (!dateInput) return "-";

  let date;
  if (typeof dateInput === "string") {
    // Jika string tidak memiliki 'Z' atau '+', anggap sebagai waktu lokal
    // agar JavaScript tidak mengkonversinya dari UTC secara salah.
    const hasTimezone = /Z|[+-]\d{2}:\d{2}$/.test(dateInput);
    date = new Date(hasTimezone ? dateInput : dateInput.replace(" ", "T"));
  } else {
    date = dateInput;
  }

  if (isNaN(date.getTime())) return "-";

  const localeOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(showTime && {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    timeZone: "Asia/Jakarta",
  };

  return date.toLocaleString("id-ID", localeOptions);
}

/**
 * Memformat string tanggal dari backend menjadi value untuk input `datetime-local`.
 * Digunakan saat mengedit rekam medis agar nilai default form akurat.
 *
 * @param {string|Date} dateInput
 * @returns {string} Format "YYYY-MM-DDTHH:mm"
 */
export function formatForDatetimeInput(dateInput) {
  if (!dateInput) return "";

  let date;
  if (typeof dateInput === "string") {
    const hasTimezone = /Z|[+-]\d{2}:\d{2}$/.test(dateInput);
    date = new Date(hasTimezone ? dateInput : dateInput.replace(" ", "T"));
  } else {
    date = dateInput;
  }

  if (isNaN(date.getTime())) return "";

  // Format ke "YYYY-MM-DDTHH:mm" menggunakan timezone Asia/Jakarta
  const tz = "Asia/Jakarta";
  const parts = new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: tz,
  }).format(date);

  // Intl dengan locale "sv-SE" menghasilkan "YYYY-MM-DD HH:mm", ubah spasi ke T
  return parts.replace(" ", "T");
}
