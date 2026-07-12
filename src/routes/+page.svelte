<script>
    // Define the available topics to study (matching the keys in your +page.server.js dictionary)
    const subjects = [
        { id: 'swedish', name: 'Swedish Vocabulary', count: 'Active' },
        { id: 'melanie', name: 'Melanie’s cards', count: 'Active' },
    ];
</script>

<main class="container">
    <div class="hub-header">
        <h1>Flashcard Study Hub</h1>
        <p>Select a subject topic below to begin your study session:</p>
    </div>

    <div class="subject-grid">
        {#each subjects as subject}
            <a href="/study/{subject.id}" class="subject-card">
                <span class="subject-name">{subject.name}</span>
                <span class="subject-badge">Start Review ➔</span>
            </a>
        {/each}
    </div>
</main>