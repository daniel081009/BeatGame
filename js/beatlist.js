class BeatList {
  constructor(beatlist) {
    if (beatlist.length === 4) {
      this.beatlist = beatlist;
    } else {
      throw new Error("beatlist length is not 4");
    }
  }
  getbeatlist(i) {
    return this.beatlist[i];
  }
  getbeatlistlength() {
    return this.beatlist.length;
  }
  clearbeatlist() {
    this.beatlist = [[1], [1], [1], [1]];
  }
  changebeatlistitem(i, item) {
    this.beatlist[i] = item;
  }
}

export default BeatList;
