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

// 패턴을 이미지 경로로 매핑
const PATTERN_TO_IMAGE = new Map([
  ["", "./img/0.png"],
  ["1", "./img/4.png"],
  ["22", "./img/8.png"],
  ["244", "./img/2-4-4.png"],
  ["442", "./img/4-4-2.png"],
  ["4444", "./img/16.png"],
  ["333", "./img/3.png"],
]);

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

    // EndPrint 초기화
    const endPrint = document.querySelector(".EndPrint");
    const endPrintDiv = endPrint?.querySelector("div");
    if (endPrintDiv) {
      endPrintDiv.remove();
    }
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

    const er = this.gethistoryErrclick();
    const avg = this.gethistoryAvgTime();
    const totalAttempts = this.history.length * 4;

    const text = document.createElement("div");
    text.innerText = `시도: ${totalAttempts}\n실패: ${er}\n정확도: ${Math.round(avg)}ms`;
    document.querySelector(".EndPrint").appendChild(text);
  }
  PrintStateGame(ch, avg, msg = "", target) {
    // classList 업데이트 (remove는 존재하지 않아도 안전함)
    target.classList.remove("good", "bad");
    target.classList.add(ch ? "good" : "bad");

    // 텍스트 생성 및 추가
    const text = document.createElement("div");
    text.classList.add("Card_ACC");
    text.innerText = msg || (ch ? "Good!" : "Miss");
    target.appendChild(text);

    // 상태 저장
    this.LiveWantBeatpattern.output.state = ch;
    this.LiveWantBeatpattern.output.avgtime = avg;
  }
  CardACCPrint() {
    if (this.loop === 0) {
      // 첫번째 루프
      return;
    }
    const target = this.Cards[this.live_card_number - 1] || this.Cards[this.Cards.length - 1];

    // 기존 ACC 요소 제거
    const oldACC = target.querySelector(".Card_ACC");
    if (oldACC) {
      oldACC.remove();
    }

    if (this.LiveWantBeatpattern.need.length === 0) {
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
    const levelPatterns = Level[this.level];
    this.beatlist.changebeatlistitem(
      getRandomArbitrary(0, this.beatlist.beatlist.length),
      levelPatterns[getRandomArbitrary(0, levelPatterns.length)]
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
  gethistoryErrclick() {
    return this.history
      .map((e) => e.map((e) => e.output.state))
      .map((e) => e.filter((e) => e === false).length)
      .reduce((a, c) => a + c);
  }
  UpdateCardTexts(list) {
    for (let i = 0; i < list.length; i++) {
      let target = this.Cards[i];
      let existingImg = target.querySelector(".Card_img");
      const pattern = list[i].join("");
      const imgSrc = PATTERN_TO_IMAGE.get(pattern) || "./img/0.png";

      if (existingImg) {
        // 기존 이미지가 있으면 src만 변경
        existingImg.src = imgSrc;
      } else {
        // 없으면 새로 생성
        let img = document.createElement("img");
        img.className = "Card_img";
        img.src = imgSrc;
        target.appendChild(img);
      }
    }
  }
  UpdateCardChose() {
    const target = this.Cards[this.live_card_number];
    target.classList.remove("good", "bad");
    target.classList.toggle("Card_CH");

    const prevCard = this.live_card_number === 0
      ? this.Cards[this.Cards.length - 1]
      : this.Cards[this.live_card_number - 1];
    prevCard.classList.remove("Card_CH");
  }
}

export default Game;
