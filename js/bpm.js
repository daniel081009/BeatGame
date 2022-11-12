const Minute = 60 * 1000;

class BPM {
  constructor(BPM, delay) {
    this.BPM = BPM; // 그냥 BPM 값
    this.delay = delay;
    this.last = 0;
    this.lastbeat = 1;
  }
  BPMCheck(now, beat) {
    if (this.last == 0) {
      this.last = now;
      return 0;
    } else if (this.lastbeat != beat && beat == 1) {
      this.last = now - Minute / this.BPM / beat;
    }
    const beat_ms = now - this.last - this.delay;
    const needbpm = Minute / this.BPM / beat;

    this.last = now;
    this.lastbeat = beat;

    return Math.floor(needbpm - beat_ms);
  }
}

export default BPM;
