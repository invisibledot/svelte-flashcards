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

    // 🔄 Time-Based Spacing State Matrix
    // Stores profiles like: { "cardId": { level: 2, availableAt: 1718919000000 } }
    let cardProfiles = $state({}); 

    // Define real-world time spacing intervals per mastery tier (in milliseconds)
    const TIER_INTERVALS = {
        1: 0,                          // Level 1: Review immediately
        2: 12 * 60 * 60 * 1000,        // Level 2: 12 Hours (Perfect for morning/evening review loops)
        3: 3 * 24 * 60 * 60 * 1000,    // Level 3: 3 Days
        4: 7 * 24 * 60 * 60 * 1000,    // Level 4: 7 Days
        5: 21 * 24 * 60 * 60 * 1000,   // Level 5: 21 Days (Absolute Mastery)
    };

    // Safe launch synchronization
    $effect(() => {
        const savedProfiles = localStorage.getItem(`flashcard-time-profiles-${subject}`);
        if (savedProfiles) cardProfiles = JSON.parse(savedProfiles);
    });

    $effect(() => {
        localStorage.setItem(`flashcard-time-profiles-${subject}`, JSON.stringify(cardProfiles));
    });

    // 🎯 Filter Engine using strict Date comparisons
    let filteredCards = $derived(
        allCards.filter(card => {
            const matchesCategory = activeCategories.has('All') || activeCategories.has(card.category);
            const matchesTags = activeTags.size === 0 || card.tags.some(t => activeTags.has(t));
            
            // Time Check: Pull down current rest state timestamp
            const profile = cardProfiles[card.id];
            const now = Date.now();
            
            // If the card has a futuristic restriction date that hasn't passed yet, hide it!
            const isAvailable = !profile || !profile.availableAt || now >= profile.availableAt;

            return matchesCategory && matchesTags && isAvailable;
        })
    );

    let currentCard = $derived(filteredCards[currentIndex] || null);

    // 🚀 Time-Shift Progression Handler
    function markCard(isCorrect) {
        if (!currentCard) return;

        const currentProfile = cardProfiles[currentCard.id] || { level: 1 };
        let nextLevel = currentProfile.level;

        if (isCorrect) {
            nextLevel = Math.min(5, currentProfile.level + 1);
        } else {
            nextLevel = 1; // Reset right back to level 1 on failure
        }

        // Calculate exact point in time this card is allowed to awake
        const waitTime = TIER_INTERVALS[nextLevel];
        const nextAvailableTimestamp = Date.now() + waitTime;

        // Commit profile adjustments
        cardProfiles[currentCard.id] = {
            level: nextLevel,
            availableAt: nextAvailableTimestamp
        };

        // UI Transition Loop
        isTransitioning = true;
        isFlipped = false;

        setTimeout(() => {
            // Since this card now fails the `isAvailable` test, it will drop out of 
            // the filteredCards array automatically. We don't always need to increment index!
            if (currentIndex >= filteredCards.length) {
                currentIndex = 0;
            }
            
            setTimeout(() => {
                isTransitioning = false;
            }, 50);
        }, 400);
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

<!-- 📊 Real-Time 5-Tier Spacing Dashboard -->
    <div class="filter-panel" style="margin-bottom: 1rem; font-size: 0.85rem; padding: 14px; border-left: 4px solid var(--primary);">
        <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 8px;">
            <span style="display: flex; align-items: center; gap: 4px;">🧠 Due for Review: {filteredCards.length}</span>
            <span style="color: var(--text-muted); font-weight: normal;">⏳ Total Resting: {allCards.length - filteredCards.length}</span>
        </div>
        
        <!-- Grid layout for the 5 Mastery levels -->
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; text-align: center; border-top: 1px solid var(--bg-app); padding-top: 8px; font-size: 0.75rem;">
            <div style="display: flex; flex-direction: column;">
                <span style="font-weight: bold; color: #ef4444;">Lvl 1</span>
                <span style="color: var(--text-muted);">{allCards.filter(c => (cardProfiles[c.id]?.level || 1) === 1).length}</span>
                <span style="font-size: 0.65rem; color: #ef4444; opacity: 0.8;">0m</span>
            </div>
            <div style="display: flex; flex-direction: column;">
                <span style="font-weight: bold; color: #f97316;">Lvl 2</span>
                <span style="color: var(--text-muted);">{allCards.filter(c => cardProfiles[c.id]?.level === 2).length}</span>
                <span style="font-size: 0.65rem; color: var(--text-muted);">12h</span>
            </div>
            <div style="display: flex; flex-direction: column;">
                <span style="font-weight: bold; color: #eab308;">Lvl 3</span>
                <span style="color: var(--text-muted);">{allCards.filter(c => cardProfiles[c.id]?.level === 3).length}</span>
                <span style="font-size: 0.65rem; color: var(--text-muted);">3d</span>
            </div>
            <div style="display: flex; flex-direction: column;">
                <span style="font-weight: bold; color: #3b82f6;">Lvl 4</span>
                <span style="color: var(--text-muted);">{allCards.filter(c => cardProfiles[c.id]?.level === 4).length}</span>
                <span style="font-size: 0.65rem; color: var(--text-muted);">7d</span>
            </div>
            <div style="display: flex; flex-direction: column;">
                <span style="font-weight: bold; color: #22c55e;">Lvl 5</span>
                <span style="color: var(--text-muted);">{allCards.filter(c => cardProfiles[c.id]?.level === 5).length}</span>
                <span style="font-size: 0.65rem; color: #22c55e; font-weight: bold;">21d</span>
            </div>
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