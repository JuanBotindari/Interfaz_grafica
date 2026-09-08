import { BaseNode } from "./BaseNode";

export class CentralNode extends BaseNode {
  constructor(id: string, name = "CORE BRAIN HUB", x = 400, y = 350) {
    super(id, "HUB", name, "Central Core", "TECH", "Active", "1ms", x, y, "#ffffff", 16);
  }

  getDetails() {
    return {
      ID: this.id,
      Tipo: "Nodo Central / Hub",
      Nombre: this.name,
      Rol: this.role,
      Estado: this.status,
    };
  }
}