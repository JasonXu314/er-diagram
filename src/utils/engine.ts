import { DummyERAttribute, ERAttribute, type ERAttributeData } from './attribute';
import type { Entity, MouseData } from './entity';
import { DummyEREntity, EREntity, type EREntityData } from './erEntity';
import { DummyERLabel, ERLabel, type ERLabelData } from './label';
import { ERLine, RecursionSide } from './line';
import { Point } from './point';
import { DummyERRelationship, ERRelationship, type ERRelationshipData } from './relationship';
import { RenderEngine } from './renderEngine';

interface EngineEvents {
	entityClicked: (entity: Entity, metadata: { button: MouseButton; spacePos: Point; pagePos: Point }) => void;
	entityDblClicked: (entity: Entity) => void;
	click: (evt: MouseEvent) => void;
}

export enum MouseButton {
	LEFT,
	MIDDLE,
	RIGHT,
	BACK,
	FORWARD
}

export class Engine {
	private readonly context: CanvasRenderingContext2D;
	private readonly layers: Entity[][] = [];
	private readonly renderEngine: RenderEngine;

	private _selectedEntity: Entity | null = null;
	private _mousePos: Point | null = null;
	private _mouseDown = false;
	private _mouseDelta: Point | null = null;

	private _listeners: { [K in keyof EngineEvents]: EngineEvents[K][] };

	private mouseListener: (evt: MouseEvent) => void = (evt) => {
		if (this._mousePos) {
			this._mousePos = this.renderEngine.canvasToSpace(new Point(evt.offsetX, evt.offsetY));

			if (this._mouseDelta) {
				this._mouseDelta.x += evt.movementX;
				this._mouseDelta.y -= evt.movementY;
			}
		}
	};

	constructor(private readonly canvas: HTMLCanvasElement) {
		const ctx = canvas.getContext('2d');

		if (ctx) {
			this.context = ctx;
			this.renderEngine = new RenderEngine(ctx, canvas);

			this._listeners = { entityClicked: [], click: [], entityDblClicked: [] };

			canvas.addEventListener('mouseout', () => {
				this._mousePos = null;

				canvas.removeEventListener('mousemove', this.mouseListener);
			});

			canvas.addEventListener('mouseover', (evt) => {
				this._mousePos = new Point(evt.offsetX, evt.offsetY);

				canvas.addEventListener('mousemove', this.mouseListener);
			});

			canvas.addEventListener('mousedown', () => {
				this._mouseDown = true;
				this._mouseDelta = new Point();
			});

			canvas.addEventListener('mouseup', (evt: MouseEvent) => {
				this._mouseDown = false;
				this._mouseDelta = null;

				if (this._selectedEntity) {
					for (const listener of this._listeners.entityClicked) {
						listener(this._selectedEntity, {
							button: evt.button,
							spacePos: this._mousePos!,
							pagePos: this.renderEngine.spaceToCanvas(this._mousePos!).add(new Point(0, 36))
						});
					}
				} else {
					for (const listener of this._listeners.click) {
						listener(evt);
					}
				}
			});

			canvas.addEventListener('dblclick', () => {
				if (this._selectedEntity) {
					for (const listener of this._listeners.entityDblClicked) {
						listener(this._selectedEntity);
					}
				}
			});

			canvas.addEventListener('contextmenu', (evt: MouseEvent) => {
				if (this._selectedEntity) {
					evt.preventDefault();
				}
			});
		} else {
			throw new Error('Unable to get canvas context');
		}
	}

	public add(entity: Entity, layer: number): void {
		while (layer >= this.layers.length) {
			this.layers.push([]);
		}

		this.layers[layer].push(entity);
	}

	public remove(entity: Entity, layer?: number): void {
		if (layer === undefined) {
			for (const layer of this.layers) {
				if (layer.includes(entity)) {
					layer.splice(layer.indexOf(entity), 1);
				}
			}
		} else {
			if (!this.layers[layer]) {
				throw new Error(`Layer ${layer} does not exist!`);
			} else if (!this.layers[layer].includes(entity)) {
				throw new Error(`Layer ${layer} does not contain entity!`);
			} else {
				this.layers[layer].splice(this.layers[layer].indexOf(entity), 1);
			}
		}

		if (!(entity instanceof ERLine)) {
			for (const layer of this.layers) {
				const toRemove = layer.filter((e) => e instanceof ERLine && (e.from === entity || e.to === entity));
				toRemove.forEach((line) => layer.splice(layer.indexOf(line), 1));
			}
		}
	}

	public start(): void {
		this._tick();
	}

	public on<T extends keyof EngineEvents>(evt: T, listener: EngineEvents[T]): () => void {
		this._listeners[evt].push(listener);

		return () => {
			this._listeners[evt].splice(this._listeners[evt].indexOf(listener), 1);
		};
	}

	public async createEntity(getData: () => Promise<EREntityData>): Promise<EREntity | null> {
		try {
			const dummyEntity = new DummyEREntity();

			this.add(dummyEntity, 1);

			const pos = await new Promise<Point>((resolve) => {
				this.on('entityClicked', () => {
					resolve(dummyEntity.position);
				});
			});
			this.remove(dummyEntity, 1);

			const data = await getData();

			const entity = new EREntity(data.label, data.weak);
			entity.position = pos.clone();

			this.add(entity, 1);

			return entity;
		} catch (e: unknown) {
			console.error(e);
			return null;
		}
	}

	public async createAttribute(getData: () => Promise<ERAttributeData>): Promise<ERAttribute | null> {
		try {
			const dummyEntity = new DummyERAttribute();

			this.add(dummyEntity, 1);

			const pos = await new Promise<Point>((resolve) => {
				this.on('entityClicked', () => {
					resolve(dummyEntity.position);
				});
			});
			this.remove(dummyEntity, 1);

			const data = await getData();

			const entity = new ERAttribute(data.label, data.key, data.partial, data.multiValued, data.derived);
			entity.position = pos.clone();

			this.add(entity, 1);

			return entity;
		} catch (e: unknown) {
			console.error(e);
			return null;
		}
	}

	public async createRelationship(getData: () => Promise<ERRelationshipData>): Promise<ERRelationship | null> {
		try {
			const dummyEntity = new DummyERRelationship();

			this.add(dummyEntity, 1);

			const pos = await new Promise<Point>((resolve) => {
				this.on('entityClicked', () => {
					resolve(dummyEntity.position);
				});
			});
			this.remove(dummyEntity, 1);

			const data = await getData();

			const entity = new ERRelationship(data.label, data.identifying, this.renderEngine);
			entity.position = pos.clone();

			this.add(entity, 1);

			return entity;
		} catch (e: unknown) {
			console.error(e);
			return null;
		}
	}

	public async createLabel(getData: () => Promise<ERLabelData>): Promise<ERLabel | null> {
		try {
			const dummyEntity = new DummyERLabel();

			this.add(dummyEntity, 1);

			const pos = await new Promise<Point>((resolve) => {
				this.on('entityClicked', () => {
					resolve(dummyEntity.position);
				});
			});
			this.remove(dummyEntity, 1);

			const data = await getData();

			const entity = new ERLabel(data.label);
			entity.position = pos.clone();

			this.add(entity, 1);

			return entity;
		} catch (e: unknown) {
			console.error(e);
			return null;
		}
	}

	private _tick(): void {
		requestAnimationFrame(() => this._tick());

		if (!this._mouseDown) {
			this._updateSelectedEntity();
		}

		if (this._selectedEntity) {
			this.canvas.style.cursor = 'pointer';
		} else {
			this.canvas.style.cursor = 'unset';
		}

		const relationshipLinks: [ERRelationship, EREntity, ERLine][] = [];
		this.layers.forEach((layer) => {
			layer.forEach((entity) => {
				if (entity instanceof ERLine) {
					if (entity.from instanceof ERRelationship && entity.to instanceof EREntity) {
						let relationship;
						if ((relationship = relationshipLinks.find(([r, e]) => entity.from === r && entity.to === e))) {
							relationship[2].recursionState = RecursionSide.LEFT;
							entity.recursionState = RecursionSide.RIGHT;
						} else {
							relationshipLinks.push([entity.from, entity.to, entity]);
						}
					} else if (entity.to instanceof ERRelationship && entity.from instanceof EREntity) {
						let relationship;
						if ((relationship = relationshipLinks.find(([r, e]) => entity.to === r && entity.from === e))) {
							relationship[2].recursionState = RecursionSide.LEFT;
							entity.recursionState = RecursionSide.RIGHT;
						} else {
							relationshipLinks.push([entity.to, entity.from, entity]);
						}
					}
				}
			});
		});

		this.layers.forEach((layer) => {
			layer.forEach((entity) => {
				entity.update({
					selected: this._selectedEntity === entity,
					mouse: { down: this._mouseDown, delta: this._mouseDelta, position: this._mousePos?.clone() || null } as MouseData
				});
			});
		});

		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.fillStyle = 'white';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.fillStyle = 'black';
		this.layers.forEach((layer) => {
			layer.forEach((entity) => {
				entity.render(this.renderEngine, {
					selected: this._selectedEntity === entity,
					mouse: null
				});
			});
		});

		if (this._mouseDelta) {
			this._mouseDelta = new Point();
		}
	}

	private _updateSelectedEntity(): void {
		if (this._mousePos) {
			const reversedLayers = this.layers.reduce<Entity[][]>((arr, layer) => [layer, ...arr], []);

			for (const layer of reversedLayers) {
				const reversedEntities = layer.reduce<Entity[]>((arr, entity) => [entity, ...arr], []);

				for (const entity of reversedEntities) {
					if (entity.selectedBy(this._mousePos, (label: string) => this.renderEngine.measure(label))) {
						this._selectedEntity = entity;
						return;
					}
				}
			}
		}

		this._selectedEntity = null;
	}
}

