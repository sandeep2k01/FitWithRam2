const fs = require('fs')
const path = require('path')

// Read existing exercises from SQL
const sqlPath = path.join(__dirname, 'supabase_schema_fixed.sql')
const sqlContent = fs.readFileSync(sqlPath, 'utf8')

// The exercises are inserted like: ('Bench Press', 'Chest', 'Barbell')
const exMatches = [...sqlContent.matchAll(/\('([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'(?:,\s*'[^']*')?\)/g)]
let myExercises = exMatches.map(m => m[1]).filter(name => !['Beginner Full Body', 'Upper Body Power'].includes(name))
// Filter out non-exercises (some entries might be names of plans or something if the regex over-matches)
// We know our exercises are under the insert into public.exercises.
const exerciseInsertBlock = sqlContent.split('insert into public.exercises')[1]?.split(';')[0];
if (exerciseInsertBlock) {
    const validMatches = [...exerciseInsertBlock.matchAll(/\('([^']+)'/g)];
    myExercises = validMatches.map(m => m[1]);
}

console.log(`Found ${myExercises.length} exercises in SQL schema.`)

// Read ExerciseDB JSON
const dbPath = path.join(__dirname, 'public', 'dataset', 'exercisedb_v1_sample', 'exercises.json')
const exDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'))

// Helpers to match strings
function normalize(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getBestMatch(name, candidates) {
    const target = name.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    let best = null;
    let maxScore = -1;
    
    for (const c of candidates) {
        const cName = c.name.toLowerCase().replace(/[^a-z0-9 ]/g, '');
        // Score based on word inclusion
        const targetWords = target.split(' ');
        const cWords = cName.split(' ');
        let score = 0;
        
        // Bonus for exact normalized match
        if (normalize(name) === normalize(c.name)) score += 100;
        
        for (const w of targetWords) {
            if (cWords.includes(w)) score += 10;
        }
        
        // Penalty for extra words in the candidate to avoid picking "barbell bench press" for "press"
        score -= cWords.length; 

        if (score > maxScore) {
            maxScore = score;
            best = c;
        }
    }
    return best;
}

// Create destination directory
const destDir = path.join(__dirname, 'public', 'gifs')
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir)

let sqlUpdates = `-- Run this in Supabase SQL Editor to update your exercise GIFs!\n\n`;
let matchedCount = 0;

for (const exName of myExercises) {
    const match = getBestMatch(exName, exDb);
    if (match) {
        matchedCount++;
        const sourceGif = path.join(__dirname, 'public', 'dataset', 'exercisedb_v1_sample', 'gifs_360x360', match.gifUrl);
        const destGif = path.join(destDir, match.gifUrl);
        
        // Copy file
        if(true) {
            fs.copyFileSync(sourceGif, destGif);
            // Add SQL update
            sqlUpdates += `UPDATE public.exercises SET gif_url = '/gifs/${match.gifUrl}', instructions = '${match.instructions.join(' ').replace(/'/g, "''")}' WHERE name = '${exName}';\n`;
        }
    }
}

fs.writeFileSync(path.join(__dirname, 'update_gifs.sql'), sqlUpdates)
console.log(`Matched ${matchedCount} exercises! Copies complete. SQL file generated at update_gifs.sql`);
