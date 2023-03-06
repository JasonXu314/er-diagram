<script lang="ts">
	import { Button, Input, Modal } from '@svelteuidev/core';
	import { createEventDispatcher } from 'svelte';

	export let opened: boolean, resetSubmit: () => void, title: string;
	let name: string = '';

	const dispatcher = createEventDispatcher<{ submit: string }>();
</script>

<Modal
	{opened}
	on:close={() => {
		resetSubmit();
		opened = false;
		title = '';
	}}
	{title}
>
	<Input bind:value={name} />
	<Button
		on:click={() => {
			dispatcher('submit', name);
			name = '';
		}}>Ok</Button
	>
</Modal>
