import React, { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useSearchParams } from "react-router-dom";

const Loading = () => {
  const [searchParams] = useSearchParams();
  const nextUrl = searchParams.get("next");
  const { navigate } = useAppContext();

  useEffect(() => {
    if (nextUrl) {
      setTimeout(() => {
        navigate(`/${nextUrl}`);
      }, 5000);
    }
  }, [nextUrl]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-24 w-24 border-4 border-gray-300 border-t-primary"></div>
    </div>
  );
};

export default Loading;
