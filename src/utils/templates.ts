import { CustomNode, Connection } from "@/types";

export interface Template {
  id: string;
  name: string;
  description: string;
  nodes: CustomNode[];
  connections: Connection[];
}

export const PRESET_TEMPLATES: Template[] = [
  {
    id: "rag-pipeline",
    name: "Pipeline RAG Avanzado",
    description: "Arquitectura para recuperación y generación aumentada con vectorstore.",
    nodes: [
      { id: "hub-1", name: "Orquestador RAG", role: "Coordinador central de la consulta", type: "HUB", status: "Active", x: 400, y: 250, model: "GPT-4o", systemPrompt: "Procesa y distribuye las peticiones RAG." },
      { id: "agent-embedding", name: "Agente Embeddings", role: "Generación de vectores", type: "AGENT", status: "Idle", x: 150, y: 120, model: "Claude 3.5 Sonnet" },
      { id: "agent-retriever", name: "Vector Search", role: "Consulta en Pinecone/Qdrant", type: "TOOL", status: "Idle", x: 150, y: 380, model: "Local Ollama" },
      { id: "agent-synthesizer", name: "Sintetizador LLM", role: "Generación de respuesta final", type: "WORKER", status: "Idle", x: 650, y: 250, model: "GPT-4o" },
    ],
    connections: [
      { id: "tc1", source: "hub-1", target: "agent-embedding", type: "data" },
      { id: "tc2", source: "agent-embedding", target: "agent-retriever", type: "data" },
      { id: "tc3", source: "agent-retriever", target: "agent-synthesizer", type: "control" },
      { id: "tc4", source: "agent-synthesizer", target: "hub-1", type: "data" },
    ],
  },
  {
    id: "multi-agent-swarm",
    name: "Enjambre Multi-Agente",
    description: "Sistema supervisor con agentes especializados en código, diseño y auditoría.",
    nodes: [
      { id: "supervisor", name: "Supervisor General", role: "Gestor de tareas y asignación", type: "HUB", status: "Active", x: 400, y: 200, model: "GPT-4o" },
      { id: "coder", name: "Agente Coder", role: "Generador de código Next.js", type: "AGENT", status: "Idle", x: 180, y: 360, model: "Claude 3.5 Sonnet" },
      { id: "reviewer", name: "Agente Revisor", role: "Auditoría de seguridad y sintaxis", type: "AGENT", status: "Idle", x: 400, y: 420, model: "Local Ollama" },
      { id: "designer", name: "Agente UI/UX", role: "Definición de estilos CSS/Tailwind", type: "AGENT", status: "Idle", x: 620, y: 360, model: "GPT-4o" },
    ],
    connections: [
      { id: "sc1", source: "supervisor", target: "coder", type: "control" },
      { id: "sc2", source: "supervisor", target: "reviewer", type: "control" },
      { id: "sc3", source: "supervisor", target: "designer", type: "control" },
      { id: "sc4", source: "coder", target: "reviewer", type: "data" },
      { id: "sc5", source: "reviewer", target: "supervisor", type: "fallback" },
    ],
  },
];