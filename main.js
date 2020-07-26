const attack = 400;
const decay = attack;

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
	gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
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
		playPauseSpan.innerHTML = 'pause';
	} else {
		setTimeout(() => {
			gainNode.disconnect(audioCtx.destination);
		}, decay);
		playPauseSpan.innerHTML = 'play';
	}
	ramp(gainNode.gain, isPlaying);
}

var isRamping = false;
function ramp(gain, isUp) {
	if (isRamping) {
		console.log('ramp already in progress');
	} else {
		isRamping = true;
		const startTime = audioCtx.currentTime;
		const endTime = startTime + (isUp ? attack : decay) / 1000;
		var val = isUp ? 0 : 1;
		const interval = 20;
		const step = (isUp ? 1 : -1) * interval / (1000 * (endTime - startTime));
		const intervalId = setInterval(() => {
			if (audioCtx.currentTime >= endTime) {
				clearInterval(intervalId);
				isRamping = false;
			} else {
				val += step;
				gain.value = val;
				// gain.setValueAtTime(val, audioCtx.currentTime);
				// console.log(isUp, val);
			}
		}, interval);
	}
}
