import { useState, useEffect, useMemo } from "react";
import {
  Download,
  RefreshCw,
  FileSpreadsheet,
  MapPin,
  Building2,
  Info,
  Filter,
  FileText,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";
import * as XLSX from "xlsx";
import Modal from "../ui/Modal";
import {
  KECAMATAN_OPTIONS,
  DESA_OPTIONS,
  POSYANDU_COLUMNS,
} from "./PosyanduRekapReport";

export const INITIAL_PUSKESMAS_LIST = ["Puskesmas Pandak II"];

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const createEmptyGrid = () => {
  const rows = [];
  MONTHS.forEach((m) => {
    ["L", "P"].forEach((gender) => {
      const rowObj = { month: m, gender };
      POSYANDU_COLUMNS.forEach((c) => {
        rowObj[c.key] = 0;
      });
      rows.push(rowObj);
    });
  });
  return rows;
};

const PuskesmasRekapReport = ({
  isAddModalOpenFromParent,
  setIsAddModalOpenFromParent,
}) => {
  const { user } = useAuth();
  const isKader = user?.role === "HEALTH_WORKER";

  // Registered Puskesmas List (Persisted in localStorage)
  const [puskesmasList, setPuskesmasList] = useState(() => {
    const saved = localStorage.getItem("siwaras_registered_puskesmas");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PUSKESMAS_LIST;
  });

  // Header Metadata States
  const [kecamatan, setKecamatan] = useState("Pandak");
  const [desa, setDesa] = useState("Caturharjo");
  const [dusun, setDusun] = useState(isKader ? "" : "-- Pilih Dusun --");
  const [puskesmas, setPuskesmas] = useState(
    isKader ? "" : "-- Pilih Puskesmas --",
  );
  const [tahun, setTahun] = useState(new Date().getFullYear().toString());

  // Regional Filter State — auto-lock for kader
  const [pedukuhanFilter, setPedukuhanFilter] = useState(
    isKader && user?.pedukuhanId ? user.pedukuhanId : ""
  );
  const [pedukuhans, setPedukuhans] = useState([]);

  // Modal State for Adding New Puskesmas
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPuskesmasName, setNewPuskesmasName] = useState("");
  const [newPuskesmasDesa, setNewPuskesmasDesa] = useState("Banguncipto");
  const [newPuskesmasKecamatan, setNewPuskesmasKecamatan] = useState("Sentolo");

  // Handle sync with parent modal triggers if passed
  useEffect(() => {
    if (isAddModalOpenFromParent) {
      setIsAddModalOpen(true);
      if (setIsAddModalOpenFromParent) setIsAddModalOpenFromParent(false);
    }
  }, [isAddModalOpenFromParent, setIsAddModalOpenFromParent]);

  // Main Data Grid State (24 rows)
  const [gridData, setGridData] = useState(createEmptyGrid());

  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeGroupFilter, setActiveGroupFilter] = useState("ALL");

  // Load all pedukuhans (for admin/village head selection, and for resolving kader name)
  useEffect(() => {
    api
      .get("/patients/pedukuhans")
      .then((res) => {
        setPedukuhans(res.data);
        // If kader, auto-set dusun name from their pedukuhan
        if (isKader && user?.pedukuhanId) {
          const kaderPedukuhan = res.data.find(
            (p) => p.id === user.pedukuhanId
          );
          if (kaderPedukuhan) {
            setDusun(kaderPedukuhan.name);
          }
        }
      })
      .catch((err) => console.error("Gagal memuat pedukuhan:", err));
  }, [user]);

  // Save puskesmas list to localStorage
  const savePuskesmasToStorage = (newList) => {
    setPuskesmasList(newList);
    localStorage.setItem(
      "siwaras_registered_puskesmas",
      JSON.stringify(newList),
    );
  };

  // Add Puskesmas Submit Handler
  const handleAddPuskesmasSubmit = (e) => {
    e.preventDefault();
    const trimmed = newPuskesmasName.trim();
    if (!trimmed || puskesmasList.includes(trimmed)) return;
    const updatedList = [...puskesmasList, trimmed];
    savePuskesmasToStorage(updatedList);
    setPuskesmas(trimmed);
    if (newPuskesmasDesa) setDesa(newPuskesmasDesa);
    if (newPuskesmasKecamatan) setKecamatan(newPuskesmasKecamatan);
    setNewPuskesmasName("");
    setIsAddModalOpen(false);
  };

  // Automatic Data Aggregation from Database Medical Records
  const handleAutoAggregate = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/records");
      const records = response.data || [];

      const newGrid = createEmptyGrid();
      const targetYear = parseInt(tahun, 10);

      let processedCount = 0;

      records.forEach((rec) => {
        const recDate = new Date(rec.date);
        if (recDate.getFullYear() !== targetYear) return;

        // Pedukuhan filter validation (for admin/village head manual filter, or auto-locked for kader)
        if (
          pedukuhanFilter &&
          rec.patient?.pedukuhan?.id !== pedukuhanFilter &&
          rec.patient?.pedukuhanId !== pedukuhanFilter
        ) {
          return;
        }

        const monthIdx = recDate.getMonth(); // 0 to 11
        const gender = rec.patient?.gender === "FEMALE" ? "P" : "L";
        const rowIdx = monthIdx * 2 + (gender === "P" ? 1 : 0);

        if (rowIdx < 0 || rowIdx >= newGrid.length) return;

        processedCount++;
        const targetRow = newGrid[rowIdx];

        // 1. IMT Calculation
        if (rec.bmi != null) {
          const bmi = rec.bmi;
          if (bmi <= 17.0) targetRow.imt_sangat_kurus++;
          else if (bmi <= 18.4) targetRow.imt_kurus++;
          else if (bmi <= 25.0) targetRow.imt_normal++;
          else if (bmi <= 27.0) targetRow.imt_gemuk++;
          else targetRow.imt_obesitas++;
        }

        // 2. Lingkar Perut (Waist Circumference)
        if (rec.waist_circumference != null || rec.waistCircumference != null) {
          const wc = Number(rec.waist_circumference ?? rec.waistCircumference);
          if (gender === "L" && wc > 90) {
            targetRow.lp_male_90++;
          } else if (gender === "P" && wc > 80) {
            targetRow.lp_female_80++;
          }
        }

        // 3. Tekanan Darah Status
        if (rec.bloodPressureStatus) {
          const bp = rec.bloodPressureStatus.toLowerCase();
          if (bp === "rendah") targetRow.td_rendah++;
          else if (bp === "normal") targetRow.td_normal++;
          else targetRow.td_tinggi++;
        }

        // 4. Gula Darah Status
        if (rec.bloodSugarStatus) {
          const bs = rec.bloodSugarStatus.toLowerCase();
          if (bs === "rendah") targetRow.gd_rendah++;
          else if (bs === "normal") targetRow.gd_normal++;
          else targetRow.gd_tinggi++;
        }

        // 5. Skrining Jiwa
        if (rec.mental_health_score != null || rec.mentalHealthScore != null) {
          const mhs = Number(rec.mental_health_score ?? rec.mentalHealthScore);
          if (mhs <= 5) targetRow.jiwa_le5++;
          else if (mhs >= 6) targetRow.jiwa_ge6++;
        }
        if (rec.mental_health_q17 || rec.mentalHealthQ17) {
          targetRow.jiwa_q17_ya++;
        }

        // 6. Skrining PUMA
        if (rec.puma_score != null || rec.pumaScore != null) {
          const ps = Number(rec.puma_score ?? rec.pumaScore);
          if (ps < 6) targetRow.puma_normal++;
          else if (ps >= 6) targetRow.puma_tinggi++;
        }

        // 7. Tingkat Ketergantungan (AKS)
        const dep = rec.dependency_level ?? rec.dependencyLevel;
        if (dep) {
          const depUpper = dep.toUpperCase();
          if (depUpper === "M") targetRow.aks_a_m++;
          else if (depUpper === "R") targetRow.aks_b_r++;
          else if (depUpper === "S") targetRow.aks_b_s++;
          else if (depUpper === "B") targetRow.aks_c_b++;
          else if (depUpper === "T") targetRow.aks_c_t++;
        }

        // 8. Lansia Edukasi & Rujukan
        if (rec.patient?.age >= 60) {
          targetRow.lansia_edukasi++;
          if (rec.is_risk || rec.isRisk) {
            targetRow.lansia_dirujuk++;
          }
        }
      });

      setGridData(newGrid);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Run auto aggregate on first load or when year changes
  useEffect(() => {
    handleAutoAggregate();
  }, [tahun, pedukuhanFilter]);

  // Handle cell edit manually
  const handleCellChange = (rowIndex, colKey, value) => {
    const parsed = parseInt(value, 10);
    const val = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    setGridData((prev) => {
      const next = [...prev];
      next[rowIndex] = { ...next[rowIndex], [colKey]: val };
      return next;
    });
  };

  // Real-time Column Totals
  const colTotals = useMemo(() => {
    const totals = {};
    POSYANDU_COLUMNS.forEach((col) => {
      totals[col.key] = gridData.reduce(
        (acc, row) => acc + (Number(row[col.key]) || 0),
        0,
      );
    });
    return totals;
  }, [gridData]);

  // Export to Excel using template file: Rekapitulasi Pemeriksaan Usia Produktif dan Lansia.xlsx
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(
        "/Rekapitulasi Pemeriksaan Usia Produktif dan Lansia.xlsx",
      );
      if (!response.ok) {
        throw new Error("File template Excel Puskesmas tidak ditemukan.");
      }
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      const sheetName = workbook.SheetNames.includes("Table 1")
        ? "Table 1"
        : workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Update Header Metadata cells in Excel template (Puskesmas template cell structure)
      sheet["A2"] = { t: "s", v: `Kecamatan      : ${kecamatan || "-"}` };
      sheet["A3"] = { t: "s", v: `Desa                  : ${desa || "-"}` };
      sheet["A4"] = { t: "s", v: `Dusun               : ${dusun || "-"}` };
      sheet["A5"] = {
        t: "s",
        v: `Tahun                     : ${tahun || "-"}`,
      };

      // Fill Data Grid (Row 13 to 36, Cols C to AM -> c=2 to 38)
      gridData.forEach((row, rowIdx) => {
        const excelRowIdx = 12 + rowIdx; // Row 13 is r=12
        POSYANDU_COLUMNS.forEach((col, colIdx) => {
          const excelColIdx = 2 + colIdx; // Col C is c=2
          const cellAddr = XLSX.utils.encode_cell({
            r: excelRowIdx,
            c: excelColIdx,
          });
          const val = Number(row[col.key]) || 0;
          sheet[cellAddr] = { t: "n", v: val };
        });
      });

      // Add Total Row at Row 37 (r=36)
      sheet["A37"] = { t: "s", v: "JUMLAH TOTAL" };
      sheet["B37"] = { t: "s", v: "-" };
      POSYANDU_COLUMNS.forEach((col, colIdx) => {
        const excelColIdx = 2 + colIdx;
        const cellAddr = XLSX.utils.encode_cell({ r: 36, c: excelColIdx });
        const val = colTotals[col.key] || 0;
        sheet[cellAddr] = { t: "n", v: val };
      });

      // Write and save workbook
      const cleanDusun = (dusun || "Puskesmas").replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `Rekapitulasi_Puskesmas_${cleanDusun}_Tahun_${tahun}.xlsx`;
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  // Download Blank Template
  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/Rekapitulasi Pemeriksaan Usia Produktif dan Lansia.xlsx";
    link.download = "Rekapitulasi Pemeriksaan Usia Produktif dan Lansia.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group names list for filter tabs
  const groupsList = useMemo(() => {
    const set = new Set();
    POSYANDU_COLUMNS.forEach((c) => set.add(c.group));
    return Array.from(set);
  }, []);

  const filteredColumns = useMemo(() => {
    if (activeGroupFilter === "ALL") return POSYANDU_COLUMNS;
    return POSYANDU_COLUMNS.filter((c) => c.group === activeGroupFilter);
  }, [activeGroupFilter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[20px] shadow-soft border border-slate-100/50 p-6 md:p-8 space-y-6"
    >
      {/* Add New Puskesmas Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Puskesmas / Wilayah Kerja Baru"
      >
        <form onSubmit={handleAddPuskesmasSubmit} className="space-y-4">
          <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-xs text-sky-700 flex items-start space-x-2">
            <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
            <span>
              Daftarkan Puskesmas atau Wilayah Kerja baru untuk ditambahkan ke
              daftar dropdown laporan rekapitulasi.
            </span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Puskesmas Baru *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Puskesmas Sentolo III"
              value={newPuskesmasName}
              onChange={(e) => setNewPuskesmasName(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-sky-500 bg-slate-50/50 focus:bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Desa
              </label>
              <select
                value={newPuskesmasDesa}
                onChange={(e) => setNewPuskesmasDesa(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-sky-500 bg-slate-50/50"
              >
                {DESA_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kecamatan
              </label>
              <select
                value={newPuskesmasKecamatan}
                onChange={(e) => setNewPuskesmasKecamatan(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-sky-500 bg-slate-50/50"
              >
                {KECAMATAN_OPTIONS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition-colors"
            >
              Simpan Puskesmas
            </button>
          </div>
        </form>
      </Modal>

      {/* Header — same style as Ekspor Kustom Kolom */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-sky-600" /> Rekapitulasi
            Puskesmas
          </h3>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Rekapitulasi Pemeriksaan Usia Produktif & Lansia sesuai template
            resmi Kemenkes (.xlsx).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Template Kosong
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExporting}
            className="flex items-center px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            {isExporting ? "Memproses..." : "Ekspor (.xlsx)"}
          </button>
        </div>
      </div>

      {/* Identitas Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">
            Identitas &amp; Informasi Puskesmas
          </h4>
          <button
            type="button"
            onClick={handleAutoAggregate}
            disabled={isLoading}
            className="flex items-center text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 mr-1 ${isLoading ? "animate-spin" : ""}`}
            />{" "}
            Hitung Ulang dari DB
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Dropdown 1: Kecamatan */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1">
              Kecamatan
            </label>
            <div className="w-full text-[13px] border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-700 font-medium select-none flex items-center justify-between">
              <span>{kecamatan}</span>
              <span className="text-[10px] font-semibold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-md shrink-0">
                Terkunci
              </span>
            </div>
          </div>

          {/* Dropdown 2: Desa */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1">
              Desa
            </label>
            <div className="w-full text-[13px] border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-700 font-medium select-none flex items-center justify-between">
              <span>{desa}</span>
              <span className="text-[10px] font-semibold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-md shrink-0">
                Terkunci
              </span>
            </div>
          </div>

          {/* Dropdown 3: Dusun / Pedukuhan */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1">
              Dusun / Pedukuhan
            </label>
            {user?.role === "ADMIN" || user?.role === "VILLAGE_HEAD" ? (
              <select
                value={pedukuhanFilter}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  setPedukuhanFilter(selectedId);
                  
                  const selectedObj = pedukuhans.find(p => p.id === selectedId);
                  setDusun(selectedObj ? selectedObj.name : "");
                }}
                className="w-full text-[13px] border border-slate-200 rounded-lg p-2.5 outline-none focus:border-sky-500 bg-slate-50/50 focus:bg-white font-medium transition-colors cursor-pointer"
              >
                <option value="">-- Semua Wilayah / Dusun --</option>
                {pedukuhans.length > 0
                  ? pedukuhans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))
                  : [
                      { id: "1", name: "Pedukuhan 1" },
                      { id: "2", name: "Pedukuhan 2" },
                      { id: "3", name: "Pedukuhan 3" },
                    ].map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
              </select>
            ) : (
              <div className="w-full text-[13px] border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-500 font-medium select-none flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  {dusun || "Memuat wilayah..."}
                </span>
                <span className="ml-auto text-[10px] font-semibold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-md shrink-0">
                  Terkunci
                </span>
              </div>
            )}
          </div>

          {/* Dropdown 4: Nama Puskesmas */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[12px] font-semibold text-slate-600">
                Puskesmas / Wilayah Kerja
              </label>
            </div>
            <select
              value={puskesmas}
              onChange={(e) => {
                if (e.target.value === "__ADD_NEW__") {
                  setIsAddModalOpen(true);
                } else {
                  setPuskesmas(e.target.value);
                }
              }}
              className="w-full text-[13px] border border-slate-200 rounded-lg p-2.5 outline-none focus:border-sky-500 bg-slate-50/50 focus:bg-white font-medium transition-colors cursor-pointer"
            >
              <option value="">-- Pilih Puskesmas --</option>
              {puskesmasList.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
              <option
                value="__ADD_NEW__"
                className="font-bold text-sky-600 bg-sky-50"
              >
                + Tambah Puskesmas Belum Terdaftar...
              </option>
            </select>
          </div>

          {/* Dropdown 5: Tahun Rekapitulasi */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1">
              Tahun Rekapitulasi
            </label>
            <select
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className="w-full text-[13px] border border-slate-200 rounded-lg p-2.5 outline-none focus:border-sky-500 bg-slate-50/50 focus:bg-white font-medium cursor-pointer"
            >
              {[2026, 2025, 2024, 2023].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(user?.role === "ADMIN" || user?.role === "VILLAGE_HEAD") &&
          pedukuhans.length > 0 && (
            <div className="pt-2 border-t border-slate-50 flex items-center gap-3">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-600">
                Preview Data Pedukuhan:
              </span>
              <select
                value={pedukuhanFilter}
                onChange={(e) => setPedukuhanFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-md p-1.5 bg-slate-50"
              >
                <option value="">Semua Pedukuhan</option>
                {pedukuhans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
      </div>

      <hr className="border-slate-100" />

      {/* Column Group Filter */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="text-[13px] font-bold text-slate-700 flex items-center">
            <Filter className="w-4 h-4 mr-1.5 text-sky-600" /> Filter Kelompok
            Kolom
          </h4>
          <span className="text-[11px] text-slate-400">
            Total {POSYANDU_COLUMNS.length} variabel pemeriksaan
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveGroupFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${activeGroupFilter === "ALL" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Semua Kolom
          </button>
          {groupsList.map((groupName) => (
            <button
              key={groupName}
              type="button"
              onClick={() => setActiveGroupFilter(groupName)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${activeGroupFilter === groupName ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {groupName}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-sky-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Tabel Rekapitulasi 12 Bulan (Jan - Des)
            </h4>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200/60">
              Inline Editing
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            24 baris data (Gender L/P)
          </span>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="sticky top-0 z-20 bg-slate-100/90 backdrop-blur-sm text-slate-700 text-[11px] uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3 border-b border-r border-slate-200 w-28 bg-slate-200/70 sticky left-0 z-30">
                  Bulan
                </th>
                <th className="p-3 border-b border-r border-slate-200 w-12 bg-slate-200/70 sticky left-28 z-30 text-center">
                  JK
                </th>
                {filteredColumns.map((col) => (
                  <th
                    key={col.key}
                    className="p-2.5 border-b border-r border-slate-200 text-center min-w-[90px]"
                  >
                    <div className="text-[10px] text-slate-400 font-medium normal-case mb-0.5">
                      {col.group}
                    </div>
                    <div className="text-slate-800 font-bold">{col.label}</div>
                    {col.sublabel && (
                      <div className="text-[9px] text-sky-600 font-medium normal-case">
                        {col.sublabel}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {gridData.map((row, rIdx) => {
                const isEvenMonth = Math.floor(rIdx / 2) % 2 === 0;
                return (
                  <tr
                    key={`${row.month}-${row.gender}`}
                    className={`transition-colors ${isEvenMonth ? "bg-white hover:bg-sky-50/30" : "bg-slate-50/40 hover:bg-sky-50/30"}`}
                  >
                    {/* Month Cell */}
                    <td className="p-2.5 border-r border-slate-200 font-semibold text-slate-700 sticky left-0 z-10 bg-inherit border-b">
                      {row.gender === "L" ? row.month : ""}
                    </td>

                    {/* Gender Cell */}
                    <td className="p-2 border-r border-slate-200 text-center font-bold sticky left-28 z-10 bg-inherit border-b">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] ${
                          row.gender === "L"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-pink-50 text-pink-700"
                        }`}
                      >
                        {row.gender}
                      </span>
                    </td>

                    {/* Data Cells */}
                    {filteredColumns.map((col) => (
                      <td
                        key={col.key}
                        className="p-1 border-r border-slate-100 text-center border-b"
                      >
                        <input
                          type="number"
                          min="0"
                          value={row[col.key] || 0}
                          onChange={(e) =>
                            handleCellChange(rIdx, col.key, e.target.value)
                          }
                          className={`w-full text-center py-1.5 px-1 rounded text-[12px] font-semibold outline-none transition-all ${
                            row[col.key] > 0
                              ? "bg-sky-50/60 text-sky-700 font-bold border border-sky-200/80 focus:bg-white focus:ring-2 focus:ring-sky-400"
                              : "bg-transparent text-slate-400 focus:bg-white focus:text-slate-800 focus:ring-2 focus:ring-sky-300"
                          }`}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>

            {/* Total Footer Row */}
            <tfoot className="sticky bottom-0 z-20 bg-slate-800 text-white font-bold text-xs">
              <tr>
                <td
                  className="p-3 border-r border-slate-700 sticky left-0 z-30 bg-slate-800"
                  colSpan="2"
                >
                  JUMLAH TOTAL
                </td>
                {filteredColumns.map((col) => (
                  <td
                    key={col.key}
                    className="p-2.5 border-r border-slate-700 text-center"
                  >
                    <span className="text-sky-300 text-xs font-bold">
                      {colTotals[col.key] || 0}
                    </span>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default PuskesmasRekapReport;
