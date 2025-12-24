
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileFormProps {
  onSave: (profile: UserProfile) => void;
  initialData: UserProfile | null;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onSave, initialData }) => {
  const [formData, setFormData] = useState<UserProfile>(initialData || {
    name: '',
    age: 25,
    height: 170,
    weight: 70,
    bodyFat: undefined,
    gender: 'masculino',
    activityLevel: 'moderado',
    goal: 'mantener_peso',
    weightLossTarget: 2,
    weightGainTarget: 1,
    allergies: '',
    intolerances: '',
    considerations: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (['age', 'height', 'weight', 'bodyFat', 'weightLossTarget', 'weightGainTarget'].includes(name)) 
        ? (value === '' ? undefined : Number(value)) 
        : value
    }));
  };

  const inputClasses = "w-full px-4 py-3 bg-white border border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 font-bold placeholder:text-slate-400 outline-none transition-all";

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-200 space-y-10">
      <div className="space-y-6">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Datos Básicos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Nombre Completo</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className={inputClasses} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Edad</label>
            <input required type="number" name="age" value={formData.age} onChange={handleChange} className={inputClasses} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Estatura (cm)</label>
            <input required type="number" name="height" value={formData.height} onChange={handleChange} className={inputClasses} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Peso Actual (kg)</label>
            <input required type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} className={inputClasses} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">% Grasa Corporal</label>
            <input type="number" step="0.1" name="bodyFat" value={formData.bodyFat || ''} onChange={handleChange} placeholder="Opcional" className={inputClasses} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Género Biológico</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className={inputClasses}>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Estilo de Vida y Objetivos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Nivel de Actividad</label>
            <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className={inputClasses}>
              <option value="sedentario">Sedentario (Oficina)</option>
              <option value="ligero">Ligero (1-2 veces/sem)</option>
              <option value="moderado">Moderado (3-5 veces/sem)</option>
              <option value="intenso">Intenso (6-7 veces/sem)</option>
              <option value="atleta">Atleta (Doble sesión)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Objetivo Principal</label>
            <select name="goal" value={formData.goal} onChange={handleChange} className={inputClasses}>
              <option value="perder_peso">Perder Peso</option>
              <option value="mantener_peso">Mantener Peso</option>
              <option value="ganar_musculo">Ganar Músculo / Volumen</option>
            </select>
          </div>
          {formData.goal === 'perder_peso' && (
            <div className="md:col-span-2 bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
              <label className="block text-[10px] font-black text-emerald-600 uppercase mb-4 tracking-widest text-center">Intensidad de Pérdida de Peso (kg al mes)</label>
              <div className="flex items-center justify-between gap-4">
                {[1, 2, 3, 4, 5].map(kg => (
                  <button
                    key={kg}
                    type="button"
                    onClick={() => setFormData(p => ({...p, weightLossTarget: kg}))}
                    className={`flex-1 py-3 rounded-2xl font-black text-sm transition-all ${
                      formData.weightLossTarget === kg ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-emerald-600 border border-emerald-200'
                    }`}
                  >
                    {kg} kg
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-emerald-600 font-bold mt-4 text-center italic">
                *Nota: Perder más de 4kg/mes requiere supervisión profesional y un déficit calórico agresivo.
              </p>
            </div>
          )}
          {formData.goal === 'ganar_musculo' && (
            <div className="md:col-span-2 bg-blue-50 p-6 rounded-3xl border border-blue-100">
              <label className="block text-[10px] font-black text-blue-600 uppercase mb-4 tracking-widest text-center">Intensidad de Ganancia de Peso (kg al mes)</label>
              <div className="flex items-center justify-between gap-4">
                {[0.5, 1, 1.5, 2, 3].map(kg => (
                  <button
                    key={kg}
                    type="button"
                    onClick={() => setFormData(p => ({...p, weightGainTarget: kg}))}
                    className={`flex-1 py-3 rounded-2xl font-black text-sm transition-all ${
                      formData.weightGainTarget === kg ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-blue-600 border border-blue-200'
                    }`}
                  >
                    {kg} kg
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-blue-600 font-bold mt-4 text-center italic">
                *Nota: Una ganancia controlada (0.5-1kg/mes) minimiza la acumulación de grasa durante el volumen.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 pt-10 border-t border-slate-100">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Salud y Consideraciones</h3>
        <div className="space-y-4">
          <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="Alergias (Ej: Maní, Gluten...)" className={inputClasses} />
          <input type="text" name="intolerances" value={formData.intolerances} onChange={handleChange} placeholder="Intolerancias (Ej: Lactosa...)" className={inputClasses} />
          <textarea name="considerations" value={formData.considerations} onChange={handleChange} rows={2} placeholder="Otras consideraciones (Diabetes, tiroides, etc...)" className={inputClasses} />
        </div>
      </div>

      <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[30px] font-black shadow-2xl hover:bg-emerald-600 transition-all uppercase tracking-widest text-lg">
        GUARDAR PERFIL Y ACTUALIZAR MÉTRICAS
      </button>
    </form>
  );
};

export default ProfileForm;
