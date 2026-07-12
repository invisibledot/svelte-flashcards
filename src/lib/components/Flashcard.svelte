<script>
    let { currentCard, isFlipped, onFlip } = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="card-wrapper" onclick={onFlip}>
    <div class="card" class:flipped={isFlipped}>
        
        <!-- FRONT FACE -->
        <div class="card-face front">
            {#if currentCard.frontimage}
                <img class="card-img" src={currentCard.frontimage} alt={currentCard.question} />
            {:else}
                <h2>{currentCard.question}</h2>
            {/if}
            
            {#if currentCard.frontsubtext}
                <p class="card-subtext">{currentCard.frontsubtext}</p>
            {/if}
            
            <p class="hint">Click to reveal answer</p>
        </div>

        <!-- BACK FACE -->
        <div class="card-face back">
            {#if currentCard.backimage}
                <img class="card-img" src={currentCard.backimage} alt={currentCard.answer} />
            {:else}
                <h2>{currentCard.answer}</h2>
            {/if}
            
            {#if currentCard.backsubtext}
                <p class="card-subtext">{currentCard.backsubtext}</p>
            {/if}
            
            {#if currentCard.notes}
                <p class="notes">{currentCard.notes}</p>
            {/if}
        </div>

    </div>
</div>