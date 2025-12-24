
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, DailyData, Goal, Gender, Meal, Activity } from './types';
import { calculateDailyTarget, getTodayStr, getYesterdayStr, getRecoveryScore } from './utils';
import Dashboard from './components/Dashboard';
import ProfileSettings from './components/ProfileSettings';
import FoodLogger from './components/FoodLogger';
import ActivityLogger from './components/ActivityLogger';
import AIChat from './components/AIChat';
import Challenges from './components/Challenges';
import Prediction from './components/Prediction';
import { useChallenges } from './hooks/useChallenges';
import { useStepCounter } from './hooks/useStepCounter';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import { supabase } from './services/supabase';

const App: React.FC = () => {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('janamen_profile');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [history, setHistory] = useState<Record<string, DailyData>>(() => {
    const saved = localStorage.getItem('janamen_history');
    try {
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'food' | 'activity' | 'chat' | 'challenges' | 'profile'>(() => {
    return (localStorage.getItem('janamen_active_tab') as any) || 'dashboard';
  });

  const [dataLoading, setDataLoading] = useState(false);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    if (profile) localStorage.setItem('janamen_profile', JSON.stringify(profile));
    localStorage.setItem('janamen_history', JSON.stringify(history));
    localStorage.setItem('janamen_active_tab', activeTab);
  }, [profile, history, activeTab]);

  // Fetch data when user is ready
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setDataLoading(true);
        // Fetch Profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile(prev => ({
            ...prev, // Keep any local changes that might not be synced yet
            height: profileData.height,
            weight: profileData.weight,
            age: profileData.age,
            gender: profileData.gender as Gender,
            goal: profileData.goal as Goal,
            stepGoal: profileData.step_goal,
            vitaminReminderTime: profileData.vitamin_reminder_time || undefined
          }));
        }

        // Fetch History
        const { data: historyData } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', user.id);

        if (historyData && historyData.length > 0) {
          setHistory(prev => {
            const merged = { ...prev };
            historyData.forEach((log: any) => {
              // Only overwrite local if server data is present for that date
              merged[log.date] = {
                date: log.date,
                calories: log.calories,
                water: log.water,
                sleepHours: log.sleep_hours,
                sleepStart: log.sleep_start,
                sleepEnd: log.sleep_end,
                vitamins: log.vitamins,
                steps: log.steps,
                activities: log.activities || [],
                meals: log.meals || []
              };
            });
            return merged;
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const challenges = useChallenges(user?.id);

  const todayStr = getTodayStr();
  const todayData = history[todayStr];

  // Автономный трекер шагов с мемоизацией коллбэка
  const handleStepChange = useCallback((newCount: number) => {
    setHistory(prev => {
      const current = prev[todayStr] || {
        date: todayStr, calories: 0, water: 0, sleepHours: 0, sleepStart: "23:00", sleepEnd: "07:00",
        vitamins: false, steps: 0, activities: [], meals: []
      };

      // Проверяем, действительно ли число изменилось
      if (current.steps === newCount) return prev;

      // Auto-track steps challenge
      const increase = newCount - current.steps;
      if (increase > 0 && challenges.activeChallengeId) {
        const challenge = challenges.availableChallenges.find(c => c.id === challenges.activeChallengeId);
        if (challenge?.type === 'step') {
          challenges.logProgress(increase);
        }
      }

      return { ...prev, [todayStr]: { ...current, steps: newCount } };
    });
  }, [todayStr, challenges.activeChallengeId, challenges.availableChallenges, challenges.logProgress]);

  const { steps, isTracking } = useStepCounter(todayData?.steps || 0, handleStepChange);


  // Sync Profile Changes
  const handleProfileUpdate = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    if (user) {
      await supabase.from('profiles').upsert({
        id: user.id,
        height: newProfile.height,
        weight: newProfile.weight,
        age: newProfile.age,
        gender: newProfile.gender,
        goal: newProfile.goal,
        step_goal: newProfile.stepGoal,
        // vitamin_reminder_time: newProfile.vitaminReminderTime // Add to schema if needed
      });
    }
  };

  const updateDaily = useCallback(async (data: Partial<DailyData>) => {
    setHistory(prev => {
      const current = prev[todayStr] || {
        date: todayStr, calories: 0, water: 0, sleepHours: 0, sleepStart: "23:00", sleepEnd: "07:00",
        vitamins: false, steps: 0, activities: [], meals: []
      };

      const updated = { ...current, ...data };

      // Optimistic Update
      const newHistory = { ...prev, [todayStr]: updated };

      // Async Sync
      if (user) {
        supabase.from('daily_logs').upsert({
          user_id: user.id,
          date: todayStr,
          calories: updated.calories,
          water: updated.water,
          sleep_hours: updated.sleepHours,
          sleep_start: updated.sleepStart,
          sleep_end: updated.sleepEnd,
          vitamins: updated.vitamins,
          steps: updated.steps,
          activities: updated.activities,
          meals: updated.meals
        }).then(({ error }) => {
          if (error) console.error("Failed to sync daily log", error);
        });
      }

      // Auto-track Water
      if (typeof data.water === 'number' && challenges.activeChallengeId) {
        const diff = data.water - current.water;
        if (diff > 0) {
          const challenge = challenges.availableChallenges.find(c => c.id === challenges.activeChallengeId);
          if (challenge?.type === 'water') {
            challenges.logProgress(diff);
          }
        }
      }

      return newHistory;
    });
  }, [todayStr, user, challenges]);

  const deleteMeal = (mealId: string) => {
    const current = history[todayStr] || { date: todayStr, calories: 0, water: 0, sleepHours: 0, sleepStart: "23:00", sleepEnd: "07:00", vitamins: false, steps: 0, activities: [], meals: [] };
    const updatedMeals = (current.meals || []).filter(m => m.id !== mealId);

    updateDaily({
      meals: updatedMeals,
      calories: updatedMeals.reduce((acc, m) => acc + m.calories, 0)
    });
  };

  const addMeal = (meal: Meal) => {
    const current = history[todayStr] || { date: todayStr, calories: 0, water: 0, sleepHours: 0, sleepStart: "23:00", sleepEnd: "07:00", vitamins: false, steps: 0, activities: [], meals: [] };
    const updatedMeals = [...(current.meals || []), meal];

    // Auto-track calories challenge
    if (challenges.activeChallengeId) {
      const challenge = challenges.availableChallenges.find(c => c.id === challenges.activeChallengeId);
      if (challenge?.type === 'calories') {
        challenges.logProgress(meal.calories);
      }
    }

    updateDaily({
      meals: updatedMeals,
      calories: updatedMeals.reduce((acc, m) => acc + m.calories, 0)
    });
  };

  const streak = Object.keys(history).length;

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-400 rounded-full mb-4"></div>
          <div className="text-emerald-800 font-bold">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-emerald-50 font-sans">
      <div className="max-w-md w-full glass p-8 rounded-[2.5rem] shadow-2xl border border-white">
        <div className="text-center mb-8">
          <OnboardingLogo />
          <h1 className="text-4xl font-black text-emerald-900 tracking-tighter">Janamen Health</h1>
          <p className="text-sm text-emerald-600 font-bold uppercase tracking-widest mt-2">Ядро твоего здоровья</p>
        </div>
        <ProfileSettings onSave={handleProfileUpdate} initialData={null} />
      </div>
    </div>
  );

  const recovery = getRecoveryScore(history[getYesterdayStr()], profile);

  return (
    <div className="min-h-screen pb-28 flex flex-col max-w-2xl mx-auto bg-[#F8FAFC]">
      <header className="p-6 flex justify-between items-center sticky top-0 glass z-40 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">Janamen</h1>
          <p className="text-[10px] text-emerald-600 uppercase tracking-[0.2em] font-black">AI Life Support</p>
        </div>
        <div className="flex gap-2">
          {streak >= 3 ? (
            <div className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg shadow-orange-500/20 flex items-center gap-2">
              <span className="animate-pulse">🔥</span> {streak} ДНЯ
            </div>
          ) : (
            <div className="bg-slate-100 text-slate-400 px-4 py-1.5 rounded-full text-xs font-black">🌱 START</div>
          )}
        </div>
      </header>

      <main className="flex-1 p-5 space-y-8 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <>
            <Dashboard
              data={todayData}
              recovery={recovery}
              target={calculateDailyTarget(profile)}
              stepTarget={profile.stepGoal}
              onUpdate={updateDaily}
              isStepTracking={isTracking}
              liveSteps={steps}
            />
            {streak >= 3 && <Prediction history={history} />}
          </>
        )}
        {activeTab === 'food' && <FoodLogger onAddMeal={addMeal} onDeleteMeal={deleteMeal} history={todayData?.meals || []} />}
        {activeTab === 'activity' && <ActivityLogger onAddActivity={(a) => updateDaily({ activities: [...(todayData?.activities || []), a] })} activities={todayData?.activities || []} steps={steps} isTracking={isTracking} />}
        {activeTab === 'chat' && <AIChat context={{ profile, todayData }} />}
        {activeTab === 'challenges' && <Challenges hookData={challenges} />}
        {activeTab === 'profile' && <ProfileSettings onSave={handleProfileUpdate} initialData={profile} />}
      </main>

      <nav className="fixed bottom-6 left-4 right-4 glass border border-white/40 rounded-[2.5rem] px-4 py-4 flex justify-around items-center max-w-2xl mx-auto z-50 shadow-2xl">
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon="📊" label="Главная" />
        <NavButton active={activeTab === 'food'} onClick={() => setActiveTab('food')} icon="🥗" label="ЕДА" />
        <NavButton active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} icon="⚡" label="Актив" />
        <NavButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon="💬" label="AI Чат" />
        <NavButton active={activeTab === 'challenges'} onClick={() => setActiveTab('challenges')} icon="🏆" label="Кубки" />
        <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon="👤" label="Профиль" />
      </nav>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center min-w-[50px] space-y-1 transition-all duration-300 ${active ? 'text-emerald-600 scale-110' : 'text-slate-400'}`}>
    <span className="text-2xl">{icon}</span>
    <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);

const OnboardingLogo = () => (
  <svg viewBox="0 0 100 100" className="w-24 h-24 mx-auto mb-6 drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34D399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    {/* Hexagon Background (Core) */}
    <path d="M50 10L85 30V70L50 90L15 70V30L50 10Z" fill="url(#logoGradient)" stroke="white" strokeWidth="2" strokeLinejoin="round" />

    {/* Pulse Line (Life/Health) */}
    <path d="M28 50H38L45 35L55 65L62 50H72" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default App;
