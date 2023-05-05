<script lang="ts">
	import { page } from '$app/stores';
	import axios from 'axios';
	import { onMount } from 'svelte';
	import type { ERDiagram } from '../../app';
	import DiagramMaker from '../../components/DiagramMaker.svelte';
	import { BACKEND_URL } from '../../utils/env';

	let dehydratedDiagram: ERDiagram | null = null,
		id = $page.params.id;

	onMount(() => {
		axios
			.get(`${BACKEND_URL}/${id}`)
			.then((res) => {
				dehydratedDiagram = res.data;
			})
			.catch((err) => {
				console.error(err);
			});
	});
</script>

{#if dehydratedDiagram}
	<DiagramMaker {dehydratedDiagram} />
{/if}
