import Papa from 'papaparse';
import { error } from '@sveltejs/kit';

// 1. Centralized repository mapping your subjects directly to their specific CSV export links
const SHEET_URLS = {
    swedish: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSeL7RusogzJ-vAxzDG0NQBOOIgElJHPjtkJsqXCbsMpq9RRFMYeW_XJJgUhY4bLF1Mz6Jedd2BH-7S/pub?gid=0&single=true&output=csv',
    melanie: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSeL7RusogzJ-vAxzDG0NQBOOIgElJHPjtkJsqXCbsMpq9RRFMYeW_XJJgUhY4bLF1Mz6Jedd2BH-7S/pub?gid=1101211831&single=true&output=csv',
};

export async function load({ params }) {
    // 2. Extract the dynamic parameter from the URL path (e.g., "swedish")
    const subject = params.subject.toLowerCase();

    // 3. Defensive Check: Throw a clean 404 page if the user visits a tab that doesn't exist
    if (!SHEET_URLS[subject]) {
        throw error(404, {
            message: `Subject '${params.subject}' not found. Available subjects: ${Object.keys(SHEET_URLS).join(', ')}`
        });
    }

    try {
        // 4. Dynamically fetch the correct sheet link based on the chosen URL path
        const response = await fetch(SHEET_URLS[subject]);
        
        if (!response.ok) {
            throw new Error(`Failed to download spreadsheet content for ${subject}`);
        }

        const csvText = await response.text();

        // 5. Parse the CSV rows into a structured array
        const parsed = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true
        });

        // 6. Map rows cleanly, handling missing tags or columns gracefully
        const cards = parsed.data.map((row, index) => {
            // Safe fallback string parsing for tags column (turns "tag1, tag2" into a proper array)
            const tagString = row.tags || row.Tags || '';
            const tagsArray = tagString ? tagString.split(',').map(t => t.trim()) : [];

            return {
                id: row.id || `${subject}-${index}`, // Builds an isolation fallback ID
                category: row.category || row.Category || 'General',
                question: row.question || row.Question || '',
                answer: row.answer || row.Answer || '',
                frontimage: row.frontimage || row['Front Image'] || '',
                backimage: row.backimage || row['Back Image'] || '',
                frontsubtext: row.frontsubtext || '',
                backsubtext: row.backsubtext || '',
                notes: row.notes || '',
                tags: tagsArray
            };
        });

        // Return the cards data down to the Svelte components
        return {
            subject,
            cards
        };

    } catch (err) {
        console.error('Loader Error:', err);
        throw error(500, 'Kunnde inte ladda in dina flashcards. Kontrollera din internetanslutning eller kalkylbladsinställningar.');
    }
}