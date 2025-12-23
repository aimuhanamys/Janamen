
import React from 'react';
import { Challenge } from '../types';

import { ChallengeType } from '../types';

const Challenges: React.FC<{ hookData: any }> = ({ hookData }) => {
  const {
    availableChallenges,
    activeChallengeId,
    joinChallenge,
    leaveChallenge,
    generateInviteLink,
    createChallenge,
    deleteChallenge,
    logProgress,
    participants,
    loading,
    setUsername,
    justCompletedChallenge,
    dismissCelebration,
    completedChallenges
  } = hookData;

  const [inviteLink, setInviteLink] = React.useState<string | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [showUsernamePrompt, setShowUsernamePrompt] = React.useState(false);
  const [tempUsername, setTempUsername] = React.useState('');
  const [newChallenge, setNewChallenge] = React.useState({
    title: '',
    description: '',
    type: 'step' as ChallengeType,
    goalValue: 10000,
    unit: 'шагов',
    durationDays: 7,
    color: 'bg-emerald-500',
    icon: '👣'
  });

  const [manualProgress, setManualProgress] = React.useState<string>('');

  const activeChallenge = availableChallenges.find(c => c.id === activeChallengeId);

  // Check if username needs to be set
  React.useEffect(() => {
    if (!hookData.profile?.username) {
      setShowUsernamePrompt(true);
    }
  }, [hookData.profile?.username]);

  const handleUsernameSubmit = () => {
    if (tempUsername.trim()) {
      setUsername(tempUsername.trim());
      setShowUsernamePrompt(false);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createChallenge(newChallenge);
    setIsCreating(false);
  };

  const handleInvite = () => {
    const link = generateInviteLink();
    setInviteLink(link);
  };

  const handleManualLog = () => {
    const val = Number(manualProgress);
    if (!isNaN(val) && val > 0) {
      logProgress(val);
      setManualProgress('');
    }
  };

  // Check if a challenge is already completed
  const isChallengeCompleted = (challengeId: string) => {
    return completedChallenges?.includes(challengeId);
  };

  return (
    <div className="space-y-6">
      {/* Username Prompt Modal */}
      {showUsernamePrompt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-[2.5rem] w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-slate-900 text-center">Как тебя зовут?</h3>
            <p className="text-sm text-slate-500 text-center">Это имя будет видно другим участникам челленджей</p>
            <input
              value={tempUsername}
              onChange={e => setTempUsername(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500"
              placeholder="Введи своё имя"
              autoFocus
            />
            <button
              onClick={handleUsernameSubmit}
              disabled={!tempUsername.trim()}
              className="w-full bg-emerald-500 text-white py-3 rounded-xl text-xs font-black uppercase shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              Продолжить
            </button>
          </div>
        </div>
      )}

      {/* 🎉 Challenge Completion Celebration Modal */}
      {justCompletedChallenge && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 rounded-[3rem] w-full max-w-sm shadow-2xl text-center relative overflow-hidden">
            {/* Confetti effect */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 left-4 text-4xl animate-bounce">🎊</div>
              <div className="absolute top-8 right-8 text-3xl animate-bounce delay-100">✨</div>
              <div className="absolute bottom-12 left-8 text-3xl animate-bounce delay-200">🌟</div>
              <div className="absolute bottom-8 right-4 text-4xl animate-bounce delay-75">🎉</div>
            </div>

            <div className="relative z-10">
              <div className="text-8xl mb-4 animate-bounce">🏆</div>
              <h2 className="text-3xl font-black text-white mb-2">ПОЗДРАВЛЯЕМ!</h2>
              <p className="text-emerald-100 text-sm mb-4">Ты завершил челлендж</p>

              <div className="bg-white/20 backdrop-blur rounded-2xl p-4 mb-6">
                <div className="text-4xl mb-2">{justCompletedChallenge.icon}</div>
                <h3 className="text-xl font-black text-white">{justCompletedChallenge.title}</h3>
                <p className="text-emerald-100 text-xs mt-1">{justCompletedChallenge.goalValue} {justCompletedChallenge.unit}</p>
              </div>

              <div className="bg-yellow-400 text-yellow-900 rounded-2xl p-4 mb-6">
                <p className="text-xs font-black uppercase tracking-widest mb-1">Получен трофей!</p>
                <p className="text-2xl font-black">Всего трофеев: {hookData.profile?.trophies || 0} 🥇</p>
              </div>

              <button
                onClick={dismissCelebration}
                className="w-full bg-white text-emerald-700 py-4 rounded-2xl font-black text-sm uppercase shadow-lg hover:bg-emerald-50 transition-all active:scale-95"
              >
                Продолжить 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center px-4">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Челленджи</h2>
        <button onClick={() => setIsCreating(true)} className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 uppercase transition-transform hover:scale-105">+ СОЗДАТЬ</button>
      </div>

      {hookData.error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl mx-4">
          <h3 className="text-red-800 font-bold text-xs uppercase mb-1">Ошибка загрузки</h3>
          <p className="text-red-600 text-xs">{hookData.error}</p>
          {hookData.error.includes("relation") && (
            <p className="text-red-800 font-black text-[10px] mt-2 uppercase">
              Внимание: Таблицы базы данных не найдены. Пожалуйста, запустите SQL скрипт в Supabase Dashboard.
            </p>
          )}
        </div>
      )
      }

      {/* User Stats Section */}
      < div className="mx-4 bg-white rounded-[2.5rem] p-6 shadow-lg border border-slate-100 flex items-center justify-between" >
        <div className="flex-1 text-center border-r border-slate-100">
          <div className="text-3xl mb-1">🥇</div>
          <div className="text-[10px] uppercase font-black text-slate-300 tracking-widest mb-1">ТРОФЕИ</div>
          <div className="text-2xl font-black text-slate-900">{hookData.profile?.trophies || 0}</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-3xl mb-1">🔥</div>
          <div className="text-[10px] uppercase font-black text-slate-300 tracking-widest mb-1">СТРИК</div>
          <div className="text-2xl font-black text-slate-900">{hookData.profile?.streak || 0} Дней</div>
        </div>
      </div >

      {isCreating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-6 rounded-[2.5rem] w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-slate-900 text-center">Новый вызов</h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">Название</label>
                <input
                  required
                  value={newChallenge.title}
                  onChange={e => setNewChallenge({ ...newChallenge, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500"
                  placeholder="Например: Неделя бега"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Цель</label>
                  <input
                    type="number"
                    required
                    value={newChallenge.goalValue}
                    onChange={e => setNewChallenge({ ...newChallenge, goalValue: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="w-1/3">
                  <label className="text-[10px] font-black uppercase text-slate-400">Ед. изм.</label>
                  <select
                    value={newChallenge.unit}
                    onChange={e => setNewChallenge({ ...newChallenge, unit: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-3 text-xs font-bold focus:outline-none focus:border-emerald-500 appearance-none"
                  >
                    <option value="шаг">шаг</option>
                    <option value="калорий">калорий</option>
                    <option value="тренировка">тренировка</option>
                    <option value="час">час</option>
                    <option value="минут">минут</option>
                    <option value="литр">литр</option>
                    <option value="день">день</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">Длительность (дней)</label>
                <input
                  type="number"
                  required
                  value={newChallenge.durationDays}
                  onChange={e => setNewChallenge({ ...newChallenge, durationDays: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsCreating(false)} className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-xl text-xs font-black uppercase">Отмена</button>
                <button type="submit" className="flex-1 bg-emerald-500 text-white py-3 rounded-xl text-xs font-black uppercase shadow-lg shadow-emerald-500/20">Создать</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {availableChallenges.map(c => {
          const isActive = activeChallengeId === c.id;
          return (
            <div
              key={c.id}
              className={`bg-white p-6 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden ${isActive ? 'border-emerald-500 ring-[6px] ring-emerald-500/5 shadow-xl' : 'border-slate-100 hover:border-slate-200 shadow-lg'}`}
            >
              {isActive && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8"></div>
              )}

              <div className="flex items-center gap-5 mb-5 relative z-10">
                <div className={`text-3xl ${c.color} bg-opacity-10 w-20 h-20 flex items-center justify-center rounded-[1.5rem] shadow-inner border border-slate-100`}>
                  {c.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-slate-900 text-lg leading-tight">{c.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{c.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">{c.goalValue} {c.unit}</span>
                    <span className="text-[10px] text-slate-300 font-black uppercase">• {c.durationDays} дней</span>
                  </div>
                </div>
              </div>

              {isActive ? (
                <div className="pt-5 border-t border-slate-50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="bg-slate-900 p-5 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10 text-4xl">🔥</div>
                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-emerald-400">ЛИДЕРБОРД ДРУЗЕЙ</h5>

                    <div className="space-y-3">
                      {participants.sort((a, b) => b.progress - a.progress).map((p, idx) => {
                        const isMe = p.userId === 'local-user';
                        const displayName = isMe ? (hookData.profile?.username || 'Вы') : `Участник ${idx + 1}`;
                        return (
                          <div key={p.userId} className="flex items-center gap-3">
                            <span className={`text-[10px] font-black w-4 ${idx === 0 ? 'text-yellow-400' : 'text-slate-500'}`}>{idx + 1}</span>
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                              {displayName.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between text-[9px] uppercase font-black mb-1">
                                <span className={isMe ? 'text-emerald-400' : 'text-slate-200'}>
                                  {displayName}
                                </span>
                                <span className="text-slate-200">{p.progress} {c.unit}</span>
                              </div>
                              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`${isMe ? 'bg-emerald-500' : 'bg-slate-600'} h-full rounded-full transition-all duration-1000`}
                                  style={{ width: `${Math.min(100, (p.progress / c.goalValue) * 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-2 text-center">Внести прогресс ({activeChallenge?.unit})</p>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        placeholder="0"
                        value={manualProgress}
                        onChange={e => setManualProgress(e.target.value)}
                        className="w-20 bg-white text-slate-900 placeholder-slate-300 rounded-xl px-3 py-2 text-center text-sm font-bold border border-emerald-500/30 focus:outline-none focus:border-emerald-400"
                      />
                      <span className="text-xs font-bold text-slate-500">{activeChallenge?.unit}</span>
                      <button onClick={handleManualLog} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-lg active:scale-95">
                        ДОБАВИТЬ
                      </button>
                    </div>
                  </div>

                  {inviteLink ? (
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center animate-in zoom-in-95">
                      <p className="text-[10px] font-black text-emerald-800 uppercase mb-2">Ссылка создана!</p>
                      <code className="block bg-white p-2 rounded border border-emerald-200 text-[10px] text-emerald-600 font-mono break-all mb-2">{inviteLink}</code>
                      <button onClick={() => setInviteLink(null)} className="text-[9px] font-bold text-slate-400 underline">Закрыть</button>
                    </div>
                  ) : (
                    <button
                      onClick={handleInvite}
                      className="w-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase py-3 rounded-2xl hover:bg-slate-200 transition-all border border-slate-200"
                    >
                      + Пригласить друга
                    </button>
                  )}

                  <button
                    onClick={leaveChallenge}
                    className="w-full bg-red-50 text-red-500 text-[10px] font-black uppercase py-4 rounded-2xl hover:bg-red-100 transition-all"
                  >
                    Покинуть челлендж
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => joinChallenge(c.id)}
                    disabled={loading || activeChallengeId !== null}
                    className={`w-full text-[10px] font-black uppercase py-4 rounded-2xl transition-all shadow-lg ${activeChallengeId
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20 active:scale-95'
                      }`}
                  >
                    {loading ? '...' : activeChallengeId ? 'У вас уже есть активный челлендж' : 'Вступить'}
                  </button>

                  {!['sugar', 'water', 'steps', 'sleep'].includes(c.id) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (confirm('Удалить этот челлендж?')) {
                          deleteChallenge(c.id);
                        }
                      }}
                      className="w-full text-[9px] font-black uppercase py-2 text-slate-300 hover:text-red-400 transition-colors cursor-pointer relative z-20"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div >
  );
};

export default Challenges;
