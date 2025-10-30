const MS_PER_MINUTE = 60 * 1000;

class BPM {
  constructor(bpm, delayMs = 0) {
    this.bpm = bpm; // Beats per minute
    this.delayMs = delayMs; // User input delay compensation in milliseconds
    this.lastTimestamp = 0; // Last beat timestamp (from performance.now())
    this.lastBeatDivision = 1; // Last beat division (1, 2, 3, 4)
  }

  /**
   * Calculate timing accuracy for a beat input
   * @param {number} now - Current timestamp from performance.now() in milliseconds
   * @param {number} beatDivision - Beat division (1=whole, 2=half, 3=triplet, 4=quarter)
   * @returns {number} Timing error in milliseconds (positive=early, negative=late)
   */
  calculateTimingError(now, beatDivision) {
    // First beat - just record timestamp
    if (this.lastTimestamp === 0) {
      this.lastTimestamp = now;
      this.lastBeatDivision = beatDivision;
      return 0;
    }

    // Reset timing on beat division change to 1 (new measure)
    if (this.lastBeatDivision !== beatDivision && beatDivision === 1) {
      const expectedInterval = MS_PER_MINUTE / this.bpm / beatDivision;
      this.lastTimestamp = now - expectedInterval;
    }

    // Calculate timing
    const actualElapsed = now - this.lastTimestamp - this.delayMs;
    const expectedInterval = MS_PER_MINUTE / this.bpm / beatDivision;

    this.lastTimestamp = now;
    this.lastBeatDivision = beatDivision;

    // Return timing error: positive = early, negative = late
    return Math.floor(expectedInterval - actualElapsed);
  }

  // Backward compatibility alias
  BPMCheck(now, beat) {
    return this.calculateTimingError(now, beat);
  }
}

export default BPM;
