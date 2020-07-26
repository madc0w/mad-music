var isPlaying = false;
var didInit = false;
const audioCtx = new AudioContext();
const oscillator = audioCtx.createOscillator();
const gainNode = audioCtx.createGain();
var playPauseSpan;

function onLoad() {
	playPauseSpan = document.getElementById('play-pause');
	window.addEventListener('keydown', togglePlay);
	window.addEventListener('click', togglePlay);
}

function init() {
	didInit = true;

	oscillator.connect(gainNode);
	oscillator.frequency.value = 400;
	// oscillator.detune.value = 100; // value in cents
	oscillator.start(0);
	// gainNode.gain.minValue = volume;
	// gainNode.gain.maxValue = volume;
}

function togglePlay() {
	if (!didInit) {
		init();
	}
	isPlaying = !isPlaying;
	if (isPlaying) {
		gainNode.connect(audioCtx.destination);
		gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.4);
		playPauseSpan.innerHTML = 'pause';
	} else {
		gainNode.gain.linearRampToValueAtTime(1e-12, audioCtx.currentTime + 0.4);
		// setTimeout(() => {
		// 	gainNode.disconnect(audioCtx.destination);
		// }, 400);
		playPauseSpan.innerHTML = 'play';
	}

}
