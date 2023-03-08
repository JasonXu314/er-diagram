<script lang="ts">
	import { Button, Modal, RadioGroup, Stack } from '@svelteuidev/core';
	import { createEventDispatcher } from 'svelte';
	import { ERConstraintType, type ERConstraintData } from '../../utils/constraint';

	export let opened: boolean;
	let value: 'd' | 'o' = 'd';

	const dispatcher = createEventDispatcher<{ submit: ERConstraintData; cancel: void }>();
</script>

<Modal {opened} on:close={() => dispatcher('cancel')} title="Create Attribute">
	<Stack>
		<RadioGroup
			label="Constraint Type"
			bind:value
			items={[
				{ label: 'Disjoint', value: 'd' },
				{ label: 'Overlapping', value: 'o' }
			]}
		/>
		<Button
			on:click={() => {
				switch (value) {
					case 'd':
						dispatcher('submit', { type: ERConstraintType.DISJOINT });
						break;
					case 'o':
						dispatcher('submit', { type: ERConstraintType.OVERLAPPING });
						break;
				}
				value = 'd';
			}}>Ok</Button
		>
	</Stack>
</Modal>
