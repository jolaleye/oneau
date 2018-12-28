class ColorRamp {
  constructor(rampImg) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = rampImg.width;
    this.canvas.height = rampImg.height;
    this.canvas.getContext('2d').drawImage(rampImg, 0, 0, rampImg.width, rampImg.height);
  }

  getColor(percentage) {
    return this.canvas.getContext('2d').getImageData(0, percentage * this.canvas.height, 1, 1).data;
  }
}

export default ColorRamp;
