import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Select from "../ui/Select";
import { formatForDatetimeInput } from "../../utils/dateUtils";
import { toastError } from "../../utils/toastAlert";
import { getBMIStatus } from "../../utils/healthLogic";

const EditRecordModal = ({ record, onClose, onEdit, isPending }) => {
  const { register, handleSubmit, reset, watch } = useForm();

  const weight = watch("weight");
  const height = watch("height");
  const liveBmi = getBMIStatus(null, weight, height);

  useEffect(() => {
    if (record) {
      reset({
        date: formatForDatetimeInput(record.date),
        bloodPressure: record.bloodPressure ?? "",
        bloodSugar: record.bloodSugar ?? "",
        cholesterol: record.cholesterol ?? "",
        uricAcid: record.uricAcid ?? "",
        weight: record.weight ?? "",
        height: record.height ?? "",
        waistCircumference: record.waist_circumference ?? record.waistCircumference ?? "",
        lila: record.lila ?? "",
        mentalHealthScore: record.mental_health_score ?? record.mentalHealthScore ?? "",
        mentalHealthQ17: record.mental_health_q17 ?? record.mentalHealthQ17 ? "true" : (record.mental_health_q17 === false || record.mentalHealthQ17 === false ? "false" : ""),
        pumaScore: record.puma_score ?? record.pumaScore ?? "",
        dependencyLevel: record.dependency_level ?? record.dependencyLevel ?? "",
        activityLevel: record.activityLevel ?? "",
        smokingStatus: record.smokingStatus === true ? "true" : (record.smokingStatus === false ? "false" : ""),
        notes: record.notes || "",
      });
    }
  }, [record, reset]);

  const onSubmit = (data) => {
    // Check if at least one medical data or note is provided
    const hasAnyField = Object.keys(data).some((key) => {
      if (key === "date") return false;
      const val = data[key];
      return val !== "" && val !== null && val !== undefined;
    });

    if (!hasAnyField) {
      toastError("Mohon isi sekurang-kurangnya satu data pemeriksaan medis.");
      return;
    }

    onEdit(record.id, data);
  };

  const activityOptions = [
    { value: "", label: "-- Opsional --" },
    { value: "LOW", label: "Rendah" },
    { value: "MODERATE", label: "Sedang" },
    { value: "HIGH", label: "Tinggi" },
  ];

  const smokingOptions = [
    { value: "", label: "-- Opsional --" },
    { value: "false", label: "Tidak" },
    { value: "true", label: "Ya" },
  ];

  return (
    <Modal isOpen={!!record} onClose={onClose} title="Perbarui Data Medis">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          <Input
            label="Tanggal & Waktu Pemeriksaan"
            type="datetime-local"
            {...register("date", { required: true })}
          />

          {/* Pemeriksaan Dasar */}
          <div className="space-y-3">
            <h4 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              Pemeriksaan Dasar (Opsional)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Tekanan Darah"
                {...register("bloodPressure")}
              />
              <Input
                label="Lingkar Perut (cm)"
                type="number"
                step="0.1"
                {...register("waistCircumference")}
              />
              <Input
                label="Lingkar Lengan Atas / LILA (cm)"
                type="number"
                step="0.1"
                {...register("lila")}
              />
              <Input
                label="Berat (kg)"
                type="number"
                step="0.1"
                {...register("weight")}
              />
              <Input
                label="Tinggi (cm)"
                type="number"
                step="0.1"
                {...register("height")}
              />
              {liveBmi && (
                <div className="sm:col-span-2 bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
                  <div className="text-[12px] font-medium text-slate-600">
                    Kalkulasi Indeks Massa Tubuh (IMT): <span className="font-bold text-slate-800">{liveBmi.value} kg/m²</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
                    liveBmi.status === "normal" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                    liveBmi.status === "waspada" ? "bg-amber-50 text-amber-700 border-amber-100" :
                    "bg-brand-light/30 text-brand-primary border-brand-light"
                  }`}>
                    {liveBmi.category}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Pemeriksaan Laboratorium */}
          <div className="space-y-3">
            <h4 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              Pemeriksaan Laboratorium (Opsional)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Gula Darah (mg/dL)"
                type="number"
                step="0.1"
                {...register("bloodSugar")}
              />
              <Input
                label="Kolesterol (mg/dL)"
                type="number"
                step="0.1"
                {...register("cholesterol")}
              />
              <Input
                label="Asam Urat (mg/dL)"
                type="number"
                step="0.1"
                {...register("uricAcid")}
              />
            </div>
          </div>

          {/* Skrining Kesehatan */}
          <div className="space-y-3">
            <h4 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              Skrining Kesehatan (Opsional)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Skor Jiwa (SRQ-20)"
                type="number"
                {...register("mentalHealthScore")}
              />
              <Select
                label="Jiwa Pert. 17"
                options={[
                  { value: "", label: "-- Opsional --" },
                  { value: "false", label: "Tidak" },
                  { value: "true", label: "Ya" },
                ]}
                {...register("mentalHealthQ17")}
              />
              <Input
                label="Skor PUMA (PPOK)"
                type="number"
                {...register("pumaScore")}
              />
            </div>
          </div>

          {/* Gaya Hidup & Ketergantungan */}
          <div className="space-y-3">
            <h4 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              Gaya Hidup & Ketergantungan (Opsional)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Tingkat Aktivitas"
                options={activityOptions}
                {...register("activityLevel")}
              />
              <Select
                label="Status Merokok"
                options={smokingOptions}
                {...register("smokingStatus")}
              />
              <Select
                label="Ketergantungan (AKS)"
                options={[
                  { value: "", label: "-- Opsional --" },
                  { value: "M", label: "Mandiri (M)" },
                  { value: "R", label: "Ringan (R)" },
                  { value: "S", label: "Sedang (S)" },
                  { value: "B", label: "Berat (B)" },
                  { value: "T", label: "Total (T)" },
                ]}
                {...register("dependencyLevel")}
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
            Catatan Klinis
          </label>
          <textarea
            {...register("notes")}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary text-[13px] bg-white hover:bg-slate-50 transition-all duration-200 outline-none"
            rows="3"
          />
        </div>
        <div className="flex justify-end pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-[13px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg mr-2 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 text-[13px] font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors shadow-sm outline-none"
          >
            {isPending ? "Memperbarui..." : "Perbarui Log"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditRecordModal;
