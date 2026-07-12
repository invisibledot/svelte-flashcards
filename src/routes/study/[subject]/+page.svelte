<script>
    import FilterPanel from '$lib/components/FilterPanel.svelte';
    import Flashcard from '$lib/components/Flashcard.svelte';
    import Controls from '$lib/components/Controls.svelte';

    let { data } = $props();
    const allCards = data.cards;
    
    const categories = ['All', ...new Set(allCards.map(c => c.category))];
    const tags = [...new Set(allCards.flatMap(c => c.tags || []))];

    let activeCategories = $state(new Set(['All']));
    let activeTags = $state(new Set());
    let currentIndex = $state(0);
    let isFlipped = $state(false);
    let reviewWrongOnly = $state(false);

    // 🔄 1. Load scores from localStorage on startup
    let cardScores = $state({});
    
    $effect(() => {
        const savedScores = localStorage.getItem('flashcard-scores');
        if (savedScores) {
            try {
                cardScores = JSON.parse(savedScores);
            } catch (e) {
                console.error("Failed to parse saved flashcard scores:", e);
            }
        }
    });

    // 🔄 2. Automatically save scores to localStorage whenever cardScores is updated
    $effect(() => {
        const scoreString = JSON.stringify(cardScores);
        localStorage.setItem('flashcard-scores', scoreString);
    });

    // Filter Engine
    let filteredCards = $derived(
        allCards.filter(card => {
            const matchesCategory = activeCategories.has('All') || activeCategories.has(card.category);
            const matchesTags = activeTags.size === 0 || card.tags.some(t => activeTags.has(t));
            const matchesWrongFilter = !reviewWrongOnly || cardScores[card.id] === 'incorrect';
            
            return matchesCategory && matchesTags && matchesWrongFilter;
        })
    );

    let currentCard = $derived(filteredCards[currentIndex] || null);

    function markCard(status) {
        if (!currentCard) return;
        cardScores[currentCard.id] = status;
        setTimeout(() => { nextCard(); }, 200);
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
        isFlipped = false;
        currentIndex = (currentIndex + 1) % filteredCards.length;
    }

    function prevCard() {
        if (filteredCards.length === 0) return;
        isFlipped = false;
        currentIndex = (currentIndex - 1 + filteredCards.length) % filteredCards.length;
    }
</script>

<main class="container">
<a href="/" class="back-hub-link">
        <span>← Back to Hub</span>
    </a>
    <!-- Review Mode Toggle Row -->
    <div style="margin-bottom: 1rem; text-align: right;">
        <button 
            class="tag-btn" 
            style="background: {reviewWrongOnly ? '#ef4444' : 'transparent'}; color: {reviewWrongOnly ? 'white' : 'var(--text-muted)'}; border-color: {reviewWrongOnly ? '#ef4444' : 'var(--text-hint)'}; font-weight: 600;"
            onclick={() => { reviewWrongOnly = !reviewWrongOnly; currentIndex = 0; isFlipped = false; }}
        >
            🚨 Review Missed Cards Only ({Object.values(cardScores).filter(v => v === 'incorrect').length})
        </button>
    </div>

    <!-- 🛠️ RESTORED FILTER PANEL COMPONENT HERE -->
    <FilterPanel 
        {categories} 
        {tags} 
        {activeCategories} 
        {activeTags} 
        onToggleCategory={toggleCategory} 
        onToggleTag={toggleTag} 
    />

    {#if currentCard}
        <Flashcard 
            {currentCard} 
            {isFlipped} 
            onFlip={() => isFlipped = !isFlipped} 
        />

        <Controls 
            {isFlipped} 
            onFlip={() => isFlipped = !isFlipped} 
            onPrev={prevCard} 
            onNext={nextCard} 
            onMarkCard={markCard} 
        />
    {:else}
        <div class="empty-state">
            <p>Inga kort matchar valda filter.</p>
            <p style="font-size: 0.9rem; color: var(--text-muted);">Try picking different filters above!</p>
        </div>
    {/if}
</main>