<script lang="ts">
	import { Button, Checkbox, Modal, Stack, TextInput } from '@svelteuidev/core';
	import type { InputElementType } from '@svelteuidev/core/types/components/Input/Input';
	import { createEventDispatcher } from 'svelte';
	import type { EREntityData } from '../../utils/erEntity';

	export let opened: boolean;
	let label: string = '',
		weak: boolean = false,
		element: InputElementType;

	$: {
		if (opened && element) {
			setTimeout(() => {
				const input = element.querySelector('input');
				input!.focus();
			}, 0);
		}
	}

	const dispatcher = createEventDispatcher<{ submit: EREntityData; cancel: void }>();
</script>

<Modal {opened} on:close={() => dispatcher('cancel')} title="Create Entity">
	<Stack>
		<TextInput label="Entity Label" bind:element bind:value={label} />
		<Checkbox label="Weak Entity?" bind:checked={weak} />
		<Button
			on:click={() => {
				dispatcher('submit', { label, weak });
				label = '';
				weak = false;
			}}>Ok</Button
		>
	</Stack>
</Modal>
