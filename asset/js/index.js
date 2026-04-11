const keys = ['qa01', 'qa02', 'qa03', 'qa04', 'qa05', 'qa06', 'qa07', 'qa08'];
const base = new URL('../data/', import.meta.url).href;

const loadQuestions = async () => {
  const results = await Promise.all(
    keys.map(key => fetch(`${base}${key}.json`).then(r => r.json()))
  );
  return Object.fromEntries(keys.map((key, i) => [key, results[i]]));
};

export default loadQuestions;
