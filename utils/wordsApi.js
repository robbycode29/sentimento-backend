// const axios = require('axios');

// const positiveSeedWords = ['joyful', 'blissful', 'loving', 'successful', 'delightful', 'inspiring', 'kind', 'grateful', 'hopeful', 'harmonious', 'exciting', 'serene', 'friendly'];
// const negativeSeedWords = ['sad', 'disappointing', 'unsuccessful', 'miserable', 'grief-stricken', 'lonely', 'desperate', 'anguished', 'regretful', 'frustrated'];

// const positiveWordSet = [];
// const negativeWordSet = [];



// const options = (seed) => {
//     return {
//         method: 'GET',
//         url: `https://wordsapiv1.p.rapidapi.com/words/${seed}/also`,
//         headers: {
//             'X-RapidAPI-Key': process.env.RAPID_API_KEY,
//             'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
//         }
//     };
// };

// const getWords = async (options) => {
//     try {
//         const response = await axios.request(options);
//         return response.data.also;
//     } catch (error) {
//         console.error(error);
//     }
// };

// positiveSeedWords.forEach((seed) => {
//     const optionSet = options(seed);
//     const words = getWords(optionSet);
//     positiveWordSet.push(words);
// });

// negativeSeedWords.forEach((seed) => {
//     const optionSet = options(seed);
//     const words = getWords(optionSet);
//     negativeWordSet.push(words);
// });

// const words = {
//     positive: positiveWordSet,
//     negative: negativeWordSet,
// };

// module.exports = words;