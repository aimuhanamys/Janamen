
import React from 'react';
import { DailyData, RecoveryStats } from '../types';
import { ICONS } from '../constants';

interface DashboardProps {
  data: DailyData | undefined;
  recovery: RecoveryStats;
  target: number;
  stepTarget: number;
  onUpdate: (data: Partial<DailyData>) => void;
  isStepTracking: boolean;
  liveSteps: number;
}

const Dashboard: React.FC<DashboardProps> = ({ data, recovery, target, stepTarget, onUpdate, isStepTracking, liveSteps }) => {
  const calories = data?.calories || 0;
  const water = data?.water || 0;
  const vitamins = data?.vitamins || false;
  const sleepStart = data?.sleepStart || "23:00";
  const sleepEnd = data?.sleepEnd || "07:00";

  const totals = data?.meals.reduce((acc, m) => ({
    p: acc.p + m.proteins,
    f: acc.f + m.fats,
    c: acc.c + m.carbs,
    fib: acc.fib + m.fiber
  }), { p: 0, f: 0, c: 0, fib: 0 }) || { p: 0, f: 0, c: 0, fib: 0 };

  const calProgress = Math.min((calories / target) * 100, 100);
  const stepProgress = Math.min((liveSteps / stepTarget) * 100, 100);

  // Функция для расчета длительности сна (логика обновления данных)
  const handleSleepTimeChange = (type: 'start' | 'end', value: string) => {
    const newStart = type === 'start' ? value : sleepStart;
    const newEnd = type === 'end' ? value : sleepEnd;

    // Парсим часы и минуты
    const [h1, m1] = newStart.split(':').map(Number);
    const [h2, m2] = newEnd.split(':').map(Number);

    // Переводим в минуты от начала дня
    const startMins = h1 * 60 + m1;
    const endMins = h2 * 60 + m2;

    // Считаем разницу
    let diffMins = endMins - startMins;
    
    // Если разница отрицательная (переход через полночь), добавляем 24 часа (1440 минут)
    if (diffMins < 0) {
      diffMins += 1440;
    }

    // Округляем до десятых для сохранения в статистику
    const hours = Number((diffMins / 60).toFixed(1));

    onUpdate({
      sleepStart: newStart,
      sleepEnd: newEnd,
      sleepHours: hours
    });
  };

  // Функция для точного отображения длительности в UI
  const getSleepDurationDisplay = () => {
    const [h1, m1] = sleepStart.split(':').map(Number);
    const [h2, m2] = sleepEnd.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff < 0) diff += 1440;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${h}ч ${m.toString().padStart(2, '0')}м`;
  };

  return (
    <div className="space-y-6">
      {/* Recovery Score Hero */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl">🧬</div>
        <div className="relative z-10 text-center">
          <h2 className="text-emerald-400 text-xs font-black uppercase tracking-[0.4em] mb-2">Core Recovery Score</h2>
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-8xl font-black tracking-tighter">{Math.round(recovery.score)}</span>
            <span className="text-2xl font-black text-emerald-500">%</span>
          </div>

          {recovery.breakdown.lateDinnerPenalty && (
            <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-400 text-[10px] font-black py-2 px-5 rounded-full border border-rose-500/30 mb-8 animate-pulse">
              ⚠️ ШТРАФ: ПОЗДНИЙ УЖИН (-7%)
            </div>
          )}

          <div className="grid grid-cols-5 gap-3 max-w-sm mx-auto">
            <StatMini active={recovery.breakdown.sleep >= 30} val={Math.round(recovery.breakdown.sleep)} label="Сон" />
            <StatMini active={recovery.breakdown.calories === 20} val={Math.round(recovery.breakdown.calories)} label="Кал" />
            <StatMini active={recovery.breakdown.water === 15} val={Math.round(recovery.breakdown.water)} label="Вода" />
            <StatMini active={recovery.breakdown.activity >= 10} val={Math.round(recovery.breakdown.activity)} label="Шаги" />
            <StatMini active={recovery.breakdown.vitamins === 10} val={Math.round(recovery.breakdown.vitamins)} label="Вит" />
          </div>
        </div>
      </div>

      {/* Calories & Nutrition Hub */}
      <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="flex justify-between items-end mb-5">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-left">Дневная норма ккал</h3>
            <p className="text-4xl font-black text-slate-900">{calories} <span className="text-sm font-bold opacity-30 tracking-normal">/ {target}</span></p>
          </div>
          <div className="text-right">
             <div className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-xl border border-emerald-100">КЛЕТЧАТКА: {totals.fib.toFixed(1)}г</div>
          </div>
        </div>
        
        <div className="w-full bg-slate-100 h-5 rounded-full overflow-hidden mb-8 shadow-inner">
          <div 
            className={`h-full transition-all duration-1000 rounded-full shadow-lg ${calories > target * 1.05 ? 'bg-rose-500' : 'bg-emerald-500'}`}
            style={{ width: `${calProgress}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <NutrientSmall label="Белки" value={totals.p} color="bg-orange-500" />
          <NutrientSmall label="Жиры" value={totals.f} color="bg-amber-500" />
          <NutrientSmall label="Углеводы" value={totals.c} color="bg-blue-500" />
        </div>
      </div>

      {/* Primary Trackers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Step Tracker - Autonomous */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/30">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">👟 ШАГИ</h3>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isStepTracking ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  {isStepTracking ? 'АВТО-ТРЕКИНГ' : 'ОЖИДАНИЕ'}
                </span>
              </div>
           </div>
           <div className="text-center mb-4">
              <p className="text-4xl font-black text-slate-900 tracking-tighter">{liveSteps.toLocaleString()}</p>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1">ЦЕЛЬ: {stepTarget}</p>
           </div>
           <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden border border-slate-100">
              <div 
                className="h-full bg-orange-400 rounded-full shadow-sm transition-all duration-1000"
                style={{ width: `${stepProgress}%` }}
              />
           </div>
        </div>

        {/* Vitamin Tracker */}
        <div className={`p-6 rounded-[2.5rem] border transition-all duration-500 flex flex-col justify-between ${vitamins ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-white border-slate-100 shadow-lg'}`}>
           <div className="flex justify-between items-start mb-6">
              <div className="text-left">
                <h3 className={`font-black text-sm uppercase ${vitamins ? 'text-white' : 'text-slate-800'}`}>Витамины</h3>
                <p className={`text-[9px] font-bold uppercase tracking-widest ${vitamins ? 'text-white/70' : 'text-slate-400'}`}>Daily Dose</p>
              </div>
              <div className={`text-2xl ${vitamins ? 'scale-125 duration-500' : 'opacity-40'}`}>💊</div>
           </div>
           <button 
             onClick={() => onUpdate({ vitamins: !vitamins })}
             className={`w-full py-3 rounded-2xl font-black text-xs uppercase transition-all ${vitamins ? 'bg-white text-amber-600' : 'bg-slate-800 text-white'}`}
           >
             {vitamins ? 'ВЫПИТО ✅' : 'ОТМЕТИТЬ ПРИЕМ'}
           </button>
        </div>

        {/* Sleep Control */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-lg col-span-1 md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">🌙 ГЛУБОКИЙ СОН</h3>
            <div className="flex gap-2">
               <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full">ЦЕЛЬ: 8Ч</span>
               <span className="text-[9px] font-black bg-indigo-500 text-white px-3 py-1.5 rounded-full">23:00-02:00</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-left">
              <label className="text-[9px] font-black text-slate-400 uppercase block mb-1 ml-2 text-left">Лег спать</label>
              <input 
                type="time" 
                value={sleepStart} 
                onChange={e => handleSleepTimeChange('start', e.target.value)} 
                className="w-full bg-slate-50 rounded-2xl p-3 text-sm font-black border-none focus:ring-2 focus:ring-indigo-200" 
              />
            </div>
            <div className="text-left">
              <label className="text-[9px] font-black text-slate-400 uppercase block mb-1 ml-2 text-left">Проснулся</label>
              <input 
                type="time" 
                value={sleepEnd} 
                onChange={e => handleSleepTimeChange('end', e.target.value)} 
                className="w-full bg-slate-50 rounded-2xl p-3 text-sm font-black border-none focus:ring-2 focus:ring-indigo-200" 
              />
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 bg-slate-50 p-4 rounded-2xl">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ИТОГО СОН:</p>
             <span className="font-black text-indigo-600 text-2xl">{getSleepDurationDisplay()}</span>
          </div>
        </div>

        {/* Water Tracker */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-lg flex items-center justify-between col-span-1 md:col-span-2">
           <div className="flex items-center gap-4 text-left">
             <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner">{ICONS.WATER('w-7 h-7')}</div>
             <div>
               <h3 className="font-black text-slate-800 text-sm">ВОДА</h3>
               <p className="text-xs font-bold text-slate-400">{(water*1000).toFixed(0)} / 2000 мл</p>
             </div>
           </div>
           <div className="flex items-center gap-3">
              <button onClick={() => onUpdate({ water: Math.max(0, water - 0.25) })} className="w-12 h-12 rounded-2xl border border-slate-100 text-slate-300 font-bold hover:bg-slate-50 transition-all">-250</button>
              <button onClick={() => onUpdate({ water: water + 0.25 })} className="w-12 h-12 rounded-2xl bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95">+250</button>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatMini: React.FC<{ active: boolean; val: number; label: string }> = ({ active, val, label }) => (
  <div className="text-center">
    <div className={`text-sm font-black mb-1 transition-colors ${active ? 'text-emerald-400' : 'text-slate-600'}`}>{val}%</div>
    <div className="text-[8px] uppercase font-black text-slate-500 tracking-tighter opacity-60">{label}</div>
  </div>
);

const NutrientSmall: React.FC<{ label: string, value: number, color: string }> = ({ label, value, color }) => (
  <div className="space-y-1.5 text-left">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
      <div className={`w-2 h-2 rounded-full shadow-sm ${color}`}></div>
      <p className="text-xs font-black text-slate-800">{Math.round(value)}г</p>
    </div>
  </div>
);

export default Dashboard;
