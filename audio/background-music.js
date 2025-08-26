/**
 * 背景音乐模拟文件
 * 
 * 由于无法直接下载外部音乐文件，这个文件模拟了背景音乐的功能
 * 实际项目中，您应该下载真实的音频文件并替换此文件
 * 
 * 音乐来源: Candy Town - FiftySounds
 * https://www.fiftysounds.com/royalty-free-music/candy-town.html
 */

// 创建一个简单的音频合成器
class BackgroundMusic {
  constructor() {
    this.audioContext = null;
    this.oscillator = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.notes = [
      { note: 'C4', duration: 0.5 },
      { note: 'E4', duration: 0.5 },
      { note: 'G4', duration: 0.5 },
      { note: 'C5', duration: 0.5 },
      { note: 'G4', duration: 0.5 },
      { note: 'E4', duration: 0.5 }
    ];
    this.noteIndex = 0;
    this.volume = 0.2; // 默认音量
  }

  // 初始化音频上下文
  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.volume;
      this.gainNode.connect(this.audioContext.destination);
      console.log('背景音乐初始化成功');
    } catch (e) {
      console.error('无法创建音频上下文:', e);
    }
  }

  // 获取音符的频率
  getFrequency(note) {
    const notes = {
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
      'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25
    };
    return notes[note] || 440;
  }

  // 播放单个音符
  playNote() {
    if (!this.audioContext) this.init();
    if (!this.isPlaying) return;

    const currentNote = this.notes[this.noteIndex];
    const frequency = this.getFrequency(currentNote.note);
    
    // 创建振荡器
    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.type = 'sine';
    this.oscillator.frequency.value = frequency;
    this.oscillator.connect(this.gainNode);
    
    // 播放音符
    this.oscillator.start();
    
    // 设置音符持续时间
    setTimeout(() => {
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
      }
      
      // 移动到下一个音符
      this.noteIndex = (this.noteIndex + 1) % this.notes.length;
      
      // 如果仍在播放，继续下一个音符
      if (this.isPlaying) {
        setTimeout(() => this.playNote(), 100);
      }
    }, currentNote.duration * 1000);
  }

  // 开始播放音乐
  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.playNote();
    console.log('背景音乐开始播放');
  }

  // 暂停音乐
  pause() {
    this.isPlaying = false;
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator.disconnect();
      this.oscillator = null;
    }
    console.log('背景音乐已暂停');
  }

  // 设置音量 (0-1)
  setVolume(volume) {
    if (volume < 0) volume = 0;
    if (volume > 1) volume = 1;
    
    this.volume = volume;
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
  }
}

// 导出背景音乐实例
const backgroundMusic = new BackgroundMusic();