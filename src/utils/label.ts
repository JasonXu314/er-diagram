import { Entity, type Metadata } from './entity';
import type { Point } from './point';
import type { RenderEngine } from './renderEngine';

export interface ERLabelData {
	label: string;
}

export class DummyERLabel extends Entity {
	public update(metadata: Metadata): void {
		if (metadata.mouse?.position) {
			this.position = metadata.mouse.position.clone();
		}
	}

	public render(renderEngine: RenderEngine): void {
		renderEngine.fillRect(this.position, 50, 25, 'white');
		renderEngine.rect(this.position, 50, 25);
	}

	public selectedBy(point: Point): boolean {
		return point.x >= this.position.x - 25 && point.x <= this.position.x + 25 && point.y >= this.position.y - 12.5 && point.y <= this.position.y + 12.5;
	}
}

export class ERLabel extends Entity {
	constructor(public label: string) {
		super();
	}

	public update(metadata: Metadata): void {
		if (metadata.selected && metadata.mouse && metadata.mouse.down) {
			this.position = this.position.add(metadata.mouse.delta);
		}
	}

	public render(renderEngine: RenderEngine, metadata: Metadata): void {
		const labelMetrics = renderEngine.measure(this.label);
		const height =
				(labelMetrics.fontBoundingBoxAscent ?? labelMetrics.actualBoundingBoxAscent) +
				(labelMetrics.fontBoundingBoxDescent ?? labelMetrics.actualBoundingBoxDescent) +
				6,
			width = labelMetrics.actualBoundingBoxLeft + labelMetrics.actualBoundingBoxRight + 12;

		if (metadata.selected) {
			renderEngine.fillRect(this.position, width, height, 'rgba(200, 200, 255, 0.5)');
		}

		renderEngine.text(this.position, this.label);
	}

	public selectedBy(point: Point, getMetrics: (label: string) => TextMetrics): boolean {
		const labelMetrics = getMetrics(this.label);
		const height =
				(labelMetrics.fontBoundingBoxAscent ?? labelMetrics.actualBoundingBoxAscent) +
				(labelMetrics.fontBoundingBoxDescent ?? labelMetrics.actualBoundingBoxDescent) +
				+6,
			width = labelMetrics.actualBoundingBoxLeft + labelMetrics.actualBoundingBoxRight + 12;

		return (
			point.x >= this.position.x - width / 2 &&
			point.x <= this.position.x + width / 2 &&
			point.y >= this.position.y - height / 2 &&
			point.y <= this.position.y + height / 2
		);
	}
}

