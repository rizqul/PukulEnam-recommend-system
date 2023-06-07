let isModelLoaded = false;
let model;
let word2index;

const maxlen = 120;

function cleanText(text) {
  const removedPunctuation = text.replace(/[^a-zA-Z\s]/g, '');
  const lowerText = removedPunctuation.toLowerCase();
  const words = lowerText.split(/\s+/);

  const removedStopwords = words.filter(word => !stopwords.includes(word));

  const stemmed = removedStopwords.map(word => stemmer.stem(word));

  const filteredSentence = stemmed.join(' ');
  return filteredSentence;
}

function padSequence(sequences, maxlen, padding='post', pad_value=0){
  return sequences.map(seq => {
    if (seq.length < maxlen) {
      const pad = new Array(maxlen - seq.length).fill(pad_value);
      if (padding == 'pre') {
        seq = pad.concat(seq);
      } else {
        seq = seq.concat(pad);
      }
    }
    return seq;
  });
}

async function predictTopic(text){
  const processedText = cleanText(text);
  const sequence = processedText.split(' ').map(word => {
    let indexed = word2index[word];
    if (indexed === undefined){
      return 1; // Change to OOV value
    }
    return indexed;
  });
  const paddedSequence = padSequence([sequence], maxlen);

  const score = tf.tidy(() => {
    const input = tf.tensor2d(paddedSequence, [1, maxlen]);
    const result = model.predict(input);
    return result.dataSync();
  });

  return score;
}

async function init(){
  model = await tf.loadLayersModel('https://127.0.0.1:8887/tfjs_model/model.json');
  isModelLoaded = true;

  const wordIndexJson = await fetch('http://127.0.0.1:8887/word_index.json');
  word2index = await wordIndexJson.json();

  console.log(model.summary());
  console.log('Model & Metadata Loaded Successfully');
}

document.getElementById('temp-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!isModelLoaded) {
    alert('Model not loaded yet');
    return;
  }

  const inputText = document.getElementById('inputTitle').value;

  if (inputText === '') {
    alert("Title can't be empty");
    document.getElementById('inputTitle').focus();
    return;
  }

  const score = await predictTopic(inputText);
  alert('Score: ' + score);
});

init();