const Papa = require('papaparse');
const fs = require('fs');

const csvText = fs.readFileSync('/Users/macbook/Documents/GIT/govtools/govtools-posts-tracker/data/master_log.csv', 'utf8');

const results = Papa.parse(csvText, { delimiter: ";;;", header: true, skipEmptyLines: true });
console.log('Total rows parsed:', results.data.length);
console.log('Total errors:', results.errors.length);
if (results.errors.length > 0) {
    console.log('First 5 errors:', results.errors.slice(0, 5));
}

// Check: how many rows have USAmb_AU as Username?
const usamb = results.data.filter(r => r.Username && r.Username.toLowerCase().includes('usamb_au'));
console.log('\nRows with USAmb_AU in Username:', usamb.length);
if (usamb.length > 0) console.log('Sample:', JSON.stringify(usamb[0], null, 2));

// Check: ALL unique usernames in parsed data
const allUsernames = new Set();
results.data.forEach(r => {
    const u = (r.handle || r.Username || "").replace('@', '').trim().toLowerCase();
    if (u) allUsernames.add(u);
});
console.log('\nUnique usernames in parsed data:', allUsernames.size);
console.log('Has usamb_au?', allUsernames.has('usamb_au'));
console.log('Has usambapec?', allUsernames.has('usambapec'));

// Check raw lines for USAmb_AU
const lines = csvText.split('\n');
console.log('\nTotal lines in file:', lines.length);
const matchingLines = lines.filter(l => l.toLowerCase().includes('usamb_au'));
console.log('Lines containing usamb_au:', matchingLines.length);
if (matchingLines.length > 0) {
    console.log('First matching line fields:', matchingLines[0].split(';;;').length);
    console.log('First matching line:', matchingLines[0].substring(0, 200));
}
