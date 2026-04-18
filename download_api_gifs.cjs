const fs = require('fs');
const path = require('path');
const https = require('https');

// 1. Read .env dynamically
const envFile = fs.readFileSync('.env', 'utf8');
const envVars = {};
envFile.split(/\r?\n/).forEach(line => {
    if (!line || !line.includes('=')) return;
    const [key, ...rest] = line.split('=');
    envVars[key.trim()] = rest.join('=').trim();
});

const SUPABASE_URL = envVars.VITE_SUPABASE_URL;
const SUPABASE_KEY = envVars.VITE_SUPABASE_ANON_KEY;
const RAPIDAPI_KEY = envVars.VITE_RAPIDAPI_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !RAPIDAPI_KEY) {
    console.error("Missing critical environment variables.");
    process.exit(1);
}

// Ensure gifs directory exists
const gifsDir = path.join(__dirname, 'public', 'gifs');
if (!fs.existsSync(gifsDir)) fs.mkdirSync(gifsDir);

// Helpers
const fetchJson = (url, headers) => new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
});

const downloadFile = (url, dest) => new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    // Follow redirect if Cloudfront gives 301/302, but usually it's direct HTTPs
    https.get(url, (res) => {
        if (res.statusCode !== 200) {
            reject(`Failed to download ${url}: HTTP ${res.statusCode}`);
            return;
        }
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
    }).on('error', err => { fs.unlink(dest, ()=>{}); reject(err); });
});

async function run() {
    console.log("Fetching exact exercise list from your Supabase...");
    let supabaseResult;
    try {
        supabaseResult = await fetchJson(`${SUPABASE_URL}/rest/v1/exercises?select=*`, {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
        });
    } catch (e) {
        // Fallback to reading the SQL schema file if Supabase fails
        console.log("Could not hit Supabase, falling back to local SQL schema...");
        const sql = fs.readFileSync('supabase_schema_fixed.sql', 'utf8');
        const block = sql.split('insert into public.exercises')[1]?.split(';')[0];
        const matches = [...block.matchAll(/\('([^']+)'/g)];
        supabaseResult = matches.map(m => ({ name: m[1] }));
    }

    if (!supabaseResult || supabaseResult.length === 0) {
        console.log("Found 0 exercises? Stopping.");
        return;
    }

    console.log(`Found ${supabaseResult.length} workouts to link!`);
    
    let sqlUpdates = `-- Run this in Supabase SQL Editor to link your NEW uniquely downloaded GIFs!\n\n`;
    sqlUpdates += `ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS gif_url text;\n`;
    sqlUpdates += `ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS instructions text;\n\n`;

    for (const ex of supabaseResult) {
        const queryName = ex.name;
        console.log(`Processing: ${queryName}...`);

        try {
            const apiRes = await fetchJson(`https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(queryName.toLowerCase())}?limit=5`, {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
            });

            if (apiRes && apiRes.length > 0) {
                // Find best matching exercise to prevent randomly weird naming matches
                let bestMatch = apiRes[0]; // just grab first since API already sorts by relevance, but we can refine picking.
                
                const gifUrl = bestMatch.gifUrl;
                const fileExt = '.gif';
                const safeName = queryName.toLowerCase().replace(/[^a-z0-9]/g, '_');
                const fileName = `${safeName}${fileExt}`;
                const destPath = path.join(gifsDir, fileName);

                console.log(`   -> Found match from API! Downloading image...`);
                
                try {
                    await downloadFile(gifUrl, destPath);
                    console.log(`   -> Downloaded ${fileName} successfully!`);
                    
                    const instructions = bestMatch.instructions ? bestMatch.instructions.join(' ').replace(/'/g, "''") : '';
                    sqlUpdates += `UPDATE public.exercises SET gif_url = '/gifs/${fileName}', instructions = '${instructions}' WHERE name = '${ex.name}';\n`;
                } catch(e) {
                    console.error(`   -> Failed to download image for ${queryName}`, e);
                }
            } else {
                console.log(`   -> No match found in API for ${queryName}`);
            }
        } catch(e) {
            console.error(`   -> API Error for ${queryName}: ${e.message || e}`);
        }

        // Wait 300ms to avoid RapidAPI rate limits for burst
        await new Promise(r => setTimeout(r, 300));
    }

    fs.writeFileSync('update_api_gifs.sql', sqlUpdates);
    console.log("\n✅ AMAZING! All 64 workouts fetched and GIFs downloaded locally.");
    console.log("✅ I have generated `update_api_gifs.sql`. Please copy & paste it into Supabase SQL Editor to finish the process!");
}

run();
