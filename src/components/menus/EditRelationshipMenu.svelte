<script lang="ts">
	import { Menu } from '@svelteuidev/core';
	import { Check, Trash } from 'radix-icons-svelte';
	import { createEventDispatcher } from 'svelte';
	import type { Point } from '../../utils/point';
	import type { ERRelationship } from '../../utils/relationship';

	export let editingRelationship: ERRelationship, menuLocation: Point;
	let identifying: boolean = editingRelationship.identifying;

	const dispatch = createEventDispatcher<{ delete: ERRelationship }>();
</script>

<Menu style="position: absolute; left: {menuLocation.x}px; top: {menuLocation.y}px;" opened on:close>
	<div slot="control" />
	<Menu.Item icon={Trash} on:click={() => dispatch('delete', editingRelationship)}>Delete</Menu.Item>
	<Menu.Item
		icon={identifying ? Check : undefined}
		on:click={() => {
			editingRelationship.identifying = !identifying;
			identifying = !identifying;
		}}
	>
		Identifying Relationship
	</Menu.Item>
</Menu>
