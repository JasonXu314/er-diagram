import { Entity, type Metadata } from './entity';
import { Point } from './point';
import type { RenderEngine } from './renderEngine';

export interface ERRelationshipData {
	label: string;
	identifying: boolean;
}

export class DummyERRelationship extends Entity {
	public update(metadata: Metadata): void {
		if (metadata.mouse?.position) {
			this.position = metadata.mouse.position.clone();
		}
	}

	public render(renderEngine: RenderEngine): void {
		renderEngine.line(this.position.add(new Point(0, 12.5)), this.position.add(new Point(25, 0)));
		renderEngine.line(this.position.add(new Point(25, 0)), this.position.add(new Point(0, -12.5)));
		renderEngine.line(this.position.add(new Point(0, -12.5)), this.position.add(new Point(-25, 0)));
		renderEngine.line(this.position.add(new Point(-25, 0)), this.position.add(new Point(0, 12.5)));
	}

	public selectedBy(point: Point): boolean {
		return (this.position.x - point.x) ** 2 / 25 ** 2 + (this.position.y - point.y) ** 2 / 12.5 ** 2 <= 1;
	}
}

export class ERRelationship extends Entity {
	public recursive = false;

	constructor(public label: string, public identifying: boolean, private readonly renderEngine: RenderEngine) {
		super();
	}

	public update(metadata: Metadata): void {
		if (metadata.selected && metadata.mouse && metadata.mouse.down) {
			this.position = this.position.add(metadata.mouse.delta);
		}
	}

	public render(renderEngine: RenderEngine, metadata: Metadata): void {
		const { width, height } = this.calculateDimensions();

		const path = [
			new Point(0, 1).times(height / 2),
			new Point(1, 0).times(width / 2),
			new Point(0, -1).times(height / 2),
			new Point(-1, 0).times(width / 2)
		];

		renderEngine.fillShape(
			path.map((pt) => this.position.add(pt)),
			'white'
		);

		if (metadata.selected) {
			renderEngine.fillShape(
				path.map((pt) => this.position.add(pt)),
				'rgba(200, 200, 255, 0.5)'
			);
		}

		renderEngine.shape(path.map((pt) => this.position.add(pt)));

		if (this.identifying) {
			renderEngine.shape(path.map((pt) => this.position.add(pt.scale(0.85, 0.8))));
		}

		renderEngine.text(this.position, this.label);
	}

	public selectedBy(point: Point): boolean {
		const { width, height } = this.calculateDimensions();

		return (
			Math.abs(point.subtract(this.position).x / (width / 2) + point.subtract(this.position).y / (height / 2)) <= 1 &&
			Math.abs(-point.subtract(this.position).x / (width / 2) + point.subtract(this.position).y / (height / 2)) <= 1
		);
	}

	public calculateDimensions(): { width: number; height: number } {
		const labelMetrics = this.renderEngine.measure(this.label);
		const width = labelMetrics.actualBoundingBoxLeft + labelMetrics.actualBoundingBoxRight + 50,
			height =
				(labelMetrics.fontBoundingBoxAscent ?? labelMetrics.actualBoundingBoxAscent) +
				(labelMetrics.fontBoundingBoxDescent ?? labelMetrics.actualBoundingBoxDescent) +
				Math.sqrt(width) +
				13;

		return { width, height };
	}
}

