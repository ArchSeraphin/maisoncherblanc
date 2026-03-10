const https = require('https');

let cache = null;
let cacheTime = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

function fetchPlaceDetails() {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.GOOGLE_PLACE_ID;

    if (!apiKey || !placeId) {
      return reject(new Error('GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID not configured'));
    }

    const fields = 'reviews,rating,user_ratings_total';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&language=fr&key=${apiKey}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status !== 'OK') return reject(new Error(`Places API: ${json.status}`));
          resolve(json.result);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function getReviews(req, res) {
  try {
    const now = Date.now();
    if (cache && now - cacheTime < CACHE_TTL) {
      return res.json(cache);
    }

    const result = await fetchPlaceDetails();

    const reviews = (result.reviews || [])
      .filter(r => r.rating >= 4)
      .sort((a, b) => b.time - a.time)
      .slice(0, 8)
      .map(r => ({
        author: r.author_name,
        avatar: r.profile_photo_url || null,
        rating: r.rating,
        text: r.text,
        time: r.relative_time_description,
      }));

    cache = {
      reviews,
      rating: result.rating || null,
      total: result.user_ratings_total || 0,
    };
    cacheTime = now;

    res.json(cache);
  } catch (err) {
    // Fallback : retourner un tableau vide sans bloquer le site
    console.error('[Reviews]', err.message);
    res.json({ reviews: [], rating: null, total: 0 });
  }
}

module.exports = { getReviews };
