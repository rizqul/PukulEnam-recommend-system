import React, { useState } from "react";
import NavBar from "../components/NavBar";
import SideNav from "../components/SideNav";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as tf from "@tensorflow/tfjs";
var sastrawi = require("sastrawijs");

export default function RequestWriter() {
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("copywriting");
  const [scope, setScope] = useState("national");
  const [day, setDay] = useState([]);
  const [ranking, setRanking] = useState([]);
  const navigate = useNavigate();

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setDay((prevDay) => [...prevDay, value]);
    } else {
      setDay((prevDay) => prevDay.filter((day) => day !== value));
    }
  };

  const saveRequest = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/news", {
        title,
        role,
        scope,
        day,
      });
      // navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  // --------------------- EXPERIMENTAL
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  // let model;
  const [model, setModel] = useState({});
  // let word2index;
  const [word2index, setWord2Index] = useState({});
  // let stopwords;
  const [stopwords, setStopWords] = useState({});
  // let authors;
  const [authors, setAuthors] = useState({});

  const maxlen = 120;
  let cbf_feature = [
    "Copywriting",
    "Design",
    "Nasional",
    "Internasional",
    "Health",
    "Finance",
    "Tech",
    "Sports",
    "Gaming",
    "Entertainment",
  ];

  // PREPROCESSING
  function clean_text(text) {
    const removedPunctuation = text.replace(/[^a-zA-Z\s]/g, "");
    const lowerText = removedPunctuation.toLowerCase();
    const words = lowerText.split(/\s+/);
    const removedStopwords = words.filter((word) => !stopwords.includes(word));
    const stemmed = [];
    const stemmer = new sastrawi.Stemmer();
    // for (word of removedStopwords) {
    //   stemmed.push(stemmer.stem(word));
    // }
    removedStopwords.forEach((word) => {
      stemmed.push(stemmer.stem(word));
    });
    return stemmed;
  }

  function padSequence(sequences, maxlen, padding = "post", pad_value = 0) {
    return sequences.map((seq) => {
      if (seq.length < maxlen) {
        const pad = [];
        for (let i = 0; i < maxlen - seq.length; i++) {
          pad.push(pad_value);
        }
        if (padding == "pre") {
          seq = pad.concat(seq);
        } else {
          seq = seq.concat(pad);
        }
      }
      return seq;
    });
  }

  // PREDIKSI TOPIK JUDUL BERITA YG DIINPUT
  function predict(inputText) {
    const processedText = clean_text(inputText);
    const sequence = processedText.map((word) => {
      let indexed = word2index[word];

      if (indexed === undefined) {
        return 1; // change to oov value
      }
      return indexed;
    });
    const paddedSequence = padSequence([sequence], maxlen);
    const scores = tf.tidy(() => {
      const input = tf.tensor2d(paddedSequence, [1, maxlen]);
      const result = model.predict(input);
      return result.dataSync();
    });
    return scores;
  }

  // MODEL CBF
  function userFeatures(user_inputs, topic_preferences) {
    const feature_cbf = ["Copywriting", "Design", "Nasional", "Internasional"];
    const userFeatureVector = [];

    feature_cbf.map((feature) => {
      if (user_inputs.includes(feature)) {
        userFeatureVector.push(1);
      } else {
        userFeatureVector.push(0);
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
    const minValues = features.reduce(
      (min, feature) =>
        feature.map((value, index) => Math.min(value, min[index])),
      features[0]
    );
    const maxValues = features.reduce(
      (max, feature) =>
        feature.map((value, index) => Math.max(value, max[index])),
      features[0]
    );
    return features.map((feature) =>
      feature.map(
        (value, index) =>
          (value - minValues[index]) / (maxValues[index] - minValues[index])
      )
    );
  }

  function cosineSimilarity(a, b) {
    const dotProduct = a.reduce((acc, val, i) => acc + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0));
    const normB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (normA * normB);
  }

  function getWriter(e) {
    saveRequest(e);
    console.log("hello its workd");
    e.preventDefault();
    console.log("hello its workd2");
    if (!isModelLoaded) {
      alert("Model not loaded yet");
      return;
    }

    const inputText = title;
    const select = [role, scope];
    const hari = day;
    const topic_preferences = predict(inputText);
    const userFeatureVector = userFeatures(select, topic_preferences);

    const authorFeatures = authors.map((author) =>
      cbf_feature.map((feature) => author[feature])
    );
    const normalizedAuthorFeatures = normalizeFeatures(authorFeatures);
    const filteredAuthors = authors.filter((author) =>
      hari.every((day) => author["Available Days"].includes(day))
    );
    const similarityScores = filteredAuthors.map((author, index) =>
      cosineSimilarity(userFeatureVector, normalizedAuthorFeatures[index])
    );
    // console.log(similarityScores);
    const recommendations = filteredAuthors.map((author, index) => ({
      author: author.Name,
      score: similarityScores[index],
    }));
    recommendations.sort((a, b) => b.score - a.score);

    const ranking1 = [];
    recommendations.forEach((recommendation) => {
      // console.log(
      //   `Author: ${recommendation.author}, Score: ${recommendation.score}`
      // );
      ranking1.push(recommendation);
    });

    setRanking(ranking1);
    // console.log(ranking1);
    return false;
  }

  async function init() {
    // MEMANGGIL MODEL TFJS
    const tempModel = await tf.loadLayersModel(
      "https://raw.githubusercontent.com/rizqul/PukulEnam-recommend-system/main/recommender/tfjs_model/model.json"
    );
    setModel(tempModel);

    const tempIsModelLoaded = true;
    setIsModelLoaded(tempIsModelLoaded);

    // MEMANGGIL WORD_INDEX
    const word_indexjson = await fetch(
      "https://raw.githubusercontent.com/rizqul/PukulEnam-recommend-system/main/recommender/word_index.json"
    );
    const tempWord2index = await word_indexjson.json();
    setWord2Index(tempWord2index);
    // MEMANGGIL STOPWORDS
    const stopwords_id = await fetch(
      "https://raw.githubusercontent.com/rizqul/PukulEnam-recommend-system/main/recommender/stopwords-id.json"
    );
    const tempStopwords = await stopwords_id.json();
    setStopWords(tempStopwords);

    setAuthors([
      {
        Name: "Aditya",
        Copywriting: 4,
        Design: 2,
        "Available Days": [
          "Senin",
          "Selasa",
          "Rabu",
          "Kamis",
          "Jumat",
          "Sabtu",
          "Minggu",
        ],
        Nasional: 4,
        Internasional: 5,
        Health: 5,
        Finance: 2,
        Tech: 3,
        Sports: 0.5,
        Gaming: 0,
        Entertainment: 0.5,
      },
      {
        Name: "Andhika Mifta Alauddin",
        Copywriting: 4,
        Design: 3,
        "Available Days": [
          "Senin",
          "Selasa",
          "Rabu",
          "Kamis",
          "Jumat",
          "Sabtu",
          "Minggu",
        ],
        Nasional: 5,
        Internasional: 4,
        Health: 1,
        Finance: 1,
        Tech: 3,
        Sports: 3,
        Gaming: 5,
        Entertainment: 3,
      },
      {
        Name: "Ni Nyoman Ayu Sintya Dewi",
        Copywriting: 4,
        Design: 3,
        "Available Days": ["Senin", "Selasa", "Rabu", "Jumat", "Sabtu"],
        Nasional: 4,
        Internasional: 3,
        Health: 3,
        Finance: 4,
        Tech: 4,
        Sports: 1,
        Gaming: 2,
        Entertainment: 3,
      },
      {
        Name: "Dewa Bagus Trima Putra",
        Copywriting: 4,
        Design: 5,
        "Available Days": ["Rabu", "Jumat"],
        Nasional: 4,
        Internasional: 4,
        Health: 3,
        Finance: 5,
        Tech: 4,
        Sports: 3,
        Gaming: 3,
        Entertainment: 5,
      },
      {
        Name: "Patma Ari Ayu Kartini",
        Copywriting: 4,
        Design: 4,
        "Available Days": ["Selasa", "Jumat"],
        Nasional: 4,
        Internasional: 4,
        Health: 4,
        Finance: 4,
        Tech: 4,
        Sports: 3,
        Gaming: 3,
        Entertainment: 4,
      },
      {
        Name: "Risa Pebriyanthi",
        Copywriting: 4,
        Design: 2,
        "Available Days": ["Selasa", "Sabtu"],
        Nasional: 5,
        Internasional: 3,
        Health: 3,
        Finance: 4.5,
        Tech: 2,
        Sports: 1,
        Gaming: 1,
        Entertainment: 2,
      },
      {
        Name: "Suci Hastika Salmaaini",
        Copywriting: 5,
        Design: 5,
        "Available Days": ["Rabu", "Kamis"],
        Nasional: 5,
        Internasional: 4,
        Health: 3,
        Finance: 4.5,
        Tech: 4.5,
        Sports: 2,
        Gaming: 3,
        Entertainment: 3,
      },
      {
        Name: "Ni Luh Santi Wahyuni",
        Copywriting: 4,
        Design: 2,
        "Available Days": ["Rabu"],
        Nasional: 5,
        Internasional: 3,
        Health: 2,
        Finance: 4,
        Tech: 2,
        Sports: 1,
        Gaming: 1,
        Entertainment: 2.5,
      },
      {
        Name: "Andre Winata",
        Copywriting: 4,
        Design: 4,
        "Available Days": ["Senin", "Rabu", "Minggu"],
        Nasional: 4,
        Internasional: 4,
        Health: 1.5,
        Finance: 2,
        Tech: 5,
        Sports: 4,
        Gaming: 3,
        Entertainment: 2,
      },
      {
        Name: "Iga Narendra Pramawijaya",
        Copywriting: 4,
        Design: 1,
        "Available Days": ["Sabtu", "Minggu"],
        Nasional: 3,
        Internasional: 4,
        Health: 2,
        Finance: 4,
        Tech: 5,
        Sports: 3,
        Gaming: 3,
        Entertainment: 1,
      },
      {
        Name: "Nyoman Satiya Nanjaya Sadha",
        Copywriting: 2,
        Design: 2,
        "Available Days": ["Sabtu", "Minggu"],
        Nasional: 2,
        Internasional: 3,
        Health: 4,
        Finance: 0,
        Tech: 3,
        Sports: 3,
        Gaming: 2,
        Entertainment: 0,
      },
      {
        Name: "Abiyyu Didar Haq",
        Copywriting: 5,
        Design: 5,
        "Available Days": ["Sabtu", "Minggu"],
        Nasional: 2,
        Internasional: 4,
        Health: 5,
        Finance: 0,
        Tech: 3,
        Sports: 3,
        Gaming: 1,
        Entertainment: 0,
      },
      {
        Name: "Putu Gede Arya Karna Sampalan",
        Copywriting: 4,
        Design: 4,
        "Available Days": ["Jumat", "Sabtu"],
        Nasional: 4,
        Internasional: 4,
        Health: 3,
        Finance: 5,
        Tech: 4,
        Sports: 3,
        Gaming: 4,
        Entertainment: 3,
      },
      {
        Name: "Visakha Vidyadevi Wiguna",
        Copywriting: 5,
        Design: 5,
        "Available Days": ["Sabtu", "Minggu"],
        Nasional: 5,
        Internasional: 4,
        Health: 5,
        Finance: 0,
        Tech: 0,
        Sports: 0,
        Gaming: 2,
        Entertainment: 5,
      },
    ]);
    // console.log(model.summary());
  }
  init();
  // --------------------- EXPERIMENTAL

  return (
    <>
      <div className="App">
        <NavBar />

        <div className="flex-grow flex">
          <div className="w-64">
            <SideNav />
          </div>
          <div className="flex flex-grow flex-col m-4">
            <div className="flex flex-grow items-center justify-center">
              <h1 className="text-4xl font-bold">
                Fill the{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">
                  Form
                </span>
              </h1>
            </div>
            <form className="mx-10" onSubmit={getWriter}>
              {/* Set Title */}
              <div className="mb-6">
                <label
                  for="title"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Your News Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="flex w-full justify-between gap-8 mb-6">
                {/* Set Role */}
                <div className="w-full">
                  <label
                    for="role"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Select your Writer Role
                  </label>
                  <select
                    id="role"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="Copywriting">Copywriting</option>
                    <option value="Design">Design</option>
                  </select>
                </div>
                {/* Set Scope */}
                <div className="w-full">
                  <label
                    for="scope"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Select your News Scope
                  </label>
                  <select
                    id="scope"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                  >
                    <option value="Nasional">Nasional</option>
                    <option value="Internasional">Internasional</option>
                  </select>
                </div>
              </div>
              {/* Set Day */}
              <div className="w-full flex flex-col mb-6">
                <h3 className="block mb-2 text-sm font-medium text-gray-900">
                  Choose your day:
                </h3>
                <ul className="grid w-full gap-6 md:grid-cols-7">
                  <li>
                    <input
                      type="checkbox"
                      id="Senin-option"
                      value="Senin"
                      className="hidden peer"
                      onChange={handleCheckboxChange}
                    />
                    <label
                      for="Senin-option"
                      className="inline-flex items-center justify-between w-full p-2 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-blue-600 hover:text-gray-600 peer-checked:text-gray-600 hover:bg-gray-50"
                    >
                      <div className="block">
                        <div className="w-full">Senin</div>
                      </div>
                    </label>
                  </li>
                  <li>
                    <input
                      type="checkbox"
                      id="Selasa-option"
                      value="Selasa"
                      className="hidden peer"
                      onChange={handleCheckboxChange}
                    />
                    <label
                      for="Selasa-option"
                      className="inline-flex items-center justify-between w-full p-2 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-blue-600 hover:text-gray-600 peer-checked:text-gray-600 hover:bg-gray-50"
                    >
                      <div className="block">
                        <div className="w-full">Selasa</div>
                      </div>
                    </label>
                  </li>
                  <li>
                    <input
                      type="checkbox"
                      id="Rabu-option"
                      value="Rabu"
                      className="hidden peer"
                      onChange={handleCheckboxChange}
                    />
                    <label
                      for="Rabu-option"
                      className="inline-flex items-center justify-between w-full p-2 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-blue-600 hover:text-gray-600 peer-checked:text-gray-600 hover:bg-gray-50"
                    >
                      <div className="block">
                        <div className="w-full">Rabu</div>
                      </div>
                    </label>
                  </li>
                  <li>
                    <input
                      type="checkbox"
                      id="Kamis-option"
                      value="Kamis"
                      className="hidden peer"
                      onChange={handleCheckboxChange}
                    />
                    <label
                      for="Kamis-option"
                      className="inline-flex items-center justify-between w-full p-2 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-blue-600 hover:text-gray-600 peer-checked:text-gray-600 hover:bg-gray-50"
                    >
                      <div className="block">
                        <div className="w-full">Kamis</div>
                      </div>
                    </label>
                  </li>
                  <li>
                    <input
                      type="checkbox"
                      id="Jumat-option"
                      value="Jumat"
                      className="hidden peer"
                      onChange={handleCheckboxChange}
                    />
                    <label
                      for="Jumat-option"
                      className="inline-flex items-center justify-between w-full p-2 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-blue-600 hover:text-gray-600 peer-checked:text-gray-600 hover:bg-gray-50"
                    >
                      <div className="block">
                        <div className="w-full">Jumat</div>
                      </div>
                    </label>
                  </li>
                  <li>
                    <input
                      type="checkbox"
                      id="Sabtu-option"
                      value="Sabtu"
                      className="hidden peer"
                      onChange={handleCheckboxChange}
                    />
                    <label
                      for="Sabtu-option"
                      className="inline-flex items-center justify-between w-full p-2 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-blue-600 hover:text-gray-600 peer-checked:text-gray-600 hover:bg-gray-50"
                    >
                      <div className="block">
                        <div className="w-full">Sabtu</div>
                      </div>
                    </label>
                  </li>
                  <li>
                    <input
                      type="checkbox"
                      id="Minggu-option"
                      value="Minggu"
                      className="hidden peer"
                      onChange={handleCheckboxChange}
                    />
                    <label
                      for="Minggu-option"
                      className="inline-flex items-center justify-between w-full p-2 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-blue-600 hover:text-gray-600 peer-checked:text-gray-600 hover:bg-gray-50"
                    >
                      <div className="block">
                        <div className="w-full">Minggu</div>
                      </div>
                    </label>
                  </li>
                </ul>
              </div>
              <div className="flex">
                <button
                  type="submit"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 focus:outline-none w-full"
                >
                  Default
                </button>
              </div>
            </form>
            {/* <div>
              {ranking.map((data) => (
                <p>
                  name : {data.author} ({data.score})
                </p>
              ))}
            </div> */}
            <div className="writer-ranking">
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((data) => (
                      <tr className="bg-white border-b">
                        <td className="px-6 py-4">{data.author}</td>
                        <td className="px-6 py-4">{data.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
