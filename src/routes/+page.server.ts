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
		frontsubtext: row.frontsubtext || row['Front Subtext'] || '',
		answer: row.answer,
		backsubtext: row.backsubtext || row['Back Subtext'] || '',
		category: row.category || 'General',
		tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
		notes: row.notes || '',
		frontimage: row.frontimage || row['frontimage'] || '',
		backimage: row.backimage || row['backimage'] || ''
	}));

		return { cards };
	} catch (error) {
		console.error("Failed to fetch cards:", error);
		return { cards: [] };
	}
}