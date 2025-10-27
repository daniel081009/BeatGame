const CARDS_PER_SET = 4;

class BeatList {
  constructor(beatlist) {
    if (beatlist.length !== CARDS_PER_SET) {
      throw new Error(`BeatList must have exactly ${CARDS_PER_SET} items, got ${beatlist.length}`);
    }
    this.beatlist = beatlist;
  }

  getBeatPattern(index) {
    if (index < 0 || index >= this.beatlist.length) {
      throw new Error(`Index ${index} out of bounds [0, ${this.beatlist.length})`);
    }
    return this.beatlist[index];
  }

  setBeatPattern(index, pattern) {
    if (index < 0 || index >= this.beatlist.length) {
      throw new Error(`Index ${index} out of bounds [0, ${this.beatlist.length})`);
    }
    this.beatlist[index] = pattern;
  }

  // Backward compatibility
  getbeatlist(i) {
    return this.getBeatPattern(i);
  }

  changebeatlistitem(i, item) {
    this.setBeatPattern(i, item);
  }
}

export default BeatList;
