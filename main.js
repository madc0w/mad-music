const numNotes = 24;
const lowFreq = 220;
const attack = 400;
const decay = attack;

var isPlaying = false;
const audioCtx = new AudioContext();
const notes = [];
var playPauseSpan;

function onLoad() {
	playPauseSpan = document.getElementById('play-pause');

	var didInit = false;
	function f() {
		if (!didInit) {
			didInit = true;
			for (var i = 0; i < numNotes; i++) {
				const gainNode = audioCtx.createGain();
				const oscillator = audioCtx.createOscillator();
				oscillator.connect(gainNode);
				oscillator.frequency.value = lowFreq * Math.pow(2, i / 12);
				// oscillator.detune.value = 100; // value in cents
				oscillator.start(0);
				gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
				notes.push({
					id: i,
					oscillator,
					gainNode,
				});
			}

			// gainNode.gain.minValue = volume;
			// gainNode.gain.maxValue = volume;
		}
		// const note = notes[Math.floor(Math.random() * notes.length)];
		togglePlay(notes[12]);
	}
	window.addEventListener('keydown', f);
	window.addEventListener('click', f);
}

function togglePlay(note) {
	isPlaying = !isPlaying;

	if (isPlaying) {
		note.gainNode.connect(audioCtx.destination);
		playPauseSpan.innerHTML = 'pause';
	} else {
		setTimeout(() => {
			note.gainNode.disconnect(audioCtx.destination);
		}, decay);
		playPauseSpan.innerHTML = 'play';
	}
	ramp(note, isPlaying);
}

var isRamping = {};
function ramp(note, isUp) {
	if (isRamping[note.id]) {
		console.log('ramp already in progress');
	} else {
		isRamping[note.id] = true;
		const startTime = audioCtx.currentTime;
		const endTime = startTime + (isUp ? attack : decay) / 1000;
		var val = isUp ? 0 : 1;
		const interval = 20;
		const step = (isUp ? 1 : -1) * interval / (1000 * (endTime - startTime));
		const intervalId = setInterval(() => {
			if (audioCtx.currentTime >= endTime) {
				clearInterval(intervalId);
				isRamping[note.id] = false;
			} else {
				val += step;
				note.gainNode.gain.value = val;
				// gain.setValueAtTime(val, audioCtx.currentTime);
				// console.log(isUp, val);
			}
		}, interval);
	}
}
