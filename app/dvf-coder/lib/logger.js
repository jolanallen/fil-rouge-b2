const isTTY = process.stdout.isTTY

class ProgressLogger {
  constructor() {
    this.history = []
    this.progressLine = ''
    this.maxHistory = 4
    this.totalLines = 5
    this.ready = false
  }

  log(msg) {
    this.history.push(String(msg))
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    }
    if (isTTY) {
      this._draw()
    } else {
      process.stdout.write(`\x1b[2m${msg}\x1b[22m\n`)
    }
  }

  progress(msg) {
    this.progressLine = String(msg)
    if (isTTY) {
      this._draw()
    }
  }

  finalize() {
    if (!isTTY) return
    process.stdout.write(`\x1b[${this.totalLines}B\n`)
    this.ready = false
  }

  _draw() {
    if (!this.ready) {
      for (let i = 0; i < this.totalLines; i++) process.stdout.write('\n')
      this.ready = true
    }
    process.stdout.write(`\x1b[${this.totalLines}A`)
    for (let i = 0; i < this.maxHistory; i++) {
      process.stdout.write('\r\x1b[2K')
      if (i < this.history.length) {
        process.stdout.write(`\x1b[2m${this.history[i]}\x1b[22m`)
      }
      process.stdout.write('\n')
    }
    process.stdout.write('\r\x1b[2K')
    process.stdout.write(this.progressLine)
    process.stdout.write('\n')
  }
}
