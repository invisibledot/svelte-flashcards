<script>
    import FilterPanel from '$lib/components/FilterPanel.svelte';
    import Flashcard from '$lib/components/Flashcard.svelte';
    import Controls from '$lib/components/Controls.svelte';

    let { data } = $props();
    const allCards = data.cards;
    const subject = data.subject;
    
    const categories = ['All', ...new Set(allCards.map(c => c.category))];
    const tags = [...new Set(allCards.flatMap(c => c.tags || []))];

    let activeCategories = $state(new Set(['All']));
    let activeTags = $state(new Set());
    let currentIndex = $state(0);
    let isFlipped = $state(false);
    let isTransitioning = $state(false);

    // 🔄 Leitner State System Matrix
    let sessionCount = $state(1);
    let cardProfiles = $state({}); // Stores: { "cardId": { box: 2 } }

    // Load state safely on browser launch (runs client-side only)
    $effect(() => {
        const savedProfiles = localStorage.getItem(`flashcard-profiles-${subject}`);
        const savedSession = localStorage.getItem(`flashcard-session-${subject}`);
        if (savedProfiles) cardProfiles = JSON.parse(savedProfiles);
        if (savedSession) sessionCount = parseInt(savedSession, 10) || 1;
    });

    // Automatically synchronize profile adjustments to local storage
    $effect(() => {
        localStorage.setItem(`flashcard-profiles-${subject}`, JSON.stringify(cardProfiles));
        localStorage.setItem(`flashcard-session-${subject}`, sessionCount.toString());
    });

    // 🎯 Clean Spaced Repetition Filter Engine (Duplicates Removed)
    let filteredCards = $derived(
        allCards.filter(card => {
            const matchesCategory = activeCategories.has('All') || activeCategories.has(card.category);
            const matchesTags = activeTags.size === 0 || card.tags.some(t => activeTags.has(t));
            
            // Fetch current box profile level (Defaults to Box 1)
            const currentBox = cardProfiles[card.id]?.box || 1;

            // Leitner Interval Math:
            let matchesInterval = true;
            if (currentBox === 2 && sessionCount % 2 !== 0) matchesInterval = false;
            if (currentBox === 3 && sessionCount % 4 !== 0) matchesInterval = false;

            return matchesCategory && matchesTags && matchesInterval;
        })
    );

    let currentCard = $derived(filteredCards[currentIndex] || null);

    // 🚀 Leitner Card Progression Manager (Cleaned up)
    function markCard(isCorrect) {
        if (!currentCard) return;

        // Process Leitner scores immediately
        const currentBox = cardProfiles[currentCard.id]?.box || 1;
        let nextBox = isCorrect ? Math.min(3, currentBox + 1) : 1;
        cardProfiles[currentCard.id] = { box: nextBox };

        // 🚀 ACTIVATE THE SHIELD: Blank out all text immediately before the turn begins
        isTransitioning = true;
        isFlipped = false;

        // Wait for the physical card body to turn back around completely blank
        setTimeout(() => {
            if (currentIndex >= filteredCards.length - 1) {
                currentIndex = 0;
                sessionCount += 1;
                
                setTimeout(() => {
                    alert(`🎉 Session complete! Advancing to Study Session #${sessionCount}.`);
                    // Deactivate shield only after data pools settle
                    isTransitioning = false; 
                }, 50);
            } else {
                currentIndex += 1;
                
                // 🚀 Give Svelte a tiny 50ms window to render the text inside the front page container
                // before dropping the transparency shield. This completely eliminates any layout flickering!
                setTimeout(() => {
                    isTransitioning = false;
                }, 10);
            }
        }, 400); // Matches your CSS animation turn duration
    }

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

    function nextCard() {
        if (filteredCards.length === 0) return;
        
        if (isFlipped) {
            isFlipped = false;
            setTimeout(() => {
                currentIndex = (currentIndex + 1) % filteredCards.length;
            }, 400);
        } else {
            currentIndex = (currentIndex + 1) % filteredCards.length;
        }
    }

    function prevCard() {
        if (filteredCards.length === 0) return;
        
        if (isFlipped) {
            isFlipped = false;
            setTimeout(() => {
                currentIndex = (currentIndex - 1 + filteredCards.length) % filteredCards.length;
            }, 400);
        } else {
            currentIndex = (currentIndex - 1 + filteredCards.length) % filteredCards.length;
        }
    }
</script>

<main class="container">
    <!-- 1. Navigation Element positioned up top -->
    <a href="/" class="back-hub-link">
        <span>← Back to Hub</span>
    </a>

    <!-- 2. Spaced Repetition Statistics Panel -->
    <div class="filter-panel" style="margin-bottom: 1rem; font-size: 0.85rem; padding: 12px;">
        <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 6px;">
            <span>📅 Study Session: #{sessionCount}</span>
            <span style="color: var(--primary);">📝 Queue: {filteredCards.length} left</span>
        </div>
        <div style="display: flex; gap: 8px; color: var(--text-muted); justify-content: space-between; border-top: 1px solid var(--bg-app); padding-top: 6px;">
            <span>Box 1 (Daily): {allCards.filter(c => (cardProfiles[c.id]?.box || 1) === 1).length}</span>
            <span>Box 2 (Every 2): {allCards.filter(c => cardProfiles[c.id]?.box === 2).length}</span>
            <span>Box 3 (Every 4): {allCards.filter(c => cardProfiles[c.id]?.box === 3).length}</span>
        </div>
    </div>

    <!-- 3. Interactive Core Space -->
    {#if currentCard}
        <Flashcard 
            {currentCard} 
            {isFlipped} 
            {isTransitioning}
            onFlip={() => { if (!isTransitioning) isFlipped = !isFlipped; }} 
        />

        <Controls 
            {isFlipped} 
            onFlip={() => isFlipped = !isFlipped} 
            onPrev={prevCard} 
            onNext={nextCard} 
            onMarkCard={markCard} 
        />
    {:else}
        <div class="empty-state" style="margin-top: 2rem;">
            <p>Inga kort matchar valda filter.</p>
            <p style="font-size: 0.9rem; color: var(--text-muted);">Try picking different filters above or wait for the next session cycle!</p>
        </div>
    {/if}

    <!-- 4. Category & Tag Filters panel -->
    <FilterPanel 
        {categories} 
        {tags} 
        {activeCategories} 
        {activeTags} 
        onToggleCategory={toggleCategory} 
        onToggleTag={toggleTag} 
    />
</main>