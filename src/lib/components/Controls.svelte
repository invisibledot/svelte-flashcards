<script>
    let { isFlipped, onFlip, onPrev, onNext, onMarkCard } = $props();
</script>

<div class="controls">
    {#if isFlipped}
        <!-- Display Grading Buttons on the Back of the Card -->
        <button class="score-btn incorrect" onclick={() => onMarkCard('incorrect')}>
            ✕ Wrong
        </button>
        <button class="score-btn correct" onclick={() => onMarkCard('correct')}>
            ✓ Right
        </button>
    {:else}
        <!-- Display Standard Navigation on the Front of the Card -->
        <button class="nav-btn" onclick={onPrev}>Previous</button>
        <button class="nav-btn" onclick={onFlip}>Flip</button>
        <button class="nav-btn" onclick={onNext}>Next</button>
    {/if}
</div>