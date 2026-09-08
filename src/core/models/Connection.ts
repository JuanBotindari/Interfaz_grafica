export class Connection {
  id: string;
  source: string;
  target: string;

  constructor(sourceId: string, targetId: string) {
    this.id = `link-${sourceId}-${targetId}`;
    this.source = sourceId;
    this.target = targetId;
  }
}