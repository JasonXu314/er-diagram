<script lang="ts">
	import { Button, Checkbox, Modal, Stack, TextInput } from '@svelteuidev/core';
	import type { InputElementType } from '@svelteuidev/core/types/components/Input/Input';
	import { createEventDispatcher } from 'svelte';
	import type { ERAttributeData } from '../../utils/attribute';

	export let opened: boolean;
	let label: string = '',
		key: boolean = false,
		partial: boolean = false,
		multiValued: boolean = false,
		derived: boolean = false,
		element: InputElementType;

	$: {
		if (!key) {
			partial = false;
		}
	}

	$: {
		if (opened && element) {
			setTimeout(() => {
				const input = element.querySelector('input');
				input!.focus();
			}, 0);
		}
	}

	const dispatcher = createEventDispatcher<{ submit: ERAttributeData; cancel: void }>();
</script>

<Modal {opened} on:close={() => dispatcher('cancel')} title="Create Attribute">
	<Stack>
		<TextInput label="Attribute Label" bind:element bind:value={label} />
		<Checkbox label="Key?" bind:checked={key} />
		{#if key}
			<Checkbox label="Partial Key?" bind:checked={partial} />
		{/if}
		<Checkbox label="Multi-Valued?" bind:checked={multiValued} />
		<Checkbox label="Derived Attribute?" bind:checked={derived} />
		<Button
			on:click={() => {
				dispatcher('submit', { label, key, partial, multiValued, derived });
				label = '';
				key = false;
				partial = false;
				multiValued = false;
				derived = false;
			}}>Ok</Button
		>
	</Stack>
</Modal>
