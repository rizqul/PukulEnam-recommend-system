const authors = [
    { Name: 'A', Copywriting: 4, Design: 2, Nasional: 4, Internasional: 3, Health:5, Finance: 3, Tech: 1, Sports: 0, Gaming: 0.5, Entertainment: 1 },
    { Name: 'A', Copywriting: 3, Design: 1, Nasional: 2, Internasional: 1, Health:4, Finance: 2, Tech: 0, Sports: 1, Gaming: 0, Entertainment: 0}
];
const user_inputs = ['Copywriting', 'Nasional']
const topic_preferences = [ {
    Finance: 0.6435556,
    Gaming: 0.0011855286,
    Entertainment: 0.002206102,
    Health: 0.22767814,
    Sports: 0.065193415,
    Technology: 0.060181238 }
]
// console.log(topic_preferences);
// convert user inputs to user feature vector
const userFeatureVector = [];
Object.keys(authors[0]).forEach((key) => {
    if (key != 'Name') {
        // userFeatureVector[key] = user_inputs.includes(key) ? 1 : 0;
        if (user_inputs.includes(key)) {
            userFeatureVector.push(1);
        } else {
            userFeatureVector.push(0);
        }
    }

});
console.log(userFeatureVector);