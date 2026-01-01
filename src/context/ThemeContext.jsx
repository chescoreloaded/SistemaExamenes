import { createContext, useContext, useState, useLayoutEffect, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // 1. INICIALIZACIÓN: Leemos localStorage, pero verificamos validez
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    
    // Recuperamos valor guardado
    const savedTheme = localStorage.getItem("theme");
    
    // Si existe, lo usamos. Si no, detectamos preferencia del sistema
    if (savedTheme) return savedTheme;
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    
    return "light";
  });

  // 2. SINCRONIZACIÓN FUERTE (The Enforcer)
  // Usamos useLayoutEffect para pintar antes de que el usuario vea nada
  useLayoutEffect(() => {
    const root = window.document.documentElement;
    
    // Eliminamos cualquier rastro previo para evitar conflictos
    root.classList.remove("light", "dark");
    
    // Aplicamos la clase que manda el estado
    root.classList.add(theme);
    
    // Guardamos en LocalStorage
    localStorage.setItem("theme", theme);
    
    // DEBUG LOG: Esto aparecerá en tu consola para confirmar qué está pasando
    console.log(`🎨 [ThemeContext] Estado: ${theme} | Clase HTML aplicada: ${root.classList.contains(theme)}`);
    
  }, [theme]);

  // 3. LISTENERS DEL SISTEMA
  // Si el usuario cambia su OS de claro a oscuro, la app reacciona (opcional)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const value = {
    theme,
    isDark: theme === "dark", // Boolean helper para las gráficas
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme debe ser usado dentro de un ThemeProvider");
  }
  return context;
}