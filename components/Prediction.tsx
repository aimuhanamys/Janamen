
import React, { useState } from 'react';
import { getAIPrediction } from '../services/gemini';

const Prediction: React.FC<{ history: any }> = ({ history }) => {
  const [prediction, setPrediction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPrediction = async () => {
    setLoading(true);
    try {
      // Передаем только последние 3 дня истории для анализа
      const keys = Object.keys(history).sort().slice(-3);
      const last3Days = keys.reduce((acc: any, key) => {
        acc[key] = history[key];
        return acc;
      }, {});
      
      const res = await getAIPrediction(last3Days);
      setPrediction(res.prediction_text);
    } catch (e) {
      setPrediction("Твои усилия сегодня формируют твое завтра. Продолжай в том же духе!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden border border-white/5">
      <div className="absolute top-[-40px] right-[-40px] text-9xl opacity-10 rotate-12">🧿</div>
      <div className="relative z-10">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400 mb-4">AI Fortune Teller</h3>
        
        {prediction ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-xl font-medium leading-relaxed text-slate-100 italic">"{prediction}"</p>
            <button 
              onClick={() => setPrediction(null)}
              className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              Сгенерировать новое →
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-slate-400 font-medium">Я проанализировал твои показатели за 3 дня. Хочешь узнать, к чему приведет твой текущий ритм через неделю?</p>
            <button 
              onClick={fetchPrediction} 
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 active:scale-95"
            >
              {loading ? "Визуализирую будущее..." : "Узнать прогноз"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prediction;
