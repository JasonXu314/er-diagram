<script lang="ts">
	import { Menu } from '@svelteuidev/core';
	import { Check, Trash } from 'radix-icons-svelte';
	import { createEventDispatcher } from 'svelte';
	import type { ERAttribute } from '../utils/attribute';
	import type { Point } from '../utils/point';

	export let editingAttribute: ERAttribute, menuLocation: Point;
	let key: boolean = editingAttribute.key,
		partial: boolean = editingAttribute.partial,
		multiValued: boolean = editingAttribute.multiValued,
		derived: boolean = editingAttribute.derived;

	const dispatch = createEventDispatcher<{ delete: ERAttribute }>();
</script>

<Menu style="position: absolute; left: {menuLocation.x}px; top: {menuLocation.y}px;" opened on:close>
	<div slot="control" />
	<Menu.Item icon={Trash} on:click={() => dispatch('delete', editingAttribute)}>Delete</Menu.Item>
	<Menu.Item
		icon={key ? Check : undefined}
		on:click={() => {
			editingAttribute.key = !key;
			key = !key;

			if (!key && partial) {
				editingAttribute.partial = false;
				partial = false;
			}
		}}
	>
		Key Attribute
	</Menu.Item>
	{#if key}
		<Menu.Item
			icon={partial ? Check : undefined}
			on:click={() => {
				editingAttribute.partial = !partial;
				partial = !partial;
			}}
		>
			Partial Key
		</Menu.Item>
	{/if}
	<Menu.Item
		icon={multiValued ? Check : undefined}
		on:click={() => {
			editingAttribute.multiValued = !multiValued;
			multiValued = !multiValued;
		}}
	>
		Multi-Valued
	</Menu.Item>
	<Menu.Item
		icon={multiValued ? Check : undefined}
		on:click={() => {
			editingAttribute.derived = !derived;
			multiValued = !derived;
		}}
	>
		Derived
	</Menu.Item>
</Menu>
