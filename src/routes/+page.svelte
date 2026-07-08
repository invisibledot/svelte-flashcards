<script>
	let { data } = $props();
	const allCards = data.cards;
	const categories = data.categories;

	// State for tracking selected category and current index
	let selectedCategory = $state('All');
	let currentIndex = $state(0);
	let isFlipped = $state(false);

	// Automatically filter the deck whenever selectedCategory changes
	let filteredCards = $derived(
		selectedCategory === 'All'
			? allCards
			: allCards.filter((c) => c.category === selectedCategory)
	);

	// Safely grab the current card from the filtered list
	let currentCard = $derived(filteredCards[currentIndex] || null);

	function changeCategory(category) {
		selectedCategory = category;
		currentIndex = 0; // Reset index to the start of the new deck
		isFlipped = false;
	}

	function nextCard() {
		isFlipped = false;
		setTimeout(() => {
			currentIndex = (currentIndex + 1) % filteredCards.length;
		}, 150);
	}

	function prevCard() {
		isFlipped = false;
		setTimeout(() => {
			currentIndex = (currentIndex - 1 + filteredCards.length) % filteredCards.length;
		}, 150);
	}
</script>

<main class="container">
	<!-- Category Filter Bar -->
	<div class="filter-bar">
		{#each categories as category}
			<button 
				class="filter-btn" 
				class:active={selectedCategory === category}
				onclick={() => changeCategory(category)}
			>
				{category}
			</button>
		{/each}
	</div>

	{#if filteredCards.length === 0}
		<p class="empty-state">No flashcards found for this category.</p>
	{:else}
		<div class="header">
			<span class="category">{currentCard.category}</span>
			<span class="counter">{currentIndex + 1} / {filteredCards.length}</span>
		</div>

		<!-- Flashcard Container -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="card-wrapper" onclick={() => (isFlipped = !isFlipped)}>
			<div class="card" class:flipped={isFlipped}>
                <div class="card-face front">
                    <h2>{currentCard.question}</h2>
                    
                    {#if currentCard.frontsubtext}
                        <p class="card-subtext">{currentCard.frontsubtext}</p>
                    {/if}
                    
                    <p class="hint">Click to reveal answer</p>
                </div>
				<div class="card-face back">
					<h2>{currentCard.answer}</h2>
   
                    {#if currentCard.backsubtext}
                        <p class="card-subtext">{currentCard.backsubtext}</p>
                    {/if}
                    
					{#if currentCard.notes}
						<p class="notes">{currentCard.notes}</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- Controls -->
		<div class="controls">
			<button class="nav-btn" onclick={prevCard}>Previous</button>
			<button class="nav-btn" onclick={() => (isFlipped = !isFlipped)}>Flip</button>
			<button class="nav-btn" onclick={nextCard}>Next</button>
		</div>
	{/if}
</main>