import { Entity, type Metadata } from './entity';
import { Point } from './point';
import { ERRelationship } from './relationship';
import type { RenderEngine } from './renderEngine';

export class ERLine extends Entity {
	constructor(public readonly from: Entity, public readonly to: Entity, public double = false) {
		super();

		this.position = from.position.add(to.position).divide(2);
	}

	public update(): void {
		this.position = this.from.position.add(this.to.position).divide(2);
	}

	public render(renderEngine: RenderEngine, metadata: Metadata): void {
		const fromPos =
				this.from instanceof ERRelationship && this.from.recursive
					? this.from.position.add(new Point(-this.from.calculateDimensions().width / 2, 0))
					: this.from.position,
			toPos =
				this.to instanceof ERRelationship && this.to.recursive
					? this.to.position.add(new Point(this.to.calculateDimensions().width / 2, 0))
					: this.to.position;

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
	}

	public selectedBy(point: Point): boolean {
		const fromPos =
				this.from instanceof ERRelationship && this.from.recursive
					? this.from.position.add(new Point(-this.from.calculateDimensions().width / 2, 0))
					: this.from.position,
			toPos =
				this.to instanceof ERRelationship && this.to.recursive
					? this.to.position.add(new Point(this.to.calculateDimensions().width / 2, 0))
					: this.to.position;

		const length = fromPos.distanceTo(toPos);

		if (length === 0) {
			return fromPos.distanceTo(point) <= 5;
		}

		const projection = ((point.x - fromPos.x) * (toPos.x - fromPos.x) + (point.y - fromPos.y) * (toPos.y - fromPos.y)) / length ** 2;
		const clampedProjection = Math.max(0, Math.min(projection, 1));

		return point.distanceTo(fromPos.add(toPos.subtract(fromPos).times(clampedProjection))) <= 5;
	}
}

