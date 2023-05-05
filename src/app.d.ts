// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

export interface ERDiagram {
	_id: string;
	author: string;
	name: string;
	diagram: string;
	preview: string;
}

