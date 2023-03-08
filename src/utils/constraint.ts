import { Entity, type Metadata } from './entity';
import type { Point } from './point';
import type { RenderEngine } from './renderEngine';

export enum ERConstraintType {
	DISJOINT,
	OVERLAPPING
}

export interface ERConstraintData {
	type: ERConstraintType;
}

export class DummyERConstraint extends Entity {
	public update(metadata: Metadata): void {
		if (metadata.mouse?.position) {
			this.position = metadata.mouse.position.clone();
		}
	}

	public render(renderEngine: RenderEngine): void {
		renderEngine.fillCircle(this.position, 10, 'white');
		renderEngine.circle(this.position, 10);
	}

	public selectedBy(point: Point): boolean {
		return this.position.distanceTo(point) <= 10;
	}
}

export class ERConstraint extends Entity {
	constructor(public type: ERConstraintType) {
		super();
	}

	public update(metadata: Metadata): void {
		if (metadata.selected && metadata.mouse && metadata.mouse.down) {
			this.position = this.position.add(metadata.mouse.delta);
		}
	}

	public render(renderEngine: RenderEngine, metadata: Metadata): void {
		renderEngine.fillCircle(this.position, 10, 'white');

		if (metadata.selected) {
			renderEngine.fillCircle(this.position, 10, 'rgba(200, 200, 255, 0.5)');
		}

		renderEngine.circle(this.position, 10);

		switch (this.type) {
			case ERConstraintType.DISJOINT:
				renderEngine.text(this.position, 'D');
				break;
			case ERConstraintType.OVERLAPPING:
				renderEngine.text(this.position, 'O');
				break;
		}
	}

	public selectedBy(point: Point): boolean {
		return this.position.distanceTo(point) <= 10;
	}
}

