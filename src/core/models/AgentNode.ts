import { BaseNode } from "./BaseNode";

export class AgentNode extends BaseNode {
  constructor(
    id: string,
    name: string,
    role: string,
    color = "#00f0ff",
    x = 200,
    y = 200
  ) {
    super(id, "AGENT", name, role, "TECH", "Active", "12ms", x, y, color, 12);
  }

  getDetails() {
    return {
      ID: this.id,
      Tipo: "Agente de IA",
      Nombre: this.name,
      "Rol / Función": this.role,
      Estado: this.status,
      Latencia: this.latency,
    };
  }
}