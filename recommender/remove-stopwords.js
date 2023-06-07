// Import the stopwords-id package
const stopwords = require('stopwords-id');
const sastrawi = require('sastrawijs');
const maxlen = 120;

function clean_text(text) {
    const removedPunctuation = text.replace(/[^a-zA-Z\s]/g, '');
    const lowerText = removedPunctuation.toLowerCase();
    const words = lowerText.split(/\s+/);

    const removedStopwords = words.filter(word => !stopwords.includes(word));
    
    const stemmed = [];
    const stemmer = new sastrawi.Stemmer();
    for (word of removedStopwords) {
        stemmed.push(stemmer.stem(word));
    }
    
    const filteredSentence = stemmed.join(' ');
    return stemmed;
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

const word2index = require('./word_index.json');

const tf = require('@tensorflow/tfjs')
const fs = require('fs')

const inputText = "Perekonomian Indonesia sedang dalam pertumbuhan yang membanggakan";
const processedText = clean_text(inputText);
const sequence = processedText.map(word => {
    let indexed = word2index[word];

    if (indexed === undefined){
        return 1; // change to oov value
    }
    return indexed;
});
const paddedSequence = padSequence([sequence], maxlen);


// Fungsi untuk membaca file JSON secara sinkron
function loadJSONFileSync(path) {
    const jsonString = fs.readFileSync(path, 'utf8');
    return JSON.parse(jsonString);
}
  
  // Memuat model dari file model.json
async function loadModel() {
    const modelPath = './tfjs_model/model.json';
    const modelJSON = loadJSONFileSync(modelPath);
    const model = await tf.loadLayersModel(tf.io.fromMemory(modelJSON));
    return model;
}

const input = tf.tensor2d(paddedSequence, [1, maxlen]);

async function predict() {
    const model = await loadModel();
    const prediction = model.predict(input);
    const outputData = prediction.dataSync();
  
    console.log('Prediction:', outputData);
}

predict();