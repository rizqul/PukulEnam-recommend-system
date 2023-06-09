# ML
Sistem rekomendasi penulis menggunakan content-based filtering dan memperhitungkan preferensi pengguna terkait judul berita, peran penulis (copywriting/design), jenis berita (nasional/internasional), dan hari ketersediaan penulis.

Langkah-langkah yang dilakukan :

1. Collecting Data

The data used is the historical_news data from PukulEnam and additional data from Kaggle, which contains a collection of news headlines created by PukulEnam. The historical_news data is used for news topic detection. The PukulEnam author data contains the names of the authors along with the values of the features that will be used for the content-based filtering model.

2. Build News Topic Detection
    - Preprocessing Text
    
      Text preprocessing is performed on the historical_news data, which involves removing punctuation, converting all letters to lowercase, removing stopwords, cleaning the text from numeric symbols, and performing stemming. Then, each word is converted into a numerical representation.
    - Build Model
    
      The model used is a BiLSTM model. The layers start with an Embedding Layer with a size of 100 dimensions, followed by a Bidirectional LSTM layer. Dropout is added to the LSTM layer. Here is the architecture of the BiLSTM model used:
      ![image](https://github.com/rizqul/PukulEnam-recommend-system/assets/54715329/b28210b0-495d-4d82-a34b-c847c9b8d9ff)
    - Evaluation Model
    
      Accuracy result :
      
      ![image](https://github.com/rizqul/PukulEnam-recommend-system/assets/54715329/0ae2d6f2-5334-44f4-92bd-55ab6aaf7792)
      
      Loss result :
      
      ![image](https://github.com/rizqul/PukulEnam-recommend-system/assets/54715329/c90d8274-ce10-4f1c-a9d7-4d546c93f67f)
    
    - Prediction with new text
    
      ![image](https://github.com/rizqul/PukulEnam-recommend-system/assets/54715329/84936479-bdd4-4a46-82e5-465afc57489e)
      
3. Build Content-Based Filtering Model for Recommendation
    - User-Profile Creation
    
      Based on user input, create a user profile by combining relevant feature vectors related to user preferences. Then, create a user profile vector that incorporates feature vectors of news titles from prediction results, roles, and corresponding types.
    - Normalization
      
      The author data containing numerical features on a scale of 0-5 indicating the abilities of the authors will be normalized to be in the range of 0-1 to have the same scale as the user profile vector.
    - Similarity Calculation
    
      Calculate the similarity between the user profile vector and the author feature vectors in the dataset. This can be done using similarity metrics such as cosine similarity. The higher the cosine similarity, the more similar the user profile is to a specific author.
    - Ranking and Recommendation
    
       Sort authors based on the similarity score with the user profile vector. Authors with the highest similarity scores are considered the most relevant and can be recommended to the user. Then, a filter is applied to check the user's requirements regarding the availability of authors on the desired day.

4. Deployment using TensorFlow.js in a web browser. The trained TensorFlow model is converted into a format that can be used by TensorFlow.js.
