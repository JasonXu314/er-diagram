import { Entity, type Metadata } from './entity';
import type { Point } from './point';
import type { RenderEngine } from './renderEngine';

export interface ERAttributeData {
	label: string;
	key: boolean;
	partial: boolean;
	multiValued: boolean;
}

export class DummyERAttribute extends Entity {
	public update(metadata: Metadata): void {
		if (metadata.mouse?.position) {
			this.position = metadata.mouse.position.clone();
		}
	}

	public render(renderEngine: RenderEngine): void {
		renderEngine.fillEllipse(this.position, 25, 12.5, 'white');
		renderEngine.ellipse(this.position, 25, 12.5);
	}

	public selectedBy(point: Point): boolean {
		return (this.position.x - point.x) ** 2 / 25 ** 2 + (this.position.y - point.y) ** 2 / 12.5 ** 2 <= 1;
	}
}

export class ERAttribute extends Entity {
	constructor(public label: string, public key: boolean, public partial: boolean, public multiValued: boolean) {
		super();
	}

	public update(metadata: Metadata): void {
		if (metadata.selected && metadata.mouse && metadata.mouse.down) {
			this.position = this.position.add(metadata.mouse.delta);
		}
	}

	public render(renderEngine: RenderEngine, metadata: Metadata): void {
		const labelMetrics = renderEngine.measure(this.label);
		const width = labelMetrics.actualBoundingBoxLeft + labelMetrics.actualBoundingBoxRight + 26,
			height =
				(labelMetrics.fontBoundingBoxAscent ?? labelMetrics.actualBoundingBoxAscent) +
				(labelMetrics.fontBoundingBoxDescent ?? labelMetrics.actualBoundingBoxDescent) +
				Math.sqrt(width) +
				13;
		const yRadius = height / 2,
			xRadius = width / 2;

		renderEngine.fillEllipse(this.position, xRadius, yRadius, 'white');

		if (metadata.selected) {
			renderEngine.fillEllipse(this.position, xRadius, yRadius, 'rgba(200, 200, 255, 0.5)');
		}

		renderEngine.ellipse(this.position, xRadius, yRadius);

		if (this.multiValued) {
			renderEngine.ellipse(this.position, xRadius - 4, yRadius - 3);
		}

		renderEngine.text(this.position, this.label, { underline: this.key });
	}

	public selectedBy(point: Point): boolean {
		return (this.position.x - point.x) ** 2 / 25 ** 2 + (this.position.y - point.y) ** 2 / 12.5 ** 2 <= 1;
	}
}

