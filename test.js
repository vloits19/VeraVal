

async function run() {
  const query = `
query SearchAnime($search: String, $format: MediaFormat, $page: Int, $perPage: Int, $sort: [MediaSort]) {
  Page(page: $page, perPage: $perPage) {
    media(search: $search, type: ANIME, format: $format, sort: $sort, isAdult: false) {
      format
      title { romaji }
    }
  }
}`;

  const variables = { format: 'MOVIE', sort: ['TRENDING_DESC', 'POPULARITY_DESC'], page: 1, perPage: 5 };

  const r = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  const data = await r.json();
  console.log(JSON.stringify(data, null, 2));
}

run();
