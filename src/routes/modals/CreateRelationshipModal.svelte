<script lang="ts">
	import { Button, Checkbox, Modal, Stack, TextInput } from '@svelteuidev/core';
	import type { InputElementType } from '@svelteuidev/core/types/components/Input/Input';
	import { createEventDispatcher } from 'svelte';
	import type { ERRelationshipData } from '../../utils/relationship';

	export let opened: boolean;
	let label: string = '',
		identifying: boolean = false,
		element: InputElementType;

	$: {
		if (opened && element) {
			setTimeout(() => {
				const input = element.querySelector('input');
				input!.focus();
			}, 0);
		}
	}

	const dispatcher = createEventDispatcher<{ submit: ERRelationshipData; cancel: void }>();
</script>

<Modal {opened} on:close={() => dispatcher('cancel')} title="Create Relationship">
	<Stack>
		<TextInput label="Relationship Label" bind:element bind:value={label} />
		<Checkbox label="Identifying Relationship?" bind:checked={identifying} />
		<Button
			on:click={() => {
				dispatcher('submit', { label, identifying });
				label = '';
				identifying = false;
			}}>Ok</Button
		>
	</Stack>
</Modal>
