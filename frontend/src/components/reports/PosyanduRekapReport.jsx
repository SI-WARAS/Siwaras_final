import { useState, useEffect, useMemo } from "react";
import {
  Download,
  RefreshCw,
  FileSpreadsheet,
  MapPin,
  Building,
  Calendar,
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

export const KECAMATAN_OPTIONS = [
  "Sentolo",
  "Pengasih",
  "Wates",
  "Lendah",
  "Galur",
  "Temon",
  "Nanggulan",
  "Samigaluh",
  "Kalibawang",
  "Girimulyo",
  "Panjatan",
];

export const DESA_OPTIONS = [
  "Banguncipto",
  "Kaliagung",
  "Demangrejo",
  "Sentolo",
  "Salamrejo",
  "Sukoreno",
  "Tuksono",
  "Tawangsari",
  "Kedungsari",
  "Margosari",
];

export const INITIAL_POSYANDU_LIST = [
  "Posyandu Lansia & Usia Produktif Mawar",
  "Posyandu Lansia Melati",
  "Posyandu Usia Produktif Dahlia",
  "Posyandu Kenanga",
  "Posyandu Flamboyan",
  "Posyandu Anggrek",
  "Posyandu Cempaka",
];

export const POSYANDU_COLUMNS = [
  {
    key: "imt_sangat_kurus",
    label: "Sangat Kurus",
    sublabel: "≤17.0",
    group: "IMT (Usia Produktif & Lansia)",
  },
  {
    key: "imt_kurus",
    label: "Kurus",
    sublabel: "17.0–18.4",
    group: "IMT (Usia Produktif & Lansia)",
  },
  {
    key: "imt_normal",
    label: "Normal",
    sublabel: "18.5–25.0",
    group: "IMT (Usia Produktif & Lansia)",
  },
  {
    key: "imt_gemuk",
    label: "Gemuk",
    sublabel: "25.1–27.0",
    group: "IMT (Usia Produktif & Lansia)",
  },
  {
    key: "imt_obesitas",
    label: "Obesitas",
    sublabel: ">27.0",
    group: "IMT (Usia Produktif & Lansia)",
  },

  {
    key: "lp_male_90",
    label: "Laki-laki > 90 Cm",
    sublabel: "L > 90 cm",
    group: "Lingkar Perut",
  },
  {
    key: "lp_female_80",
    label: "Perempuan > 80 Cm",
    sublabel: "P > 80 cm",
    group: "Lingkar Perut",
  },

  {
    key: "td_rendah",
    label: "Rendah",
    sublabel: "Hipotensi",
    group: "Tekanan Darah",
  },
  {
    key: "td_normal",
    label: "Normal",
    sublabel: "Sistol/Diastol",
    group: "Tekanan Darah",
  },
  {
    key: "td_tinggi",
    label: "Tinggi",
    sublabel: "Hipertensi",
    group: "Tekanan Darah",
  },

  {
    key: "gd_rendah",
    label: "Rendah",
    sublabel: "Hipoglikemi",
    group: "Gula Darah",
  },
  {
    key: "gd_normal",
    label: "Normal",
    sublabel: "Normal",
    group: "Gula Darah",
  },
  {
    key: "gd_tinggi",
    label: "Tinggi",
    sublabel: "Hiperglikemi",
    group: "Gula Darah",
  },

  {
    key: "jiwa_le5",
    label: "≤5",
    sublabel: "Normal",
    group: "Skrining Kesehatan Jiwa (≥18 thn)",
  },
  {
    key: "jiwa_ge6",
    label: "≥6",
    sublabel: "Risiko",
    group: "Skrining Kesehatan Jiwa (≥18 thn)",
  },
  {
    key: "jiwa_q17_ya",
    label: "Pert. 17=Ya",
    sublabel: "Tindak Lanjut",
    group: "Skrining Kesehatan Jiwa (≥18 thn)",
  },

  {
    key: "puma_normal",
    label: "Normal (<6)",
    sublabel: "<6",
    group: "Skrining PUMA/PPOK (≥40 thn)",
  },
  {
    key: "puma_tinggi",
    label: "Tinggi (≥6)",
    sublabel: "≥6",
    group: "Skrining PUMA/PPOK (≥40 thn)",
  },

  {
    key: "aks_a_m",
    label: "Kategori A",
    sublabel: "Mandiri (M)",
    group: "Tingkat Ketergantungan (AKS)",
  },
  {
    key: "aks_b_r",
    label: "Kategori B",
    sublabel: "Ringan (R)",
    group: "Tingkat Ketergantungan (AKS)",
  },
  {
    key: "aks_b_s",
    label: "Kategori B",
    sublabel: "Sedang (S)",
    group: "Tingkat Ketergantungan (AKS)",
  },
  {
    key: "aks_c_b",
    label: "Kategori C",
    sublabel: "Berat (B)",
    group: "Tingkat Ketergantungan (AKS)",
  },
  {
    key: "aks_c_t",
    label: "Kategori C",
    sublabel: "Total (T)",
    group: "Tingkat Ketergantungan (AKS)",
  },

  {
    key: "skilas_kognitif_ya",
    label: "Kognitif - Ya",
    sublabel: "Ada Gangguan",
    group: "SKILAS",
  },
  {
    key: "skilas_kognitif_tidak",
    label: "Kognitif - Tidak",
    sublabel: "Normal",
    group: "SKILAS",
  },
  {
    key: "skilas_gerak_ya",
    label: "Gerak - Ya",
    sublabel: "Ada Gangguan",
    group: "SKILAS",
  },
  {
    key: "skilas_gerak_tidak",
    label: "Gerak - Tidak",
    sublabel: "Normal",
    group: "SKILAS",
  },
  {
    key: "skilas_malnutrisi_ya",
    label: "Malnutrisi - Ya",
    sublabel: "Ada Risiko",
    group: "SKILAS",
  },
  {
    key: "skilas_malnutrisi_tidak",
    label: "Malnutrisi - Tidak",
    sublabel: "Normal",
    group: "SKILAS",
  },
  {
    key: "skilas_pendengaran_ya",
    label: "Pendengaran - Ya",
    sublabel: "Ada Gangguan",
    group: "SKILAS",
  },
  {
    key: "skilas_pendengaran_tidak",
    label: "Pendengaran - Tidak",
    sublabel: "Normal",
    group: "SKILAS",
  },
  {
    key: "skilas_penglihatan_ya",
    label: "Penglihatan - Ya",
    sublabel: "Ada Gangguan",
    group: "SKILAS",
  },
  {
    key: "skilas_penglihatan_tidak",
    label: "Penglihatan - Tidak",
    sublabel: "Normal",
    group: "SKILAS",
  },
  {
    key: "skilas_depresi_ya",
    label: "Depresi - Ya",
    sublabel: "Ada Gejala",
    group: "SKILAS",
  },
  {
    key: "skilas_depresi_tidak",
    label: "Depresi - Tidak",
    sublabel: "Normal",
    group: "SKILAS",
  },

  {
    key: "lansia_edukasi",
    label: "Mendapat Edukasi",
    sublabel: "Usia Lansia",
    group: "Lansia Edukasi & Rujukan",
  },
  {
    key: "lansia_dirujuk",
    label: "Dirujuk",
    sublabel: "Usia Lansia",
    group: "Lansia Edukasi & Rujukan",
  },
];

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

const PosyanduRekapReport = ({
  isAddModalOpenFromParent,
  setIsAddModalOpenFromParent,
}) => {
  const { user } = useAuth();
  const isKader = user?.role === "HEALTH_WORKER";

  // Registered Posyandus List (Persisted in localStorage)
  const [posyanduList, setPosyanduList] = useState(() => {
    const saved = localStorage.getItem("siwaras_registered_posyandus");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_POSYANDU_LIST;
  });

  // Header Metadata States (Empty default for Kader as requested)
  const [kecamatan, setKecamatan] = useState(isKader ? "" : "Sentolo");
  const [desa, setDesa] = useState(isKader ? "" : "Banguncipto");
  const [dusun, setDusun] = useState(isKader ? "" : "Pedukuhan 1");
  const [posyandu, setPosyandu] = useState(
    isKader ? "" : posyanduList[0] || "",
  );
  const [tahun, setTahun] = useState(new Date().getFullYear().toString());

  // Regional Filter State
  const [pedukuhanFilter, setPedukuhanFilter] = useState("");
  const [pedukuhans, setPedukuhans] = useState([]);

  // Modal State for Adding New Posyandu
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPosyanduName, setNewPosyanduName] = useState("");
  const [newPosyanduDusun, setNewPosyanduDusun] = useState("");
  const [newPosyanduDesa, setNewPosyanduDesa] = useState("Banguncipto");
  const [newPosyanduKecamatan, setNewPosyanduKecamatan] = useState("Sentolo");

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

  useEffect(() => {
    if (user && (user.role === "ADMIN" || user.role === "VILLAGE_HEAD")) {
      api
        .get("/patients/pedukuhans")
        .then((res) => setPedukuhans(res.data))
        .catch((err) => console.error("Gagal memuat pedukuhan:", err));
    }
  }, [user]);

  // Save posyandu list to localStorage whenever updated
  const savePosyandusToStorage = (newList) => {
    setPosyanduList(newList);
    localStorage.setItem(
      "siwaras_registered_posyandus",
      JSON.stringify(newList),
    );
  };

  // Add Posyandu Submit Handler
  const handleAddPosyanduSubmit = (e) => {
    e.preventDefault();
    if (!newPosyanduName.trim()) return;

    const trimmed = newPosyanduName.trim();
    if (posyanduList.includes(trimmed)) return;

    const updatedList = [...posyanduList, trimmed];
    savePosyandusToStorage(updatedList);

    // Auto select newly created posyandu
    setPosyandu(trimmed);
    if (newPosyanduDusun) setDusun(newPosyanduDusun);
    if (newPosyanduDesa) setDesa(newPosyanduDesa);
    if (newPosyanduKecamatan) setKecamatan(newPosyanduKecamatan);

    setNewPosyanduName("");
    setNewPosyanduDusun("");
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

      records.forEach((rec) => {
        const recDate = new Date(rec.date);
        if (recDate.getFullYear() !== targetYear) return;

        // Pedukuhan filter validation
        if (
          (user.role === "ADMIN" || user.role === "VILLAGE_HEAD") &&
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

        // 2. Tekanan Darah Status
        if (rec.bloodPressureStatus) {
          const bp = rec.bloodPressureStatus.toLowerCase();
          if (bp === "rendah") targetRow.td_rendah++;
          else if (bp === "normal") targetRow.td_normal++;
          else targetRow.td_tinggi++;
        }

        // 3. Gula Darah Status
        if (rec.bloodSugarStatus) {
          const bs = rec.bloodSugarStatus.toLowerCase();
          if (bs === "rendah") targetRow.gd_rendah++;
          else if (bs === "normal") targetRow.gd_normal++;
          else targetRow.gd_tinggi++;
        }

        // 4. Skrining Jiwa & PUMA estimates
        if (rec.isRisk) {
          targetRow.jiwa_q17_ya++;
        }

        // 5. Lansia Edukasi & Rujukan
        if (rec.patient?.age >= 60) {
          targetRow.lansia_edukasi++;
          if (rec.isRisk) {
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

  // Export to Excel using template file
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(
        "/Rekapitulasi Pemeriksaan Usia Produktif dan Lansia.xlsx",
      );
      if (!response.ok) {
        throw new Error("File template Excel tidak ditemukan.");
      }
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      const sheetName = workbook.SheetNames.includes("Table 1")
        ? "Table 1"
        : workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Update Header Metadata cells in Excel template
      sheet["A2"] = { t: "s", v: `Kecamatan      : ${kecamatan || "-"}` };
      sheet["A3"] = { t: "s", v: `Desa                  : ${desa || "-"}` };
      sheet["A4"] = { t: "s", v: `Dusun               : ${dusun || "-"}` };
      sheet["A5"] = { t: "s", v: `Posyandu              : ${posyandu || "-"}` };
      sheet["A6"] = {
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
      const cleanDusun = (dusun || "Laporan").replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `Rekapitulasi_Posyandu_${cleanDusun}_Tahun_${tahun}.xlsx`;
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
    link.href =
      "/Rekapitulasi Pemeriksaan Usia Produktif dan Lansia.xlsx";
    link.download =
      "Rekapitulasi Pemeriksaan Usia Produktif dan Lansia.xlsx";
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
      {/* Add New Posyandu Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Posyandu Baru"
      >
        <form onSubmit={handleAddPosyanduSubmit} className="space-y-4">
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-700 flex items-start space-x-2">
            <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>
              Daftarkan posyandu baru agar muncul secara otomatis dalam pilihan
              dropdown pelaporan seluruh kader.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Posyandu Baru *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Posyandu Lansia Kenanga II"
              value={newPosyanduName}
              onChange={(e) => setNewPosyanduName(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-rose-500 bg-slate-50/50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dusun / Pedukuhan
            </label>
            <input
              type="text"
              placeholder="Contoh: Pedukuhan 2"
              value={newPosyanduDusun}
              onChange={(e) => setNewPosyanduDusun(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-rose-500 bg-slate-50/50 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Desa
              </label>
              <select
                value={newPosyanduDesa}
                onChange={(e) => setNewPosyanduDesa(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-rose-500 bg-slate-50/50"
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
                value={newPosyanduKecamatan}
                onChange={(e) => setNewPosyanduKecamatan(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-rose-500 bg-slate-50/50"
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
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
            >
              Simpan Posyandu
            </button>
          </div>
        </form>
      </Modal>

      {/* Row 1: Header Suite matching Ekspor Kustom Kolom style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center">
            <Building className="w-5 h-5 mr-2 text-rose-600" /> Formulir Kartu
            Bantu Posyandu
          </h3>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Rekapitulasi Pemeriksaan Usia Produktif & Lansia versi template
            standar Kemenkes (.xlsx).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            <span>Template Kosong</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExporting}
            className="flex items-center px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            <span>{isExporting ? "Memproses..." : "Ekspor (.xlsx)"}</span>
          </button>
        </div>
      </div>

      {/* Row 2: Identitas & Informasi Posyandu Dropdowns */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">
            Identitas & Informasi Posyandu
          </h4>
          <button
            type="button"
            onClick={handleAutoAggregate}
            disabled={isLoading}
            className="flex items-center text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 mr-1 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Hitung Ulang dari DB</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Dropdown 1: Kecamatan */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
              Kecamatan
            </label>
            <select
              value={kecamatan}
              onChange={(e) => setKecamatan(e.target.value)}
              className="w-full text-[13px] border border-slate-200 rounded-lg p-2.5 outline-none focus:border-rose-500 bg-slate-50/50 focus:bg-white transition-colors cursor-pointer"
            >
              <option value="">-- Pilih Kecamatan --</option>
              {KECAMATAN_OPTIONS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown 2: Desa */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
              Desa
            </label>
            <select
              value={desa}
              onChange={(e) => setDesa(e.target.value)}
              className="w-full text-[13px] border border-slate-200 rounded-lg p-2.5 outline-none focus:border-rose-500 bg-slate-50/50 focus:bg-white transition-colors cursor-pointer"
            >
              <option value="">-- Pilih Desa --</option>
              {DESA_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown 3: Dusun / Pedukuhan */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
              Dusun / Pedukuhan
            </label>
            <select
              value={dusun}
              onChange={(e) => setDusun(e.target.value)}
              className="w-full text-[13px] border border-slate-200 rounded-lg p-2.5 outline-none focus:border-rose-500 bg-slate-50/50 focus:bg-white transition-colors cursor-pointer"
            >
              <option value="">-- Pilih Dusun --</option>
              {pedukuhans.length > 0
                ? pedukuhans.map((p) => (
                    <option key={p.id || p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))
                : [
                    "Pedukuhan 1",
                    "Pedukuhan 2",
                    "Pedukuhan 3",
                    "Kaliagung",
                    "Sentolo",
                  ].map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
            </select>
          </div>

          {/* Dropdown 4: Nama Posyandu */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[12px] font-semibold text-slate-700">
                Nama Posyandu
              </label>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded transition-colors flex items-center"
              >
                <Plus className="w-3 h-3 mr-0.5" /> Posyandu Baru
              </button>
            </div>
            <select
              value={posyandu}
              onChange={(e) => {
                if (e.target.value === "__ADD_NEW__") {
                  setIsAddModalOpen(true);
                } else {
                  setPosyandu(e.target.value);
                }
              }}
              className="w-full text-[13px] border border-slate-200 rounded-lg p-2.5 outline-none focus:border-rose-500 bg-slate-50/50 focus:bg-white transition-colors cursor-pointer"
            >
              <option value="">-- Pilih Posyandu --</option>
              {posyanduList.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
              <option
                value="__ADD_NEW__"
                className="font-bold text-rose-600 bg-rose-50"
              >
                + Tambah Posyandu Belum Terdaftar...
              </option>
            </select>
          </div>

          {/* Dropdown 5: Tahun Rekapitulasi */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
              Tahun Rekapitulasi
            </label>
            <select
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className="w-full text-[13px] border border-slate-200 rounded-lg p-2.5 outline-none focus:border-rose-500 bg-slate-50/50 focus:bg-white transition-colors cursor-pointer"
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
            <div className="pt-2 flex items-center gap-3">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-600">
                Filter Tenant Pedukuhan:
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

      {/* Row 3: Column Group Filter Pills */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="text-[13px] font-bold text-slate-700 flex items-center">
            <Filter className="w-4 h-4 mr-1.5 text-rose-500" /> Filter Kelompok
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
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeGroupFilter === "ALL"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua Kolom
          </button>
          {groupsList.map((groupName) => (
            <button
              key={groupName}
              type="button"
              onClick={() => setActiveGroupFilter(groupName)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeGroupFilter === groupName
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {groupName}
            </button>
          ))}
        </div>
      </div>

      {/* Row 4: Main Data Table Grid */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-rose-500" />
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

        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="sticky top-0 z-20 bg-slate-100 text-slate-700 text-[11px] uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3 border-b border-r border-slate-200 w-28 bg-slate-100 sticky left-0 z-30">
                  Bulan
                </th>
                <th className="p-3 border-b border-r border-slate-200 w-12 bg-slate-100 sticky left-28 z-30 text-center">
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
                      <div className="text-[9px] text-rose-600 font-medium normal-case">
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
                    className={`transition-colors ${isEvenMonth ? "bg-white hover:bg-rose-50/20" : "bg-slate-50/50 hover:bg-rose-50/20"}`}
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
                              ? "bg-rose-50/60 text-rose-700 font-bold border border-rose-200/80 focus:bg-white focus:ring-2 focus:ring-rose-400"
                              : "bg-transparent text-slate-400 focus:bg-white focus:text-slate-800 focus:ring-2 focus:ring-rose-300"
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
                    <span className="text-rose-300 text-xs font-bold">
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

export default PosyanduRekapReport;
