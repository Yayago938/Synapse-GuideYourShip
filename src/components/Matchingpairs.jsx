import React, { useState, useEffect } from "react";
import compass from "../assets/compass.png";
import coin from "../assets/coin.png";
import ship from "../assets/ship.png";
import anchor from "../assets/anchor.png";
import cannon from "../assets/cannon.png";
import sword from "../assets/sword.png";
import map from "../assets/TMF02.png";
import mapship from "../assets/transparentship.png";
import backsidecard from "../assets/backsidecard.png";
import Confetti from "react-confetti";

const images = [compass, coin, ship, anchor, cannon, sword];

// Helper: Shuffle cards
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const Matchingpairs = () => {
  const [shuffledCards, setShuffledCards] = useState(() =>
    shuffleArray([...images, ...images])
  );
  const [flippedCards, setFlippedCards] = useState(Array(12).fill(false));
  const [matchedCards, setMatchedCards] = useState([]);
  const [selected, setSelected] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [shipPosition, setShipPosition] = useState({ x: 10, y: 90 });
  const [progress, setProgress] = useState(0);

  // --- MAP PATH CONFIGURATION ---
  const WAYPOINTS = [
    { x: 10, y: 90 },
    { x: 35, y: 30 },
    { x: 60, y: 50 },
    { x: 85, y: 10 },
  ];
  const NUM_SEGMENTS = WAYPOINTS.length - 1;

  const catmullRom = (p0, p1, p2, p3, t) => {
    const t2 = t * t;
    const t3 = t2 * t;
    const c0 = p1;
    const c1 = 0.5 * (p2 - p0);
    const c2 = 0.5 * (2 * p0 - 5 * p1 + 4 * p2 - p3);
    const c3 = 0.5 * (-p0 + 3 * p1 - 3 * p2 + p3);
    return c0 + c1 * t + c2 * t2 + c3 * t3;
  };

  const moveShip = () => {
    if (images.length === 0) return;

    setProgress((prev) => {
      const newProgress = Math.min(prev + 1, images.length);
      const ratio = newProgress / images.length;
      const segmentIndex = Math.min(
        Math.floor(ratio * NUM_SEGMENTS),
        NUM_SEGMENTS - 1
      );
      const segmentRatio = ratio * NUM_SEGMENTS - segmentIndex;

      const p1 = WAYPOINTS[segmentIndex];
      const p2 = WAYPOINTS[segmentIndex + 1];
      const p0 = segmentIndex === 0 ? p1 : WAYPOINTS[segmentIndex - 1];
      const p3 =
        segmentIndex === NUM_SEGMENTS - 1 ? p2 : WAYPOINTS[segmentIndex + 2];

      const newX = catmullRom(p0.x, p1.x, p2.x, p3.x, segmentRatio);
      const newY = catmullRom(p0.y, p1.y, p2.y, p3.y, segmentRatio);

      setShipPosition({ x: newX, y: newY });
      return newProgress;
    });
  };

  // Responsive confetti size
  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleFlip = (index) => {
    if (flippedCards[index] || matchedCards.includes(index) || gameOver) return;

    const newFlipped = [...flippedCards];
    newFlipped[index] = true;
    setFlippedCards(newFlipped);

    const newSelected = [...selected, index];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;

      if (shuffledCards[first] === shuffledCards[second]) {
        setMatchedCards((prev) => [...prev, first, second]);
        setSelected([]);
        moveShip();

        if (matchedCards.length + 2 === shuffledCards.length) {
          setTimeout(() => setShowWinPopup(true), 400);
        }
      } else {
        setTimeout(() => {
          const resetFlipped = [...newFlipped];
          resetFlipped[first] = false;
          resetFlipped[second] = false;
          resetFlipped[second] = false;
          setFlippedCards(resetFlipped);
          setSelected([]);
        }, 800);
      }
    }
  };

  const resetGame = () => {
    setShuffledCards(shuffleArray([...images, ...images]));
    setFlippedCards(Array(12).fill(false));
    setMatchedCards([]);
    setSelected([]);
    setGameOver(false);
    setShowWinPopup(false);
    setShipPosition({ x: 10, y: 90 });
    setProgress(0);
  };
// bg-gradient-to-b from-yellow-200 to-amber-400
  return (
    <div className="h-screen w-full  flex flex-col bg-[url('./assets/gamebg.jpg')] bg-cover bg-center items-center justify-center overflow-hidden relative p-4 ">
      <h1 className="text-4xl lg:text-5xl font-extrabold text-amber-400 mb-6 text-center drop-shadow-lg">
        🏴‍☠️ Guide Your Ship
      </h1>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-4 xl:gap-12 w-full max-w-7xl flex-grow">

        {/* Pirate Map */}
        {/* Map size increased for large screens (xl:w-[32rem], xl:h-[32rem]) */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-[24rem] md:h-[24rem] lg:w-[28rem] lg:h-[28rem] xl:w-[32rem] xl:h-[32rem] flex-shrink-0">
          <img
            src={map}
            alt="Map"
            className="absolute top-0 left-0 w-full h-full object-contain rounded-2xl shadow-2xl"
          />
          <img
            src={mapship}
            alt="Ship"
            className="absolute transition-all duration-700 ease-in-out w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40"
            style={{
              top: `${shipPosition.y}%`,
              left: `${shipPosition.x}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>

        {/* Cards Grid */}
        {/* Card size adjusted and grid gap reduced for large screens */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-3 lg:gap-4 xl:gap-6 justify-center">
          {shuffledCards.map((img, index) => (
            <div
              key={index}
              onClick={() => handleFlip(index)}
              className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 xl:w-36 xl:h-36 cursor-pointer [perspective:300px]"
            >
              <div
                className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
                  flippedCards[index] ? "[transform:rotateY(180deg)]" : ""
                }`}
              >
                {/* Back Side */}
                <img
                  src={backsidecard}
                  alt="Backside"
                  className="absolute w-full h-full object-cover rounded-lg shadow-md [backface-visibility:hidden]"
                />

                {/* Front Side */}
                <img
                  src={img}
                  alt={`Card ${index}`}
                  className="absolute w-full h-full object-cover rounded-lg shadow-md [backface-visibility:hidden] [transform:rotateY(180deg)]"
                />
              </div>
            </div>
          ))}
        </div>

      </div>

      {showWinPopup && (
        <>
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            numberOfPieces={400}
            recycle={false}
          />
          <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/70 text-white z-50">
            <h2 className="text-4xl font-bold mb-2">🎉 You Won! 🎉</h2>
            <p className="mb-4 text-lg">All pairs matched successfully!</p>
            <button
              onClick={resetGame}
              className="bg-yellow-500 px-6 py-3 rounded-lg hover:bg-yellow-600 transition"
            >
              Play Again
            </button>
          </div>
        </>
      )}

      <button
        onClick={resetGame}
        className="mt-6 bg-blue-700 text-white px-6 py-3 rounded-xl hover:bg-blue-800 transition shadow-lg "
      >
        🔄 Restart Game
      </button>
    </div>
  );
};

export default Matchingpairs;