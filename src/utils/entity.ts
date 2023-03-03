import { Point } from './point';
import type { RenderEngine } from './renderEngine';

export interface Metadata {
	selected: boolean;
	mouse: MouseData | null;
}

export type MouseData = { position: Point | null } & ({ down: true; delta: Point } | { down: false; delta: null });

export abstract class Entity {
	public position: Point = new Point();

	public abstract update(metadata: Metadata): void;
	public abstract render(renderEngine: RenderEngine, metadata: Metadata): void;
	public abstract selectedBy(point: Point, getMetrics: (label: string) => TextMetrics): boolean;
}

