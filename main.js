const noteNames = [
	'A3', 'A3#', 'B3', 'C3', 'C3#', 'D3', 'D3#', 'E3', 'F3', 'F3#', 'G3', 'A4', 'A4#', 'B4', 'C4', 'C4#', 'D4', 'D4#', 'E4', 'F4', 'F4#', 'G4',
];
const lowFreq = 220;
const attack = 400;
const decay = attack;

const audioCtx = new AudioContext();
const notes = [];
const playing = {};
var playingNotesDiv;

function onLoad() {
	playingNotesDiv = document.getElementById('playing-notes');

	var didInit = false;
	function f() {
		if (!didInit) {
			didInit = true;
			for (var i = 0; i < noteNames.length; i++) {
				const name = noteNames[i];
				const gainNode = audioCtx.createGain();
				const oscillator = audioCtx.createOscillator();
				oscillator.connect(gainNode);
				oscillator.frequency.value = lowFreq * Math.pow(2, i / 12);
				// oscillator.detune.value = 100; // value in cents
				oscillator.start(0);
				gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
				notes.push({
					name,
					id: i,
					oscillator,
					gainNode,
				});
			}

			// gainNode.gain.minValue = volume;
			// gainNode.gain.maxValue = volume;
		}
		const note = notes[Math.floor(Math.random() * notes.length)];
		togglePlay(note);
	}
	window.addEventListener('keydown', f);
	window.addEventListener('click', f);
}

function togglePlay(note) {
	playing[note.id] = playing[note.id] ? null : note;
	var html = '';
	for (const noteId in playing) {
		if (playing[noteId]) {
			html += playing[noteId].name + ' ';
		}
	}
	playingNotesDiv.innerHTML = html;

	if (playing[note.id]) {
		note.gainNode.connect(audioCtx.destination);
	} else {
		setTimeout(() => {
			note.gainNode.disconnect(audioCtx.destination);
		}, decay);
	}
	ramp(note, !!playing[note.id]);
}

const isRamping = {};
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
