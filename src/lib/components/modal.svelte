<script>
	export let showModal; // boolean
	export let modalContent; // element
	export let modalContentProps = {}; // props for element

	let dialog; // HTMLDialogElement

	$: if (dialog && showModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<dialog
	bind:this={dialog}
	on:close={() => (showModal = false)}
	on:click|self={() => dialog.close()}
>
	<div on:click|stopPropagation>
		<div class="flex flex-row w-full items-center align-middle pb-1">
			<div class="w-full font-semibold">
				<slot name="header"/>
			</div>
			<!-- svelte-ignore a11y-autofocus -->
			<button class="btn-error grow-0 shrink-0 basis-8" autofocus on:click={() => dialog.close()}>X</button>
		</div>
		<hr class="py-2"/>
		<div id="modal-component">
			<svelte:component on:click this={modalContent} {...modalContentProps} {dialog}/>
		</div>
	</div>
</dialog>

<style>
	dialog {
		max-width: 32em;
		border-radius: 0.2em;
		border: none;
		padding: 0;
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
	dialog > div {
		padding: 1em;
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	button {
		display: block;
	}
</style>
