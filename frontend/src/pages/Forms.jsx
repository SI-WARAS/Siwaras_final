import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, BookOpen, AlertCircle, ExternalLink, Clock, Eye } from "lucide-react";
import api from "../lib/axios";

const Forms = () => {
  const formLinks = [
    {
      title: "Form Evaluasi",
      description: "Formulir evaluasi kegiatan dan program kesehatan",
      icon: FileText,
      href: "/form_eval.html",
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Logbook Kader",
      description: "Pencatatan harian kegiatan dan aktivitas kader",
      icon: BookOpen,
      href: "/logbook_kader.html",
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      title: "Monitoring Kelompok Risiko",
      description: "Pemantauan kelompok dengan risiko penyakit tidak menular",
      icon: AlertCircle,
      href: "/monitoring_kelompok_risiko.html",
      color: "bg-rose-500",
      lightColor: "bg-rose-50",
      textColor: "text-rose-600",
    },
  ];

  const [historyData, setHistoryData] = useState([]);

  const urlMap = {
    "Form Evaluasi": "/form_eval.html",
    "Logbook Kader": "/logbook_kader.html",
    "Monitoring Kelompok Risiko": "/monitoring_kelompok_risiko.html"
  };

  const handleViewDetail = (item) => {
    const url = urlMap[item.formName];
    if (url) {
      window.open(`${url}?view_id=${item.id}`, '_blank');
    }
  };

  useEffect(() => {
    // Save current API URL to localStorage so static HTML forms can use it
    if (api.defaults.baseURL) {
      localStorage.setItem('api_base_url', api.defaults.baseURL);
    }

    const loadHistory = async () => {
      try {
        const response = await api.get('/forms');
        if (response.data) {
          setHistoryData(response.data);
        }
      } catch (err) {
        console.error('Failed to load forms history', err);
      }
    };
    
    // Load initially
    loadHistory();

    // Listen for changes across tabs or window focus
    window.addEventListener('focus', loadHistory);
    return () => window.removeEventListener('focus', loadHistory);
  }, []);

  const iconMap = {
    FileText: FileText,
    BookOpen: BookOpen,
    AlertCircle: AlertCircle,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-7xl mx-auto pb-10"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Formulir & Dokumen
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Akses berbagai formulir operasional, logbook, dan form monitoring.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formLinks.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.a
              key={index}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group block bg-white rounded-[20px] p-6 shadow-soft hover:shadow-md border border-slate-100 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out" />
              
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl ${item.lightColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-7 h-7 ${item.textColor}`} />
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-rose-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-[13px] text-slate-500 mb-6 leading-relaxed">
                  {item.description}
                </p>
                
                <div className="flex items-center text-sm font-semibold text-slate-400 group-hover:text-rose-500 transition-colors">
                  <span>Buka Formulir</span>
                  <ExternalLink className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </div>
            </motion.a>
          );
        })}
      </div>

      {/* History Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mr-3">
              <Clock className="w-4 h-4 text-indigo-600" />
            </span>
            Riwayat Penginputan Terbaru
          </h2>
          <button className="text-[13px] font-semibold text-indigo-600 hover:text-indigo-700">
            Lihat Semua
          </button>
        </div>

        <div className="bg-white rounded-[20px] shadow-soft border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-100/80">
            {historyData.length > 0 ? (
              historyData.map((item) => {
                const Icon = iconMap[item.iconType] || FileText;
              return (
                <div 
                  key={item.id} 
                  className="p-5 flex items-start gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  onClick={() => handleViewDetail(item)}
                >
                  <div className={`w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <h4 className="text-[14px] font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                        {item.formName}
                      </h4>
                      <span className="text-[12px] font-medium text-slate-500 whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })} WIB
                      </span>
                    </div>
                    
                    <div className="flex items-center text-[13px] text-slate-600 mb-2">
                      <span className="font-semibold text-slate-700 mr-1">{item.user ? item.user.name : 'Unknown User'}</span>
                      <span className="text-slate-400 mr-2">• {item.user ? item.user.role : 'No Role'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600">
                          {item.status}
                        </span>
                      </div>
                      <button className="text-[12px] font-semibold text-indigo-600 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-3 h-3 mr-1" /> Lihat Detail
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-500">
              <p className="text-[14px]">Belum ada histori penginputan.</p>
            </div>
          )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Forms;
