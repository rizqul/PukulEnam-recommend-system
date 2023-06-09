import React from "react";
import { useNavigate } from "react-router-dom";

export default function SideNav() {
  const navigate = useNavigate();
  return (
    <aside
      id="default-sidebar"
      className="fixed top-16 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
      aria-label="Sidebar"
    >
      <div className="h-full px-3 py-4 overflow-y-auto bg-red-950 ">
        <ul className="space-y-2 font-medium">
          <li>
            <span
              className="flex items-center p-2 text-white hover:bg-red-500"
              onClick={() => {
                navigate("/");
              }}
            >
              <svg
                aria-hidden="true"
                className="w-6 h-6 text-white transition duration-75  group-hover:text-gray-900 dark:group-hover:text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
              </svg>
              <span className="ml-3">Home</span>
            </span>
          </li>
          <li>
            <span
              className="flex items-center p-2 text-white hover:bg-red-500"
              onClick={() => {
                navigate("/request-writer");
              }}
            >
              <svg
                aria-hidden="true"
                className="flex-shrink-0 w-6 h-6 text-white transition duration-75  group-hover:text-gray-900 dark:group-hover:text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <span className="flex-1 ml-3 whitespace-nowrap">
                Request Writer
              </span>
            </span>
          </li>
        </ul>
      </div>
    </aside>
  );
}
