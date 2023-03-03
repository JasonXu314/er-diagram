import { Point } from './point';

interface TextStyles {
	underline: boolean;
	underlineStyle: string | CanvasGradient | CanvasPattern;
	underlineDashed: boolean;
}

interface ShapeStyles {
	dashed: boolean;
}

export class RenderEngine {
	private readonly norm: Point;

	constructor(private readonly context: CanvasRenderingContext2D, private readonly canvas: HTMLCanvasElement) {
		context.strokeStyle = 'black';
		context.lineWidth = 1;
		context.textAlign = 'center';
		context.font = '12px sans-serif';

		this.norm = new Point(canvas.width / 2, canvas.height / 2);
	}

	public line(from: Point, to: Point, width = 1, style: string | CanvasGradient | CanvasPattern = 'black') {
		const [fx, fy] = this.spaceToCanvas(from);
		const [tx, ty] = this.spaceToCanvas(to);

		this.context.lineWidth = width;
		this.context.strokeStyle = style;

		this.context.beginPath();
		this.context.moveTo(fx, fy);
		this.context.lineTo(tx, ty);
		this.context.stroke();

		this.context.lineWidth = 1;
		this.context.strokeStyle = 'black';
	}

	public rect(center: Point, width: number, height: number): void {
		const [x, y] = this.norm.add(center.invert('y')).add(new Point(-width / 2, -height / 2));

		this.context.strokeRect(x, y, width, height);
	}

	public fillRect(center: Point, width: number, height: number, fillStyle: string | CanvasGradient): void {
		const [x, y] = this.norm.add(center.invert('y')).add(new Point(-width / 2, -height / 2));

		this.context.fillStyle = fillStyle;

		this.context.fillRect(x, y, width, height);
	}

	public shape(path: Point[], closed = true): void {
		const [sx, sy] = this.spaceToCanvas(path[0]);

		this.context.beginPath();
		this.context.moveTo(sx, sy);

		for (let i = 1; i < path.length; i++) {
			const [x, y] = this.spaceToCanvas(path[i]);
			this.context.lineTo(x, y);
		}

		if (closed) {
			this.context.closePath();
		}

		this.context.stroke();
	}

	public fillShape(path: Point[], style: string | CanvasGradient | CanvasPattern): void {
		const [sx, sy] = this.spaceToCanvas(path[0]);

		this.context.fillStyle = style;

		this.context.beginPath();
		this.context.moveTo(sx, sy);

		for (let i = 1; i < path.length; i++) {
			const [x, y] = this.spaceToCanvas(path[i]);
			this.context.lineTo(x, y);
		}

		this.context.closePath();
		this.context.fill();
	}

	public text(center: Point, text: string, styles: Partial<TextStyles> = {}): void {
		const [x, y] = this.norm.add(center.invert('y')).add(new Point(0, 4));

		const defaultStyles: TextStyles = {
			underline: false,
			underlineStyle: 'black',
			underlineDashed: false
		};
		const sx = { ...defaultStyles, ...styles };

		this.context.fillStyle = 'black';

		this.context.fillText(text, x, y);

		if (sx.underline) {
			const metrics = this.context.measureText(text);

			this.context.strokeStyle = sx.underlineStyle;
			if (sx.underlineDashed) {
				this.context.setLineDash([3, 2]);
			}

			this.context.beginPath();
			this.context.moveTo(x - metrics.actualBoundingBoxLeft, y + (metrics.fontBoundingBoxDescent ?? metrics.actualBoundingBoxDescent));
			this.context.lineTo(x + metrics.actualBoundingBoxRight, y + (metrics.fontBoundingBoxDescent ?? metrics.actualBoundingBoxDescent));
			this.context.stroke();

			this.context.strokeStyle = 'black';
			this.context.setLineDash([]);
		}
	}

	public ellipse(center: Point, xRadius: number, yRadius: number, styles: Partial<ShapeStyles> = {}): void {
		const [x, y] = this.spaceToCanvas(center);

		const defaultStyles: ShapeStyles = {
			dashed: false
		};
		const sx = { ...defaultStyles, ...styles };

		this.context.strokeStyle = 'black';
		if (sx.dashed) {
			this.context.setLineDash([3, 2]);
		}

		this.context.beginPath();
		this.context.ellipse(x, y, xRadius, yRadius, 0, 0, 2 * Math.PI);
		this.context.stroke();

		this.context.strokeStyle = 'black';
		this.context.setLineDash([]);
	}

	public fillEllipse(center: Point, xRadius: number, yRadius: number, fillStyle: string | CanvasGradient): void {
		const [x, y] = this.spaceToCanvas(center);

		this.context.fillStyle = fillStyle;

		this.context.beginPath();
		this.context.ellipse(x, y, xRadius, yRadius, 0, 0, 2 * Math.PI);
		this.context.fill();
	}

	public measure(text: string): TextMetrics {
		return this.context.measureText(text);
	}

	public spaceToCanvas(point: Point): Point {
		return this.norm.add(point.invert('y'));
	}

	public canvasToSpace(point: Point): Point {
		return point.invert('y').add(this.norm.invert('x'));
	}
}

