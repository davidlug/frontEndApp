import React, { useEffect, useState } from 'react';

const WeightNumberLine = ({ value, min, max }) => {
  const lineLength = 100; 
  const scale = (lineLength - 10) / (max - min); 
  const [sliderValue, setSliderValue] = useState(value);

  const position = (value - min) * scale + 5; 

  useEffect(() => {
    setSliderValue(value);
}, [value]);


  return (
    <svg width={lineLength} height="20" style={{ display: 'block', margin: 'auto' }}>
      <line
        x1="5"
        y1="10"
        x2={lineLength - 5}
        y2="10"
        stroke="black"
        strokeWidth="2"
        onChange={(e) => setSliderValue(e.target.value)}

      />
      <circle cx={position} cy="10" r="3" fill="rgb(228, 130, 18)" />
    </svg>
  );
};

export default WeightNumberLine;
