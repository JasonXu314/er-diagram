import { Entity, type Metadata } from './entity';
import { Point } from './point';
import { ERRelationship } from './relationship';
import type { RenderEngine } from './renderEngine';

export enum RecursionSide {
	LEFT,
	RIGHT
}

export interface ERLineData {
	type: 'LINE';
	from: Entity;
	to: Entity;
	double: boolean;
	derivation: boolean;
	recursionState: RecursionSide | null;
}

export interface DehydratedERLine {
	id: number;
	type: 'LINE';
	from: number;
	to: number;
	double: boolean;
	derivation: boolean;
	recursionState: RecursionSide | null;
}

export class ERLine extends Entity {
	constructor(public from: Entity, public to: Entity, public double = false, public derivation = false, public recursionState: RecursionSide | null = null) {
		super();

		this.position = from.position.add(to.position).divide(2);
	}

	public update(): void {
		this.position = this.from.position.add(this.to.position).divide(2);
	}

	public render(renderEngine: RenderEngine, metadata: Metadata): void {
		const fromPos = this.from instanceof ERRelationship ? this._getAnchor(this.from) : this.from.position,
			toPos = this.to instanceof ERRelationship ? this._getAnchor(this.to) : this.to.position;

		if (metadata.selected) {
			if (this.double) {
				renderEngine.line(fromPos, toPos, 10, 'rgba(200, 200, 255, 0.5)');
			} else {
				renderEngine.line(fromPos, toPos, 6, 'rgba(200, 200, 255, 0.5)');
			}
		}

		if (this.double) {
			const delta = toPos.subtract(fromPos);
			const perpendicular = new Point(-delta.y, delta.x).scaleTo(2);

			renderEngine.line(fromPos.add(perpendicular), toPos.add(perpendicular));
			renderEngine.line(fromPos.add(perpendicular.invert()), toPos.add(perpendicular.invert()));
		} else {
			renderEngine.line(fromPos, toPos);
		}

		if (this.derivation) {
			const delta = toPos.subtract(fromPos).scaleTo(1);
			const perpendicular = new Point(-delta.y, delta.x).scaleTo(1);

			const start = this.position.add(perpendicular.times(6)).subtract(delta.times(4));
			const end = start.add(delta.times(8));
			renderEngine.line(start, end);

			const otherStart = this.position.subtract(perpendicular.times(6)).subtract(delta.times(4));
			const otherEnd = otherStart.add(delta.times(8));
			renderEngine.line(otherStart, otherEnd);

			renderEngine.arc(end, end.add(otherEnd).divide(2), 6, Math.PI);
		}
	}

	public selectedBy(point: Point): boolean {
		const fromPos = this.from instanceof ERRelationship ? this._getAnchor(this.from) : this.from.position,
			toPos = this.to instanceof ERRelationship ? this._getAnchor(this.to) : this.to.position;

		const length = fromPos.distanceTo(toPos);

		if (length === 0) {
			return fromPos.distanceTo(point) <= 5;
		}

		const projection = ((point.x - fromPos.x) * (toPos.x - fromPos.x) + (point.y - fromPos.y) * (toPos.y - fromPos.y)) / length ** 2;
		const clampedProjection = Math.max(0, Math.min(projection, 1));

		return point.distanceTo(fromPos.add(toPos.subtract(fromPos).times(clampedProjection))) <= 5;
	}

	private _getAnchor(entity: ERRelationship): Point {
		switch (this.recursionState) {
			case RecursionSide.LEFT:
				return entity.position.add(new Point(-entity.calculateDimensions().width / 2, 0));
			case RecursionSide.RIGHT:
				return entity.position.add(new Point(entity.calculateDimensions().width / 2, 0));
			default:
				return entity.position;
		}
	}

	public serialize(id: number, getID: (entity: Entity) => number): DehydratedERLine {
		return {
			id,
			type: 'LINE',
			from: getID(this.from),
			to: getID(this.to),
			double: this.double,
			derivation: this.derivation,
			recursionState: this.recursionState
		};
	}

	public static deserialize({ type, derivation, double, from, recursionState, to }: ERLineData): ERLine {
		if (type !== 'LINE') {
			throw new Error(`Attempting to deserialize ${type} as line`);
		}

		return new ERLine(from, to, double, derivation, recursionState);
	}
}

