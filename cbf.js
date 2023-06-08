const authors = [
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
const user_inputs = ['Copywriting', 'Nasional']
const selectedDay = ['Senin']
const topic_preferences = [
    {
        'Finance': 0.6435556, //2
        'Gaming': 0.0011855286, //5
        'Entertainment': 0.002206102, //6
        'Health': 0.22767814,  //1
        'Sports': 0.065193415, //4
        'Tech': 0.060181238 //3
    }
]

const feature_cbf = ['Copywriting', 'Design', 'Nasional', 'Internasional', 'Health', 'Finance', 'Tech', 'Sports', 'Gaming','Entertainment']

const userFeatureVector = [];
feature_cbf.map((feature) => {
    if (user_inputs.includes(feature)) {
        userFeatureVector.push(1)
    } else if (topic_preferences[0].hasOwnProperty(feature)) {
        userFeatureVector.push(topic_preferences[0][feature])
    } else {
        userFeatureVector.push(0)
    }
})

// const userFeatures = tf.tensor2d([userFeatureVector])

const authorFeatures = authors.map(author => feature_cbf.map(feature => author[feature]));

function normalizeFeatures(features) {
    const minValues = features.reduce((min, feature) => feature.map((value, index) => Math.min(value, min[index])), features[0]);
    const maxValues = features.reduce((max, feature) => feature.map((value, index) => Math.max(value, max[index])), features[0]);
    return features.map(feature => feature.map((value, index) => (value - minValues[index]) / (maxValues[index] - minValues[index])));
}

const normalizedAuthorFeatures = normalizeFeatures(authorFeatures);

// Calculate cosine similarity between user profile and author features
function cosineSimilarity(a, b) {
    const dotProduct = a.reduce((acc, val, i) => acc + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0));
    const normB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (normA * normB);
}

// Filter writers based on available days
const filteredAuthors = authors.filter(author => selectedDay.every(day => author['Available Days'].includes(day)));

const similarityScores = filteredAuthors.map((author, index) =>
    cosineSimilarity(userFeatureVector, normalizedAuthorFeatures[index])
);  

// Get recommended authors based on similarity scores
const recommendations = filteredAuthors.map((author, index) => ({
    author: author.Name,
    score: similarityScores[index]
}));

// Sort recommendations by score (descending)
recommendations.sort((a, b) => b.score - a.score);
  
// Print recommended authors
// console.log('Recommended Authors:');
// recommendations.forEach(recommendation => {
//     console.log(`Author: ${recommendation.author}, Score: ${recommendation.score}`);
// });



