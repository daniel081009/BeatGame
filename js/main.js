import Game from "./game.js";

const Cards = document.querySelectorAll(".Card");

var game = new Game(Cards);

function toggle() {
  document.querySelector(".EndPrint").classList.toggle("invisible");
  document.querySelector(".GameBord").classList.toggle("invisible");
  document.querySelector(".setting").classList.toggle("invisible");
  document.getElementById("btn").classList.toggle("invisible");
}

game.UserEnd = toggle;

// 통합된 입력 처리 함수
function handleGameInput() {
  if (!game.play) return;

  if (game.new_card_number !== game.live_card_number) {
    game.new_card_number = game.live_card_number;
    game.live_beat_number = 0;
  }

  if (game.live_beat_number < game.LiveWantBeatpattern.need.length) {
    const d = game.bpm.BPMCheck(
      new Date().getTime(),
      game.LiveWantBeatpattern.need[game.live_beat_number]
    );
    game.LiveWantBeatpattern.have.push(d);
    game.live_beat_number++;
  }
}

document.onkeydown = function (e) {
  if (game.play && e.code === "Space") {
    e.preventDefault();
    handleGameInput();
  }
};

document.documentElement.addEventListener(
  "touchend",
  function (event) {
    if (game.play) {
      event.preventDefault();
      handleGameInput();
    }
  },
  false
);
// document.onclick = function (e) {
//   if (game.play) {
//     if (game.new_card_number != game.live_card_number) {
//       game.new_card_number = game.live_card_number;
//       game.live_beat_number = 0;
//     }
//     const d = game.bpm.BPMCheck(
//       new Date().getTime(),
//       game.LiveWantBeatpattern.need[game.live_beat_number]
//     );
//     game.LiveWantBeatpattern.have.push(d);
//     game.live_beat_number++;
//   }
// };

document.getElementById("btn").addEventListener("click", () => {
  const bpmInput = document.getElementById("bpm");
  const levelInput = document.querySelector("input[name=drone]:checked");

  if (!bpmInput || !bpmInput.value) {
    alert("BPM을 입력해주세요.");
    return;
  }

  const bpmValue = parseFloat(bpmInput.value);
  if (isNaN(bpmValue) || bpmValue <= 0 || bpmValue > 300) {
    alert("BPM은 1~300 사이의 숫자를 입력해주세요.");
    return;
  }

  if (!levelInput) {
    alert("레벨을 선택해주세요.");
    return;
  }

  toggle();
  game.Start(bpmInput.value, levelInput.value, 16);
});
