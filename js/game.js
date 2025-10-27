import BeatList from "./beatlist.js";
import BPM from "./bpm.js";
import Met from "./met.js";

const Level = {
  0: [[], [1]],
  1: [[], [1], [2, 2]],
  2: [[], [1], [2, 2], [4, 4, 4, 4]],
  3: [[], [1], [2, 2], [4, 4, 4, 4], [3, 3, 3]],
  4: [[], [1], [2, 2], [2, 4, 4], [4, 4, 2], [4, 4, 4, 4], [3, 3, 3]],
  5: [[], [2, 4, 4], [4, 4, 2], [4, 4, 4, 4], [3, 3, 3]],
};

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

class Game {
  constructor(Cards = document.querySelectorAll(".Card")) {
    this.play = false;
    this.level = 1;
    this.max_loop = 16;
    this.loop = 0;
    this.beatlist = null;
    this.bpm = null;
    this.metronome = null;
    this.history = [];
    this.card_history = [];
    this.live_card_number = 0;
    this.live_beat_number = 0;
    this.new_card_number = 0;
    this.LiveWantBeatpattern = {
      need: [1],
      have: [],
      output: {
        state: false,
        avgtime: 0,
      },
    };
    this.Cards = Cards;
    this.UserEnd = () => {};
  }
  init(bpm, level, max_loop) {
    this.play = true;
    this.level = parseInt(level, 10);
    this.max_loop = parseInt(max_loop, 10);
    this.loop = 0;
    this.beatlist = new BeatList([[1], [1], [1], [1]]);
    const delay = localStorage.getItem("delay");
    this.bpm = new BPM(parseFloat(bpm), delay ? parseFloat(delay) : 0);
    this.metronome = new Met(parseFloat(bpm));
    this.history = [];
    this.card_history = [];
    this.live_card_number = 0;
    this.live_beat_number = 0;
    this.new_card_number = 0;
    this.LiveWantBeatpattern = {
      need: [1],
      have: [],
      output: {
        state: false,
        avgtime: 0,
      },
    };
  }
  Start(bpm, level, max_loop) {
    this.init(bpm, level, max_loop);
    this.UpdateCardTexts(this.beatlist.beatlist);

    try {
      document
        .getElementsByClassName("EndPrint")[0]
        .getElementsByTagName("div")[0]
        .remove();
    } catch (e) {}
    this.metronome.runfunc = () => {
      if (this.live_card_number === this.Cards.length) {
        this.live_card_number = 0;
        if (this.AddLoop()) {
          this.End();
          return;
        }
      } else if (this.live_card_number === this.Cards.length - 1) {
        this.Next();
        this.AddHistory(this.card_history);
        this.UpdateCardTexts(this.beatlist.beatlist);
        this.card_history = [];
      }
      this.CardACCPrint();
      this.UpdateCardChose();
      if (this.loop !== 0) {
        this.card_history.push(this.LiveWantBeatpattern);
      }
      this.InitLiveWantBeatpattern(
        this.beatlist.getbeatlist(this.live_card_number)
      );
      this.live_card_number++;
    };
    this.metronome.startStop();
  }
  End() {
    this.UserEnd();
    this.metronome.startStop();
    this.play = false;

    let er = this.geethistoryErrclick();
    let avg = this.gethistoryAvgTime();
    let totalAttempts = this.history.length * 4;

    let text = document.createElement("div");
    text.innerText = `시도: ${totalAttempts}\n실패: ${er}\n정확도: ${Math.round(avg)}ms`;
    document.getElementsByClassName("EndPrint")[0].appendChild(text);
  }
  PrintStateGame(ch, avg, msg = "", target) {
    var text = document.createElement("div");
    text.classList.add("Card_ACC");

    if (!msg) {
      if (ch) {
        try {
          target.classList.remove("bad");
          target.classList.add("good");
        } catch (e) {}
        text.innerText = "Good!";
        target.appendChild(text);
      } else {
        try {
          target.classList.remove("good");
          target.classList.add("bad");
        } catch (e) {}
        text.innerText = "Miss";
        target.appendChild(text);
      }
    } else {
      if (ch) {
        try {
          target.classList.remove("bad");
          target.classList.add("good");
        } catch (e) {}
      } else {
        try {
          target.classList.remove("good");
          target.classList.add("bad");
        } catch (e) {}
      }
      text.innerText = msg;
      target.appendChild(text);
    }
    this.LiveWantBeatpattern.output.state = ch;
    this.LiveWantBeatpattern.output.avgtime = avg;
  }
  CardACCPrint() {
    if (this.loop === 0) {
      // 첫번째 루프
      return;
    }
    var target = this.Cards[this.live_card_number - 1];
    if (this.live_card_number === 0) {
      target = this.Cards[this.Cards.length - 1];
    }

    try {
      target.removeChild(target.getElementsByClassName("Card_ACC")[0]);
    } catch (e) {}

    if (this.LiveWantBeatpattern.need.join("") === [].join("")) {
      if (this.LiveWantBeatpattern.have.length === 0) {
        this.PrintStateGame(true, 0, null, target);
      } else {
        this.PrintStateGame(false, 0, null, target);
      }
      return;
    } else if (this.LiveWantBeatpattern.have.length === 0) {
      this.PrintStateGame(false, 0, null, target);
      return;
    }

    let sum = this.LiveWantBeatpattern.have.reduce((a, c) => a + c);
    let avg = sum / this.LiveWantBeatpattern.have.length;
    this.LiveWantBeatpattern.output.avgtime = avg;

    this.LiveWantBeatpattern.output.state =
      this.LiveWantBeatpattern.have.length ===
        this.LiveWantBeatpattern.need.length &&
      this.LiveWantBeatpattern.output.avgtime <= 150;

    if (this.LiveWantBeatpattern.output.state) {
      this.PrintStateGame(true, avg, null, target);
    } else {
      if (
        this.LiveWantBeatpattern.have.length !==
        this.LiveWantBeatpattern.need.length
      ) {
        this.PrintStateGame(false, avg, "Too Many", target);
      } else {
        this.PrintStateGame(false, avg, "Too Slow OR Fast", target);
      }
    }
    if (isNaN(this.LiveWantBeatpattern.output.avgtime)) {
      this.LiveWantBeatpattern.output.avgtime = 100;
    }
  }
  InitLiveWantBeatpattern(need) {
    this.LiveWantBeatpattern = {
      need: need,
      have: [],
      output: {
        state: false,
        avgtime: 0,
      },
    };
  }
  AddHistory(history) {
    this.history.push(history);
  }
  AddLoop() {
    if (this.loop !== this.max_loop) this.loop++;
    else return true;
    return false;
  }
  Next() {
    this.beatlist.changebeatlistitem(
      getRandomArbitrary(0, this.beatlist.beatlist.length),
      Level[this.level][getRandomArbitrary(0, Level[this.level].length)]
    );
  }
  gethistoryAvgTime() {
    return (
      this.history
        .map((e) => e.map((e) => e.output.avgtime))
        .map((e) => e.reduce((a, c) => a + c) / e.length)
        .reduce((a, c) => a + c) / this.history.length
    );
  }
  geethistoryErrclick() {
    return this.history
      .map((e) => e.map((e) => e.output.state))
      .map((e) => e.filter((e) => e == false).length)
      .reduce((a, c) => a + c);
  }
  UpdateCardTexts(list) {
    for (let i = 0; i < list.length; i++) {
      let target = this.Cards[i];
      try {
        target.removeChild(target.getElementsByClassName("Card_img")[0]);
      } catch (e) {}

      let img = document.createElement("img");
      img.className = "Card_img";

      if (list[i].join("") === [1].join("")) {
        img.src = "./img/4.png";
      } else if (list[i].join("") === [2, 2].join("")) {
        img.src = "./img/8.png";
      } else if (list[i].join("") === [2, 4, 4].join("")) {
        img.src = "./img/2-4-4.png";
      } else if (list[i].join("") === [4, 4, 2].join("")) {
        img.src = "./img/4-4-2.png";
      } else if (list[i].join("") === [4, 4, 4, 4].join("")) {
        img.src = "./img/16.png";
      } else if (list[i].join("") === [3, 3, 3].join("")) {
        img.src = "./img/3.png";
      } else if (list[i].length === 0) {
        img.src = "./img/0.png";
      }
      target.appendChild(img);
    }
  }
  UpdateCardChose() {
    let target = this.Cards[this.live_card_number];
    try {
      target.classList.remove("good");
      target.classList.remove("bad");
    } catch (e) {}
    target.classList.toggle("Card_CH");
    if (this.live_card_number === 0) {
      this.Cards[this.Cards.length - 1].classList.remove("Card_CH");
    } else {
      this.Cards[this.live_card_number - 1].classList.remove("Card_CH");
    }
  }
}

export default Game;
