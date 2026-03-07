import type { Ground, GroundsRegistry } from "./types";

const EMPTY_REGISTRY: GroundsRegistry = { A: [], B: [] };

export function parseRegistry(json: unknown): GroundsRegistry {
  if (!json || typeof json !== "object") return { ...EMPTY_REGISTRY, A: [], B: [] };
  const obj = json as Record<string, unknown>;
  const A = Array.isArray(obj.A) ? (obj.A as Ground[]) : [];
  const B = Array.isArray(obj.B) ? (obj.B as Ground[]) : [];
  return { A, B };
}

export function nextGroundId(registry: GroundsRegistry, side: "A" | "B"): string {
  const count = registry[side].length;
  return `G-${side}${count + 1}`;
}

export function addGround(
  registry: GroundsRegistry,
  side: "A" | "B",
  content: string,
  summary: string,
  turn: number
): { registry: GroundsRegistry; ground: Ground } {
  const id = nextGroundId(registry, side);
  const ground: Ground = {
    id,
    side,
    content,
    summary,
    status: "active",
    counteredBy: null,
    reinforcedCount: 0,
    createdAtTurn: turn,
  };
  const updated: GroundsRegistry = {
    ...registry,
    [side]: [...registry[side], ground],
  };
  return { registry: updated, ground };
}

export function counterGround(
  registry: GroundsRegistry,
  targetId: string,
  counterById: string
): GroundsRegistry {
  const update = (grounds: Ground[]) =>
    grounds.map((g) =>
      g.id === targetId
        ? { ...g, status: "countered" as const, counteredBy: counterById }
        : g
    );

  return {
    A: update(registry.A),
    B: update(registry.B),
  };
}

export function reinforceGround(
  registry: GroundsRegistry,
  groundId: string,
  updatedSummary?: string
): GroundsRegistry {
  const update = (grounds: Ground[]) =>
    grounds.map((g) =>
      g.id === groundId
        ? {
            ...g,
            reinforcedCount: g.reinforcedCount + 1,
            ...(updatedSummary ? { summary: updatedSummary } : {}),
          }
        : g
    );

  return {
    A: update(registry.A),
    B: update(registry.B),
  };
}

export function findGround(
  registry: GroundsRegistry,
  groundId: string
): Ground | undefined {
  return (
    registry.A.find((g) => g.id === groundId) ??
    registry.B.find((g) => g.id === groundId)
  );
}

export function getCurrentTurnNumber(registry: GroundsRegistry): number {
  return registry.A.length + registry.B.length + 1;
}
