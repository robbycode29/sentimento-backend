const puppeteer = require('puppeteer-core');
const words = require('../utils/wordsApi');

var express = require('express');
var router = express.Router();

router.get('/', async (req, res) => {
  const url = req.query.url;
  // const url = 'https://wsa-test.vercel.app/';

  const getWords = async () => {
    const positiveWordSets = [];
    const negativeWordSets = [];

    for (let i = 0; i < words.positive.length; i++) {
      positiveWordSets.push(await words.positive[i]);
    }
    for (let i = 0; i < words.negative.length; i++) {
      negativeWordSets.push(await words.negative[i]);
    }

    const positiveWords = positiveWordSets.flat(1);
    const negativeWords = negativeWordSets.flat(1);
    
    return { positiveWords, negativeWords };
  }

  const getSentiment = async (text) => {

    // Uncomment this line and comment out the next two lines to use the Words API for the positive and negative words lists used in sentiment analysis
    // And also uncomment the utils/wordsApi.js file
    // const { positiveWords, negativeWords } = await getWords();

    const positiveWords = ['joyful', 'blissful', 'loving', 'successful', 'delightful', 'inspiring', 'kind', 'grateful', 'hopeful', 'harmonious', 'exciting', 'serene', 'friendly', 'vibrant', 'positive', 'optimistic', 'upbeat', 'encouraging'];
    const negativeWords = ['sad', 'disappointing', 'unsuccessful', 'miserable', 'grief-stricken', 'lonely', 'desperate', 'anguished', 'regretful', 'frustrated', 'negative', 'critical', 'unhappy', 'unpleasant', 'unfortunate', 'unlucky'];

    const positiveMatches = [];
    const negativeMatches = [];

    for (let i = 0; i < positiveWords.length; i++) {
      if (text?.includes(positiveWords[i])) {
        positiveMatches.push(positiveWords[i]);
      }
    }
    for (let i = 0; i < negativeWords.length; i++) {
      if (text?.includes(negativeWords[i])) {
        negativeMatches.push(negativeWords[i]);
      }
    }

    if (positiveMatches.length > negativeMatches.length) {
      return 'positive';
    } else if (negativeMatches.length > positiveMatches.length) {
      return 'negative';
    } else {
      return 'neutral';
    }
  };

  try {
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROMIUM_PATH,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });
    const page = await browser.newPage();
    await page.goto(url, { timeout: 10000 });

    await page.waitForSelector('div > div > div > div > div > div > div');
    await page.waitForSelector('img');
    await page.waitForSelector('a');

    const texts = await page.$$eval('div > div > div > div > div > div > div', (elements) => {
      const texts = elements.map((element) => {
        return element.innerText.split('\n').filter((text) => text !== '');
      });
      return [...new Set(texts.flat(1))];
    });

    let textSections = [];

    for (let i = 0; i < texts.length; i += 5) {
      textSections.push(texts.slice(i, i + 5));
    }

    let sections = [];

    textSections.forEach(async (textSection) => {
      const section = {
        genre: '',
        title: '',
        short_description: '',
        author: '',
        author_description: '',
        image: '',
        href: '',
        sentiment: '',
        words: 0,
      };
      section.genre = textSection[0];
      section.title = textSection[1];
      section.short_description = textSection[2];
      section.author = textSection[3];
      section.author_description = textSection[4];
      section.sentiment = await getSentiment(textSection[2]);
      sections.push(section);
    });

    const images = await page.$$eval('img', (elements) => {
      const images = elements.map((element) => {
        return element.src;
      });
      return images;
    });

    const hrefs = await page.$$eval('a', (elements) => {
      const hrefs = elements.map((element) => {
        return element.href;
      });
      return hrefs;
    });

    for (let i = 0; i < images.length; i += 2) {
      sections[i / 2].image = images[i];
      sections[i / 2].href = hrefs[i];
    }

    const getText = async (url) => {
      await page.goto(url, { timeout: 10000 });
      await page.waitForSelector('div');
      const text = await page.$eval('div', (element) => {
        return element.innerText;
      });
      return text.split(' ').length;
    };

    for (let i = 0; i < sections.length; i++) {
      const url = sections[i].href;
      sections[i].words = await getText(url);
    }

    await browser.close();

    res.json(sections);

  } catch (error) {
    res.status(500).json({ error: 'Scraping failed', message: error.message });
  }
});

module.exports = router;