// 메트로놈 설정 상수
const LOOKAHEAD_MS = 25; // 스케줄링 간격 (밀리초)
const SCHEDULE_AHEAD_TIME_S = 0.1; // 미리 스케줄링할 시간 (초)
const BEATS_PER_BAR = 4; // 한 마디의 박자 수
const FIRST_BEAT_FREQUENCY_HZ = 1200; // 첫 박자 주파수
const OTHER_BEAT_FREQUENCY_HZ = 1000; // 일반 박자 주파수
const NOTE_CLEANUP_THRESHOLD_S = 1; // 오래된 노트 정리 기준 (초)

class Metronome {
  constructor(tempo = 120) {
    this.audioContext = null;
    this.notesInQueue = [];
    this.currentBeatInBar = 0;
    this.beatsPerBar = BEATS_PER_BAR;
    this.tempo = tempo;
    this.lookahead = LOOKAHEAD_MS;
    this.scheduleAheadTime = SCHEDULE_AHEAD_TIME_S;
    this.nextNoteTime = 0.0;
    this.isRunning = false;
    this.intervalID = null;
    this.runfunc = function () {};
  }

  nextNote() {
    const secondsPerBeat = 60.0 / this.tempo;
    this.nextNoteTime += secondsPerBeat;

    this.currentBeatInBar++;
    if (this.currentBeatInBar === this.beatsPerBar) {
      this.currentBeatInBar = 0;
    }
  }

  scheduleNote(beatNumber, time) {
    // 오래된 노트 제거 (메모리 누수 방지)
    const currentTime = this.audioContext.currentTime;
    this.notesInQueue = this.notesInQueue.filter(
      note => note.time > currentTime - NOTE_CLEANUP_THRESHOLD_S
    );

    this.notesInQueue.push({ note: beatNumber, time: time });

    const osc = this.audioContext.createOscillator();
    const envelope = this.audioContext.createGain();

    osc.frequency.value =
      beatNumber % this.beatsPerBar === 0
        ? FIRST_BEAT_FREQUENCY_HZ
        : OTHER_BEAT_FREQUENCY_HZ;
    envelope.gain.value = 1;
    envelope.gain.exponentialRampToValueAtTime(1, time + 0.001);
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

    osc.connect(envelope);
    envelope.connect(this.audioContext.destination);

    osc.start(time);
    osc.stop(time + 0.03);
    this.runfunc();
  }

  scheduler() {
    while (
      this.nextNoteTime <
      this.audioContext.currentTime + this.scheduleAheadTime
    ) {
      this.scheduleNote(this.currentBeatInBar, this.nextNoteTime);
      this.nextNote();
    }
  }

  start() {
    if (this.isRunning) return;

    if (this.audioContext === null) {
      try {
        this.audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
      } catch (e) {
        console.error("Failed to create AudioContext:", e);
        return;
      }
    }

    this.isRunning = true;

    this.currentBeatInBar = 0;
    this.nextNoteTime = this.audioContext.currentTime + 0.05;

    this.intervalID = setInterval(() => this.scheduler(), this.lookahead);
  }

  stop() {
    this.isRunning = false;

    if (this.intervalID !== null) {
      clearInterval(this.intervalID);
      this.intervalID = null;
    }
  }

  cleanup() {
    this.stop();
    if (this.audioContext !== null) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.notesInQueue = [];
  }

  startStop() {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
  }
}
export default Metronome;
