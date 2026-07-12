<script>
    // Accept state readouts and active trigger functions as props
    let { 
        categories, 
        tags, 
        activeCategories, 
        activeTags, 
        onToggleCategory, 
        onToggleTag 
    } = $props();
</script>

<div class="filter-panel">
    <!-- Category Group -->
    <div class="filter-group">
        <h3>Categories:</h3>
        <div class="filter-bar">
            {#each categories as category}
                <button 
                    class="filter-btn" 
                    class:active={activeCategories.has(category)}
                    onclick={() => onToggleCategory(category)}
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
                        onclick={() => onToggleTag(tag)}
                    >
                        #{tag}
                    </button>
                {/each}
            </div>
        </div>
    {/if}
</div>