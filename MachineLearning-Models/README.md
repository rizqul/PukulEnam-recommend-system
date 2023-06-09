# ML
Sistem rekomendasi penulis menggunakan content-based filtering dan memperhitungkan preferensi pengguna terkait judul berita, peran penulis (copywriting/design), jenis berita (nasional/internasional), dan hari ketersediaan penulis.
Langkah-langkah yang dilakukan :
1. Pengumpulan Data
Data yang digunakan merupakan data historical_news dari PukulEnam dan kaggle yang berisi kumpulan judul berita yang telah dibuat oleh PukulEnam. Data historical_news digunakan untuk deteksi topik berita. Data penulis PukulEnam yang berisi nama-nama penulis beserta nilai dari fitur-fitur yang akan digunakan untuk content-based filtering model.
2. Membangun Model Deteksi Topik Berita
    - Preprocessing Teks
      Preprocessing teks dilakukan pada data historical_news, terdiri dari menghapus punctuation, menyamakan semua huruf menjadi huruf kecil, menghapus stopwords, membersihkan teks dari tanda baca numerik, dan melakukan stemming. Kemudian mengkonversi setiap kata menjadi representasi numerik. 
    - Build Model
      Model yang digunakan adalah model BiLSTM. Berikut arsitektur model BiLSTM yang digunakan : 
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
    - Normalization
    - Similarity Calculation
    - Ranking and Recommendation

