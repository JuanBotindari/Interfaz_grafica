export type NodeType = "HUB" | "AGENT" | "TOOL" | "WORKER";
export type NodeStatus = "Active" | "Idle" | "Syncing" | "Error";

export abstract class BaseNode {
  id: string;
  type: NodeType;
  name: string;
  role: string;
  department: string;
  status: NodeStatus;
  latency: string;
  x: number;
  y: number;
  color: string;
  size: number;
  parentId?: string;

  constructor(
    id: string,
    type: NodeType,
    name: string,
    role = "Sin definir",
    department = "TECH",
    status: NodeStatus = "Active",
    latency = "1ms",
    x = 100,
    y = 100,
    color = "#ffffff",
    size = 12
  ) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.role = role;
    this.department = department;
    this.status = status;
    this.latency = latency;
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = size;
  }

  abstract getDetails(): Record<string, any>;
}