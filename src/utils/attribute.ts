import { Entity, type Metadata } from './entity';
import { Point } from './point';
import type { RenderEngine } from './renderEngine';

export interface ERAttributeData {
	label: string;
	key: boolean;
	partial: boolean;
	multiValued: boolean;
	derived: boolean;
}

export interface DehydratedERAttribute extends ERAttributeData {
	id: number;
	type: 'ATTRIBUTE';
	position: [number, number];
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

	public serialize(): never {
		throw new Error('Attempting to serialize a placeholder attribute');
	}
}

export class ERAttribute extends Entity {
	constructor(public label: string, public key: boolean, public partial: boolean, public multiValued: boolean, public derived: boolean) {
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

		renderEngine.ellipse(this.position, xRadius, yRadius, { dashed: this.derived });

		if (this.multiValued) {
			renderEngine.ellipse(this.position, xRadius - 4, yRadius - 3);
		}

		renderEngine.text(this.position, this.label, { underline: this.key, underlineDashed: this.partial });
	}

	public selectedBy(point: Point): boolean {
		return (this.position.x - point.x) ** 2 / 25 ** 2 + (this.position.y - point.y) ** 2 / 12.5 ** 2 <= 1;
	}

	public serialize(id: number): DehydratedERAttribute {
		return {
			id,
			type: 'ATTRIBUTE',
			position: [this.position.x, this.position.y],
			label: this.label,
			key: this.key,
			partial: this.partial,
			multiValued: this.multiValued,
			derived: this.derived
		};
	}

	public static deserialize({ type, derived, key, label, multiValued, partial, position }: DehydratedERAttribute): ERAttribute {
		if (type !== 'ATTRIBUTE') {
			throw new Error(`Attempting to deserialize ${type} as attribute`);
		}

		const attr = new ERAttribute(label, key, partial, multiValued, derived);
		const [x, y] = position;
		attr.position = new Point(x, y);

		return attr;
	}
}

