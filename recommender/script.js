let isModelLoaded = false;
let model;
let word2index;
let stopwords;
let authors;

const maxlen = 120;
let cbf_feature = ['Copywriting', 'Design', 'Nasional', 'Internasional', 'Health', 'Finance', 'Tech', 'Sports', 'Gaming','Entertainment']

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
  // const stemmed = [];
  // const stemmer = new sastrawi.Stemmer();
  // for (word of removedStopwords) {
  //     stemmed.push(stemmer.stem(word));
  // }
  // return stemmed;
  // console.log(removedStopwords);
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
  const word_indexjson = await fetch('https://raw.githubusercontent.com/rizqul/PukulEnam-recommend-system/main/recommender/word_index.json')
  word2index = await word_indexjson.json();
  // MEMANGGIL STOPWORDS
  const stopwords_id = await fetch('https://raw.githubusercontent.com/rizqul/PukulEnam-recommend-system/main/recommender/stopwords-id.json');
  stopwords = await stopwords_id.json()

  authors = [
    { 'Name': 'Aditya', 'Copywriting': 4, 'Design': 2, 'Available Days': ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'], 'Nasional': 4, 'Internasional': 5, 'Health':5, 'Finance': 2, 'Tech': 3, 'Sports': 0.5, 'Gaming': 0, 'Entertainment': 0.5},
    { 'Name': 'Andhika Mifta Alauddin', 'Copywriting': 4, 'Design': 3, 'Available Days': ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'], 'Nasional': 5, 'Internasional': 4, 'Health':1, 'Finance': 1, 'Tech': 3, 'Sports': 3, 'Gaming': 5, 'Entertainment': 3},
    { 'Name': 'Ni Nyoman Ayu Sintya Dewi', 'Copywriting': 4, 'Design': 3, 'Available Days': ['Senin', 'Selasa', 'Rabu', 'Jumat', 'Sabtu'], 'Nasional':4, 'Internasional':3,  'Health':3, 'Finance':4, 'Tech':4, 'Sports':1, 'Gaming':2, 'Entertainment':3},
    { 'Name': 'Dewa Bagus Trima Putra', 'Copywriting': 4, 'Design': 5,'Available Days': ['Rabu', 'Jumat'], 'Nasional':4, 'Internasional':4, 'Health':3, 'Finance':5, 'Tech':4, 'Sports':3, 'Gaming':3, 'Entertainment':5},
    { 'Name': 'Patma Ari Ayu Kartini', 'Copywriting': 4, 'Design': 4, 'Available Days':['Selasa', 'Jumat'], 'Nasional':4, 'Internasional':4, 'Health':4, 'Finance':4, 'Tech':4, 'Sports':3, 'Gaming':3, 'Entertainment':4},
    { 'Name': 'Risa Pebriyanthi', 'Copywriting':4, 'Design':2, 'Available Days':['Selasa', 'Sabtu'], 'Nasional':5, 'Internasional':3, 'Health':3, 'Finance':4.5, 'Tech':2, 'Sports':1, 'Gaming':1, 'Entertainment':2},
    { 'Name': 'Suci Hastika Salmaaini', 'Copywriting':5, 'Design':5, 'Available Days':['Rabu', 'Kamis'], 'Nasional':5, 'Internasional':4, 'Health':3, 'Finance':4.5, 'Tech':4.5, 'Sports':2, 'Gaming':3, 'Entertainment':3},
    { 'Name': 'Ni Luh Santi Wahyuni', 'Copywriting':4, 'Design':2, 'Available Days':['Rabu'], 'Nasional':5, 'Internasional':3, 'Health':2, 'Finance':4, 'Tech':2, 'Sports':1, 'Gaming':1, 'Entertainment':2.5},
    { 'Name': 'Andre Winata', 'Copywriting':4, 'Design':4,'Available Days':['Senin', 'Rabu', 'Minggu'], 'Nasional':4, 'Internasional':4, 'Health':1.5, 'Finance':2, 'Tech':5, 'Sports':4, 'Gaming':3, 'Entertainment':2},
    { 'Name': 'Iga Narendra Pramawijaya', 'Copywriting':4, 'Design':1, 'Available Days':['Sabtu', 'Minggu'], 'Nasional':3, 'Internasional':4, 'Health':2, 'Finance':4, 'Tech':5, 'Sports':3, 'Gaming':3, 'Entertainment':1},
    { 'Name': 'Nyoman Satiya Nanjaya Sadha', 'Copywriting':2, 'Design':2, 'Available Days':['Sabtu', 'Minggu'], 'Nasional':2, 'Internasional':3, 'Health':4, 'Finance':0, 'Tech':3, 'Sports':3, 'Gaming':2, 'Entertainment':0},
    { 'Name': 'Abiyyu Didar Haq', 'Copywriting':5, 'Design':5, 'Available Days':['Sabtu', 'Minggu'], 'Nasional':2, 'Internasional':4, 'Health':5, 'Finance':0, 'Tech':3, 'Sports':3, 'Gaming':1, 'Entertainment':0},
    { 'Name': 'Putu Gede Arya Karna Sampalan', 'Copywriting':4, 'Design':4, 'Available Days':['Jumat', 'Sabtu'], 'Nasional':4, 'Internasional':4, 'Health':3, 'Finance':5, 'Tech':4, 'Sports':3, 'Gaming':4, 'Entertainment':3},
    { 'Name': 'Visakha Vidyadevi Wiguna', 'Copywriting':5, 'Design':5,'Available Days':['Sabtu', 'Minggu'], 'Nasional':5, 'Internasional':4, 'Health':5, 'Finance':0, 'Tech':0, 'Sports':0, 'Gaming':2, 'Entertainment':5}
  ];
  // console.log(model.summary());
}
init()