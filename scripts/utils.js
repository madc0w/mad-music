var tempo = 2000;
const attack = 0.6;
const decay = 0.3;
const lowFreq = 110;
const numWaveCompnents = 6;
var beatsPerMeasure = 16;
var mainLoopIntervalId;
const baseUrl = 'https://madc0w.github.io/mad-music';

var playingNotesDiv, stopButton;
const noteNames = [
	'A3',
	'A3#',
	'B3',
	'C3',
	'C3#',
	'D3',
	'D3#',
	'E3',
	'F3',
	'F3#',
	'G3',
	'A4',
	'A4#',
	'B4',
	'C4',
	'C4#',
	'D4',
	'D4#',
	'E4',
	'F4',
	'F4#',
	'G4',
];

var measureNum = 0;
const audioCtx = new AudioContext();

function onLoad() {
	playingNotesDiv = document.getElementById('playing-notes');
	stopButton = document.getElementById('stop-button');
	addEventListener('keydown', start);
	addEventListener('click', start);

	stopButton.onclick = () => {
		stop();
		refreshDisplay();
	};
	init();
}

var didStart = false;
function start() {
	if (didStart) {
		return;
	}
	didStart = true;
	mainLoopIntervalId = setInterval(loop, tempo);
	initLoop();
	loop();
}

function init() {}

function initLoop() {}

function play(note, done) {
	setTimeout(() => {
		console.log('playing ' + note.name, note);
		// note.gainNode.connect(audioCtx.destination);
		ramp(note, true);
		setTimeout(() => {
			ramp(note, false, done);
		}, (note.duration * tempo) / beatsPerMeasure - decay);
	}, ((note.delay || 0) * tempo) / beatsPerMeasure);
}

function ramp(note, isUp, done) {
	console.log('ramp ', isUp, note);
	if (note.ramping) {
		console.log('ramp already in progress', isUp, note);
		if (!isUp) {
			// note.gainNode.gain.value = 0;
			// try {
			// 	// console.log('disconnect ' + note.name);
			// 	note.gainNode.disconnect(audioCtx.destination);
			// 	note.oscillator.disconnect(note.gainNode);
			// } catch (err) {
			// 	console.error(err);
			// }
			// note.isPlaying = false;
			clearInterval(note.intervalId);
			// note.ramping = null;
		}
	}
	if (isUp) {
		note.isPlaying = true;
		refreshDisplay();
	}
	note.ramping = isUp ? 'up' : 'down';
	const startTime = audioCtx.currentTime;
	const endTime =
		startTime +
		(((note.duration * tempo) / beatsPerMeasure) * (isUp ? attack : decay)) /
			1000;
	var val = isUp ? 0 : 1;
	const interval = 4;
	const step = ((isUp ? 1 : -1) * interval) / (1000 * (endTime - startTime));
	// console.log('step', step);
	note.intervalId = setInterval(() => {
		if ((val == 0 && !isUp) || (val == 1 && isUp)) {
			clearInterval(note.intervalId);
			note.ramping = null;
			if (val == 0) {
				// try {
				// 	// console.log('disconnect ' + note.name);
				// 	// note.oscillator.disconnect(note.gainNode);
				// 	// note.gainNode.disconnect(audioCtx.destination);
				// 	// note.gainNode.disconnect(note.panNode);
				// } catch (err) {
				// 	console.error(err);
				// }
				note.isPlaying = false;
				refreshDisplay();
			}
			if (done) {
				done();
			}
		} else {
			val += step;
			val = Math.min(Math.max(val, 0), 1);
			// console.log('val', val);
			note.gainNode.gain.value = val;
			// gain.setValueAtTime(val, audioCtx.currentTime);
			// console.log(isUp, val);
		}
	}, interval);
}

function setRandomWave(oscillator) {
	const real = new Float32Array(numWaveCompnents + 1);
	const imag = new Float32Array(numWaveCompnents + 1);
	real[0] = imag[0] = 0;
	for (var j = 1; j <= numWaveCompnents; j++) {
		real[j] = Math.random() * 2 - 1;
		imag[j] = Math.random() * 2 - 1;
	}
	const wave = audioCtx.createPeriodicWave(real, imag);
	oscillator.setPeriodicWave(wave);
}
