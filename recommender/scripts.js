let input = document.querySelector('input')
let button = document.querySelector('.button')
button.addEventListener('click', onClick);

let isModelLoaded = false;
let model;
let word2index;

import { Stemmer } from 'sastrawijs';
import { includes } from 'stopwords-id';

const maxlen = 120;
const vocab_size = 3000;
const padding = 'post';

// var myVar;

// function myFunction() {
//     myVar = setTimeout(showPage, 3000);
// }

// function showPage() {
//     document.getElementById("inputTitle");
// }
let data;
document.getElementById('temp-form').addEventListener("submit", (event)=>{
    event.preventDefault();
data = document.getElementById("inputTitle").value;
console.log(data);
})

function getInput(){
    const titleText = document.getElementById('inputTitle');
    // return titleText.value;
    console.log(titleText.value);
}
getInput();

function clean_text(text) {
    const removedPunctuation = text.replace(/[^a-zA-Z\s]/g, '');
    const lowerText = removedPunctuation.toLowerCase();
    const words = lowerText.split(/\s+/);

    const removedStopwords = words.filter(word => !includes(word));
    
    const stemmed = [];
    const stemmer = new Stemmer();
    for (word of removedStopwords) {
        stemmed.push(stemmer.stem(word));
    }
    
    const filteredSentence = stemmed.join(' ');
    return filteredSentence;
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

function predictTopic(text){
    const processedText = clean_text(text);
    const sequence = processedText.map(word => {
        let indexed = word2index[word];
        if (indexed === undefined){
            return 1; // change to oov value
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

function onClick(){
    if (!isModelLoaded) {
        alert("Model not loaded yet");
        return;
    }

    if (getInput() === '') {
        alert("Title Can't be Null");
        document.getElementById('inputTitle').focus();
        return;
    }
    const inputText = getInput();
    let score = predict(inputText);
    alert(score);
}

async function init(){
    model = await tf.loadLayersModel('https://127.0.0.1:8887/tfjs_model/model.json');
    isModelLoaded = true;

    const word_indexjson = await fetch('http://127.0.0.1:8887/word_index.json');
    word2index = await word_indexjson.json();

    console.log(model.summary());
    console.log('Model & Metadata Loaded Succesfully');
}