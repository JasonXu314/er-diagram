<script lang="ts">
	import { SvelteUIProvider } from '@svelteuidev/core';
</script>

<SvelteUIProvider withNormalizeCSS withGlobalStyles>
	<slot />
</SvelteUIProvider>
