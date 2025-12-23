
import React, { useState } from 'react';
import { Activity } from '../types';

interface ActivityLoggerProps {
  onAddActivity: (activity: Activity) => void;
  activities: Activity[];
  steps: number;
  isTracking: boolean;
}

const ActivityLogger: React.FC<ActivityLoggerProps> = ({ onAddActivity, activities, steps, isTracking }) => {
  const [type, setType] = useState<Activity['type']>('gym');
  const [duration, setDuration] = useState(45);

  const handleAdd = () => {
    const caloriesBurned = type === 'gym' ? duration * 7 : type === 'running' ? duration * 10 : duration * 4;
    onAddActivity({
      id: Date.now().toString(),
      type,
      duration,
      caloriesBurned,
      timestamp: Date.now()
    });
  };

  return (
    <div className="space-y-6">
      <div className="glass p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Активность</h2>
        
        <div className="flex items-center justify-between mb-8 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase">Шаги за сегодня</p>
            <p className="text-3xl font-black text-emerald-800">{steps.toLocaleString()}</p>
          </div>
          <div className="text-right">
             <div className={`w-3 h-3 rounded-full inline-block mr-2 ${isTracking ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
             <span className="text-[10px] font-bold text-slate-400 uppercase">{isTracking ? 'Авто-трекинг' : 'Ожидание'}</span>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-bold text-slate-700">Добавить тренировку</p>
          <div className="grid grid-cols-2 gap-3">
             {(['gym', 'running', 'walking', 'other'] as const).map(t => (
               <button 
                 key={t}
                 onClick={() => setType(t)}
                 className={`p-3 rounded-xl text-xs font-bold border transition-all ${type === t ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-500'}`}
               >
                 {t === 'gym' ? 'Зал' : t === 'running' ? 'Бег' : t === 'walking' ? 'Ходьба' : 'Другое'}
               </button>
             ))}
          </div>
          <div className="flex items-center gap-4">
            <input 
              type="range" min="5" max="180" step="5"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="flex-1 accent-emerald-600"
            />
            <span className="font-bold text-slate-700 w-16">{duration} мин</span>
          </div>
          <button 
            onClick={handleAdd}
            className="w-full bg-slate-800 text-white font-bold py-3 rounded-2xl hover:bg-slate-900 transition-all active:scale-95"
          >
            Сохранить активность
          </button>
        </div>
      </div>

      {activities.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Лог тренировок</h3>
          {activities.map(act => (
            <div key={act.id} className="glass p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
               <div>
                  <p className="font-bold text-slate-800 capitalize">
                    {act.type === 'gym' ? 'Спортзал' : act.type === 'running' ? 'Бег' : act.type === 'walking' ? 'Прогулка' : 'Активность'}
                  </p>
                  <p className="text-xs text-slate-400">{act.duration} мин • {new Date(act.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
               </div>
               <p className="text-emerald-600 font-bold">-{act.caloriesBurned} ккал</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityLogger;
