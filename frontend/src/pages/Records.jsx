import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Activity, Heart, Scale, Calendar, ChevronRight } from "lucide-react";
import { formatDisplayDate } from "../utils/dateUtils";
import api from "../lib/axios";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { getBasePath } from "../utils/roleHelpers";

import {
  getBPStatus,
  getBSStatus,
  getUAStatus,
  getCholesterolStatus,
  getBMIStatus,
} from "../utils/healthLogic";

const StatusBadge = ({ status, text }) => {
  const styles = {
    rendah: "bg-blue-50 text-blue-700 border-blue-100",
    normal: "bg-emerald-50 text-emerald-700 border-emerald-100",
    waspada: "bg-amber-50 text-amber-700 border-amber-100",
    bahaya: "bg-brand-light/30 text-brand-primary border-brand-light",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${styles[status]}`}
    >
      {text || status}
    </span>
  );
};

const Records = () => {
  const { user } = useAuth();

  const basePath = getBasePath(user?.role);

  const { data: records, isLoading } = useQuery({
    queryKey: ["allRecords"],
    queryFn: async () => {
      const { data } = await api.get("/records");
      return data;
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Rekam Medis
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Umpan global semua pemeriksaan medis terbaru.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 font-medium animate-pulse">
            Memuat rekam medis...
          </div>
        ) : records?.length === 0 ? (
          <div className="bg-white rounded-[20px] shadow-soft border border-slate-100/50 p-12 text-center text-slate-400 text-[13px] font-medium flex flex-col items-center justify-center">
            <Activity className="w-8 h-8 text-slate-200 mb-3" />
            Tidak ada rekam medis ditemukan.
          </div>
        ) : (
          records?.map((record) => {
            const bpStatus = getBPStatus(record.bloodPressure);
            const bsStatus = getBSStatus(record.bloodSugar);
            const bmiStatus = getBMIStatus(record.bmi, record.weight, record.height);

            return (
              <div
                key={record.id}
                className="bg-white p-6 rounded-[20px] shadow-soft border border-slate-100/50 hover:border-rose-200 transition-all group"
              >
                {/* Header — klik untuk lihat detail pasien */}
                <Link
                  to={`${basePath}/patients/${record.patientId}`}
                  className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100/50 group/header cursor-pointer"
                  title={`Lihat detail ${record.patient?.name}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-[13px] group-hover/header:bg-rose-600 group-hover/header:text-white transition-colors shrink-0">
                      {record.patient?.name?.charAt(0) ?? "?"}
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-slate-800 group-hover/header:text-rose-600 transition-colors underline-offset-2 group-hover/header:underline">
                        {record.patient?.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDisplayDate(record.createdAt || record.date)}
                      </div>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 group-hover/header:text-rose-500 transition-colors bg-slate-50 group-hover/header:bg-rose-50 px-2.5 py-1.5 rounded-lg border border-slate-100 group-hover/header:border-rose-100">
                    Detail Pasien
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </Link>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-6">
                  <div>
                    <div className="flex items-center text-slate-400 mb-1.5 text-[10px] font-bold uppercase tracking-wider">
                      <Heart className="w-3 h-3 mr-1" /> T. Darah
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-[15px]">
                        {record.bloodPressure}
                      </span>
                      <StatusBadge status={bpStatus} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center text-slate-400 mb-1.5 text-[10px] font-bold uppercase tracking-wider">
                      <Activity className="w-3 h-3 mr-1" /> G. Darah
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-[15px]">
                        {record.bloodSugar}
                      </span>
                      <StatusBadge status={bsStatus} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center text-slate-400 mb-1.5 text-[10px] font-bold uppercase tracking-wider">
                      Kolesterol
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-[15px]">
                        {record.cholesterol}
                      </span>
                      <StatusBadge
                        status={getCholesterolStatus(record.cholesterol)}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center text-slate-400 mb-1.5 text-[10px] font-bold uppercase tracking-wider">
                      Asam Urat
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-[15px]">
                        {record.uricAcid}
                      </span>
                      <StatusBadge
                        status={getUAStatus(
                          record.uricAcid,
                          record.patient?.gender,
                        )}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <Scale className="w-3 h-3 mr-1" /> IMT (BMI) & Fisik
                      </div>
                      {bmiStatus && (
                        <StatusBadge
                          status={bmiStatus.status}
                          text={bmiStatus.category}
                        />
                      )}
                    </div>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      {bmiStatus && (
                        <span className="font-bold text-slate-900 text-[14px]">
                          {bmiStatus.value} <span className="text-[10px] font-normal text-slate-400">kg/m²</span>
                        </span>
                      )}
                      <span className="font-medium text-slate-600 text-[13px]">
                        {bmiStatus ? "• " : ""}
                        {record.weight ? `${record.weight}kg` : "-"} / {record.height ? `${record.height}cm` : "-"}
                        {(record.waist_circumference || record.waistCircumference) && ` • LP: ${record.waist_circumference ?? record.waistCircumference}cm`}
                        {record.lila && ` • LILA: ${record.lila}cm`}
                        {record.activityLevel && ` • ${record.activityLevel} Activity`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default Records;
