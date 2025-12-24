
import React, { useState } from 'react';
import { Measurement } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MeasurementsViewProps {
  history: Measurement[];
  onAdd: (m: Omit<Measurement, 'id'>) => void;
  onDelete: (id: string) => void;
  gender: string;
}

const MEASUREMENT_GUIDE: Record<string, { title: string, description: string, icon: string }> = {
  neck: { title: "Cuello", description: "Rodea la base del cuello justo por encima de la clavícula. Mantén la cinta nivelada.", icon: "🧣" },
  chest: { title: "Pecho", description: "Pasa la cinta por debajo de las axilas sobre la parte más prominente del pecho/busto.", icon: "👕" },
  arm: { title: "Brazo", description: "Mide el contorno del bíceps en su punto más ancho con el brazo flexionado y contraído.", icon: "💪" },
  waist: { title: "Cintura", description: "Un dedo por encima del ombligo. Rodea el abdomen relajado sin apretar la cinta.", icon: "📏" },
  hip: { title: "Cadera", description: "Con los pies juntos, rodea la parte más prominente de los glúteos de forma nivelada.", icon: "👖" },
  thigh: { title: "Muslo", description: "Mide la parte media del muslo, a mitad de camino entre la ingle y la rodilla.", icon: "🦵" }
};

const MeasurementInput = ({ label, value, setter, field, activeField, setActiveField }: { label: string, value: string, setter: (v: string) => void, field: string, activeField: string | null, setActiveField: (f: string | null) => void }) => (
  <div 
    onMouseEnter={() => setActiveField(field)}
    onMouseLeave={() => setActiveField(null)}
    className={`p-4 rounded-2xl border transition-all duration-300 ${activeField === field ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 bg-white'}`}
  >
    <label className={`block text-[10px] font-black uppercase mb-1 transition-colors ${activeField === field ? 'text-emerald-600' : 'text-slate-400'}`}>
      {label} (cm)
    </label>
    <input 
      type="number" 
      step="0.1" 
      value={value} 
      onChange={(e) => setter(e.target.value)} 
      className="w-full bg-transparent text-slate-900 font-black text-lg outline-none placeholder:text-slate-300" 
      placeholder="0.0"
    />
  </div>
);

const MeasurementsView: React.FC<MeasurementsViewProps> = ({ history, onAdd, onDelete, gender }) => {
  const [activeSubTab, setActiveSubTab] = useState<'composition' | 'body'>('composition');
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [neck, setNeck] = useState('');
  const [chest, setChest] = useState('');
  const [arm, setArm] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [thigh, setThigh] = useState('');

  const [activeField, setActiveField] = useState<string | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<Measurement | null>(null);

  const sortedHistory = [...history].sort((a, b) => a.date.localeCompare(b.date));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;
    onAdd({
      date,
      weight: Number(weight),
      bodyFat: bodyFat ? Number(bodyFat) : undefined,
      height: 0,
      neck: neck ? Number(neck) : undefined,
      chest: chest ? Number(chest) : undefined,
      arm: arm ? Number(arm) : undefined,
      waist: waist ? Number(waist) : undefined,
      hip: hip ? Number(hip) : undefined,
      thigh: thigh ? Number(thigh) : undefined,
    });
    setWeight(''); setBodyFat(''); setNeck(''); setChest(''); setArm(''); setWaist(''); setHip(''); setThigh('');
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Evolución Física</h2>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveSubTab('composition')} 
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeSubTab === 'composition' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            COMPOSICIÓN CORPORAL
          </button>
          <button 
            onClick={() => setActiveSubTab('body')} 
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeSubTab === 'body' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            HISTORIAL
          </button>
        </div>
      </div>

      <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
          <h3 className="text-xl font-black text-slate-900">Nuevo Registro de Progreso</h3>
        </div>
        
        <form onSubmit={handleAdd} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Fecha de Registro</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-transparent text-slate-900 font-black outline-none" required />
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Peso Corporal (kg)</label>
              <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0.0" className="w-full bg-transparent text-slate-900 font-black outline-none" required />
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">% Grasa Estimado</label>
              <input type="number" step="0.1" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} placeholder="0.0" className="w-full bg-transparent text-slate-900 font-black outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
            <div className="space-y-4">
              <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-lg">📏</span> Antropometría
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <MeasurementInput label="Cuello" value={neck} setter={setNeck} field="neck" activeField={activeField} setActiveField={setActiveField} />
                <MeasurementInput label="Pecho" value={chest} setter={setChest} field="chest" activeField={activeField} setActiveField={setActiveField} />
                <MeasurementInput label="Brazo" value={arm} setter={setArm} field="arm" activeField={activeField} setActiveField={setActiveField} />
                <MeasurementInput label="Cintura" value={waist} setter={setWaist} field="waist" activeField={activeField} setActiveField={setActiveField} />
                <MeasurementInput label="Cadera" value={hip} setter={setHip} field="hip" activeField={activeField} setActiveField={setActiveField} />
                <MeasurementInput label="Muslo" value={thigh} setter={setThigh} field="thigh" activeField={activeField} setActiveField={setActiveField} />
              </div>
            </div>
            
            <div className="bg-slate-900 rounded-[40px] p-8 flex flex-col justify-center border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
              </div>
              <h4 className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-4">Guía de Medición</h4>
              {activeField && MEASUREMENT_GUIDE[activeField] ? (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="text-4xl mb-4">{MEASUREMENT_GUIDE[activeField].icon}</div>
                  <h5 className="text-xl font-black text-white mb-2">{MEASUREMENT_GUIDE[activeField].title}</h5>
                  <p className="text-slate-400 font-medium leading-relaxed">
                    {MEASUREMENT_GUIDE[activeField].description}
                  </p>
                </div>
              ) : (
                <div className="text-slate-500 font-medium">
                  Pasa el cursor sobre un campo de entrada para ver las instrucciones de medición correcta.
                </div>
              )}
              <div className="mt-8 pt-8 border-t border-slate-800">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tip Pro:</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">Usa siempre la misma cinta y mide a la misma hora para mayor precisión.</p>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[25px] font-black shadow-xl hover:bg-emerald-600 transition-all uppercase tracking-[0.2em] text-sm">
            Guardar Medición Completa
          </button>
        </form>
      </section>

      {activeSubTab === 'composition' && sortedHistory.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6">Peso Corporal (kg)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sortedHistory}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => new Date(val + 'T12:00:00').toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" name="Peso" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
          
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6">% Grasa Corporal</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sortedHistory.filter(m => m.bodyFat !== undefined)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => new Date(val + 'T12:00:00').toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="bodyFat" name="Grasa" stroke="#f59e0b" strokeWidth={4} dot={{ r: 4, fill: '#f59e0b' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      )}

      {activeSubTab === 'body' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900">Historial de Mediciones</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Fecha</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Peso</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Cintura</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Grasa</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
                  {[...sortedHistory].reverse().map(m => (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-5 text-sm">{new Date(m.date + 'T12:00:00').toLocaleDateString()}</td>
                      <td className="px-6 py-5 text-emerald-600">{m.weight} kg</td>
                      <td className="px-6 py-5">{m.waist ? `${m.waist} cm` : '-'}</td>
                      <td className="px-6 py-5 text-amber-500">{m.bodyFat ? `${m.bodyFat}%` : '-'}</td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => setSelectedHistoryItem(m)}
                          className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-lg text-xs font-black hover:bg-slate-900 hover:text-white transition-all uppercase tracking-wider"
                        >
                          Detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {selectedHistoryItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{new Date(selectedHistoryItem.date + 'T12:00:00').toLocaleDateString()}</h3>
                <p className="text-slate-500 font-bold">Resumen de métricas corporales</p>
              </div>
              <button onClick={() => setSelectedHistoryItem(null)} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-8 grid grid-cols-2 gap-6">
              <div className="col-span-2 flex gap-4">
                <div className="flex-1 bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                  <span className="text-[10px] font-black text-emerald-600 uppercase block mb-1">Peso</span>
                  <p className="text-3xl font-black text-emerald-900">{selectedHistoryItem.weight} <span className="text-sm">kg</span></p>
                </div>
                <div className="flex-1 bg-amber-50 p-6 rounded-3xl border border-amber-100">
                  <span className="text-[10px] font-black text-amber-600 uppercase block mb-1">Grasa</span>
                  <p className="text-3xl font-black text-amber-900">{selectedHistoryItem.bodyFat || '-'}%</p>
                </div>
              </div>

              {[
                { label: 'Cuello', val: selectedHistoryItem.neck, icon: '🧣' },
                { label: 'Pecho', val: selectedHistoryItem.chest, icon: '👕' },
                { label: 'Brazo', val: selectedHistoryItem.arm, icon: '💪' },
                { label: 'Cintura', val: selectedHistoryItem.waist, icon: '📏' },
                { label: 'Cadera', val: selectedHistoryItem.hip, icon: '👖' },
                { label: 'Muslo', val: selectedHistoryItem.thigh, icon: '🦵' },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase">{item.label}</p>
                    <p className="text-lg font-black text-slate-900">{item.val ? `${item.val} cm` : '-'}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 border-t border-slate-100 flex gap-4">
              <button 
                onClick={() => setSelectedHistoryItem(null)}
                className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl transition-all"
              >
                Cerrar
              </button>
              <button 
                onClick={() => {
                  if(confirm('¿Eliminar este registro?')) {
                    onDelete(selectedHistoryItem.id);
                    setSelectedHistoryItem(null);
                  }
                }}
                className="px-6 py-4 text-rose-500 font-black hover:bg-rose-50 rounded-2xl transition-all border border-rose-100"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeasurementsView;
