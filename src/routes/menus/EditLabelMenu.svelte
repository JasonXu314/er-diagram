<script lang="ts">
	import { Menu } from '@svelteuidev/core';
	import { Trash } from 'radix-icons-svelte';
	import { createEventDispatcher } from 'svelte';
	import type { ERLabel } from '../../utils/label';
	import type { Point } from '../../utils/point';

	export let editingLabel: ERLabel, menuLocation: Point;

	const dispatch = createEventDispatcher<{ delete: ERLabel }>();
</script>

<Menu style="position: absolute; left: {menuLocation.x}px; top: {menuLocation.y}px;" opened on:close>
	<div slot="control" />
	<Menu.Item icon={Trash} on:click={() => dispatch('delete', editingLabel)}>Delete</Menu.Item>
</Menu>
