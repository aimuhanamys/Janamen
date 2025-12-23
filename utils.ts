
import { UserProfile, Goal, Gender, DailyData, RecoveryStats, Meal } from './types';

export function calculateBMR(profile: UserProfile): number {
  const { weight, height, age, gender } = profile;
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  bmr = gender === Gender.MALE ? bmr + 5 : bmr - 161;
  return Math.round(bmr);
}

export function calculateDailyTarget(profile: UserProfile): number {
  const bmr = calculateBMR(profile);
  const tdee = bmr * 1.2; 
  switch (profile.goal) {
    case Goal.LOSS: return Math.round(tdee - 500);
    case Goal.GAIN: return Math.round(tdee + 500);
    default: return Math.round(tdee);
  }
}

export function getRecoveryScore(data: DailyData | undefined, profile: UserProfile): RecoveryStats {
  const targetCals = calculateDailyTarget(profile);
  const stepGoal = profile.stepGoal || 10000;
  
  const stats: RecoveryStats = {
    score: 0,
    breakdown: { sleep: 0, calories: 0, water: 0, activity: 0, vitamins: 0, lateDinnerPenalty: false }
  };

  if (!data) return stats;

  // 1. СОН (40%)
  const startHour = parseInt(data.sleepStart?.split(':')[0] || '0');
  const startMin = parseInt(data.sleepStart?.split(':')[1] || '0');
  const endHour = parseInt(data.sleepEnd?.split(':')[0] || '0');
  
  // Интервал 23:00 - 02:00 (Считаем что лег до 23:00 и спал минимум до 02:00)
  const isEarlyStart = startHour < 23 || (startHour === 23 && startMin === 0);
  const isLateEnd = endHour >= 2 && endHour < 12; // Проверка что это утро следующего дня
  const inInterval = isEarlyStart && isLateEnd;

  if (data.sleepHours >= 8 && inInterval) {
    stats.breakdown.sleep = 40;
  } else if (data.sleepHours < 6 || !inInterval) {
    stats.breakdown.sleep = 10;
  } else {
    // Пропорционально между 10 и 40
    const hourBonus = Math.min(20, (data.sleepHours - 6) * 10);
    const intervalBonus = inInterval ? 20 : 0;
    stats.breakdown.sleep = 10 + hourBonus + intervalBonus;
  }

  // 2. КАЛОРИИ (20%)
  const calRatio = data.calories / targetCals;
  if (calRatio >= 0.95 && calRatio <= 1.05) stats.breakdown.calories = 20;
  else if (Math.abs(1 - calRatio) > 0.3) stats.breakdown.calories = 0;
  else stats.breakdown.calories = 10;

  // 3. ВОДА (15%)
  if (data.water >= 1.5) stats.breakdown.water = 15;
  else if (data.water < 0.5) stats.breakdown.water = 0;
  else stats.breakdown.water = 7;

  // 4. АКТИВНОСТЬ (15%)
  if (data.steps >= stepGoal) stats.breakdown.activity = 15;
  else if (data.steps < 2000) stats.breakdown.activity = 0;
  else stats.breakdown.activity = Math.round((data.steps / stepGoal) * 15);

  // 5. ВИТАМИНЫ (10%)
  if (data.vitamins) stats.breakdown.vitamins = 10;

  // ШТРАФ (Поздний ужин > 21:30)
  const lateDinner = data.meals.some(m => {
    const d = new Date(m.timestamp);
    const hour = d.getHours();
    const min = d.getMinutes();
    return (hour === 21 && min > 30) || hour >= 22;
  });

  stats.breakdown.lateDinnerPenalty = lateDinner;
  
  const totalRaw = stats.breakdown.sleep + stats.breakdown.calories + stats.breakdown.water + stats.breakdown.activity + stats.breakdown.vitamins;
  stats.score = Math.max(0, lateDinner ? totalRaw - 7 : totalRaw);

  return stats;
}

export function getTodayStr() { return new Date().toISOString().split('T')[0]; }
export function getYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}
export function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
