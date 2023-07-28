<script lang="ts">
	import { Button, Card, Group, Image, SimpleGrid, Stack, Title } from '@svelteuidev/core';
	import axios from 'axios';
	import { onMount } from 'svelte';
	import type { ERDiagram } from '../../app';
	import { BACKEND_URL } from '../../utils/env';

	let diagrams: ERDiagram[] = [];

	onMount(() => {
		axios.get<ERDiagram[]>(BACKEND_URL).then((res) => {
			diagrams = res.data;
		});
	});
</script>

<SimpleGrid
	breakpoints={[
		{ minWidth: 2000, cols: 5, spacing: 'md' },
		{ minWidth: 1600, cols: 4, spacing: 'md' },
		{ minWidth: 1200, cols: 3, spacing: 'md' },
		{ minWidth: 800, cols: 2, spacing: 'md' },
		{ minWidth: 400, cols: 1, spacing: 'md' }
	]}
>
	{#each diagrams as diagram}
		<Card shadow="md" padding="lg">
			<Image src={diagram.preview} alt="Preview" />
			<Stack>
				<Group position="apart">
					<Title>{diagram.name}</Title>
					<Title order={3}>{diagram.author}</Title>
				</Group>
				<Button variant="light" href={`${diagram._id}`} target="_blank" rel="noreferrer noopener">Visit</Button>
			</Stack>
		</Card>
	{/each}
</SimpleGrid>
