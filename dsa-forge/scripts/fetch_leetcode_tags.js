/**
 * Fetch Official LeetCode Topic Tags in Bulk via GraphQL
 * Caches results locally in scripts/data/leetcode_tags_cache.json
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const cacheFile = path.resolve(__dirname, 'data/leetcode_tags_cache.json');

const query = `
query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
  problemsetQuestionList: questionList(
    categorySlug: $categorySlug
    limit: $limit
    skip: $skip
    filters: $filters
  ) {
    total: totalNum
    questions: data {
      questionFrontendId
      title
      titleSlug
      topicTags {
        name
        slug
      }
    }
  }
}
`;

function fetchBatch(skip, limit = 100) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      query,
      variables: {
        categorySlug: "",
        skip,
        limit,
        filters: {}
      }
    });

    const req = https.request('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.errors) {
            return reject(new Error(JSON.stringify(json.errors)));
          }
          const list = json.data?.problemsetQuestionList;
          resolve({
            total: list?.total || 0,
            questions: list?.questions || []
          });
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.write(postData);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log("=== Fetching Official LeetCode Problem Topic Tags in Bulk ===");

  let cache = {};
  if (fs.existsSync(cacheFile)) {
    try {
      cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      console.log(`Loaded existing cache with ${Object.keys(cache).length} problems.`);
    } catch {
      cache = {};
    }
  }

  // First fetch to get total
  const first = await fetchBatch(0, 100);
  const total = first.total;
  console.log(`Total questions on LeetCode: ${total}`);

  for (const q of first.questions) {
    cache[q.questionFrontendId] = {
      title: q.title,
      slug: q.titleSlug,
      tags: q.topicTags.map(t => t.name)
    };
  }

  const batchSize = 100;
  // Fetch up to total to cover all problems up to ~4,109
  const maxToFetch = total;

  for (let skip = 3600; skip < maxToFetch; skip += batchSize) {
    process.stdout.write(`Fetching offset ${skip}/${maxToFetch}... `);
    let attempts = 0;
    let success = false;

    while (attempts < 3 && !success) {
      try {
        const res = await fetchBatch(skip, batchSize);
        for (const q of res.questions) {
          cache[q.questionFrontendId] = {
            title: q.title,
            slug: q.titleSlug,
            tags: q.topicTags.map(t => t.name)
          };
        }
        success = true;
        console.log(`OK (got ${res.questions.length} Qs, total in cache: ${Object.keys(cache).length})`);
      } catch (err) {
        attempts++;
        console.warn(`Retry ${attempts} after error: ${err.message}`);
        await sleep(1500 * attempts);
      }
    }

    // Save cache incrementally every 5 batches
    if ((skip / batchSize) % 5 === 0) {
      fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2), 'utf8');
    }

    await sleep(250); // Be respectful to LeetCode API
  }

  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2), 'utf8');
  console.log(`\nDONE! Cached ${Object.keys(cache).length} LeetCode problems with official topic tags in:`);
  console.log(cacheFile);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
