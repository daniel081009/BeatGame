import BPM from "./bpm.js";
import Metronome from "./met.js";

let bpm = new BPM(100, 0);
let metronome = new Metronome(100);
let Game_start = false;

const average = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;
document.getElementById("start").onclick = function () {
  metronome.startStop();
  document.getElementById("start").style.cssText = "display: none;";
  Game_start = true;
};

let count = 0;
let beat_list = [];
document.onkeydown = async function (e) {
  if (Game_start && e.code === "Space") {
    e.preventDefault();
    if (count > 9) {
      metronome.startStop();
      document.getElementById("count").innerText = average(beat_list) + "ms";
      localStorage.setItem("delay", average(beat_list));
      beat_list = [];

      count = 0;
      document.getElementById("start").style.cssText = "display: block;";
      Game_start = false;
      location.replace("./");
    } else {
      beat_list.push(bpm.BPMCheck(new Date().getTime(), 1));
      document.getElementById("count").innerText = average(beat_list) + "ms";
      count++;
    }
  }
};
