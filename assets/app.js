/* =========================================================
   SEKE MESARI — Arisan & Pinjaman Keluarga
   Client-side demo (localStorage). Login/OTP = simulasi UI,
   BUKAN sistem otentikasi nyata. Lihat README bagian Keamanan.
   ========================================================= */

const STORAGE_KEY = "seke_mesari_state_v1";
const THEME_KEY = "seke_mesari_theme";
const SESSION_KEY = "seke_mesari_session";

const BUNGA_PERSEN = 1;
const TOTAL_CICILAN = 10;
const TOTAL_PERIODE = 10;

function todayIso() { return new Date().toISOString().slice(0, 10); }
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function nowIso() { return new Date().toISOString(); }

/* ===== Seed data ===== */
function buildSeedState() {
  const anggotaSeed = [
    { nama: "Gede", hp: "081111000001", password: "admin123", role: "admin", tanggalBergabung: "2025-01-10", totalSimpanan: 1250000, pinjaman: null, tunggakan: 0 },
    { nama: "Made", hp: "081111000002", password: "made123", role: "anggota", tanggalBergabung: "2025-01-10", totalSimpanan: 900000, pinjaman: { jumlah: 1000000, cicilanTerbayar: 6, jatuhTempoOffset: 4 }, tunggakan: 0 },
    { nama: "Wayan", hp: "081111000003", password: "wayan123", role: "anggota", tanggalBergabung: "2025-01-10", totalSimpanan: 700000, pinjaman: { jumlah: 1000000, cicilanTerbayar: 3, jatuhTempoOffset: -6 }, tunggakan: 2 },
    { nama: "Komang", hp: "081111000004", password: "komang123", role: "anggota", tanggalBergabung: "2025-02-05", totalSimpanan: 1100000, pinjaman: null, tunggakan: 0 },
    { nama: "Ketut", hp: "081111000005", password: "ketut123", role: "anggota", tanggalBergabung: "2025-02-05", totalSimpanan: 500000, pinjaman: { jumlah: 500000, cicilanTerbayar: 1, jatuhTempoOffset: -20 }, tunggakan: 3 },
    { nama: "Nyoman", hp: "081111000006", password: "nyoman123", role: "anggota", tanggalBergabung: "2025-02-20", totalSimpanan: 800000, pinjaman: null, tunggakan: 0 },
    { nama: "Putu", hp: "081111000007", password: "putu123", role: "anggota", tanggalBergabung: "2025-03-01", totalSimpanan: 650000, pinjaman: { jumlah: 2000000, cicilanTerbayar: 8, jatuhTempoOffset: 2 }, tunggakan: 0 },
    { nama: "Kadek", hp: "081111000008", password: "kadek123", role: "anggota", tanggalBergabung: "2025-03-15", totalSimpanan: 400000, pinjaman: null, tunggakan: 0 },
    { nama: "Wayan Sari", hp: "081111000009", password: "sari123", role: "anggota", tanggalBergabung: "2025-04-01", totalSimpanan: 950000, pinjaman: null, tunggakan: 0 },
    { nama: "Made Ayu", hp: "081111000010", password: "ayu123", role: "anggota", tanggalBergabung: "2025-04-01", totalSimpanan: 350000, pinjaman: { jumlah: 1000000, cicilanTerbayar: 5, jatuhTempoOffset: 9 }, tunggakan: 1 }
  ];

  const anggota = anggotaSeed.map((s, i) => ({
    id: "A" + String(i + 1).padStart(3, "0"),
    nama: s.nama,
    hp: s.hp,
    password: s.password,
    role: s.role,
    tanggalBergabung: s.tanggalBergabung,
    status: "aktif",
    totalSimpanan: s.totalSimpanan,
    tunggakan: s.tunggakan,
    pinjaman: s.pinjaman ? {
      jumlah: s.pinjaman.jumlah,
      totalCicilan: TOTAL_CICILAN,
      cicilanTerbayar: s.pinjaman.cicilanTerbayar,
      bungaPersenBulan: BUNGA_PERSEN,
      jatuhTempo: daysFromNow(s.pinjaman.jatuhTempoOffset)
    } : null
  }));

  const transaksi = [
    { id: "T001", tanggal: daysFromNow(-1), anggotaId: anggota[1].id, jenis: "setoran", jumlah: 50000, arah: "masuk", keterangan: "Setoran bulanan" },
    { id: "T002", tanggal: daysFromNow(-5), anggotaId: anggota[2].id, jenis: "setoran", jumlah: 50000, arah: "masuk", keterangan: "Setoran bulanan" },
    { id: "T003", tanggal: daysFromNow(-3), anggotaId: anggota[3].id, jenis: "setoran", jumlah: 50000, arah: "masuk", keterangan: "Setoran bulanan" }
  ];

  /* Bangun pencairan + riwayat angsuran otomatis untuk tiap anggota
     berpinjaman, konsisten dengan cicilanTerbayar & rumus angsuran
     (bukan cuma satu-dua transaksi contoh) — supaya jumlah "X dari Y
     kali" di UI selalu punya riwayat sebanyak X entri sungguhan,
     bukan kelihatan bolong. Interval antar cicilan ~30 hari mundur
     dari jatuh tempo berikutnya. */
  anggotaSeed.forEach((s, i) => {
    if (!s.pinjaman) return;
    const a = anggota[i];
    const { cicilanTerbayar, jatuhTempoOffset } = s.pinjaman;
    const angsuran = angsuranPerBulan(a.pinjaman);
    const disbursementOffset = jatuhTempoOffset - (cicilanTerbayar + 1) * 30;
    transaksi.push({
      id: "T" + String(transaksi.length + 1).padStart(3, "0"),
      tanggal: daysFromNow(disbursementOffset), anggotaId: a.id, jenis: "pinjaman",
      jumlah: s.pinjaman.jumlah, arah: "keluar", keterangan: "Pencairan pinjaman"
    });
    for (let k = 1; k <= cicilanTerbayar; k++) {
      const offset = jatuhTempoOffset - (cicilanTerbayar - k + 1) * 30;
      transaksi.push({
        id: "T" + String(transaksi.length + 1).padStart(3, "0"),
        tanggal: daysFromNow(offset), anggotaId: a.id, jenis: "angsuran",
        jumlah: angsuran, arah: "masuk", keterangan: `Angsuran ke-${k}`
      });
    }
  });

  const pengumuman = [
    { id: "P1", teks: "Pertemuan Bulanan 10 September di Balai Banjar", tanggal: daysFromNow(3) },
    { id: "P2", teks: "Kas Periode ke-7 telah ditutup", tanggal: daysFromNow(-2) },
    { id: "P3", teks: "Pengajuan pinjaman periode ke-8 dibuka", tanggal: daysFromNow(-1) }
  ];

  return {
    periodeSekarang: 7,
    totalPeriode: TOTAL_PERIODE,
    kasTerkumpulAwal: 8000000,
    anggota,
    transaksi,
    pengumuman,
    pengajuanPinjaman: [],
    buktiPembayaran: [],
    auditLog: [
      { id: "L1", actor: "Gede", aksi: "Menyetujui pinjaman Made sebesar Rp1.000.000", waktu: new Date(Date.now() - 206 * 86400000).toISOString() },
      { id: "L2", actor: "Gede", aksi: "Menyetujui pinjaman Wayan sebesar Rp1.000.000", waktu: new Date(Date.now() - 126 * 86400000).toISOString() }
    ]
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Gagal membaca data tersimpan, memakai data contoh.", e);
  }
  const seed = buildSeedState();
  saveState(seed);
  return seed;
}
function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }
  catch (e) { console.warn("Gagal menyimpan data.", e); }
}

let state = loadState();
let session = null;
try { session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch (e) { session = null; }

let viewAsAdmin = false; // demo-only "lihat sebagai" toggle, follows session role by default
let lainnyaView = "menu";

/* ===== Helpers ===== */
function formatRupiah(n) {
  n = Math.round(n || 0);
  return "Rp" + n.toLocaleString("id-ID");
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}
function formatDateTime(iso) {
  return new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function initials(name) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}
function getAnggota(id) { return state.anggota.find(a => a.id === id); }
function currentUser() { return session ? getAnggota(session.anggotaId) : null; }
function isAdmin() { const u = currentUser(); return !!u && u.role === "admin"; }

function angsuranPerBulan(pinjaman) {
  return Math.round((pinjaman.jumlah / pinjaman.totalCicilan) * (1 + pinjaman.bungaPersenBulan / 100));
}
function sisaHutang(pinjaman) {
  const pokokPerCicilan = pinjaman.jumlah / pinjaman.totalCicilan;
  return Math.max(0, Math.round(pinjaman.jumlah - pokokPerCicilan * pinjaman.cicilanTerbayar));
}
function statusPinjaman(a) {
  if (!a.pinjaman) return { label: "Tidak Ada Pinjaman", cls: "none" };
  if (a.tunggakan >= 3) return { label: "Perlu Evaluasi Keanggotaan", cls: "evaluasi" };
  if (a.tunggakan >= 1) return { label: `Menunggak ${a.tunggakan}x`, cls: "telat" };
  return { label: "Lancar", cls: "lancar" };
}
function skorKepatuhan(a) {
  return Math.max(35, 100 - a.tunggakan * 15);
}
function starsForScore(score) {
  const n = Math.max(1, Math.min(5, Math.round(score / 20)));
  return "★".repeat(n) + "☆".repeat(5 - n);
}

/* ===== Derived totals ===== */
function totalAnggotaAktif() { return state.anggota.filter(a => a.status === "aktif").length; }
function kasTerkumpul() {
  const dariTransaksi = state.transaksi.reduce((s, t) => s + (t.arah === "masuk" ? t.jumlah : -t.jumlah), 0);
  return state.kasTerkumpulAwal + dariTransaksi;
}
function pinjamanBeredar() {
  return state.anggota.reduce((s, a) => s + (a.pinjaman ? sisaHutang(a.pinjaman) : 0), 0);
}
function totalSimpananAnggota() {
  return state.anggota.reduce((s, a) => s + a.totalSimpanan, 0);
}
/* Neraca (balance sheet). Aset = Kas + Piutang Pinjaman (pokok yang
   belum kembali). Kewajiban = Simpanan Anggota (dana titipan yang jadi
   tanggungan koperasi ke anggota). Ekuitas dihitung sebagai SISA
   (Aset − Kewajiban), bukan ditebak dari bunga per transaksi — supaya
   neraca selalu balance secara definisi, sesuai persamaan akuntansi
   dasar (Aset = Kewajiban + Ekuitas), dan tetap benar walau nominal
   pembayaran yang diverifikasi admin tidak persis mengikuti rumus
   angsuran. */
function totalAsetNeraca() {
  return kasTerkumpul() + pinjamanBeredar();
}
function totalKewajibanNeraca() {
  return totalSimpananAnggota();
}
function ekuitasNeraca() {
  return totalAsetNeraca() - totalKewajibanNeraca();
}
function anggotaMenunggak() { return state.anggota.filter(a => a.pinjaman && a.tunggakan >= 1).length; }
function jatuhTempoBulanIni() {
  const now = new Date();
  return state.anggota.filter(a => {
    if (!a.pinjaman) return false;
    const d = new Date(a.pinjaman.jatuhTempo);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
}
/* Riwayat angsuran untuk pinjaman yang SEDANG aktif milik satu anggota.
   Transaksi tidak menyimpan id pinjaman, tapi karena anggota hanya boleh
   punya satu pinjaman aktif sekaligus (pinjaman baru hanya bisa diajukan
   setelah pinjaman lama lunas), N transaksi "angsuran" terakhir milik
   anggota ini (N = cicilanTerbayar pinjaman aktif) pasti pembayaran
   untuk pinjaman yang sedang berjalan. */
function riwayatAngsuranAktif(a) {
  if (!a.pinjaman || a.pinjaman.cicilanTerbayar === 0) return [];
  const semua = state.transaksi
    .filter(t => t.anggotaId === a.id && t.jenis === "angsuran")
    .sort((x, y) => new Date(x.tanggal) - new Date(y.tanggal));
  return semua.slice(-a.pinjaman.cicilanTerbayar);
}

function pengingatList() {
  const now = new Date();
  return state.anggota
    .filter(a => a.pinjaman)
    .map(a => {
      const due = new Date(a.pinjaman.jatuhTempo);
      const diffDays = Math.ceil((due - now) / 86400000);
      return { anggota: a, diffDays };
    })
    .filter(x => x.diffDays <= 7)
    .sort((a, b) => a.diffDays - b.diffDays);
}

/* ===== Login flow =====
   Satu langkah (HP + password), tanpa OTP. Ini hanya untuk membedakan
   tampilan tiap anggota, bukan proteksi keamanan sungguhan — lihat
   README bagian Keamanan. */
function initLogin() {
  document.getElementById("loginStep1").addEventListener("submit", (e) => {
    e.preventDefault();
    const hp = document.getElementById("loginHp").value.trim();
    const pw = document.getElementById("loginPassword").value;
    const a = state.anggota.find(x => x.hp === hp);
    if (!a || a.password !== pw) {
      showToast("Nomor HP atau password salah.");
      return;
    }
    if (a.status !== "aktif") {
      showToast("Akun anggota ini nonaktif.");
      return;
    }
    session = { anggotaId: a.id };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    viewAsAdmin = a.role === "admin";
    enterApp();
  });
}

function logout() {
  session = null;
  localStorage.removeItem(SESSION_KEY);
  document.getElementById("appShell").hidden = true;
  document.getElementById("loginScreen").hidden = false;
  document.getElementById("loginStep1").reset();
}

function enterApp() {
  document.getElementById("loginScreen").hidden = true;
  document.getElementById("appShell").hidden = false;
  document.querySelectorAll(".admin-only").forEach(el => el.hidden = !isAdmin());
  renderHome();
}

/* ===== Tabs ===== */
const TAB_LABELS = { home: "Beranda", pinjaman: "Pinjaman", pembayaran: "Pembayaran", anggota: "Anggota", lainnya: "Lainnya" };
function switchTab(tab) {
  document.querySelectorAll(".tab-panel").forEach(el => el.hidden = true);
  document.getElementById("tab-" + tab).hidden = false;
  document.querySelectorAll(".nav-item").forEach(el => el.classList.toggle("active", el.dataset.tab === tab));
  document.getElementById("topbarSub").textContent = TAB_LABELS[tab];
  if (tab === "home") renderHome();
  if (tab === "pinjaman") renderPinjaman();
  if (tab === "pembayaran") renderPembayaran();
  if (tab === "anggota") renderMemberList(document.getElementById("memberSearch").value);
  if (tab === "lainnya") { lainnyaView = "menu"; renderLainnya(); }
}

/* ===== HOME ===== */
function renderHome() {
  const u = currentUser();
  if (!u) return;
  document.getElementById("heroAvatar").textContent = initials(u.nama);
  document.getElementById("heroName").textContent = u.nama + (isAdmin() ? " (Admin)" : "");
  document.getElementById("heroPeriode").textContent = `Periode ke-${state.periodeSekarang} dari ${state.totalPeriode}`;

  document.getElementById("statTotalAnggota").textContent = totalAnggotaAktif();
  document.getElementById("statKas").textContent = formatRupiah(kasTerkumpul());
  document.getElementById("statPinjamanBeredar").textContent = formatRupiah(pinjamanBeredar());
  document.getElementById("statMenunggak").textContent = anggotaMenunggak();
  document.getElementById("statJatuhTempo").textContent = jatuhTempoBulanIni() + " anggota";

  document.getElementById("addPengumumanBtn").hidden = !isAdmin();

  const list = document.getElementById("pengumumanList");
  if (state.pengumuman.length === 0) {
    list.innerHTML = `<div class="activity-empty">Belum ada pengumuman.</div>`;
  } else {
    list.innerHTML = [...state.pengumuman].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).map(p => `
      <div class="activity-item">
        <div class="activity-icon in">📢</div>
        <div class="activity-main">
          <div class="activity-title">${escapeHtml(p.teks)}</div>
          <div class="activity-sub">${formatDate(p.tanggal)}</div>
        </div>
        ${isAdmin() ? `<div class="activity-actions"><button class="btn-mini reject" data-del-pengumuman="${p.id}">Hapus</button></div>` : ""}
      </div>`).join("");
    if (isAdmin()) {
      list.querySelectorAll("[data-del-pengumuman]").forEach(btn => {
        btn.addEventListener("click", () => {
          state.pengumuman = state.pengumuman.filter(p => p.id !== btn.dataset.delPengumuman);
          saveState(state);
          renderHome();
        });
      });
    }
  }
  renderNotifBadge();
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

/* ===== Reminders ===== */
function renderNotifBadge() {
  const due = pengingatList().filter(x => x.diffDays >= 0);
  const badge = document.getElementById("notifBadge");
  if (due.length > 0) { badge.hidden = false; badge.textContent = due.length; }
  else badge.hidden = true;
}
function openNotifDrawer() {
  const items = pengingatList();
  const listEl = document.getElementById("notifList");
  if (items.length === 0) {
    listEl.innerHTML = `<div class="notif-empty">Tidak ada pengingat jatuh tempo dalam waktu dekat.</div>`;
  } else {
    listEl.innerHTML = items.map(x => {
      const late = x.diffDays < 0;
      const angsuran = angsuranPerBulan(x.anggota.pinjaman);
      const teks = late
        ? `Anda memiliki tunggakan ${Math.abs(x.diffDays)} hari, sebesar ${formatRupiah(angsuran)}`
        : `Pembayaran jatuh tempo ${x.diffDays === 0 ? "hari ini" : "dalam " + x.diffDays + " hari"} — ${formatRupiah(angsuran)}`;
      return `
      <div class="notif-item" data-id="${x.anggota.id}">
        <div class="notif-emoji">${late ? "⚠️" : "🔔"}</div>
        <div>
          <div class="notif-title">${x.anggota.nama}</div>
          <div class="notif-sub">${teks}</div>
          <div class="notif-sub">Sisa pinjaman: ${formatRupiah(sisaHutang(x.anggota.pinjaman))}</div>
        </div>
      </div>`;
    }).join("");
    listEl.querySelectorAll(".notif-item").forEach(el => {
      el.addEventListener("click", () => { closeNotifDrawer(); openMemberDetail(el.dataset.id); });
    });
  }
  document.getElementById("notifDrawer").hidden = false;
}
function closeNotifDrawer() { document.getElementById("notifDrawer").hidden = true; }

/* ===== PINJAMAN ===== */
function renderPinjaman() {
  const u = currentUser();
  const block = document.getElementById("pinjamanAktifBlock");
  if (u.pinjaman) {
    const p = u.pinjaman;
    const pct = Math.round((p.cicilanTerbayar / p.totalCicilan) * 100);
    const riwayat = riwayatAngsuranAktif(u);
    const riwayatHtml = riwayat.length === 0
      ? `<div class="activity-empty">Belum ada pembayaran untuk pinjaman ini.</div>`
      : `<div class="activity-list">${riwayat.map((t, i) => `
        <div class="activity-item">
          <div class="activity-icon in">📄</div>
          <div class="activity-main">
            <div class="activity-title">Angsuran ke-${i + 1}</div>
            <div class="activity-sub">${formatDate(t.tanggal)}</div>
          </div>
          <div class="activity-amount in">+${formatRupiah(t.jumlah)}</div>
        </div>`).join("")}</div>`;
    block.innerHTML = `
      <div class="section-heading">Pinjaman Aktif</div>
      <div class="chart-card">
        <div class="md-stat-grid" style="margin-bottom:12px">
          <div class="md-stat"><div class="md-stat-label">Jumlah</div><div class="md-stat-value">${formatRupiah(p.jumlah)}</div></div>
          <div class="md-stat"><div class="md-stat-label">Bunga</div><div class="md-stat-value">${p.bungaPersenBulan}% / bulan</div></div>
          <div class="md-stat"><div class="md-stat-label">Sisa Cicilan</div><div class="md-stat-value">${p.totalCicilan - p.cicilanTerbayar} dari ${p.totalCicilan}</div></div>
          <div class="md-stat"><div class="md-stat-label">Sisa Hutang</div><div class="md-stat-value">${formatRupiah(sisaHutang(p))}</div></div>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div class="progress-label">${pct}% · ${p.cicilanTerbayar}/${p.totalCicilan} pembayaran</div>
        <div class="progress-label" style="margin-top:8px">Jatuh tempo: ${formatDate(p.jatuhTempo)} · Angsuran/bulan: ${formatRupiah(angsuranPerBulan(p))}</div>
      </div>
      <div class="md-section-title">Riwayat Pembayaran (${p.cicilanTerbayar} dari ${p.totalCicilan} kali)</div>
      ${riwayatHtml}`;
  } else {
    block.innerHTML = `
      <div class="section-heading">Pinjaman Aktif</div>
      <div class="empty-state" style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius)">Anda tidak memiliki pinjaman aktif.</div>`;
  }

  const statusBlock = document.getElementById("statusPinjamanBlock");
  statusBlock.hidden = !isAdmin();
  if (isAdmin()) {
    const now = new Date();
    const dengan = state.anggota
      .filter(a => a.pinjaman)
      .map(a => {
        const diffDays = Math.ceil((new Date(a.pinjaman.jatuhTempo) - now) / 86400000);
        return { a, diffDays, st: statusPinjaman(a) };
      })
      .sort((x, y) => {
        if (x.a.tunggakan !== y.a.tunggakan) return y.a.tunggakan - x.a.tunggakan;
        return x.diffDays - y.diffDays;
      });
    const listEl = document.getElementById("statusPinjamanList");
    if (dengan.length === 0) {
      listEl.innerHTML = `<div class="activity-empty">Tidak ada anggota dengan pinjaman aktif.</div>`;
    } else {
      listEl.innerHTML = dengan.map(x => {
        const tempoLabel = x.diffDays < 0
          ? `Terlambat ${Math.abs(x.diffDays)} hari`
          : x.diffDays === 0 ? "Jatuh tempo hari ini" : `Jatuh tempo ${x.diffDays} hari lagi`;
        return `
        <div class="activity-item" data-member="${x.a.id}" style="cursor:pointer">
          <div class="activity-icon ${x.diffDays < 0 ? "out" : "in"}">${x.diffDays < 0 ? "⚠️" : "📄"}</div>
          <div class="activity-main">
            <div class="activity-title">${x.a.nama}</div>
            <div class="activity-sub">${tempoLabel} · ${formatDate(x.a.pinjaman.jatuhTempo)} · sisa ${formatRupiah(sisaHutang(x.a.pinjaman))}</div>
          </div>
          <div class="status-pill ${x.st.cls}">${x.st.label}</div>
        </div>`;
      }).join("");
      listEl.querySelectorAll("[data-member]").forEach(el => {
        el.addEventListener("click", () => openMemberDetail(el.dataset.member));
      });
    }
  }

  const approvalBlock = document.getElementById("approvalPinjamanBlock");
  approvalBlock.hidden = !isAdmin();
  if (isAdmin()) {
    const pending = state.pengajuanPinjaman.filter(p => p.status === "menunggu");
    const listEl = document.getElementById("approvalPinjamanList");
    if (pending.length === 0) {
      listEl.innerHTML = `<div class="activity-empty">Tidak ada pengajuan menunggu.</div>`;
    } else {
      listEl.innerHTML = pending.map(p => {
        const a = getAnggota(p.anggotaId);
        return `
        <div class="activity-item">
          <div class="activity-icon out">💰</div>
          <div class="activity-main">
            <div class="activity-title">${a.nama} — ${formatRupiah(p.jumlah)}</div>
            <div class="activity-sub">${escapeHtml(p.tujuan)} · ${formatDate(p.createdAt)}</div>
          </div>
          <div class="activity-actions">
            <button class="btn-mini approve" data-approve-pinjaman="${p.id}">Setujui</button>
            <button class="btn-mini reject" data-reject-pinjaman="${p.id}">Tolak</button>
          </div>
        </div>`;
      }).join("");
      listEl.querySelectorAll("[data-approve-pinjaman]").forEach(btn => btn.addEventListener("click", () => decidePengajuanPinjaman(btn.dataset.approvePinjaman, true)));
      listEl.querySelectorAll("[data-reject-pinjaman]").forEach(btn => btn.addEventListener("click", () => decidePengajuanPinjaman(btn.dataset.rejectPinjaman, false)));
    }
  }
}

function decidePengajuanPinjaman(id, approve) {
  const p = state.pengajuanPinjaman.find(x => x.id === id);
  if (!p) return;
  const a = getAnggota(p.anggotaId);
  p.status = approve ? "disetujui" : "ditolak";
  if (approve) {
    a.pinjaman = {
      jumlah: p.jumlah,
      totalCicilan: TOTAL_CICILAN,
      cicilanTerbayar: 0,
      bungaPersenBulan: BUNGA_PERSEN,
      jatuhTempo: daysFromNow(30)
    };
    a.tunggakan = 0;
    state.transaksi.push({
      id: "T" + String(state.transaksi.length + 1).padStart(3, "0"),
      tanggal: todayIso(), anggotaId: a.id, jenis: "pinjaman", jumlah: p.jumlah, arah: "keluar", keterangan: "Pencairan pinjaman"
    });
  }
  logAudit(`${approve ? "Menyetujui" : "Menolak"} pengajuan pinjaman ${a.nama} sebesar ${formatRupiah(p.jumlah)}`);
  saveState(state);
  renderPinjaman();
  showToast(approve ? "Pinjaman disetujui." : "Pengajuan ditolak.");
}

function logAudit(aksi) {
  const u = currentUser();
  state.auditLog.unshift({ id: "L" + (state.auditLog.length + 1), actor: u ? u.nama : "-", aksi, waktu: nowIso() });
}

/* ===== PEMBAYARAN ===== */
let histFilterJenis = "semua";

function renderPembayaran() {
  const u = currentUser();

  const verifBlock = document.getElementById("verifikasiBlock");
  verifBlock.hidden = !isAdmin();
  if (isAdmin()) {
    const pending = state.buktiPembayaran.filter(b => b.status === "menunggu");
    const listEl = document.getElementById("verifikasiList");
    if (pending.length === 0) {
      listEl.innerHTML = `<div class="activity-empty">Tidak ada bukti menunggu verifikasi.</div>`;
    } else {
      listEl.innerHTML = pending.map(b => {
        const a = getAnggota(b.anggotaId);
        return `
        <div class="activity-item">
          <div class="activity-icon in">📤</div>
          <div class="activity-main">
            <div class="activity-title">${a.nama} — ${formatRupiah(b.nominal)}</div>
            <div class="activity-sub">${formatDate(b.tanggal)}${b.catatan ? " · " + escapeHtml(b.catatan) : ""}</div>
          </div>
          <div class="activity-actions">
            <button class="btn-mini approve" data-approve-bukti="${b.id}">Setujui</button>
            <button class="btn-mini reject" data-reject-bukti="${b.id}">Tolak</button>
          </div>
        </div>`;
      }).join("");
      listEl.querySelectorAll("[data-approve-bukti]").forEach(btn => btn.addEventListener("click", () => decideBukti(btn.dataset.approveBukti, true)));
      listEl.querySelectorAll("[data-reject-bukti]").forEach(btn => btn.addEventListener("click", () => decideBukti(btn.dataset.rejectBukti, false)));
    }
  }

  const buktiSaya = state.buktiPembayaran.filter(b => b.anggotaId === u.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const buktiEl = document.getElementById("buktiSayaList");
  if (buktiSaya.length === 0) {
    buktiEl.innerHTML = `<div class="activity-empty">Anda belum mengupload bukti pembayaran.</div>`;
  } else {
    buktiEl.innerHTML = buktiSaya.map(b => `
      <div class="activity-item">
        <div class="activity-icon ${b.status === "ditolak" ? "out" : "in"}">📎</div>
        <div class="activity-main">
          <div class="activity-title">${formatRupiah(b.nominal)}</div>
          <div class="activity-sub">${formatDate(b.tanggal)}${b.catatan ? " · " + escapeHtml(b.catatan) : ""}</div>
        </div>
        <div class="status-pill ${b.status}">${b.status === "menunggu" ? "Menunggu Verifikasi" : b.status === "disetujui" ? "Disetujui" : "Ditolak"}</div>
      </div>`).join("");
  }

  renderHistori();
}

function decideBukti(id, approve) {
  const b = state.buktiPembayaran.find(x => x.id === id);
  if (!b) return;
  const a = getAnggota(b.anggotaId);
  b.status = approve ? "disetujui" : "ditolak";
  if (approve) {
    state.transaksi.push({
      id: "T" + String(state.transaksi.length + 1).padStart(3, "0"),
      tanggal: b.tanggal, anggotaId: a.id, jenis: a.pinjaman ? "angsuran" : "setoran",
      jumlah: b.nominal, arah: "masuk", keterangan: b.catatan || (a.pinjaman ? "Angsuran" : "Setoran")
    });
    if (a.pinjaman) {
      a.pinjaman.cicilanTerbayar = Math.min(a.pinjaman.totalCicilan, a.pinjaman.cicilanTerbayar + 1);
      a.tunggakan = Math.max(0, a.tunggakan - 1);
      if (a.pinjaman.cicilanTerbayar >= a.pinjaman.totalCicilan) a.pinjaman = null;
    } else {
      a.totalSimpanan += b.nominal;
    }
  }
  logAudit(`${approve ? "Menyetujui" : "Menolak"} pembayaran ${a.nama} sebesar ${formatRupiah(b.nominal)}`);
  saveState(state);
  renderPembayaran();
  showToast(approve ? "Pembayaran diverifikasi." : "Bukti ditolak.");
}

function renderHistori() {
  const u = currentUser();
  const scoped = isAdmin() ? state.transaksi : state.transaksi.filter(t => t.anggotaId === u.id);
  const filtered = histFilterJenis === "semua" ? scoped : scoped.filter(t => t.jenis === histFilterJenis);
  const sorted = [...filtered].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  const jenisLabel = { setoran: "Setoran", pinjaman: "Pinjaman", angsuran: "Angsuran" };
  const jenisIcon = { setoran: "➕", pinjaman: "💰", angsuran: "📄" };
  const listEl = document.getElementById("histList");
  if (sorted.length === 0) {
    listEl.innerHTML = `<div class="activity-empty">Belum ada transaksi.</div>`;
    return;
  }
  listEl.innerHTML = sorted.map(t => {
    const a = getAnggota(t.anggotaId);
    const sign = t.arah === "masuk" ? "+" : "-";
    return `
      <div class="activity-item">
        <div class="activity-icon ${t.arah === "masuk" ? "in" : "out"}">${jenisIcon[t.jenis]}</div>
        <div class="activity-main">
          <div class="activity-title">${jenisLabel[t.jenis]}${isAdmin() ? " — " + a.nama : ""}</div>
          <div class="activity-sub">${formatDate(t.tanggal)}${t.keterangan ? " · " + escapeHtml(t.keterangan) : ""}</div>
        </div>
        <div class="activity-amount ${t.arah === "masuk" ? "in" : "out"}">${sign}${formatRupiah(t.jumlah)}</div>
      </div>`;
  }).join("");
}

/* ===== ANGGOTA (Transparansi Publik) ===== */
function renderMemberList(filter = "") {
  document.getElementById("addAnggotaBtn").hidden = !isAdmin();
  const list = document.getElementById("memberList");
  const q = filter.trim().toLowerCase();
  const filtered = state.anggota.filter(a => a.nama.toLowerCase().includes(q));
  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-state">Anggota tidak ditemukan.</div>`;
    return;
  }
  list.innerHTML = filtered.map(a => {
    const st = statusPinjaman(a);
    return `
    <div class="member-card" data-id="${a.id}">
      <div class="member-avatar">${initials(a.nama)}</div>
      <div class="member-main">
        <div class="member-name">${a.nama}${a.status === "nonaktif" ? " (nonaktif)" : ""}</div>
        <div class="member-sub">${a.pinjaman ? formatRupiah(a.pinjaman.jumlah) + " · sisa " + formatRupiah(sisaHutang(a.pinjaman)) : "Tidak ada pinjaman"}</div>
      </div>
      <div class="status-pill ${st.cls}">${st.label}</div>
    </div>`;
  }).join("");
  list.querySelectorAll(".member-card").forEach(el => el.addEventListener("click", () => openMemberDetail(el.dataset.id)));
}

function openMemberDetail(id) {
  const a = getAnggota(id);
  if (!a) return;
  const st = statusPinjaman(a);
  const score = skorKepatuhan(a);
  document.getElementById("memberModalTitle").textContent = a.nama;

  const riwayat = state.transaksi.filter(t => t.anggotaId === a.id).sort((x, y) => new Date(y.tanggal) - new Date(x.tanggal));
  const jenisLabel = { setoran: "Setoran", pinjaman: "Pinjaman", angsuran: "Angsuran" };
  const jenisIcon = { setoran: "➕", pinjaman: "💰", angsuran: "📄" };
  const riwayatHtml = riwayat.length === 0 ? `<div class="activity-empty">Belum ada transaksi.</div>` : riwayat.map(t => `
    <div class="activity-item">
      <div class="activity-icon ${t.arah === "masuk" ? "in" : "out"}">${jenisIcon[t.jenis]}</div>
      <div class="activity-main">
        <div class="activity-title">${jenisLabel[t.jenis]}</div>
        <div class="activity-sub">${formatDate(t.tanggal)}</div>
      </div>
      <div class="activity-amount ${t.arah === "masuk" ? "in" : "out"}">${t.arah === "masuk" ? "+" : "-"}${formatRupiah(t.jumlah)}</div>
    </div>`).join("");

  document.getElementById("memberModalBody").innerHTML = `
    <div class="member-detail-header">
      <div class="member-detail-avatar">${initials(a.nama)}</div>
      <div>
        <div class="member-name" style="font-size:16px">${a.nama}</div>
        <div class="member-detail-code">${a.hp} · Bergabung ${formatDate(a.tanggalBergabung)}</div>
      </div>
    </div>

    <div class="md-stat-grid">
      <div class="md-stat"><div class="md-stat-label">Status Pinjaman</div><div class="md-stat-value"><span class="status-pill ${st.cls}">${st.label}</span></div></div>
      <div class="md-stat"><div class="md-stat-label">Skor Kepatuhan</div><div class="md-stat-value">${score}/100 <span class="stars">${starsForScore(score)}</span></div></div>
      <div class="md-stat"><div class="md-stat-label">Total Simpanan</div><div class="md-stat-value">${formatRupiah(a.totalSimpanan)}</div></div>
      <div class="md-stat"><div class="md-stat-label">Sisa Pinjaman</div><div class="md-stat-value">${a.pinjaman ? formatRupiah(sisaHutang(a.pinjaman)) : "-"}</div></div>
    </div>

    ${a.pinjaman ? `
    <div class="md-section-title">Riwayat Pembayaran (${a.pinjaman.cicilanTerbayar} dari ${a.pinjaman.totalCicilan} kali) · Jatuh tempo ${formatDate(a.pinjaman.jatuhTempo)}</div>
    <div class="activity-list">${
      riwayatAngsuranAktif(a).length === 0
        ? `<div class="activity-empty">Belum ada pembayaran untuk pinjaman ini.</div>`
        : riwayatAngsuranAktif(a).map((t, i) => `
          <div class="activity-item">
            <div class="activity-icon in">📄</div>
            <div class="activity-main">
              <div class="activity-title">Angsuran ke-${i + 1}</div>
              <div class="activity-sub">${formatDate(t.tanggal)}</div>
            </div>
            <div class="activity-amount in">+${formatRupiah(t.jumlah)}</div>
          </div>`).join("")
    }</div>
    ` : ""}

    <div class="md-section-title">Riwayat Transaksi (Semua)</div>
    <div class="activity-list">${riwayatHtml}</div>

    ${isAdmin() ? `
    <div class="md-actions">
      <button class="btn-outline" id="mdToggleStatusBtn">${a.status === "aktif" ? "Nonaktifkan" : "Aktifkan"} Anggota</button>
    </div>` : ""}
  `;
  document.getElementById("memberModalOverlay").hidden = false;

  if (isAdmin()) {
    document.getElementById("mdToggleStatusBtn").addEventListener("click", () => {
      a.status = a.status === "aktif" ? "nonaktif" : "aktif";
      logAudit(`${a.status === "nonaktif" ? "Menonaktifkan" : "Mengaktifkan"} anggota ${a.nama}`);
      saveState(state);
      document.getElementById("memberModalOverlay").hidden = true;
      renderMemberList(document.getElementById("memberSearch").value);
      showToast(`Anggota ${a.status === "nonaktif" ? "dinonaktifkan" : "diaktifkan"}.`);
    });
  }
}

/* ===== LAINNYA ===== */
const LAINNYA_ITEMS = [
  { key: "bukukas", icon: "📒", label: "Buku Kas", adminOnly: false },
  { key: "neraca", icon: "⚖️", label: "Neraca Keuangan", adminOnly: false },
  { key: "timeline", icon: "🗓️", label: "Timeline Periode", adminOnly: false },
  { key: "auditlog", icon: "🧾", label: "Audit Log", adminOnly: false },
  { key: "peran", icon: "🔁", label: "Lihat Sebagai (Demo)", adminOnly: false },
  { key: "tentang", icon: "ℹ️", label: "Tentang & Keterbatasan", adminOnly: false },
  { key: "keluar", icon: "🚪", label: "Keluar", adminOnly: false, danger: true }
];

function renderLainnya() {
  const menuEl = document.getElementById("lainnyaMenu");
  const subEl = document.getElementById("lainnyaSubview");
  if (lainnyaView === "menu") {
    menuEl.hidden = false;
    subEl.hidden = true;
    menuEl.innerHTML = LAINNYA_ITEMS.map(item => `
      <div class="menu-item ${item.danger ? "danger" : ""}" data-key="${item.key}">
        <div class="menu-item-icon">${item.icon}</div>
        <div class="menu-item-label">${item.label}</div>
        <div class="menu-item-chevron">›</div>
      </div>`).join("");
    menuEl.querySelectorAll(".menu-item").forEach(el => {
      el.addEventListener("click", () => {
        if (el.dataset.key === "keluar") { logout(); return; }
        lainnyaView = el.dataset.key;
        renderLainnya();
      });
    });
  } else {
    menuEl.hidden = true;
    subEl.hidden = false;
    subEl.innerHTML = `<div class="subview-header"><button class="back-btn" id="lainnyaBackBtn">←</button><h3>${LAINNYA_ITEMS.find(i => i.key === lainnyaView).label}</h3></div><div id="lainnyaSubContent"></div>`;
    document.getElementById("lainnyaBackBtn").addEventListener("click", () => { lainnyaView = "menu"; renderLainnya(); });
    const content = document.getElementById("lainnyaSubContent");
    if (lainnyaView === "bukukas") renderBukuKas(content);
    if (lainnyaView === "neraca") renderNeraca(content);
    if (lainnyaView === "timeline") renderTimeline(content);
    if (lainnyaView === "auditlog") renderAuditLog(content);
    if (lainnyaView === "peran") renderPeranSwitch(content);
    if (lainnyaView === "tentang") renderTentang(content);
  }
}

function renderBukuKas(content) {
  const rows = [...state.transaksi].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  const jenisLabel = { setoran: "Setoran Anggota", pinjaman: "Pencairan Pinjaman", angsuran: "Angsuran" };
  content.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Tanggal</th><th>Keterangan</th><th>Masuk</th><th>Keluar</th></tr></thead>
        <tbody>
          ${rows.map(t => {
            const a = getAnggota(t.anggotaId);
            const ket = `${jenisLabel[t.jenis]} — ${a ? a.nama : "-"}`;
            const cancelled = t.dibatalkan;
            return `<tr class="${cancelled ? "dibatalkan" : ""}" data-tx="${t.id}">
              <td>${formatDate(t.tanggal)}</td>
              <td>${escapeHtml(ket)}</td>
              <td>${t.arah === "masuk" ? formatRupiah(t.jumlah) : "-"}</td>
              <td>${t.arah === "keluar" ? formatRupiah(t.jumlah) : "-"}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>
    <div class="form-note" style="margin-top:10px">Transaksi tidak pernah dihapus — hanya dapat dibatalkan (audit trail tetap tersimpan).</div>
  `;
}

function renderNeraca(content) {
  const kas = kasTerkumpul();
  const piutang = pinjamanBeredar();
  const aset = totalAsetNeraca();
  const simpanan = totalSimpananAnggota();
  const ekuitas = ekuitasNeraca();
  const kewajibanEkuitas = simpanan + ekuitas;

  content.innerHTML = `
    <div class="neraca-card">
      <div class="neraca-heading">ASET</div>
      <div class="neraca-row">
        <div class="neraca-label">Kas Koperasi</div>
        <div class="neraca-value">${formatRupiah(kas)}</div>
      </div>
      <div class="neraca-row">
        <div class="neraca-label">Piutang Pinjaman Anggota</div>
        <div class="neraca-value">${formatRupiah(piutang)}</div>
      </div>
      <div class="neraca-row neraca-total">
        <div class="neraca-label">Total Aset</div>
        <div class="neraca-value">${formatRupiah(aset)}</div>
      </div>
    </div>

    <div class="neraca-card" style="margin-top:12px">
      <div class="neraca-heading">KEWAJIBAN &amp; EKUITAS</div>
      <div class="neraca-row">
        <div class="neraca-label">Simpanan Anggota</div>
        <div class="neraca-value">${formatRupiah(simpanan)}</div>
      </div>
      <div class="neraca-row">
        <div class="neraca-label">SHU / Laba Ditahan</div>
        <div class="neraca-value">${formatRupiah(ekuitas)}</div>
      </div>
      <div class="neraca-row neraca-total">
        <div class="neraca-label">Total Kewajiban &amp; Ekuitas</div>
        <div class="neraca-value">${formatRupiah(kewajibanEkuitas)}</div>
      </div>
    </div>

    <div class="neraca-balance-badge">✓ Neraca seimbang — Total Aset = Total Kewajiban &amp; Ekuitas</div>

    <div class="form-note" style="margin-top:14px">
      "SHU / Laba Ditahan" dihitung otomatis sebagai selisih Total Aset dikurangi Simpanan Anggota — bukan angka tebakan, jadi neraca ini selalu balance sesuai persamaan akuntansi dasar (Aset = Kewajiban + Ekuitas). Ini snapshot posisi keuangan saat ini; untuk riwayat transaksi kronologis lihat Buku Kas.
    </div>
  `;
}

function renderTimeline(content) {
  let boxes = "";
  for (let i = 1; i <= state.totalPeriode; i++) {
    const cls = i < state.periodeSekarang ? "done" : i === state.periodeSekarang ? "current" : "";
    const icon = i < state.periodeSekarang ? "✓" : i === state.periodeSekarang ? "●" : "";
    boxes += `<div class="periode-box ${cls}"><div class="p-icon">${icon}</div>Periode ${i}</div>`;
  }
  content.innerHTML = `<div class="timeline-periode">${boxes}</div>
    <div class="form-note" style="margin-top:14px">SEKE MESARI berjalan dalam siklus ${state.totalPeriode} periode pembayaran. Saat ini periode ke-${state.periodeSekarang}.</div>`;
}

function renderAuditLog(content) {
  if (state.auditLog.length === 0) {
    content.innerHTML = `<div class="activity-empty">Belum ada aktivitas admin tercatat.</div>`;
    return;
  }
  content.innerHTML = `<div class="activity-list">${state.auditLog.map(l => `
    <div class="activity-item">
      <div class="activity-icon in">🧾</div>
      <div class="activity-main">
        <div class="activity-title">${escapeHtml(l.actor)}</div>
        <div class="activity-sub">${escapeHtml(l.aksi)}</div>
        <div class="activity-sub">${formatDateTime(l.waktu)}</div>
      </div>
    </div>`).join("")}</div>`;
}

function renderPeranSwitch(content) {
  const u = currentUser();
  content.innerHTML = `
    <div class="form-note" style="margin-bottom:12px">Khusus demo/pratinjau: lihat tampilan aplikasi sebagai peran lain tanpa logout. Ini tidak mengubah akun sungguhan.</div>
    <div class="role-switch">
      <button id="roleAnggotaBtn" class="${!viewAsAdmin ? "active" : ""}">Lihat sebagai Anggota</button>
      <button id="roleAdminBtn" class="${viewAsAdmin ? "active" : ""}">Lihat sebagai Admin</button>
    </div>
  `;
  document.getElementById("roleAdminBtn").addEventListener("click", () => {
    if (u.role !== "admin") { showToast("Akun ini bukan admin — login sebagai admin untuk peran nyata."); return; }
    viewAsAdmin = true;
    document.querySelectorAll(".admin-only").forEach(el => el.hidden = false);
    renderLainnya();
    renderHome(); renderPinjaman(); renderPembayaran(); renderMemberList();
  });
  document.getElementById("roleAnggotaBtn").addEventListener("click", () => {
    viewAsAdmin = false;
    document.querySelectorAll(".admin-only").forEach(el => el.hidden = true);
    renderLainnya();
    renderHome(); renderPinjaman(); renderPembayaran(); renderMemberList();
  });
}

function renderTentang(content) {
  content.innerHTML = `
    <div class="info-box">
      <h4>Tentang</h4>
      Aplikasi arisan &amp; pinjaman keluarga untuk SEKE MESARI. Sengaja dibuat sederhana: berjalan sepenuhnya di browser (data tersimpan di localStorage), tanpa server, database, atau API eksternal.

      <h4>Batasan yang perlu diketahui</h4>
      Login (HP + password) hanya untuk membedakan tampilan tiap anggota — <strong>bukan proteksi keamanan sungguhan</strong>. Karena tanpa server, semua data (termasuk password) ada di kode yang bisa dibaca siapa pun yang membuka sumber halaman. Cocok dipakai internal antar anggota yang saling percaya, bukan untuk data yang benar-benar harus rahasia.<br><br>
      Pengingat jatuh tempo hanya muncul di dalam aplikasi — tidak ada notifikasi WhatsApp/push ke HP.<br><br>
      Foto bukti pembayaran disimpan di browser (localStorage) — bisa hilang jika cache dibersihkan.<br><br>
      Tidak ada sinkronisasi antar perangkat — tiap anggota yang membuka di HP masing-masing melihat data lokalnya sendiri, bukan data bersama secara real-time.
    </div>
  `;
}

/* ===== Modals: Ajukan Pinjaman ===== */
function initPinjamanModal() {
  document.getElementById("ajukanPinjamanBtn").addEventListener("click", () => {
    document.getElementById("pinjamanForm").reset();
    document.getElementById("pinjamanModalOverlay").hidden = false;
  });
  document.getElementById("pinjamanModalCloseBtn").addEventListener("click", () => {
    document.getElementById("pinjamanModalOverlay").hidden = true;
  });
  document.getElementById("pinjamanModalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "pinjamanModalOverlay") document.getElementById("pinjamanModalOverlay").hidden = true;
  });
  document.getElementById("pinjamanForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const u = currentUser();
    if (u.pinjaman) { showToast("Anda masih memiliki pinjaman aktif."); return; }
    const jumlah = Number(document.getElementById("pinjamanJumlah").value);
    const tujuan = document.getElementById("pinjamanTujuan").value.trim();
    state.pengajuanPinjaman.push({
      id: "PJ" + String(state.pengajuanPinjaman.length + 1).padStart(3, "0"),
      anggotaId: u.id, jumlah, tujuan, status: "menunggu", createdAt: todayIso()
    });
    saveState(state);
    document.getElementById("pinjamanModalOverlay").hidden = true;
    showToast("Pengajuan pinjaman terkirim, menunggu persetujuan admin.");
    renderPinjaman();
  });
}

/* ===== Modals: Upload Bukti ===== */
function initBuktiModal() {
  const open = () => {
    document.getElementById("buktiForm").reset();
    document.getElementById("buktiPreview").hidden = true;
    document.getElementById("buktiTanggal").value = todayIso();
    document.getElementById("buktiModalOverlay").hidden = false;
  };
  document.getElementById("uploadBuktiBtnPinjaman").addEventListener("click", open);
  document.getElementById("uploadBuktiBtnPembayaran").addEventListener("click", open);
  document.getElementById("buktiModalCloseBtn").addEventListener("click", () => { document.getElementById("buktiModalOverlay").hidden = true; });
  document.getElementById("buktiModalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "buktiModalOverlay") document.getElementById("buktiModalOverlay").hidden = true;
  });
  document.getElementById("buktiFoto").addEventListener("change", (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById("buktiPreview");
    if (!file) { preview.hidden = true; return; }
    const reader = new FileReader();
    reader.onload = () => { preview.src = reader.result; preview.hidden = false; };
    reader.readAsDataURL(file);
  });
  document.getElementById("buktiForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const u = currentUser();
    const nominal = Number(document.getElementById("buktiNominal").value);
    const tanggal = document.getElementById("buktiTanggal").value;
    const catatan = document.getElementById("buktiCatatan").value.trim();
    state.buktiPembayaran.push({
      id: "B" + String(state.buktiPembayaran.length + 1).padStart(3, "0"),
      anggotaId: u.id, tanggal, nominal, catatan, status: "menunggu", createdAt: nowIso()
    });
    saveState(state);
    document.getElementById("buktiModalOverlay").hidden = true;
    showToast("Bukti pembayaran terkirim, menunggu verifikasi admin.");
    renderPembayaran();
  });
}

/* ===== Modal: Tambah Anggota ===== */
function initAnggotaModal() {
  document.getElementById("addAnggotaBtn").addEventListener("click", () => {
    document.getElementById("anggotaForm").reset();
    document.getElementById("anggotaFormOverlay").hidden = false;
  });
  document.getElementById("anggotaFormCloseBtn").addEventListener("click", () => { document.getElementById("anggotaFormOverlay").hidden = true; });
  document.getElementById("anggotaFormOverlay").addEventListener("click", (e) => {
    if (e.target.id === "anggotaFormOverlay") document.getElementById("anggotaFormOverlay").hidden = true;
  });
  document.getElementById("anggotaForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const nama = document.getElementById("anggotaNama").value.trim();
    const hp = document.getElementById("anggotaHp").value.trim();
    if (state.anggota.some(a => a.hp === hp)) { showToast("Nomor HP sudah terdaftar."); return; }
    state.anggota.push({
      id: "A" + String(state.anggota.length + 1).padStart(3, "0"),
      nama, hp, password: "anggota123", role: "anggota",
      tanggalBergabung: todayIso(), status: "aktif", totalSimpanan: 0, tunggakan: 0, pinjaman: null
    });
    logAudit(`Menambahkan anggota baru: ${nama}`);
    saveState(state);
    document.getElementById("anggotaFormOverlay").hidden = true;
    showToast("Anggota baru ditambahkan (password default: anggota123).");
    renderMemberList();
  });
}

/* ===== Add Pengumuman ===== */
function initPengumumanModal() {
  document.getElementById("addPengumumanBtn").addEventListener("click", () => {
    const teks = prompt("Isi pengumuman:");
    if (!teks || !teks.trim()) return;
    state.pengumuman.push({ id: "P" + (state.pengumuman.length + 1), teks: teks.trim(), tanggal: todayIso() });
    logAudit(`Menambahkan pengumuman: ${teks.trim()}`);
    saveState(state);
    renderHome();
  });
}

/* ===== Toast ===== */
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2500);
}

/* ===== Theme ===== */
function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    document.getElementById("themeBtn").textContent = "☀️";
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    document.getElementById("themeBtn").textContent = "🌙";
  }
  localStorage.setItem(THEME_KEY, theme);
}
function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  applyTheme(current === "dark" ? "light" : "dark");
}

/* ===== Init ===== */
function init() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) applyTheme(savedTheme);
  else document.getElementById("themeBtn").textContent = window.matchMedia("(prefers-color-scheme: dark)").matches ? "☀️" : "🌙";

  initLogin();
  initPinjamanModal();
  initBuktiModal();
  initAnggotaModal();
  initPengumumanModal();

  document.querySelectorAll(".nav-item").forEach(btn => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));

  document.getElementById("memberModalCloseBtn").addEventListener("click", () => { document.getElementById("memberModalOverlay").hidden = true; });
  document.getElementById("memberModalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "memberModalOverlay") document.getElementById("memberModalOverlay").hidden = true;
  });

  document.getElementById("memberSearch").addEventListener("input", (e) => renderMemberList(e.target.value));

  document.getElementById("notifBtn").addEventListener("click", openNotifDrawer);
  document.getElementById("notifCloseBtn").addEventListener("click", closeNotifDrawer);
  document.getElementById("notifDrawer").addEventListener("click", (e) => { if (e.target.id === "notifDrawer") closeNotifDrawer(); });

  document.getElementById("themeBtn").addEventListener("click", toggleTheme);

  document.querySelectorAll("#histFilter .filter-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#histFilter .filter-chip").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      histFilterJenis = btn.dataset.jenis;
      renderHistori();
    });
  });

  if (session && getAnggota(session.anggotaId)) {
    viewAsAdmin = getAnggota(session.anggotaId).role === "admin";
    enterApp();
  }
}

document.addEventListener("DOMContentLoaded", init);
