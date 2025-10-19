import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useExamStore = create(
  persist(
    (set, get) => ({
      // Estado global
      currentSubject: null,
      theme: 'default',
      
      // Configuración de usuario
      preferences: {
        darkMode: false,
        soundEnabled: false,
        animationsEnabled: true
      },
      
      // Historial reciente
      recentSubjects: [],
      
      // Acciones
      setCurrentSubject: (subject) => set({ currentSubject: subject }),
      
      setTheme: (theme) => set({ theme }),
      
      toggleDarkMode: () => set((state) => ({
        preferences: {
          ...state.preferences,
          darkMode: !state.preferences.darkMode
        }
      })),
      
      addRecentSubject: (subjectId) => set((state) => {
        const recent = state.recentSubjects.filter(id => id !== subjectId);
        return {
          recentSubjects: [subjectId, ...recent].slice(0, 5)
        };
      }),
      
      updatePreferences: (newPrefs) => set((state) => ({
        preferences: { ...state.preferences, ...newPrefs }
      })),
      
      clearStore: () => set({
        currentSubject: null,
        recentSubjects: []
      })
    }),
    {
      name: 'exam-store',
      partialize: (state) => ({
        preferences: state.preferences,
        recentSubjects: state.recentSubjects
      })
    }
  )
);