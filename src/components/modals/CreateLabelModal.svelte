<script lang="ts">
	import { Button, Modal, Stack, TextInput } from '@svelteuidev/core';
	import type { InputElementType } from '@svelteuidev/core/types/components/Input/Input';
	import { createEventDispatcher } from 'svelte';
	import type { ERLabelData } from '../../utils/label';

	export let opened: boolean;
	let label: string = '',
		element: InputElementType;

	$: {
		if (opened && element) {
			setTimeout(() => {
				const input = element.querySelector('input');
				input!.focus();
			}, 0);
		}
	}

	const dispatcher = createEventDispatcher<{ submit: ERLabelData; cancel: void }>();
</script>

<Modal {opened} on:close={() => dispatcher('cancel')} title="Create Attribute">
	<Stack>
		<TextInput label="Label Text" bind:element bind:value={label} />
		<Button
			on:click={() => {
				dispatcher('submit', { label });
				label = '';
			}}>Ok</Button
		>
	</Stack>
</Modal>
