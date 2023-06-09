import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import SideNav from "../components/SideNav";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Home() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    getNews();
  }, []);

  const getNews = async () => {
    try {
      const response = await axios.get("http://localhost:5000/news");
      setNews(response.data);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="App">
        <NavBar />

        <div className="flex-grow flex">
          <div className="w-64">
            <SideNav />
          </div>
          <div className="flex flex-grow m-4 items-center justify-center flex-col">
            <div>
              <h1 className="text-4xl font-bold">
                This is a{" "}
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">
                  PukulEnam
                </span>
              </h1>
            </div>

            <div className="w-full ">
              {news.map((newsData, index) => (
                <Link
                  class="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100"
                  to={`get-writer/${newsData.id}`}
                >
                  <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                    {newsData.title}
                  </h5>
                  <p class="font-normal text-gray-700">{newsData.day}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
