
import React, { useState } from 'react';
import { UserProfile, Goal, Gender } from '../types';

interface ProfileSettingsProps {
  onSave: (profile: UserProfile) => void;
  initialData: UserProfile | null;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onSave, initialData }) => {
  const [formData, setFormData] = useState<UserProfile>(initialData || {
    height: 170,
    weight: 70,
    age: 25,
    gender: Gender.MALE,
    goal: Goal.MAINTENANCE,
    stepGoal: 10000
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleNumberChange = (field: keyof UserProfile, value: string) => {
    // Remove leading zeros and parse
    const sanitized = value.replace(/^0+(?=\d)/, '');
    setFormData({ ...formData, [field]: sanitized === '' ? 0 : Number(sanitized) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Вес (кг)</label>
          <input
            type="text"
            inputMode="numeric"
            value={formData.weight === 0 ? '' : formData.weight}
            onChange={e => handleNumberChange('weight', e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500"
            placeholder="0"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Рост (см)</label>
          <input
            type="text"
            inputMode="numeric"
            value={formData.height === 0 ? '' : formData.height}
            onChange={e => handleNumberChange('height', e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500"
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Возраст</label>
          <input
            type="text"
            inputMode="numeric"
            value={formData.age === 0 ? '' : formData.age}
            onChange={e => handleNumberChange('age', e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500"
            placeholder="0"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Цель шагов</label>
          <input
            type="text"
            inputMode="numeric"
            value={formData.stepGoal === 0 ? '' : formData.stepGoal}
            onChange={e => handleNumberChange('stepGoal', e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500"
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Пол</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, gender: Gender.MALE })}
            className={`p-3 rounded-xl text-[10px] font-bold transition-all border ${formData.gender === Gender.MALE ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
          >
            МУЖСКОЙ
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, gender: Gender.FEMALE })}
            className={`p-3 rounded-xl text-[10px] font-bold transition-all border ${formData.gender === Gender.FEMALE ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
          >
            ЖЕНСКИЙ
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Ваша цель</label>
        <div className="grid grid-cols-3 gap-2">
          {Object.values(Goal).map(g => (
            <button key={g} type="button" onClick={() => setFormData({ ...formData, goal: g })} className={`p-3 rounded-xl text-[10px] font-bold transition-all border ${formData.goal === g ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
              {g}
            </button>
          ))}
        </div>
      </div>

      <button className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg mt-4 uppercase tracking-widest text-xs hover:bg-emerald-700 transition-colors">
        {initialData ? 'Сохранить профиль' : 'Начать путь к здоровью'}
      </button>
    </form>
  );
};

export default ProfileSettings;
