import { Entity, type Metadata } from './entity';
import type { Point } from './point';
import type { RenderEngine } from './renderEngine';

export interface EREntityData {
	label: string;
	weak: boolean;
}

export class DummyEREntity extends Entity {
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

export class EREntity extends Entity {
	constructor(public label: string, public weak: boolean) {
		super();
	}

	public update(metadata: Metadata): void {
		if (metadata.selected && metadata.mouse && metadata.mouse.down) {
			this.position = this.position.add(metadata.mouse.delta);
		}
	}

	public render(renderEngine: RenderEngine, metadata: Metadata): void {
		const labelMetrics = renderEngine.measure(this.label);
		const height = labelMetrics.fontBoundingBoxAscent + labelMetrics.fontBoundingBoxDescent + 13,
			width = labelMetrics.actualBoundingBoxLeft + labelMetrics.actualBoundingBoxRight + 26;

		renderEngine.fillRect(this.position, width, height, 'white');

		if (metadata.selected) {
			renderEngine.fillRect(this.position, width, height, 'rgba(200, 200, 255, 0.5)');
		}

		renderEngine.rect(this.position, width, height);

		if (this.weak) {
			renderEngine.rect(this.position, width - 6, height - 6);
		}

		renderEngine.text(this.position, this.label);
	}

	public selectedBy(point: Point, getMetrics: (label: string) => TextMetrics): boolean {
		const labelMetrics = getMetrics(this.label);
		const height = labelMetrics.fontBoundingBoxAscent + labelMetrics.fontBoundingBoxDescent + 13,
			width = labelMetrics.actualBoundingBoxLeft + labelMetrics.actualBoundingBoxRight + 26;

		return (
			point.x >= this.position.x - width / 2 &&
			point.x <= this.position.x + width / 2 &&
			point.y >= this.position.y - height / 2 &&
			point.y <= this.position.y + height / 2
		);
	}
}

