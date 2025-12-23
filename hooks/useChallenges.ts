import { useState, useEffect, useCallback } from 'react';
import { Challenge, ChallengeParticipant } from '../types';

const MOCK_CHALLENGES: Challenge[] = [
    {
        id: 'sugar',
        title: 'Дни без сахара',
        description: 'Откажись от сахара и почувствуй легкость',
        type: 'custom',
        goalValue: 30,
        unit: 'день',
        durationDays: 30,
        color: 'bg-pink-500',
        icon: '🍬'
    },
    {
        id: 'water',
        title: 'Водный марафон',
        description: 'Выпей 90 литров воды за месяц (3л в день)',
        type: 'water',
        goalValue: 90000,
        unit: 'мл',
        durationDays: 30,
        color: 'bg-blue-500',
        icon: '💧'
    },
    {
        id: 'steps',
        title: '100,000 шагов',
        description: 'Пройди 100 тысяч шагов за месяц',
        type: 'step',
        goalValue: 100000,
        unit: 'шаг',
        durationDays: 30,
        color: 'bg-emerald-500',
        icon: '👣'
    },
];

const STORAGE_KEY = 'janamen_challenges_data';

interface StoredData {
    challenges: Challenge[];
    activeId: string | null;
    progress: ChallengeParticipant | null;
    trophies: number;
    streak: number;
    username: string;
    lastActiveDate: string | null;
    completedChallenges: string[]; // IDs of completed challenges
}

const getTodayStr = () => new Date().toISOString().split('T')[0];

const loadFromStorage = (): StoredData => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            const defaultIds = MOCK_CHALLENGES.map(c => c.id);
            const customChallenges = parsed.challenges?.filter((c: Challenge) => !defaultIds.includes(c.id)) || [];
            return {
                ...parsed,
                challenges: [...MOCK_CHALLENGES, ...customChallenges],
                completedChallenges: parsed.completedChallenges || []
            };
        }
    } catch (e) {
        console.error('Error loading challenges data:', e);
    }
    return {
        challenges: [...MOCK_CHALLENGES],
        activeId: null,
        progress: null,
        trophies: 0,
        streak: 0,
        username: '',
        lastActiveDate: null,
        completedChallenges: []
    };
};

const saveToStorage = (data: StoredData) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Error saving challenges data:', e);
    }
};

export const useChallenges = (_userId?: string) => {
    const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>(MOCK_CHALLENGES);
    const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
    const [myProgress, setMyProgress] = useState<ChallengeParticipant | null>(null);
    const [participants, setParticipants] = useState<ChallengeParticipant[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorState, setErrorState] = useState<string | null>(null);
    const [profile, setProfile] = useState<{ trophies: number; streak: number; username: string }>({ trophies: 0, streak: 0, username: '' });
    const [lastActiveDate, setLastActiveDate] = useState<string | null>(null);
    const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);

    // State for celebration modal
    const [justCompletedChallenge, setJustCompletedChallenge] = useState<Challenge | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = loadFromStorage();
        setAvailableChallenges(stored.challenges);
        setActiveChallengeId(stored.activeId);
        setMyProgress(stored.progress);
        setProfile({ trophies: stored.trophies, streak: stored.streak, username: stored.username || '' });
        setLastActiveDate(stored.lastActiveDate);
        setCompletedChallenges(stored.completedChallenges || []);

        if (stored.progress) {
            setParticipants([stored.progress]);
        }

        // Check and update streak on load
        updateStreak(stored.lastActiveDate, stored.streak);
    }, []);

    // Update streak logic
    const updateStreak = useCallback((lastDate: string | null, currentStreak: number) => {
        const today = getTodayStr();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastDate === today) {
            // Already active today, streak stays
            return;
        } else if (lastDate === yesterdayStr) {
            // Was active yesterday, streak continues (will increment on next activity)
            return;
        } else if (lastDate && lastDate !== today && lastDate !== yesterdayStr) {
            // Missed a day, reset streak
            setProfile(prev => ({ ...prev, streak: 0 }));
        }
    }, []);

    // Record daily activity and update streak
    const recordDailyActivity = useCallback(() => {
        const today = getTodayStr();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastActiveDate === today) {
            // Already recorded today
            return;
        }

        let newStreak = profile.streak;
        if (lastActiveDate === yesterdayStr || lastActiveDate === null) {
            // Consecutive day or first day
            newStreak = profile.streak + 1;
        } else {
            // Streak broken, start new
            newStreak = 1;
        }

        setLastActiveDate(today);
        setProfile(prev => ({ ...prev, streak: newStreak }));
    }, [lastActiveDate, profile.streak]);

    // Save to localStorage on change
    useEffect(() => {
        saveToStorage({
            challenges: availableChallenges,
            activeId: activeChallengeId,
            progress: myProgress,
            trophies: profile.trophies,
            streak: profile.streak,
            username: profile.username,
            lastActiveDate,
            completedChallenges
        });
    }, [availableChallenges, activeChallengeId, myProgress, profile, lastActiveDate, completedChallenges]);

    const joinChallenge = async (challengeId: string) => {
        setLoading(true);
        setErrorState(null);

        await new Promise(resolve => setTimeout(resolve, 300));

        const newProgress: ChallengeParticipant = {
            userId: 'local-user',
            challengeId,
            progress: 0,
            joinedAt: new Date().toISOString()
        };

        setActiveChallengeId(challengeId);
        setMyProgress(newProgress);
        setParticipants([newProgress]);

        // Record activity for streak
        recordDailyActivity();

        setLoading(false);
    };

    const leaveChallenge = async () => {
        setActiveChallengeId(null);
        setMyProgress(null);
        setParticipants([]);
    };

    const logProgress = async (amount: number) => {
        if (!activeChallengeId || !myProgress) return;

        const challenge = availableChallenges.find(c => c.id === activeChallengeId);
        if (!challenge) return;

        const newProgressValue = myProgress.progress + amount;
        const reachedGoal = newProgressValue >= challenge.goalValue;
        const previouslyReached = myProgress.progress >= challenge.goalValue;

        const updatedProgress: ChallengeParticipant = {
            ...myProgress,
            progress: newProgressValue
        };

        setMyProgress(updatedProgress);
        setParticipants([updatedProgress]);

        // Record activity for streak
        recordDailyActivity();

        // Award trophy and show celebration on FIRST goal completion
        if (reachedGoal && !previouslyReached) {
            // Check if this challenge was already completed before
            const alreadyCompleted = completedChallenges.includes(activeChallengeId);

            if (!alreadyCompleted) {
                // First time completing this challenge!
                setProfile(prev => ({ ...prev, trophies: prev.trophies + 1 }));
                setCompletedChallenges(prev => [...prev, activeChallengeId]);
                setJustCompletedChallenge(challenge);
            }
        }
    };

    const dismissCelebration = () => {
        setJustCompletedChallenge(null);
    };

    const generateInviteLink = () => {
        return `${window.location.origin}?challenge=${activeChallengeId}`;
    };

    const createChallenge = async (challenge: Omit<Challenge, 'id'>) => {
        setLoading(true);
        setErrorState(null);

        await new Promise(resolve => setTimeout(resolve, 300));

        const newChallenge: Challenge = {
            ...challenge,
            id: `custom-${Date.now()}`
        };

        setAvailableChallenges(prev => [newChallenge, ...prev]);
        await joinChallenge(newChallenge.id);

        setLoading(false);
    };

    const deleteChallenge = async (challengeId: string) => {
        if (['sugar', 'water', 'steps'].includes(challengeId)) {
            return;
        }

        if (activeChallengeId === challengeId) {
            await leaveChallenge();
        }

        setAvailableChallenges(prev => prev.filter(c => c.id !== challengeId));
    };

    const setUsername = (name: string) => {
        setProfile(prev => ({ ...prev, username: name }));
    };

    return {
        availableChallenges,
        activeChallengeId,
        myProgress,
        participants,
        profile,
        completedChallenges,
        justCompletedChallenge,
        dismissCelebration,
        joinChallenge,
        leaveChallenge,
        generateInviteLink,
        createChallenge,
        deleteChallenge,
        logProgress,
        setUsername,
        loading,
        error: errorState
    };
};
