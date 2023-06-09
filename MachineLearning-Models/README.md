# ML
Sistem rekomendasi penulis menggunakan content-based filtering dan memperhitungkan preferensi pengguna terkait judul berita, peran penulis (copywriting/design), jenis berita (nasional/internasional), dan hari ketersediaan penulis.

Langkah-langkah yang dilakukan :

1. Pengumpulan Data

Data yang digunakan merupakan data historical_news dari PukulEnam dan kaggle yang berisi kumpulan judul berita yang telah dibuat oleh PukulEnam. Data historical_news digunakan untuk deteksi topik berita. Data penulis PukulEnam yang berisi nama-nama penulis beserta nilai dari fitur-fitur yang akan digunakan untuk content-based filtering model.

2. Membangun Model Deteksi Topik Berita
    - Preprocessing Teks
    
      Preprocessing teks dilakukan pada data historical_news, terdiri dari menghapus punctuation, menyamakan semua huruf menjadi huruf kecil, menghapus stopwords, membersihkan teks dari tanda baca numerik, dan melakukan stemming. Kemudian mengkonversi setiap kata menjadi representasi numerik. 
    - Build Model
    
      Model yang digunakan adalah model BiLSTM. Layer dimulai dari Embedding Layer dengan ukuran 100 dimensi kemudian LSTM didalam layer Bidirectional. Di layer LSTM ditambahkan dropout. Berikut arsitektur model BiLSTM yang digunakan : 
      ![image](https://github.com/rizqul/PukulEnam-recommend-system/assets/54715329/b28210b0-495d-4d82-a34b-c847c9b8d9ff)
    - Evaluasi Model
    
      Hasil akurasi diperoleh :
      
      ![image](https://github.com/rizqul/PukulEnam-recommend-system/assets/54715329/0ae2d6f2-5334-44f4-92bd-55ab6aaf7792)
      
      Hasil loss diperoleh :
      
      ![image](https://github.com/rizqul/PukulEnam-recommend-system/assets/54715329/c90d8274-ce10-4f1c-a9d7-4d546c93f67f)
    
    - Prediksi
    
      ![image](https://github.com/rizqul/PukulEnam-recommend-system/assets/54715329/84936479-bdd4-4a46-82e5-465afc57489e)
      
3. Membangun Model Content-Based Filtering
    - User-Profile Creation
    
      Berdasarkan input pengguna, buat profil pengguna dengan menggabungkan vektor fitur yang relevan yang berkaitan dengan preferensi pengguna. 
      Kemudian buat vektor profil pengguna yang menggabungkan vektor fitur judul berita dari hasil prediksi, peran, dan jenis yang sesuai.
    - Normalization
    
      Data penulis yang berisi fitur-fitur numerik dari skala 0-5 yang mengindikasikan kemampuan dari penulis-penulis tersebut, akan dilakukan normalisasi untuk berada di range 0-1 agar skalanya sama dengan vektor profil pengguna.
    - Similarity Calculation
    
      Hitung kesamaan antara vektor profil pengguna dan vektor fitur penulis dalam dataset. Ini dapat dilakukan dengan menggunakan metrik kesamaan seperti cosine similarity. Semakin tinggi kesamaan kosinus, semakin mirip profil pengguna dengan penulis tertentu.
    - Ranking and Recommendation
    
       Urutkan penulis berdasarkan skor kesamaan dengan vektor profil pengguna. Penulis dengan skor kesamaan tertinggi dianggap paling relevan dan dapat direkomendasikan kepada pengguna. Setelah itu dilakukan filter untuk mencari kebutuhan user akan kesediaan penulis di hari yang diinginkan.

4. Deployment menggunakan Tensorflow.js pada web browser. Model TensorFlow yang telah dilatih dikonversi ke format yang dapat digunakan oleh TensorFlow.js.
