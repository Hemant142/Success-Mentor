import React from "react";
import mission from "../images/mission.png";
import vision from "../images/vision.png";

const AboutUs = () => {
  return (
    <div className="w-full py-12 px-4 max-w-5xl mx-auto flex flex-col items-center">
      <h1 className="text-4xl md:text-6xl font-extrabold text-black my-6 text-center">
        About Us
      </h1>

      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#d49539]">
          "Online Education Is Like a Rising
        </h2>
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#304b62]">
          Tide, It's Going To Lift All Boats.!"
        </h2>
      </div>

      <p className="text-black text-center text-lg md:text-2xl font-normal max-w-4xl leading-relaxed mb-12">
        Online learning is one of the imminent trends in the education sector around the globe. This mode of learning is done through the internet. With advanced and upgraded technologies, this mode of learning has been made simpler. Online Education is also preferred in higher learning Institutions. This article will render the students about online education, its outcomes, and advantage in short and long essays on Online Education.
      </p>

      {/* Mission Image */}
      <div className="w-full mt-10">
        <img
          src={mission}
          alt="Mission statement"
          className="w-full h-auto rounded-xl shadow-md object-contain"
        />
      </div>

      {/* Vision Image */}
      <div className="w-full mt-8">
        <img
          src={vision}
          alt="Vision statement"
          className="w-full h-auto rounded-xl shadow-md object-contain"
        />
      </div>
    </div>
  );
};

export default AboutUs;