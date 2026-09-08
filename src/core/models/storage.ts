const STORAGE_KEY = "graph_state_v1";

export const saveGraph = (data: unknown): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error guardando en localStorage:", error);
  }
};

export const loadGraph = (): unknown | null => {
  if (typeof window === "undefined") return null;
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error("Error cargando de localStorage:", error);
    return null;
  }
};