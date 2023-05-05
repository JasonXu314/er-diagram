<script lang="ts">
	import { goto } from '$app/navigation';
	import { hotkey } from '@svelteuidev/composables';
	import { Button, Group, Modal, Space, TextInput, Tooltip } from '@svelteuidev/core';
	import axios from 'axios';
	import { onMount } from 'svelte';
	import type { ERDiagram } from '../app';
	import { ERAttribute, type ERAttributeData } from '../utils/attribute';
	import { ERConstraint, type ERConstraintData } from '../utils/constraint';
	import { Engine, MouseButton } from '../utils/engine';
	import type { Entity } from '../utils/entity';
	import { BACKEND_URL } from '../utils/env';
	import { EREntity, type EREntityData } from '../utils/erEntity';
	import { ERLabel, type ERLabelData } from '../utils/label';
	import { ERLine } from '../utils/line';
	import { Point } from '../utils/point';
	import { ERRelationship, type ERRelationshipData } from '../utils/relationship';
	import EditAttributeMenu from './menus/EditAttributeMenu.svelte';
	import EditConstraintMenu from './menus/EditConstraintMenu.svelte';
	import EditEntityMenu from './menus/EditEntityMenu.svelte';
	import EditLabelMenu from './menus/EditLabelMenu.svelte';
	import EditLineMenu from './menus/EditLineMenu.svelte';
	import EditRelationshipMenu from './menus/EditRelationshipMenu.svelte';
	import CreateAttributeModal from './modals/CreateAttributeModal.svelte';
	import CreateConstraintModal from './modals/CreateConstraintModal.svelte';
	import CreateEntityModal from './modals/CreateEntityModal.svelte';
	import CreateLabelModal from './modals/CreateLabelModal.svelte';
	import CreateRelationshipModal from './modals/CreateRelationshipModal.svelte';

	enum ModalState {
		NONE,
		CREATE_ENTITY,
		CREATE_ATTRIBUTE,
		CREATE_RELATIONSHIP,
		CREATE_LABEL,
		CREATE_CONSTRAINT,
		UPLOAD
	}

	enum MenuState {
		NONE,
		EDITING_ENTITY,
		EDITING_ATTRIBUTE,
		EDITING_LINE,
		EDITING_LABEL,
		EDITING_RELATIONSHIP,
		EDITING_CONSTRAINT
	}

	export let dehydratedDiagram: ERDiagram | null = null;

	let name: string, author: string;

	let canvas: HTMLCanvasElement | undefined,
		engine: Engine | null,
		drawingLine = false,
		modalState: ModalState = ModalState.NONE,
		menuState: MenuState = MenuState.NONE,
		menuLocation: Point | null = null,
		editingEntity: EREntity | null = null,
		editingAttribute: ERAttribute | null = null,
		editingLine: ERLine | null = null,
		editingLabel: ERLabel | null = null,
		editingRelationship: ERRelationship | null = null,
		editingConstraint: ERConstraint | null = null,
		entityResolver: (data: EREntityData) => void = () => {},
		entityCanceler: () => void = () => {},
		attributeResolver: (data: ERAttributeData) => void = () => {},
		attributeCanceler: () => void = () => {},
		relationshipResolver: (data: ERRelationshipData) => void = () => {},
		relationshipCanceler: () => void = () => {},
		labelResolver: (data: ERLabelData) => void = () => {},
		labelCanceler: () => void = () => {},
		constraintResolver: (data: ERConstraintData) => void = () => {},
		constraintCanceler: () => void = () => {},
		cancelLine: () => void = () => {};

	onMount(() => {
		if (canvas) {
			engine = new Engine(canvas);

			if (dehydratedDiagram) {
				engine.load(JSON.parse(dehydratedDiagram.diagram));
			}

			engine.start();
			(window as any).engine = engine;

			engine.on('entityClicked', (entity, metadata) => {
				if (metadata.button === MouseButton.RIGHT) {
					if (entity instanceof EREntity) {
						menuState = MenuState.EDITING_ENTITY;
						editingEntity = entity;
						menuLocation = metadata.pagePos.add(new Point(-25, 12.5));
					} else if (entity instanceof ERAttribute) {
						menuState = MenuState.EDITING_ATTRIBUTE;
						editingAttribute = entity;
						menuLocation = metadata.pagePos.add(new Point(-25, 12.5));
					} else if (entity instanceof ERLine) {
						menuState = MenuState.EDITING_LINE;
						editingLine = entity;
						menuLocation = metadata.pagePos.add(new Point(5, 0));
					} else if (entity instanceof ERRelationship) {
						menuState = MenuState.EDITING_RELATIONSHIP;
						editingRelationship = entity;
						menuLocation = metadata.pagePos.add(new Point(-25, 12.5));
					} else if (entity instanceof ERLabel) {
						menuState = MenuState.EDITING_LABEL;
						editingLabel = entity;
						menuLocation = metadata.pagePos.add(new Point(-5, 12.5));
					} else if (entity instanceof ERConstraint) {
						menuState = MenuState.EDITING_CONSTRAINT;
						editingConstraint = entity;
						menuLocation = metadata.pagePos.add(new Point(-5, 10));
					}
				}
			});
		}
	});

	function createEntity() {
		if (engine) {
			engine.createEntity(async () => {
				modalState = ModalState.CREATE_ENTITY;

				return new Promise<EREntityData>((resolve, reject) => {
					entityResolver = resolve;
					entityCanceler = reject;
				});
			});
		}
	}

	function createAttribute() {
		if (engine) {
			engine.createAttribute(async () => {
				modalState = ModalState.CREATE_ATTRIBUTE;

				return new Promise<ERAttributeData>((resolve, reject) => {
					attributeResolver = resolve;
					attributeCanceler = reject;
				});
			});
		}
	}

	function createRelationship() {
		if (engine) {
			engine.createRelationship(async () => {
				modalState = ModalState.CREATE_RELATIONSHIP;

				return new Promise<ERRelationshipData>((resolve, reject) => {
					relationshipResolver = resolve;
					relationshipCanceler = reject;
				});
			});
		}
	}

	function createLabel() {
		if (engine) {
			engine.createLabel(async () => {
				modalState = ModalState.CREATE_LABEL;

				return new Promise<ERLabelData>((resolve, reject) => {
					labelResolver = resolve;
					labelCanceler = reject;
				});
			});
		}
	}

	function createConstraint() {
		if (engine) {
			engine.createConstraint(async () => {
				modalState = ModalState.CREATE_CONSTRAINT;

				return new Promise<ERConstraintData>((resolve, reject) => {
					constraintResolver = resolve;
					constraintCanceler = reject;
				});
			});
		}
	}

	function createLine() {
		if (engine) {
			let from: Entity | null = null,
				to: Entity | null = null;

			const off = engine.on('entityClicked', (entity, metadata) => {
				if (metadata.button === MouseButton.LEFT) {
					if (!from) {
						from = entity;
					} else {
						to = entity;

						const line = new ERLine(from, to);

						engine?.add(line, 0);

						drawingLine = false;
						off();
					}
				} else {
					drawingLine = false;
					off();
				}
			});

			drawingLine = true;
			cancelLine = () => {
				off();
				drawingLine = false;
			};
		}
	}

	function submitEntityData(evt: CustomEvent<EREntityData>): void {
		const data = evt.detail;

		entityResolver(data);

		entityResolver = () => {};
		entityCanceler = () => {};
		modalState = ModalState.NONE;
	}

	function cancelCreateEntity(): void {
		entityCanceler();

		entityResolver = () => {};
		entityCanceler = () => {};
		modalState = ModalState.NONE;
	}

	function submitAttributeData(evt: CustomEvent<ERAttributeData>): void {
		const data = evt.detail;

		attributeResolver(data);

		attributeResolver = () => {};
		attributeCanceler = () => {};
		modalState = ModalState.NONE;
	}

	function cancelCreateAttribute(): void {
		attributeCanceler();

		attributeResolver = () => {};
		attributeCanceler = () => {};
		modalState = ModalState.NONE;
	}

	function submitRelationshipData(evt: CustomEvent<ERRelationshipData>): void {
		const data = evt.detail;

		relationshipResolver(data);

		relationshipResolver = () => {};
		relationshipCanceler = () => {};
		modalState = ModalState.NONE;
	}

	function cancelCreateRelationship(): void {
		relationshipCanceler();

		relationshipResolver = () => {};
		relationshipCanceler = () => {};
		modalState = ModalState.NONE;
	}

	function submitLabelData(evt: CustomEvent<ERLabelData>): void {
		const data = evt.detail;

		labelResolver(data);

		labelResolver = () => {};
		labelCanceler = () => {};
		modalState = ModalState.NONE;
	}

	function cancelCreateLabel(): void {
		labelCanceler();

		labelResolver = () => {};
		labelCanceler = () => {};
		modalState = ModalState.NONE;
	}

	function submitConstraintData(evt: CustomEvent<ERConstraintData>): void {
		const data = evt.detail;

		constraintResolver(data);

		constraintResolver = () => {};
		constraintCanceler = () => {};
		modalState = ModalState.NONE;
	}

	function cancelCreateConstraint(): void {
		constraintCanceler();

		constraintResolver = () => {};
		constraintCanceler = () => {};
		modalState = ModalState.NONE;
	}

	function showUpload(): void {
		modalState = ModalState.UPLOAD;
	}

	function upload(): void {
		exportImage().then((blob) => {
			if (engine) {
				const data = new FormData();
				data.append('name', name);
				data.append('author', author);
				data.append('diagram', engine.export());
				data.append('preview', blob);

				axios
					.post<ERDiagram>(BACKEND_URL, data)
					.then((res) => {
						goto(`/${res.data._id}`, { replaceState: true });
					})
					.catch((err) => {
						console.error(err);
					});
			}
		});
	}

	function save(): void {
		exportImage().then((blob) => {
			if (engine && dehydratedDiagram) {
				const data = new FormData();
				data.append('diagram', engine.export());
				data.append('preview', blob);

				axios
					.patch(`${BACKEND_URL}/${dehydratedDiagram._id}`, data)
					.then((res) => {
						console.log(res.data);
					})
					.catch((err) => {
						console.error(err);
					});
			}
		});
	}

	function download(): void {
		exportImage().then((blob) => {
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement('a');
			anchor.href = url;
			anchor.download = 'er.png';
			anchor.click();
		});
	}

	async function exportImage(): Promise<Blob> {
		return new Promise((res, rej) => {
			if (canvas) {
				canvas.toBlob((blob) => {
					if (!blob) {
						rej('couldnt export to blob');
					} else {
						res(blob);
					}
				});
			} else {
				rej('No canvas');
			}
		});
	}
</script>

<Group>
	<Tooltip label="Hotkey: e (Entity)">
		<Button use={[[hotkey, modalState === ModalState.NONE ? [['e', createEntity]] : []]]} on:click={createEntity}>Entity</Button>
	</Tooltip>
	<Tooltip label="Hotkey: a (Attribute)">
		<Button use={[[hotkey, modalState === ModalState.NONE ? [['a', createAttribute]] : []]]} on:click={createAttribute}>Attribute</Button>
	</Tooltip>
	{#if drawingLine}
		<Button color="red" on:click={cancelLine}>Cancel</Button>
	{:else}
		<Tooltip label="Hotkey: c (Connect)">
			<Button use={[[hotkey, modalState === ModalState.NONE ? [['c', createLine]] : []]]} on:click={createLine}>Line</Button>
		</Tooltip>
	{/if}
	<Tooltip label="Hotkey: r (Relationship)">
		<Button use={[[hotkey, modalState === ModalState.NONE ? [['r', createRelationship]] : []]]} on:click={createRelationship}>Relationship</Button>
	</Tooltip>
	<Tooltip label="Hotkey: t (Text)">
		<Button use={[[hotkey, modalState === ModalState.NONE ? [['t', createLabel]] : []]]} on:click={createLabel}>Label</Button>
	</Tooltip>
	<Tooltip label="Hotkey: shift + c (Constraint)">
		<Button use={[[hotkey, modalState === ModalState.NONE ? [['shift+c', createConstraint]] : []]]} on:click={createConstraint}>Constraint</Button>
	</Tooltip>
	<Button on:click={dehydratedDiagram ? save : showUpload}>{dehydratedDiagram ? 'Save' : 'Upload'}</Button>
	<Button on:click={download}>Download</Button>
</Group>
<canvas height={800} width={1200} bind:this={canvas} />
<CreateEntityModal opened={modalState === ModalState.CREATE_ENTITY} on:submit={submitEntityData} on:cancel={cancelCreateEntity} />
<CreateAttributeModal opened={modalState === ModalState.CREATE_ATTRIBUTE} on:submit={submitAttributeData} on:cancel={cancelCreateAttribute} />
<CreateRelationshipModal opened={modalState === ModalState.CREATE_RELATIONSHIP} on:submit={submitRelationshipData} on:cancel={cancelCreateRelationship} />
<CreateLabelModal opened={modalState === ModalState.CREATE_LABEL} on:submit={submitLabelData} on:cancel={cancelCreateLabel} />
<CreateConstraintModal opened={modalState === ModalState.CREATE_CONSTRAINT} on:submit={submitConstraintData} on:cancel={cancelCreateConstraint} />
<Modal
	title="Upload Your ER Diagram"
	opened={modalState === ModalState.UPLOAD}
	on:close={() => {
		modalState = ModalState.NONE;
		name = '';
		author = '';
	}}
>
	<TextInput label="Diagram Name" bind:value={name} />
	<TextInput label="Your Name" bind:value={author} />
	<Space h="lg" />
	<Button on:click={upload}>Upload</Button>
</Modal>
{#if menuState === MenuState.EDITING_ENTITY && editingEntity && menuLocation}
	<EditEntityMenu
		{menuLocation}
		{editingEntity}
		on:close={() => {
			menuState = MenuState.NONE;
			editingEntity = null;
			menuLocation = null;
		}}
		on:delete={(evt) => {
			const entity = evt.detail;

			if (engine) {
				engine.remove(entity);
			}
		}}
	/>
{:else if menuState === MenuState.EDITING_ATTRIBUTE && editingAttribute && menuLocation}
	<EditAttributeMenu
		{menuLocation}
		{editingAttribute}
		on:close={() => {
			menuState = MenuState.NONE;
			editingAttribute = null;
			menuLocation = null;
		}}
		on:delete={(evt) => {
			const attribute = evt.detail;

			if (engine) {
				engine.remove(attribute);
			}
		}}
	/>
{:else if menuState === MenuState.EDITING_LINE && editingLine && menuLocation}
	<EditLineMenu
		{menuLocation}
		{editingLine}
		on:close={() => {
			menuState = MenuState.NONE;
			editingAttribute = null;
			menuLocation = null;
		}}
		on:delete={(evt) => {
			const line = evt.detail;

			if (engine) {
				engine.remove(line);
			}
		}}
	/>
{:else if menuState === MenuState.EDITING_LABEL && editingLabel && menuLocation}
	<EditLabelMenu
		{menuLocation}
		{editingLabel}
		on:close={() => {
			menuState = MenuState.NONE;
			editingLabel = null;
			menuLocation = null;
		}}
		on:delete={(evt) => {
			const label = evt.detail;

			if (engine) {
				engine.remove(label);
			}
		}}
	/>
{:else if menuState === MenuState.EDITING_RELATIONSHIP && editingRelationship && menuLocation}
	<EditRelationshipMenu
		{menuLocation}
		{editingRelationship}
		on:close={() => {
			menuState = MenuState.NONE;
			editingRelationship = null;
			menuLocation = null;
		}}
		on:delete={(evt) => {
			const relationship = evt.detail;

			if (engine) {
				engine.remove(relationship);
			}
		}}
	/>
{:else if menuState === MenuState.EDITING_CONSTRAINT && editingConstraint && menuLocation}
	<EditConstraintMenu
		{menuLocation}
		{editingConstraint}
		on:close={() => {
			menuState = MenuState.NONE;
			editingConstraint = null;
			menuLocation = null;
		}}
		on:delete={(evt) => {
			const constraint = evt.detail;

			if (engine) {
				engine.remove(constraint);
			}
		}}
	/>
{/if}

<style>
	canvas {
		margin-top: 1em;
		margin-left: 1em;
		border: 1px solid black;
	}
</style>
