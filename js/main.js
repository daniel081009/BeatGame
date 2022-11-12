import Game from "./game.js";

const Cards = document.querySelectorAll(".Card");

var game = new Game(Cards);

function toggle() {
  document.getElementsByClassName("EndPrint")[0].classList.toggle("invisible");
  document.getElementsByClassName("GameBord")[0].classList.toggle("invisible");
  document.getElementsByClassName("setting")[0].classList.toggle("invisible");
  document.getElementById("btn").classList.toggle("invisible");
}

game.UserEnd = toggle;

document.onkeydown = function () {
  if (game.play) {
    if (game.new_card_number != game.live_card_number) {
      game.new_card_number = game.live_card_number;
      game.live_beat_number = 0;
    }
    const d = game.bpm.BPMCheck(
      new Date().getTime(),
      game.LiveWantBeatpattern.need[game.live_beat_number]
    );
    game.LiveWantBeatpattern.have.push(d);
    game.live_beat_number++;
  }
};

document.documentElement.addEventListener(
  "touchend",
  function (event) {
    if (game.play) {
      event.preventDefault();
      if (game.new_card_number != game.live_card_number) {
        game.new_card_number = game.live_card_number;
        game.live_beat_number = 0;
      }
      const d = game.bpm.BPMCheck(
        new Date().getTime(),
        game.LiveWantBeatpattern.need[game.live_beat_number]
      );
      game.LiveWantBeatpattern.have.push(d);
      game.live_beat_number++;
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
  toggle();
  game.Start(
    document.querySelector("#bpm").value,
    document.querySelector("input[type=radio]:checked").value,
    16
  );
});
