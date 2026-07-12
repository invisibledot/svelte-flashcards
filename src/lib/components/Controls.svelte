<script>
    let { isFlipped, onFlip, onPrev, onNext, onMarkCard } = $props();
</script>

<div class="controls">
    {#if isFlipped}
        <!-- Modified to pass true/false parameters to our calculation engine -->
        <button class="score-btn incorrect" onclick={() => onMarkCard(false)}>
            ✕ Forgot
        </button>
        <button class="score-btn correct" onclick={() => onMarkCard(true)}>
            ✓ Remembered
        </button>
    {:else}
        <button class="nav-btn" onclick={onPrev}>Previous</button>
        <button class="nav-btn" onclick={onFlip}>Flip</button>
        <button class="nav-btn" onclick={onNext}>Next</button>
    {/if}
</div>