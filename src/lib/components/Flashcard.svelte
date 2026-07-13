<script>
    let { currentCard, isFlipped, isTransitioning, onFlip } = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="card-wrapper" onclick={onFlip}>
    <div class="card" class:flipped={isFlipped}>
        
        <!-- FRONT FACE -->
        <div class="card-face front">
            <div class="fade-content" class:hidden={isFlipped || isTransitioning}>
                <span class="category">{currentCard?.category}</span>
                
                {#if currentCard?.frontimage}
                    <!-- 🖼️ Image-only layout: Question text is moved strictly to the alt attribute -->
                    <img src={currentCard.frontimage} alt={currentCard?.question || 'Question Visual'} class="card-image-hero" />
                {:else}
                    <!-- 📝 Text fallback layout -->
                    <h2>{currentCard?.question}</h2>
                {/if}

                {#if currentCard?.frontsubtext}
                    <p class="card-subtext">{currentCard.frontsubtext}</p>
                {/if}
            </div>
        </div>

        <!-- BACK FACE -->
        <div class="card-face back">
            <div class="fade-content" class:hidden={!isFlipped || isTransitioning}>
                
                {#if currentCard?.backimage}
                    <!-- 🖼️ Image-only layout: Answer text is moved strictly to the alt attribute -->
                    <img src={currentCard.backimage} alt={currentCard?.answer || 'Answer Visual'} class="card-image-hero" />
                {:else}
                    <!-- 📝 Text fallback layout -->
                    <h2>{currentCard?.answer}</h2>
                {/if}

                {#if currentCard?.backsubtext}
                    <p class="card-subtext" style="color: var(--bg-muted);">{currentCard.backsubtext}</p>
                {/if}
                {#if currentCard?.notes}
                    <p class="notes">{currentCard.notes}</p>
                {/if}
            </div>
        </div>
        
    </div>
</div>