import React from "react";
import Lottie from "lottie-react";
import loader from "../assets/json/loader.json";

function Loader() {
  return (
    <div className=" w-[35px]">
      <Lottie animationData={loader} loop={true} />
    </div>
  );
}

export default Loader;
