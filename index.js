
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const request = require("request");
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();

  // Scraping the repositories data
  await page.goto('https://github.com/trending');

  const html = await page.content();
  const $ = cheerio.load(html);

  const repos = [];

  $('li > div > h1 > a').each((i, element) => {
    const title = $(element).text().trim();
    const url = 'https://github.com' + $(element).attr('href');
    const description = $(element).parent().parent().find('p.my-1').text().trim();
    const stars = $(element).parent().parent().find('a.mr-3').eq(0).text().trim();
    const forks = $(element).parent().parent().find('a.mr-3').eq(1).text().trim();
    const language = $(element).parent().parent().find('span.d-inline-block.ml-0.mr-3').text().trim();

    repos.push({
      title,
      url,
      description,
      stars,
      forks,
      language,
    });
  });

  // Scraping the developers data
  await page.goto('https://github.com/trending/developers?language=javascript&since=daily');

  const html2 = await page.content();
  const $2 = cheerio.load(html2);

  const developers = [];

  $2('li > div.d-md-flex > div > a').each((i, element) => {
    const name = $(element).find('h2').text().trim();
    const username = $(element).find('span.d-inline-block').text().trim();
    const repoName = $(element).find('span.repo-snipit').find('a').eq(0).text().trim();
    const repoDescription = $(element).find('span.repo-snipit').find('p').text().trim();

    developers.push({
      name,
      username,
      repoName,
      repoDescription,
    });
  });

  // Saving the data in a JSON file
  const data = { repos, developers };
  fs.writeFileSync('data.json', JSON.stringify(data));

  console.log('Data extracted and saved successfully!');

 await browser.close();
})();


