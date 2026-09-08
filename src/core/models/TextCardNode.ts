import { BaseNode } from "./BaseNode";

export class TextCardNode extends BaseNode {
  textContent: string;

  constructor(id: string, name: string, textContent: string, x = 100, y = 100) {
    super(id, "WORKER", name, "Tarea / Nota", "TECH", "Idle", "0ms", x, y, "#ffea00", 9);
    this.textContent = textContent;
  }

  getDetails() {
    return {
      ID: this.id,
      Tipo: "Tarjeta de Texto / Nota",
      Título: this.name,
      Contenido: this.textContent,
    };
  }
}