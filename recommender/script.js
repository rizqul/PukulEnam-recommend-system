let isModelLoaded = false;
let model;
let word2index;
let stopwords;
let authors;

const maxlen = 120;
let cbf_feature = ['Copywriting', 'Design', 'Nasional', 'Internasional', 'Health', 'Finance', 'Technology', 'Sports', 'Gaming','Entertainment']

// INPUTAN USER
function getInput(){
    const input = document.getElementById("inputTitle").value;
    return input;
}
function getSelected(){
    const selectedRole = document.querySelector('input[name="role"]:checked').value;
    const selectedType = document.querySelector('input[name="radioType"]:checked').value;
    const userInput = [selectedRole, selectedType];
    return userInput;
}
function getDay(){
  const selectedDay = document.querySelectorAll('input[type="checkbox"]:checked');
  const day = []
  selectedDay.forEach(function(checkbox) {
    day.push(checkbox.value);
  });
  return day;
}

// PREPROCESSING 
function clean_text(text) {
  const removedPunctuation = text.replace(/[^a-zA-Z\s]/g, '');
  const lowerText = removedPunctuation.toLowerCase();
  const words = lowerText.split(/\s+/);
  const removedStopwords = words.filter(word => !stopwords.includes(word));
  return removedStopwords
}

function padSequence(sequences, maxlen, padding='post', pad_value=0){
  return sequences.map(seq => {
      if (seq.length < maxlen) {
          const pad = [];
          for (let i = 0; i < maxlen - seq.length; i++) {
              pad.push(pad_value);
          }
          if (padding == 'pre') {
              seq = pad.concat(seq);
          } else {
              seq = seq.concat(pad);
          }
      }
      return seq;
  });
}

// PREDIKSI TOPIK JUDUL BERITA YG DIINPUT
function predict(inputText){
  const processedText = clean_text(inputText);
  const sequence = processedText.map(word => {
      let indexed = word2index[word];
  
      if (indexed === undefined){
          return 1; // change to oov value
      }
      return indexed;
  });
  const paddedSequence = padSequence([sequence], maxlen);
  const scores = tf.tidy(() => {
    const input = tf.tensor2d(paddedSequence, [1, maxlen]);
    const result = model.predict(input);
    return result.dataSync()
  });
  return scores;
}

// MODEL CBF
function userFeatures(user_inputs, topic_preferences){
  const feature_cbf = ['Copywriting', 'Design', 'Nasional', 'Internasional']
  const userFeatureVector = [];
  
  feature_cbf.map((feature) => {
    if (user_inputs.includes(feature)) {
      userFeatureVector.push(1)
    } else {
        userFeatureVector.push(0)
    }
  });
  userFeatureVector.push(topic_preferences[3]);
  userFeatureVector.push(topic_preferences[0]);
  userFeatureVector.push(topic_preferences[5]);
  userFeatureVector.push(topic_preferences[4]);
  userFeatureVector.push(topic_preferences[1]);
  userFeatureVector.push(topic_preferences[2]);
  return userFeatureVector;
}

function normalizeFeatures(features) {
  const minValues = features.reduce((min, feature) => feature.map((value, index) => Math.min(value, min[index])), features[0]);
  const maxValues = features.reduce((max, feature) => feature.map((value, index) => Math.max(value, max[index])), features[0]);
  return features.map(feature => feature.map((value, index) => (value - minValues[index]) / (maxValues[index] - minValues[index])));
}

function cosineSimilarity(a, b) {
  const dotProduct = a.reduce((acc, val, i) => acc + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0));
  const normB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0));
  return dotProduct / (normA * normB);
}

function onClick(){
  if(!isModelLoaded){
    alert('Model not loaded yet');
    return;
  } 
  const inputText = getInput();
  const select = getSelected();
  const hari = getDay();
  const topic_preferences = predict(inputText);
  const userFeatureVector = userFeatures(select, topic_preferences);
  console.log(topic_preferences);

  const authorFeatures = authors.map(author => cbf_feature.map(feature => author[feature]));
  const normalizedAuthorFeatures = normalizeFeatures(authorFeatures);
  const filteredAuthors = authors.filter(author => hari.every(day => author['Available Days'].includes(day)));
  const similarityScores = filteredAuthors.map((author, index) =>
    cosineSimilarity(userFeatureVector, normalizedAuthorFeatures[index])
  );  
  // console.log(similarityScores);
  const recommendations = filteredAuthors.map((author, index) => ({
    author: author.Name,
    score: similarityScores[index]
  }));
  recommendations.sort((a, b) => b.score - a.score);
  
  const recommendationContainer = document.getElementById('recommendationContainer');
  recommendationContainer.innerHTML = '';
  
  recommendations.forEach(recommendation => {
    console.log(`Author: ${recommendation.author}, Score: ${recommendation.score}`);
    
    const authorElement = document.createElement('p');
    authorElement.textContent = `${recommendation.author}, Score: ${recommendation.score}`;
    recommendationContainer.appendChild(authorElement);
  });

  return false;
}

// KOLOM FUNGSI INIT
async function init(){
  // MEMANGGIL MODEL TFJS 
  model = await tf.loadLayersModel('https://raw.githubusercontent.com/rizqul/PukulEnam-recommend-system/main/recommender/tfjs_model/model.json');
  isModelLoaded = true;
  // MEMANGGIL WORD_INDEX
  const word_indexjson = await fetch('https://raw.githubusercontent.com/rizqul/PukulEnam-recommend-system/main/recommender/word_index.json');
  word2index = await word_indexjson.json();
  // MEMANGGIL STOPWORDS
  const stopwords_id = await fetch('https://raw.githubusercontent.com/rizqul/PukulEnam-recommend-system/main/recommender/stopwords-id.json');
  stopwords = await stopwords_id.json()

  const newsroom_datajson = await fetch('https://raw.githubusercontent.com/rizqul/PukulEnam-recommend-system/main/recommender/Newsroom_data.json');
  authors = await newsroom_datajson.json();

}
init()