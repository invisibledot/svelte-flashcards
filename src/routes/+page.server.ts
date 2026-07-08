import Papa from 'papaparse';

export async function load() {
	const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSeL7RusogzJ-vAxzDG0NQBOOIgElJHPjtkJsqXCbsMpq9RRFMYeW_XJJgUhY4bLF1Mz6Jedd2BH-7S/pub?output=csv";
	
	try {
		const response = await fetch(csvUrl);
		const csvText = await response.text();
		
		// Parse CSV directly into JSON objects
		const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
		
	const cards = parsed.data.map((row, index) => ({
		id: `card-${index}`,
		question: row.question,
		answer: row.answer,
		category: row.category || 'General',
		tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
		notes: row.notes || '',
		frontsubtext: row.frontsubtext || row['Front Subtext'] || '',
		backsubtext: row.backsubtext || row['Back Subtext'] || ''
	}));

		return { cards };
	} catch (error) {
		console.error("Failed to fetch cards:", error);
		return { cards: [] };
	}
}