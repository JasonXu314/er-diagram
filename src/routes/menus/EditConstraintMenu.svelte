<script lang="ts">
	import { Menu } from '@svelteuidev/core';
	import { Check, Trash } from 'radix-icons-svelte';
	import { createEventDispatcher } from 'svelte';
	import { ERConstraintType, type ERConstraint } from '../../utils/constraint';
	import type { Point } from '../../utils/point';

	export let editingConstraint: ERConstraint, menuLocation: Point;

	const dispatch = createEventDispatcher<{ delete: ERConstraint }>();
</script>

<Menu style="position: absolute; left: {menuLocation.x}px; top: {menuLocation.y}px;" opened on:close>
	<div slot="control" />
	<Menu.Item icon={Trash} on:click={() => dispatch('delete', editingConstraint)}>Delete</Menu.Item>
	<Menu.Item
		icon={editingConstraint.type === ERConstraintType.DISJOINT ? Check : undefined}
		on:click={() => {
			editingConstraint.type = ERConstraintType.DISJOINT;
		}}>Disjoint</Menu.Item
	>
	<Menu.Item
		icon={editingConstraint.type === ERConstraintType.OVERLAPPING ? Check : undefined}
		on:click={() => {
			editingConstraint.type = ERConstraintType.OVERLAPPING;
		}}>Overlapping</Menu.Item
	>
</Menu>
