
import React, { useState, useRef } from 'react';
import { Meal } from '../types';
import { analyzeFood } from '../services/gemini';
import { formatTime } from '../utils';

interface FoodLoggerProps {
  onAddMeal: (meal: Meal) => void;
  onDeleteMeal: (mealId: string) => void;
  history: Meal[];
}

const FoodLogger: React.FC<FoodLoggerProps> = ({ onAddMeal, onDeleteMeal, history }) => {
  const [loading, setLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processAnalysis = async (input: string | { data: string; mimeType: string }) => {
    setLoading(true);
    try {
      const result = await analyzeFood(input);
      const newMeal: Meal = {
        id: Date.now().toString(),
        name: result.name,
        weight: result.weight,
        calories: result.calories,
        proteins: result.proteins,
        fats: result.fats,
        carbs: result.carbs,
        fiber: result.fiber,
        timestamp: Date.now(),
      };
      onAddMeal(newMeal);
      setTextInput('');
    } catch (error) {
      console.error("Food analysis failed", error);
      alert("Не удалось проанализировать блюдо. Попробуйте еще раз.");
    } finally {
      setLoading(false);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) processAnalysis(textInput);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        processAnalysis({ data: base64, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const dailyTotals = history.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    proteins: acc.proteins + meal.proteins,
    fats: acc.fats + meal.fats,
    carbs: acc.carbs + meal.carbs,
    fiber: acc.fiber + meal.fiber,
  }), { calories: 0, proteins: 0, fats: 0, carbs: 0, fiber: 0 });

  return (
    <div className="space-y-6">
      <div className="bg-white p-7 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
        <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tighter text-left">ЕДА</h2>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
          >
            📷 ФОТО БЛЮДА
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        <form onSubmit={handleTextSubmit} className="space-y-4">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Что вы съели? Опишите словами..."
            className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] p-5 text-sm font-medium focus:ring-4 focus:ring-emerald-500/5 focus:outline-none transition-all resize-none h-28"
          />
          <button
            disabled={loading || !textInput.trim()}
            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl disabled:opacity-50 transition-all hover:bg-black uppercase tracking-widest text-xs"
          >
            {loading ? 'АНАЛИЗИРУЮ...' : 'ДОБАВИТЬ ПРИЕМ ПИЩИ'}
          </button>
        </form>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center p-12 space-y-5">
          <div className="w-14 h-14 border-[6px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">ИИ рассчитывает нутриенты...</p>
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-5">
          <div className="flex justify-between items-center px-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Лог за сегодня</h3>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">Итого: {dailyTotals.calories} ккал</span>
          </div>

          <div className="space-y-4">
            {history.slice().reverse().map(meal => (
              <div key={meal.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/30 relative overflow-hidden group transition-all hover:shadow-xl">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="text-left">
                    <h4 className="font-black text-slate-900 text-lg leading-tight group-hover:text-emerald-700 transition-colors">{meal.name}</h4>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{formatTime(meal.timestamp)} • {meal.weight}г</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="text-right flex flex-col items-end">
                      <p className="font-black text-slate-900 text-2xl tracking-tighter">{meal.calories} <span className="text-[10px] text-slate-400 uppercase font-normal">ккал</span></p>
                      <button
                        onClick={() => onDeleteMeal(meal.id)}
                        className="mt-2 text-slate-300 hover:text-red-500 transition-colors p-1"
                        title="Удалить"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 border-t border-slate-50 pt-4">
                  <NutrientBox label="Белки" value={meal.proteins} unit="г" color="text-orange-600" />
                  <NutrientBox label="Жиры" value={meal.fats} unit="г" color="text-amber-600" />
                  <NutrientBox label="Углев" value={meal.carbs} unit="г" color="text-blue-600" />
                  <NutrientBox label="Клетч" value={meal.fiber} unit="г" color="text-emerald-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const NutrientBox: React.FC<{ label: string, value: number, unit: string, color: string }> = ({ label, value, unit, color }) => (
  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col items-center">
    <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter mb-1">{label}</span>
    <span className={`text-xs font-black ${color}`}>{value}{unit}</span>
  </div>
);

export default FoodLogger;
