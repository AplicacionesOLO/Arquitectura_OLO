// Ancho de la ventana (se actualiza al redimensionar) — para ajustar layouts
// con paneles laterales en pantallas angostas.
import { useState, useEffect } from "react";

export function useAncho() {
  const [ancho, setAncho] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setAncho(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return ancho;
}
