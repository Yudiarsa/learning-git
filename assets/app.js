/* =========================================================
   Koperasi Keluarga — data + logic
   Data disimpan di localStorage (client-side only, demo app).
   ========================================================= */

const STORAGE_KEY = "koperasi_keluarga_state_v1";
const THEME_KEY = "koperasi_keluarga_theme";

const NAMES = [
  "Gede", "Wayan", "Made", "Ketut", "Nyoman", "Putu", "Kadek", "Komang",
  "Wayan Sari", "Made Ayu", "Ketut Arta", "Nyoman Dewi", "Putu Agus",
  "Kadek Yuni", "Komang Rai", "Gede Suarta", "Wayan Merta", "Made Suarni",
  "Ketut Suastika", "Nyoman Widi", "Putu Sukerta", "Kadek Sri", "Komang Yasa",
  "Gede Wirawan"
];

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function monthsAgoLabel(n) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toLocaleDateString("id-ID", { month: "short" });
}

function buildSeedState() {
  const anggotaSeed = [
    { simpanan: 5000000, pinjamanTotal: 0, angsuran: 0, jatuhTempoIn: null },
    { simpanan: 8500000, pinjamanTotal: 2000000, angsuran: 250000, jatuhTempoIn: 3 },
    { simpanan: 4000000, pinjamanTotal: 5000000, angsuran: 500000, jatuhTempoIn: 10 },
    { simpanan: 1200000, pinjamanTotal: 0, angsuran: 0, jatuhTempoIn: null },
    { simpanan: 900000, pinjamanTotal: 500000, angsuran: 100000, jatuhTempoIn: 6 },
    { simpanan: 1500000, pinjamanTotal: 0, angsuran: 0, jatuhTempoIn: null },
    { simpanan: 700000, pinjamanTotal: 0, angsuran: 0, jatuhTempoIn: null },
    { simpanan: 600000, pinjamanTotal: 0, angsuran: 0, jatuhTempoIn: null },
    { simpanan: 800000, pinjamanTotal: 0, angsuran: 0, jatuhTempoIn: null },
    { simpanan: 950000, pinjamanTotal: 0, angsuran: 0, jatuhTempoIn: null },
    { simpanan: 1100000, pinjamanTotal: 0, angsuran: 0, jatuhTempoIn: null },
    { simpanan: 500000, pinjamanTotal: 0, angsuran: 0, jatuhTempoIn: null },
    { simpanan: 650000, pinjamanTotal: 0, angsuran: 0, jatuhTempoIn: null },
    { simpanan: 720000, pinjamanTotal: 0, angsuran: 0, jatuhTempoIn: null },
    { simpanan: 480000, pinjamanTotal: 0, angsuran: 0, jatuhTempoIn: null },
    { simpanan: 300000, pinjamanTotal: 0, angsuran: 0, jatuhTempoIn: null },
    { simpanan: 400000, pinjamanTotal: 0, angsuran: 0, jatuhTempoIn: null },
    { simpanan: 250000, pinjamanTotal: 0, angsuran: 0, jatuhTempoIn: null },
    { simpanan: 350000, pinjamanTotal: 0, angsuran: 0, jatuhTempoIn: null },
    { simpanan: 200000, pinjamanTotal: 0, angsuran: 0, jatuhTempoIn: null },
    { simpanan: 300000, pinjamanTotal: 0, angsuran: 0, jatuhTempoIn: null },
    { simpanan: 400000, pinjamanTotal: 0, angsuran: 0, jatuhTempoIn: null },
    { simpanan: 300000, pinjamanTotal: 0, angsuran: 0, jatuhTempoIn: null },
    { simpanan: 400000, pinjamanTotal: 0, angsuran: 0, jatuhTempoIn: null }
  ];

  const anggota = anggotaSeed.map((seed, i) => {
    const riwayatSimpanan = [0.7, 0.85, 1, 0.95, 1.1, 1.2].map((f, idx) => ({
      bulan: monthsAgoLabel(5 - idx),
      jumlah: Math.round((seed.simpanan / 6) * f)
    }));
    return {
      id: "A" + String(i + 1).padStart(3, "0"),
      kode: "KOP-" + String(i + 1).padStart(4, "0"),
      nama: NAMES[i] || "Anggota " + (i + 1),
      simpanan: seed.simpanan,
      pinjaman: seed.pinjamanTotal > 0 ? {
        total: seed.pinjamanTotal,
        sisa: seed.pinjamanTotal,
        angsuranBulanan: seed.angsuran,
        jatuhTempo: daysFromNow(seed.jatuhTempoIn)
      } : null,
      riwayatSimpanan
    };
  });

  const totalSimpanan = anggota.reduce((s, a) => s + a.simpanan, 0);
  const shuTahunIni = 1250000;
  anggota.forEach(a => {
    a.shuDiterima = Math.round(shuTahunIni * (a.simpanan / totalSimpanan));
  });

  const findId = (idx) => anggota[idx].id;

  const transaksi = [
    { id: "T001", tanggal: daysFromNow(-1), anggotaId: findId(0), jenis: "setoran", jumlah: 500000, arah: "masuk", keterangan: "Setoran bulanan" },
    { id: "T002", tanggal: daysFromNow(-1), anggotaId: findId(1), jenis: "angsuran", jumlah: 250000, arah: "masuk", keterangan: "Angsuran pinjaman" },
    { id: "T003", tanggal: daysFromNow(-2), anggotaId: findId(2), jenis: "pinjaman", jumlah: 5000000, arah: "keluar", keterangan: "Pencairan pinjaman" },
    { id: "T004", tanggal: daysFromNow(-3), anggotaId: findId(3), jenis: "setoran", jumlah: 300000, arah: "masuk", keterangan: "Setoran bulanan" },
    { id: "T005", tanggal: daysFromNow(-4), anggotaId: findId(4), jenis: "angsuran", jumlah: 100000, arah: "masuk", keterangan: "Angsuran pinjaman" },
    { id: "T006", tanggal: daysFromNow(-5), anggotaId: findId(5), jenis: "penarikan", jumlah: 200000, arah: "keluar", keterangan: "Penarikan simpanan" },
    { id: "T007", tanggal: daysFromNow(-6), anggotaId: findId(0), jenis: "setoran", jumlah: 400000, arah: "masuk", keterangan: "Setoran bulanan" },
    { id: "T008", tanggal: daysFromNow(-8), anggotaId: findId(2), jenis: "angsuran", jumlah: 500000, arah: "masuk", keterangan: "Angsuran pinjaman" }
  ];

  return {
    kasKoperasi: 120000000,
    ringkasanKeuangan: { kasMasukAwal: 250000000, kasKeluarAwal: 180000000 },
    trenBulanan: {
      simpanan: [0.6, 0.75, 0.85, 0.95, 1.1, 1.25].map(f => Math.round(totalSimpanan * f * 0.18)),
      pinjaman: [3000000, 4200000, 5000000, 6100000, 7000000, 7500000],
      kas: [95000000, 100000000, 105000000, 110000000, 115000000, 120000000]
    },
    shuTahunIni,
    anggota,
    transaksi
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

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Gagal menyimpan data.", e);
  }
}

let state = loadState();

/* ===== Formatting helpers ===== */
function formatRupiah(n) {
  n = Math.round(n || 0);
  return "Rp" + n.toLocaleString("id-ID");
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}
function initials(name) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}
function getAnggota(id) {
  return state.anggota.find(a => a.id === id);
}

/* ===== Derived totals ===== */
function totalSimpanan() {
  return state.anggota.reduce((s, a) => s + a.simpanan, 0);
}
function totalPinjamanAktif() {
  return state.anggota.reduce((s, a) => s + (a.pinjaman ? a.pinjaman.sisa : 0), 0);
}
function kasMasukTotal() {
  const dariTransaksi = state.transaksi.filter(t => t.arah === "masuk").reduce((s, t) => s + t.jumlah, 0);
  return state.ringkasanKeuangan.kasMasukAwal + dariTransaksi;
}
function kasKeluarTotal() {
  const dariTransaksi = state.transaksi.filter(t => t.arah === "keluar").reduce((s, t) => s + t.jumlah, 0);
  return state.ringkasanKeuangan.kasKeluarAwal + dariTransaksi;
}
function anggotaJatuhTempoDekat(maxDays = 7) {
  const now = new Date();
  return state.anggota
    .filter(a => a.pinjaman && a.pinjaman.sisa > 0)
    .map(a => {
      const due = new Date(a.pinjaman.jatuhTempo);
      const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
      return { anggota: a, diffDays };
    })
    .filter(x => x.diffDays >= 0 && x.diffDays <= maxDays)
    .sort((a, b) => a.diffDays - b.diffDays);
}

/* ===== Rendering: Dashboard ===== */
function renderDashboard() {
  document.getElementById("heroKas").textContent = formatRupiah(state.kasKoperasi);
  document.getElementById("statSimpanan").textContent = formatRupiah(totalSimpanan());
  document.getElementById("statPinjaman").textContent = formatRupiah(totalPinjamanAktif());
  document.getElementById("statShu").textContent = formatRupiah(state.shuTahunIni);
  document.getElementById("statAnggota").textContent = state.anggota.length + " Org";

  const due = anggotaJatuhTempoDekat(7);
  const banner = document.getElementById("dueSoonBanner");
  if (due.length > 0) {
    const first = due[0];
    banner.hidden = false;
    banner.innerHTML = `🔔 <div><strong>${due.length} anggota</strong> punya angsuran jatuh tempo dalam 7 hari.<br>Terdekat: ${first.anggota.nama}, ${first.diffDays === 0 ? "hari ini" : first.diffDays + " hari lagi"}.</div>`;
    banner.onclick = () => openNotifDrawer();
  } else {
    banner.hidden = true;
  }

  renderNotifBadge();
  renderActivity();
}

function renderActivity() {
  const list = document.getElementById("activityList");
  const sorted = [...state.transaksi].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).slice(0, 8);
  if (sorted.length === 0) {
    list.innerHTML = `<div class="activity-empty">Belum ada transaksi.</div>`;
    return;
  }
  const jenisLabel = { setoran: "Setoran", penarikan: "Penarikan", pinjaman: "Pinjaman", angsuran: "Angsuran" };
  const jenisIcon = { setoran: "➕", penarikan: "➖", pinjaman: "💰", angsuran: "📄" };
  list.innerHTML = sorted.map(t => {
    const a = getAnggota(t.anggotaId);
    const sign = t.arah === "masuk" ? "+" : "-";
    return `
      <div class="activity-item">
        <div class="activity-icon ${t.arah === "masuk" ? "in" : "out"}">${jenisIcon[t.jenis]}</div>
        <div class="activity-main">
          <div class="activity-title">${jenisLabel[t.jenis]} ${a ? a.nama : "-"}</div>
          <div class="activity-sub">${formatDate(t.tanggal)}${t.keterangan ? " · " + t.keterangan : ""}</div>
        </div>
        <div class="activity-amount ${t.arah === "masuk" ? "in" : "out"}">${sign}${formatRupiah(t.jumlah)}</div>
      </div>`;
  }).join("");
}

/* ===== Notifications ===== */
function renderNotifBadge() {
  const due = anggotaJatuhTempoDekat(7);
  const badge = document.getElementById("notifBadge");
  if (due.length > 0) {
    badge.hidden = false;
    badge.textContent = due.length;
  } else {
    badge.hidden = true;
  }
}

function openNotifDrawer() {
  const due = anggotaJatuhTempoDekat(30);
  const listEl = document.getElementById("notifList");
  if (due.length === 0) {
    listEl.innerHTML = `<div class="notif-empty">Tidak ada angsuran jatuh tempo dalam 30 hari ke depan.</div>`;
  } else {
    listEl.innerHTML = due.map(x => `
      <div class="notif-item" data-id="${x.anggota.id}">
        <div class="notif-emoji">🔔</div>
        <div>
          <div class="notif-title">${x.anggota.nama}</div>
          <div class="notif-sub">Angsuran ${formatRupiah(x.anggota.pinjaman.angsuranBulanan)} jatuh tempo ${x.diffDays === 0 ? "hari ini" : x.diffDays + " hari lagi"}</div>
        </div>
      </div>`).join("");
    listEl.querySelectorAll(".notif-item").forEach(el => {
      el.addEventListener("click", () => {
        closeNotifDrawer();
        openMemberDetail(el.dataset.id);
      });
    });
  }
  document.getElementById("notifDrawer").hidden = false;
}
function closeNotifDrawer() {
  document.getElementById("notifDrawer").hidden = true;
}

/* ===== Rendering: Anggota ===== */
function renderMemberList(filter = "") {
  const list = document.getElementById("memberList");
  const q = filter.trim().toLowerCase();
  const filtered = state.anggota.filter(a => a.nama.toLowerCase().includes(q));
  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-state">Anggota tidak ditemukan.</div>`;
    return;
  }
  list.innerHTML = filtered.map(a => `
    <div class="member-card" data-id="${a.id}">
      <div class="member-avatar">${initials(a.nama)}</div>
      <div class="member-main">
        <div class="member-name">${a.nama}</div>
        <div class="member-sub">Saldo: ${formatRupiah(a.simpanan)}</div>
      </div>
      <div class="member-loan-tag ${a.pinjaman ? "" : "none"}">
        ${a.pinjaman ? "Pinjaman " + formatRupiah(a.pinjaman.sisa) : "Tidak ada"}
      </div>
    </div>`).join("");
  list.querySelectorAll(".member-card").forEach(el => {
    el.addEventListener("click", () => openMemberDetail(el.dataset.id));
  });
}

function openMemberDetail(id) {
  const a = getAnggota(id);
  if (!a) return;
  document.getElementById("memberModalTitle").textContent = a.nama;
  const maxRiwayat = Math.max(...a.riwayatSimpanan.map(r => r.jumlah), 1);
  const chartHtml = `
    <div class="bar-chart">
      ${a.riwayatSimpanan.map(r => `
        <div class="bar-col">
          <div class="bar-value">${(r.jumlah / 1000).toFixed(0)}rb</div>
          <div class="bar-fill" style="height:${Math.max(6, (r.jumlah / maxRiwayat) * 100)}%"></div>
          <div class="bar-label">${r.bulan}</div>
        </div>`).join("")}
    </div>`;

  document.getElementById("memberModalBody").innerHTML = `
    <div class="member-detail-header">
      <div class="member-detail-avatar">${initials(a.nama)}</div>
      <div>
        <div class="member-name" style="font-size:16px">${a.nama}</div>
        <div class="member-detail-code">${a.kode}</div>
      </div>
    </div>

    <div class="md-stat-grid">
      <div class="md-stat">
        <div class="md-stat-label">Saldo Simpanan</div>
        <div class="md-stat-value">${formatRupiah(a.simpanan)}</div>
      </div>
      <div class="md-stat">
        <div class="md-stat-label">SHU Diterima</div>
        <div class="md-stat-value">${formatRupiah(a.shuDiterima)}</div>
      </div>
      <div class="md-stat">
        <div class="md-stat-label">Pinjaman Aktif</div>
        <div class="md-stat-value">${a.pinjaman ? formatRupiah(a.pinjaman.sisa) : "Tidak ada"}</div>
      </div>
      <div class="md-stat">
        <div class="md-stat-label">Angsuran / Bulan</div>
        <div class="md-stat-value">${a.pinjaman ? formatRupiah(a.pinjaman.angsuranBulanan) : "-"}</div>
      </div>
    </div>

    ${a.pinjaman ? `<div class="notif-sub" style="margin-bottom:12px">Jatuh tempo berikutnya: ${formatDate(a.pinjaman.jatuhTempo)}</div>` : ""}

    <div class="md-section-title">Grafik Simpanan (6 Bulan Terakhir)</div>
    ${chartHtml}

    <div class="md-section-title">Riwayat Transaksi</div>
    <div class="activity-list">
      ${renderMemberActivity(a.id)}
    </div>

    <div class="md-section-title">Kode Anggota</div>
    <div class="qr-box">
      <div class="qr-pattern">${renderQrPattern(a.kode)}</div>
      <div class="qr-note">Kode unik anggota: <strong>${a.kode}</strong>. Fitur pindai QR kamera belum diimplementasikan pada versi ini — lihat README.</div>
    </div>
  `;
  document.getElementById("memberModalOverlay").hidden = false;
}

function renderMemberActivity(anggotaId) {
  const items = state.transaksi.filter(t => t.anggotaId === anggotaId)
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  if (items.length === 0) return `<div class="activity-empty">Belum ada transaksi.</div>`;
  const jenisLabel = { setoran: "Setoran", penarikan: "Penarikan", pinjaman: "Pinjaman", angsuran: "Angsuran" };
  const jenisIcon = { setoran: "➕", penarikan: "➖", pinjaman: "💰", angsuran: "📄" };
  return items.map(t => `
    <div class="activity-item">
      <div class="activity-icon ${t.arah === "masuk" ? "in" : "out"}">${jenisIcon[t.jenis]}</div>
      <div class="activity-main">
        <div class="activity-title">${jenisLabel[t.jenis]}</div>
        <div class="activity-sub">${formatDate(t.tanggal)}</div>
      </div>
      <div class="activity-amount ${t.arah === "masuk" ? "in" : "out"}">${t.arah === "masuk" ? "+" : "-"}${formatRupiah(t.jumlah)}</div>
    </div>`).join("");
}

/* Deterministic decorative pixel pattern representing a member code.
   Not a real scannable QR code — see README for scope notes. */
function renderQrPattern(code) {
  let hash = 0;
  for (let i = 0; i < code.length; i++) hash = (hash * 31 + code.charCodeAt(i)) >>> 0;
  const size = 6;
  let cells = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const bit = (hash >> ((x + y * size) % 24)) & 1;
      if (bit) {
        cells += `<rect x="${x}" y="${y}" width="1" height="1" fill="var(--primary)"/>`;
      }
    }
  }
  return `<svg viewBox="0 0 ${size} ${size}" width="64" height="64" style="background:var(--card);border-radius:8px">${cells}</svg>`;
}

/* ===== Rendering: Keuangan ===== */
function renderKeuangan() {
  const masuk = kasMasukTotal();
  const keluar = kasKeluarTotal();
  document.getElementById("kmKasMasuk").textContent = formatRupiah(masuk);
  document.getElementById("kmKasKeluar").textContent = formatRupiah(keluar);
  document.getElementById("kmSaldoAkhir").textContent = formatRupiah(masuk - keluar);

  renderBarChart("chartSimpanan", state.trenBulanan.simpanan, "var(--primary)");
  renderBarChart("chartPinjaman", state.trenBulanan.pinjaman, "var(--blue)");
  renderBarChart("chartKas", state.trenBulanan.kas, "var(--secondary)");
}

function renderBarChart(elId, values, color) {
  const el = document.getElementById(elId);
  const max = Math.max(...values, 1);
  const labels = [5, 4, 3, 2, 1, 0].map(monthsAgoLabel);
  el.innerHTML = `<div class="bar-chart">${values.map((v, i) => `
    <div class="bar-col">
      <div class="bar-value">${(v / 1000000).toFixed(1)}jt</div>
      <div class="bar-fill" style="height:${Math.max(6, (v / max) * 100)}%; background:${color}"></div>
      <div class="bar-label">${labels[i]}</div>
    </div>`).join("")}</div>`;
}

/* ===== Rendering: Laporan ===== */
let laporanState = { period: "hari", type: "simpanan", from: null, to: null };

function periodRange() {
  const now = new Date();
  if (laporanState.period === "hari") {
    const d = now.toISOString().slice(0, 10);
    return [d, d];
  }
  if (laporanState.period === "bulan") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    return [from, now.toISOString().slice(0, 10)];
  }
  if (laporanState.period === "tahun") {
    const from = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
    return [from, now.toISOString().slice(0, 10)];
  }
  return [laporanState.from || "0000-01-01", laporanState.to || "9999-12-31"];
}

function renderLaporan() {
  const [from, to] = periodRange();
  const thead = document.getElementById("reportThead");
  const tbody = document.getElementById("reportTbody");
  const emptyEl = document.getElementById("reportEmpty");
  const table = document.getElementById("reportTable");

  let rows = [];
  let headers = [];

  if (laporanState.type === "shu") {
    headers = ["Anggota", "Kode", "Simpanan", "SHU Diterima"];
    rows = state.anggota.map(a => [a.nama, a.kode, formatRupiah(a.simpanan), formatRupiah(a.shuDiterima)]);
  } else {
    const jenisMap = { simpanan: "setoran", pinjaman: "pinjaman", angsuran: "angsuran" };
    const jenis = jenisMap[laporanState.type];
    const filtered = state.transaksi.filter(t => t.jenis === jenis && t.tanggal >= from && t.tanggal <= to)
      .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    headers = ["Tanggal", "Anggota", "Keterangan", "Jumlah"];
    rows = filtered.map(t => {
      const a = getAnggota(t.anggotaId);
      return [formatDate(t.tanggal), a ? a.nama : "-", t.keterangan || "-", formatRupiah(t.jumlah)];
    });
  }

  thead.innerHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>`;
  if (rows.length === 0) {
    tbody.innerHTML = "";
    table.hidden = true;
    emptyEl.hidden = false;
  } else {
    table.hidden = false;
    emptyEl.hidden = true;
    tbody.innerHTML = rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("");
  }
}

function exportReportToExcel() {
  const table = document.getElementById("reportTable");
  if (table.hidden) return showToast("Tidak ada data untuk diekspor.");
  const rows = [...table.querySelectorAll("tr")].map(tr =>
    [...tr.children].map(td => `"${td.textContent.replace(/"/g, '""')}"`).join(",")
  );
  const csv = rows.join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `laporan-${laporanState.type}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast("Laporan diunduh (CSV, dapat dibuka di Excel).");
}

function exportReportToPdf() {
  const table = document.getElementById("reportTable");
  if (table.hidden) return showToast("Tidak ada data untuk diekspor.");
  document.querySelector("#tab-laporan .section-block:last-child").classList.add("print-target");
  window.print();
  document.querySelector("#tab-laporan .section-block:last-child").classList.remove("print-target");
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

/* ===== Tabs ===== */
const TAB_LABELS = { dashboard: "Dashboard", anggota: "Anggota", keuangan: "Keuangan", laporan: "Laporan" };
function switchTab(tab) {
  document.querySelectorAll(".tab-panel").forEach(el => el.hidden = true);
  document.getElementById("tab-" + tab).hidden = false;
  document.querySelectorAll(".nav-item").forEach(el => el.classList.toggle("active", el.dataset.tab === tab));
  document.getElementById("topbarSub").textContent = TAB_LABELS[tab];
  if (tab === "anggota") renderMemberList(document.getElementById("memberSearch").value);
  if (tab === "keuangan") renderKeuangan();
  if (tab === "laporan") renderLaporan();
}

/* ===== Quick action modal ===== */
const ACTION_CONFIG = {
  setoran: { title: "Setoran", label: "Jumlah Setoran (Rp)", jenis: "setoran", arah: "masuk" },
  penarikan: { title: "Penarikan", label: "Jumlah Penarikan (Rp)", jenis: "penarikan", arah: "keluar" },
  pinjaman: { title: "Pengajuan Pinjaman", label: "Jumlah Pinjaman (Rp)", jenis: "pinjaman", arah: "keluar" },
  angsuran: { title: "Bayar Angsuran", label: "Jumlah Angsuran (Rp)", jenis: "angsuran", arah: "masuk" }
};
let currentAction = null;

function fillAnggotaSelect() {
  const sel = document.getElementById("modalAnggota");
  sel.innerHTML = state.anggota.map(a => `<option value="${a.id}">${a.nama}</option>`).join("");
}

function openActionModal(action) {
  currentAction = action;
  const cfg = ACTION_CONFIG[action];
  document.getElementById("modalTitle").textContent = cfg.title;
  document.getElementById("modalAmountLabel").textContent = cfg.label;
  fillAnggotaSelect();
  document.getElementById("modalAmount").value = "";
  document.getElementById("modalNote").value = "";
  document.getElementById("modalOverlay").hidden = false;
}
function closeActionModal() {
  document.getElementById("modalOverlay").hidden = true;
  currentAction = null;
}

function submitActionForm(e) {
  e.preventDefault();
  const cfg = ACTION_CONFIG[currentAction];
  const anggotaId = document.getElementById("modalAnggota").value;
  const jumlah = Number(document.getElementById("modalAmount").value);
  const note = document.getElementById("modalNote").value.trim();
  const a = getAnggota(anggotaId);
  if (!a || !jumlah || jumlah <= 0) return;

  if (cfg.jenis === "penarikan" && jumlah > a.simpanan) {
    showToast("Saldo simpanan tidak mencukupi.");
    return;
  }
  if (cfg.jenis === "angsuran" && (!a.pinjaman || a.pinjaman.sisa <= 0)) {
    showToast("Anggota ini tidak memiliki pinjaman aktif.");
    return;
  }

  const tx = {
    id: "T" + String(state.transaksi.length + 1).padStart(3, "0"),
    tanggal: new Date().toISOString().slice(0, 10),
    anggotaId: a.id,
    jenis: cfg.jenis,
    jumlah,
    arah: cfg.arah,
    keterangan: note || cfg.title
  };
  state.transaksi.push(tx);

  if (cfg.jenis === "setoran") a.simpanan += jumlah;
  if (cfg.jenis === "penarikan") a.simpanan -= jumlah;
  if (cfg.jenis === "pinjaman") {
    const existingSisa = a.pinjaman ? a.pinjaman.sisa : 0;
    a.pinjaman = {
      total: (a.pinjaman ? a.pinjaman.total : 0) + jumlah,
      sisa: existingSisa + jumlah,
      angsuranBulanan: a.pinjaman ? a.pinjaman.angsuranBulanan : Math.round(jumlah / 12),
      jatuhTempo: a.pinjaman ? a.pinjaman.jatuhTempo : daysFromNow(30)
    };
  }
  if (cfg.jenis === "angsuran") {
    a.pinjaman.sisa = Math.max(0, a.pinjaman.sisa - jumlah);
    if (a.pinjaman.sisa === 0) {
      a.pinjaman = null;
    } else {
      const next = new Date(a.pinjaman.jatuhTempo);
      next.setMonth(next.getMonth() + 1);
      a.pinjaman.jatuhTempo = next.toISOString().slice(0, 10);
    }
  }

  state.kasKoperasi += cfg.arah === "masuk" ? jumlah : -jumlah;

  saveState(state);
  closeActionModal();
  renderDashboard();
  showToast(cfg.title + " berhasil dicatat.");
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
  else document.getElementById("themeBtn").textContent =
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "☀️" : "🌙";

  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  document.querySelectorAll(".qa-btn").forEach(btn => {
    btn.addEventListener("click", () => openActionModal(btn.dataset.action));
  });
  document.getElementById("modalCloseBtn").addEventListener("click", closeActionModal);
  document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "modalOverlay") closeActionModal();
  });
  document.getElementById("modalForm").addEventListener("submit", submitActionForm);

  document.getElementById("memberModalCloseBtn").addEventListener("click", () => {
    document.getElementById("memberModalOverlay").hidden = true;
  });
  document.getElementById("memberModalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "memberModalOverlay") document.getElementById("memberModalOverlay").hidden = true;
  });

  document.getElementById("memberSearch").addEventListener("input", (e) => renderMemberList(e.target.value));

  document.getElementById("notifBtn").addEventListener("click", openNotifDrawer);
  document.getElementById("notifCloseBtn").addEventListener("click", closeNotifDrawer);
  document.getElementById("notifDrawer").addEventListener("click", (e) => {
    if (e.target.id === "notifDrawer") closeNotifDrawer();
  });

  document.getElementById("themeBtn").addEventListener("click", toggleTheme);

  document.querySelectorAll("#periodFilter .filter-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#periodFilter .filter-chip").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      laporanState.period = btn.dataset.period;
      document.getElementById("customRange").hidden = laporanState.period !== "custom";
      renderLaporan();
    });
  });
  document.getElementById("dateFrom").addEventListener("change", (e) => { laporanState.from = e.target.value; renderLaporan(); });
  document.getElementById("dateTo").addEventListener("change", (e) => { laporanState.to = e.target.value; renderLaporan(); });

  document.querySelectorAll("#reportTypeFilter .filter-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#reportTypeFilter .filter-chip").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      laporanState.type = btn.dataset.type;
      renderLaporan();
    });
  });

  document.getElementById("exportExcelBtn").addEventListener("click", exportReportToExcel);
  document.getElementById("exportPdfBtn").addEventListener("click", exportReportToPdf);

  renderDashboard();
}

document.addEventListener("DOMContentLoaded", init);
