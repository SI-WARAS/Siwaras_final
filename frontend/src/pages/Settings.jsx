import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toastSuccess, toastError } from "../utils/toastAlert";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Lock,
  Shield,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Modal from "../components/ui/Modal";
import api from "../lib/axios";

const ROLE_LABELS = {
  ADMIN: "Admin",
  HEALTH_WORKER: "Kader Kesehatan",
  VILLAGE_HEAD: "Kepala Desa",
};

const ROLE_BADGE = {
  ADMIN: "bg-rose-50 text-rose-600 border-rose-100",
  HEALTH_WORKER: "bg-sky-50 text-sky-600 border-sky-100",
  VILLAGE_HEAD: "bg-emerald-50 text-emerald-600 border-emerald-100",
};

// ─── User Form Modal ──────────────────────────────────────────────────────────
const UserFormModal = ({
  isOpen,
  onClose,
  editUser,
  pedukuhans,
  onSave,
  isPending,
}) => {
  const [showPass, setShowPass] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: editUser
      ? {
          username: editUser.username,
          role: editUser.role,
          pedukuhan_id: editUser.pedukuhan_id || "",
        }
      : { role: "HEALTH_WORKER", pedukuhan_id: "" },
  });

  const role = watch("role");

  const onSubmit = (data) => {
    if (!data.password) delete data.password;
    if (!data.pedukuhan_id) data.pedukuhan_id = null;
    onSave(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editUser ? "Edit Pengguna" : "Tambah Pengguna"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Username"
          placeholder="username"
          {...register("username", { required: "Username wajib diisi" })}
          error={errors.username?.message}
        />
        <div className="relative">
          <Input
            label={
              editUser
                ? "Password Baru (kosongkan jika tidak diubah)"
                : "Password"
            }
            type={showPass ? "text" : "password"}
            placeholder={editUser ? "(biarkan kosong)" : "Min. 6 karakter"}
            {...register("password", {
              minLength: { value: 6, message: "Min. 6 karakter" },
              ...(!editUser && { required: "Password wajib diisi" }),
            })}
            error={errors.password?.message}
          />
          <button
            type="button"
            onClick={() => setShowPass((p) => !p)}
            className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 outline-none"
          >
            {showPass ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <Select
          label="Peran"
          {...register("role", { required: true })}
          options={[
            { value: "HEALTH_WORKER", label: "Kader Kesehatan" },
            { value: "VILLAGE_HEAD", label: "Kepala Desa" },
          ]}
        />
        {role === "HEALTH_WORKER" && (
          <Select
            label="Pedukuhan"
            {...register("pedukuhan_id")}
            options={[
              { value: "", label: "— Pilih Pedukuhan —" },
              ...(pedukuhans || []).map((p) => ({
                value: p.id,
                label: p.name,
              })),
            ]}
          />
        )}
        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-[13px] font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors outline-none"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 text-[13px] font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-sm outline-none disabled:opacity-50"
          >
            {isPending
              ? "Menyimpan..."
              : editUser
                ? "Simpan Perubahan"
                : "Tambah Pengguna"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteUserModal = ({ user: target, onClose, onDelete, isPending }) => (
  <Modal isOpen={!!target} onClose={onClose} title="Hapus Pengguna">
    <p className="text-[14px] text-slate-600 mb-6">
      Apakah Anda yakin ingin menghapus akun{" "}
      <span className="font-bold text-slate-800">{target?.name}</span>? Tindakan
      ini tidak dapat dibatalkan.
    </p>
    <div className="flex justify-end gap-3">
      <button
        onClick={onClose}
        className="px-4 py-2 text-[13px] font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors outline-none"
      >
        Batal
      </button>
      <button
        onClick={() => onDelete(target?.id)}
        disabled={isPending}
        className="px-5 py-2 text-[13px] font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-sm outline-none disabled:opacity-50"
      >
        {isPending ? "Menghapus..." : "Ya, Hapus"}
      </button>
    </div>
  </Modal>
);

// ─── User Management Tab ──────────────────────────────────────────────────────
const UserManagementTab = () => {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await api.get("/users");
      return data.filter((u) => u.role !== "ADMIN");
    },
  });

  const { data: pedukuhans = [] } = useQuery({
    queryKey: ["pedukuhans"],
    queryFn: async () => {
      const { data } = await api.get("/pedukuhans");
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (d) => api.post("/users", d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toastSuccess("Pengguna berhasil ditambahkan!");
      setAddOpen(false);
    },
    onError: (e) =>
      toastError(e.response?.data?.message || "Gagal menambahkan pengguna."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }) => api.put(`/users/${id}`, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toastSuccess("Pengguna berhasil diperbarui!");
      setEditUser(null);
    },
    onError: (e) =>
      toastError(e.response?.data?.message || "Gagal memperbarui pengguna."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toastSuccess("Pengguna berhasil dihapus.");
      setDeleteUser(null);
    },
    onError: (e) =>
      toastError(e.response?.data?.message || "Gagal menghapus pengguna."),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Manajemen Pengguna
          </h2>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Kelola akun pengguna sistem SI-WARAS.
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-medium rounded-lg transition-colors shadow-sm outline-none"
        >
          <Plus className="w-4 h-4" /> Tambah Pengguna
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-slate-50 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {users.map((u) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center justify-between p-4 bg-slate-50/80 hover:bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm rounded-xl transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold text-[14px] flex-shrink-0">
                    {u.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 truncate">
                      {u.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      @{u.username}
                      {u.pedukuhanName ? ` · ${u.pedukuhanName}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border hidden sm:inline ${ROLE_BADGE[u.role]}`}
                  >
                    {ROLE_LABELS[u.role]}
                  </span>
                  <button
                    onClick={() => setEditUser(u)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors outline-none"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteUser(u)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors outline-none"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {users.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-[13px]">
              Belum ada pengguna.
            </div>
          )}
        </div>
      )}

      <UserFormModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        editUser={null}
        pedukuhans={pedukuhans}
        onSave={(d) => createMutation.mutate(d)}
        isPending={createMutation.isPending}
      />
      <UserFormModal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        editUser={editUser}
        pedukuhans={pedukuhans}
        onSave={(d) => updateMutation.mutate({ id: editUser.id, ...d })}
        isPending={updateMutation.isPending}
      />
      <DeleteUserModal
        user={deleteUser}
        onClose={() => setDeleteUser(null)}
        onDelete={(id) => deleteMutation.mutate(id)}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
};

// ─── Profile Tab ──────────────────────────────────────────────────────────────
const ProfileTab = ({ user }) => {
  const [isSaving, setIsSaving] = useState(false);
  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toastSuccess("Pengaturan berhasil diperbarui!");
    }, 1000);
  };
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-800 mb-6">
        Informasi Profil
      </h2>
      <form onSubmit={handleSave} className="space-y-6">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold text-3xl">
            {user?.name?.charAt(0) || "A"}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Nama Lengkap" type="text" defaultValue={user?.name} />
          <Input
            label="Peran"
            type="text"
            value={ROLE_LABELS[user?.role] || user?.role || ""}
            disabled
            className="bg-slate-50 text-slate-400 cursor-not-allowed"
          />
        </div>
        <div className="pt-6 border-t border-slate-100/50 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 text-[13px] font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors shadow-sm outline-none disabled:opacity-50"
          >
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
};

// ─── Main Settings Page ───────────────────────────────────────────────────────
const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    ...(user?.role === "ADMIN"
      ? [{ id: "users", label: "Manajemen Pengguna", icon: Shield }]
      : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto pb-12"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Pengaturan
        </h1>
        <p className="text-[13px] text-slate-500 mt-1">
          Kelola preferensi akun dan pengaturan sistem Anda.
        </p>
      </div>

      <div className="bg-white rounded-[20px] shadow-soft border border-slate-100/50 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar Nav */}
          <div className="w-full md:w-56 bg-slate-50/50 border-r border-slate-100/50 p-5">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-2.5 text-[13px] font-medium rounded-lg transition-colors outline-none text-left ${
                      isActive
                        ? "bg-white text-rose-600 shadow-sm border border-slate-100 font-semibold"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18 }}
              >
                {activeTab === "profile" && <ProfileTab user={user} />}
                {activeTab === "users" && user?.role === "ADMIN" && (
                  <UserManagementTab />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
