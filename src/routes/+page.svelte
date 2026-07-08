<script>
    let { data } = $props();
    const allCards = data.cards;
    
    // 1. Gather all unique categories and individual tags from the deck
    const categories = ['All', ...new Set(allCards.map(c => c.category))];
    const tags = [...new Set(allCards.flatMap(c => c.tags || []))];

    // 2. Track multiple active filters using Sets
    let activeCategories = $state(new Set(['All']));
    let activeTags = $state(new Set());
    
    let currentIndex = $state(0);
    let isFlipped = $state(false);

    // 3. The engine: match cards that fit BOTH selected categories AND tags
    let filteredCards = $derived(
        allCards.filter(card => {
            const matchesCategory = activeCategories.has('All') || activeCategories.has(card.category);
            const matchesTags = activeTags.size === 0 || card.tags.some(t => activeTags.has(t));
            return matchesCategory && matchesTags;
        })
    );

    // Safely grab the current card
    let currentCard = $derived(filteredCards[currentIndex] || null);

    // 4. Toggle function for Category buttons
    function toggleCategory(category) {
        if (category === 'All') {
            activeCategories = new Set(['All']);
        } else {
            activeCategories.delete('All');
            if (activeCategories.has(category)) {
                activeCategories.delete(category);
                if (activeCategories.size === 0) activeCategories.add('All');
            } else {
                activeCategories.add(category);
            }
        }
        activeCategories = new Set(activeCategories);
        currentIndex = 0;
        isFlipped = false;
    }

    // 5. Toggle function for Tag buttons
    function toggleTag(tag) {
        if (activeTags.has(tag)) {
            activeTags.delete(tag);
        } else {
            activeTags.add(tag);
        }
        activeTags = new Set(activeTags);
        currentIndex = 0;
        isFlipped = false;
    }

    // 6. Navigation Control Engines (Added missing functions)
    function nextCard() {
        if (filteredCards.length === 0) return;
        isFlipped = false;
        // Loops back to beginning if reaching the end
        currentIndex = (currentIndex + 1) % filteredCards.length;
    }

    function prevCard() {
        if (filteredCards.length === 0) return;
        isFlipped = false;
        // Loops to the end if clicking backward from the first card
        currentIndex = (currentIndex - 1 + filteredCards.length) % filteredCards.length;
    }
</script>

<main class="container">
    <!-- Filter Panel Layout -->
    <div class="filter-panel">
        <!-- Category Group -->
        <div class="filter-group">
            <h3>Categories:</h3>
            <div class="filter-bar">
                {#each categories as category}
                    <button 
                        class="filter-btn" 
                        class:active={activeCategories.has(category)}
                        onclick={() => toggleCategory(category)}
                    >
                        {category}
                    </button>
                {/each}
            </div>
        </div>

        <!-- Tags Group -->
        {#if tags.length > 0}
            <div class="filter-group">
                <h3>Tags:</h3>
                <div class="filter-bar">
                    {#each tags as tag}
                        <button 
                            class="tag-btn" 
                            class:active={activeTags.has(tag)}
                            onclick={() => toggleTag(tag)}
                        >
                            #{tag}
                        </button>
                    {/each}
                </div>
            </div>
        {/if}
    </div>

    <!-- Conditional check: Safe view rendering if matching cards exist -->
    {#if currentCard}
        <!-- Flashcard Container -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="card-wrapper" onclick={() => (isFlipped = !isFlipped)}>
            <div class="card" class:flipped={isFlipped}>
                
                <!-- FRONT FACE -->
                <div class="card-face front">
                    {#if currentCard.frontimage}
                        <img class="card-img-full" src={currentCard.frontimage} alt={currentCard.question} />
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
                        <img class="card-img-full" src={currentCard.backimage} alt={currentCard.answer} />
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

        <!-- Controls View Panel -->
        <div class="controls">
            <button class="nav-btn" onclick={prevCard}>Previous</button>
            <button class="nav-btn" onclick={() => (isFlipped = !isFlipped)}>Flip</button>
            <button class="nav-btn" onclick={nextCard}>Next</button>
        </div>
    {:else}
        <!-- Safe Fallback Empty State: Displayed if selected filter combination has 0 cards -->
        <div class="empty-state">
            <p>Inga kort matchar valda filter.</p>
            <p style="font-size: 0.9rem; color: var(--text-muted);">Try picking different filters above!</p>
        </div>
    {/if}
</main>