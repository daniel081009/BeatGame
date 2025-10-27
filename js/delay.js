import BPM from "./bpm.js";
import Metronome from "./met.js";

let bpm = new BPM(100, 0);
let metronome = new Metronome(100);
let Game_start = false;

const average = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;

// DOM 요소 캐싱
const startBtn = document.getElementById("start");
const countDisplay = document.getElementById("count");

startBtn.onclick = function () {
  metronome.startStop();
  startBtn.style.display = "none";
  Game_start = true;
};

let count = 0;
let beat_list = [];
document.onkeydown = function (e) {
  if (Game_start && e.code === "Space") {
    e.preventDefault();
    if (count > 9) {
      metronome.startStop();
      const avgDelay = average(beat_list);
      countDisplay.innerText = avgDelay + "ms";
      localStorage.setItem("delay", avgDelay);
      beat_list = [];

      count = 0;
      startBtn.style.display = "block";
      Game_start = false;
      location.replace("./");
    } else {
      beat_list.push(bpm.BPMCheck(new Date().getTime(), 1));
      countDisplay.innerText = average(beat_list) + "ms";
      count++;
    }
  }
};
