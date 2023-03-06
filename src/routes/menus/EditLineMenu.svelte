<script lang="ts">
	import { Menu } from '@svelteuidev/core';
	import { Check, Trash } from 'radix-icons-svelte';
	import { createEventDispatcher } from 'svelte';
	import type { ERLine } from '../../utils/line';
	import type { Point } from '../../utils/point';

	export let editingLine: ERLine, menuLocation: Point;
	let double: boolean = editingLine.double;

	const dispatch = createEventDispatcher<{ delete: ERLine }>();
</script>

<Menu style="position: absolute; left: {menuLocation.x}px; top: {menuLocation.y}px;" opened on:close>
	<div slot="control" />
	<Menu.Item icon={Trash} on:click={() => dispatch('delete', editingLine)}>Delete</Menu.Item>
	<Menu.Item
		icon={double ? Check : undefined}
		on:click={() => {
			editingLine.double = !double;
			double = !double;
		}}
	>
		Double Line
	</Menu.Item>
</Menu>
