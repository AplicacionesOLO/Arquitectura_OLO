// Navegación entre módulos (ej. ficha de proceso → tabla en Integraciones,
// tabla → ficha de proceso). App provee navigate({ tab, ...foco }).
import { createContext, useContext } from "react";

export const NavContext = createContext({ navigate: () => {}, focus: null });
export const useNav = () => useContext(NavContext);
