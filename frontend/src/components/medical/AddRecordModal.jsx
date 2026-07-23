import { useForm } from 'react-hook-form';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { getNowForDatetimeInput } from '../../utils/dateUtils';

const AddRecordModal = ({ isOpen, onClose, onAdd, isPending }) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      date: getNowForDatetimeInput(),
    }
  });

  const onSubmit = (data) => {
    onAdd(data, reset);
  };

  const activityOptions = [
    { value: 'LOW', label: 'Rendah' },
    { value: 'MODERATE', label: 'Sedang' },
    { value: 'HIGH', label: 'Tinggi' },
  ];

  const smokingOptions = [
    { value: 'false', label: 'Tidak' },
    { value: 'true', label: 'Ya' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Data Medis">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Tanggal & Waktu Pemeriksaan"
          type="datetime-local"
          {...register("date", { required: true })}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Tekanan Darah" 
            {...register("bloodPressure", { required: true })} placeholder='120/80'
          />
          <Input 
            label="Gula Darah" 
            type="number" 
            step="0.1" 
            {...register("bloodSugar", { required: true })} placeholder='100'
          />
          <Input 
            label="Kolesterol" 
            type="number" 
            step="0.1" 
            {...register("cholesterol", { required: true })} placeholder='150'
          />
          <Input 
            label="Asam Urat" 
            type="number" 
            step="0.1" 
            {...register("uricAcid", { required: true })} placeholder='2.4 - 6.0'
          />
          <Select 
            label="Tingkat Aktivitas" 
            options={activityOptions} 
            {...register("activityLevel", { required: true })} 
          />
          <Input 
            label="Berat (kg)" 
            type="number" 
            step="0.1" 
            {...register("weight", { required: true })} placeholder='60'
          />
          <Input 
            label="Tinggi (cm)" 
            type="number" 
            step="0.1" 
            {...register("height", { required: true })} placeholder='160'
          />
          <Select 
            label="Status Merokok" 
            options={smokingOptions} 
            {...register("smokingStatus", { required: true })} 
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Catatan Klinis</label>
          <textarea 
            {...register("notes")} 
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary text-[13px] bg-white hover:bg-slate-50 transition-all duration-200 outline-none" 
            rows="3"
          />
        </div>
        <div className="flex justify-end pt-5 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-4 py-2.5 text-[13px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg mr-2 transition-colors">Batal</button>
          <button type="submit" disabled={isPending} className="px-5 py-2.5 text-[13px] font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors shadow-sm outline-none">
            {isPending ? 'Menyimpan...' : 'Simpan Log'}
          </button>
        </div>
      </form>
    </Modal>
  );

};

export default AddRecordModal;
