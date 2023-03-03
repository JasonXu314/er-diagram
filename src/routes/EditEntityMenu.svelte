<script lang="ts">
	import { Menu } from '@svelteuidev/core';
	import { Check, Trash } from 'radix-icons-svelte';
	import { createEventDispatcher } from 'svelte';
	import type { EREntity } from '../utils/erEntity';
	import type { Point } from '../utils/point';

	export let editingEntity: EREntity, menuLocation: Point;
	let weak: boolean = editingEntity.weak;

	const dispatch = createEventDispatcher<{ delete: EREntity }>();
</script>

<Menu style="position: absolute; left: {menuLocation.x}px; top: {menuLocation.y}px;" opened on:close>
	<div slot="control" />
	<Menu.Item icon={Trash} on:click={() => dispatch('delete', editingEntity)}>Delete</Menu.Item>
	<Menu.Item
		icon={weak ? Check : undefined}
		on:click={() => {
			editingEntity.weak = !weak;
			weak = !weak;
		}}
	>
		Weak Entity
	</Menu.Item>
</Menu>
