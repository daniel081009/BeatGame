import BPM from "./bpm.js";
import Metronome from "./met.js";

// 딜레이 측정 설정
const CALIBRATION_BEATS = 10; // 딜레이 측정에 필요한 비트 수
const DEFAULT_BPM = 100; // 기본 BPM

let bpm = new BPM(DEFAULT_BPM, 0);
let metronome = new Metronome(DEFAULT_BPM);
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
    if (count >= CALIBRATION_BEATS) {
      metronome.startStop();
      const avgDelay = average(beat_list);
      countDisplay.innerText = avgDelay + "ms";

      try {
        localStorage.setItem("delay", avgDelay);
      } catch (e) {
        console.warn("Failed to save delay to localStorage:", e);
      }

      beat_list = [];
      count = 0;
      startBtn.style.display = "block";
      Game_start = false;
      location.replace("./");
    } else {
      beat_list.push(bpm.BPMCheck(performance.now(), 1));
      countDisplay.innerText = average(beat_list) + "ms";
      count++;
    }
  }
};
