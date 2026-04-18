const fs = require('fs')
const path = require('path')

const API_KEY = process.env.VITE_RAPIDAPI_KEY
if (!API_KEY) {
  console.error("No API key")
  process.exit(1)
}

async function testDownload() {
  try {
    console.log("Searching for bench press on RapidAPI...")
    const res = await fetch(`https://exercisedb.p.rapidapi.com/exercises/name/bench%20press?limit=1`, {
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
      }
    })
    const data = await res.json()
    if (!data || data.length === 0) return console.log("Not found")
    
    console.log("Found:", JSON.stringify(data[0], null, 2))
    
    // Stop early to just read schema
    return
    const buffer = await imgRes.arrayBuffer()
    const filePath = path.join(__dirname, 'test_gif.gif')
    fs.writeFileSync(filePath, Buffer.from(buffer))
    console.log("Downloaded successfully to test_gif.gif (size: " + buffer.byteLength + ")")
  } catch(e) {
    console.error(e)
  }
}
testDownload()
