const maxNotes = 6;
const startSequenceProbability = 0.3;
const stopSequenceProbability = 0.12;
const tempo = 1600;
const lowFreq = 110;
const attack = 100;
const decay = 60;

const noteNames = [
	'A3', 'A3#', 'B3', 'C3', 'C3#', 'D3', 'D3#', 'E3', 'F3', 'F3#', 'G3', 'A4', 'A4#', 'B4', 'C4', 'C4#', 'D4', 'D4#', 'E4', 'F4', 'F4#', 'G4',
];
var notes = [];
const audioCtx = new AudioContext();
// const analyser = audioCtx.createAnalyser();
var playingNotesDiv, stopButton;
var measureNum = 0;

function onLoad() {
	playingNotesDiv = document.getElementById('playing-notes');
	stopButton = document.getElementById('stop-button');
	stopButton.onclick = () => {
		for (const note of notes) {
			note.gainNode.disconnect();
			note.ramping = null;
			note.isPlaying = false;
		}
		notes = [];
		refreshDisplay();
	};
	addEventListener('keydown', start);
	addEventListener('click', start);

	// analyser.minDecibels = -90;
	// analyser.maxDecibels = -10;
	// analyser.smoothingTimeConstant = 0.85;
}

var didStart = false;
function start() {
	if (didStart) {
		return;
	}
	didStart = true;
	setInterval(() => {
		console.log('measure: ' + ++measureNum);
		refreshDisplay();
		const _notes = [];
		for (const note of notes) {
			if (Math.random() > stopSequenceProbability) {
				_notes.push(note);
			}
		}
		notes = _notes;
		if (notes.length < maxNotes && (measureNum < 3 || Math.random() < startSequenceProbability)) {
			const i = Math.floor(Math.random() * noteNames.length);
			const name = noteNames[i];
			if (!notes.find(n => n.name == name)) {
				const panNode = audioCtx.createStereoPanner();
				panNode.connect(audioCtx.destination);
				panNode.pan.value = Math.random() < 0.5 ? 1 : -1;
				const gainNode = audioCtx.createGain();
				const oscillator = audioCtx.createOscillator();
				oscillator.connect(gainNode);
				gainNode.connect(panNode);
				oscillator.frequency.value = lowFreq * Math.pow(2, i / 12);
				// this magically makes things work... no idea why
				oscillator.detune.value = 100;
				oscillator.start(0);
				gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
				gainNode.gain.minValue = 0;
				gainNode.gain.maxValue = 1;
				const duration = Math.ceil(Math.random() * 4);
				const delay = Math.floor(Math.random() * (8 - duration));
				notes.push({
					name,
					oscillator,
					gainNode,
					panNode,
					duration,
					delay,
				});
			}
		}
		for (const note of notes) {
			play(note);
		}
		refreshDisplay();
	}, tempo);
}

function play(note) {
	setTimeout(() => {
		console.log('playing ' + note.name, note);
		// note.gainNode.connect(audioCtx.destination);
		ramp(note, true);
		setTimeout(() => {
			ramp(note, false);
		}, (note.duration * tempo / 8) - decay);
	}, note.delay * tempo / 8);
}

function ramp(note, isUp) {
	console.log('ramp ', isUp, note);
	if (note.ramping) {
		console.log('ramp already in progress', isUp, note);
		if (!isUp) {
			note.gainNode.gain.value = 0;
			// try {
			// 	// console.log('disconnect ' + note.name);
			// 	note.gainNode.disconnect(audioCtx.destination);
			// 	note.oscillator.disconnect(note.gainNode);
			// } catch (err) {
			// 	console.error(err);
			// }
			note.isPlaying = false;
			clearInterval(note.intervalId);
			note.ramping = null;
		}
	} else {
		if (isUp) {
			note.isPlaying = true;
			refreshDisplay();
		}
		note.ramping = isUp ? 'up' : 'down';
		const startTime = audioCtx.currentTime;
		const endTime = startTime + (isUp ? attack : decay) / 1000;
		var val = isUp ? 0 : 1;
		const interval = 12;
		const step = (isUp ? 1 : -1) * interval / (1000 * (endTime - startTime));
		console.log('step', step);
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
}

function refreshDisplay() {
	var html = '';
	html += '<div class="mesure-num">';
	html += measureNum;
	html += '</div>';
	for (const note of notes) {
		const className = note.isPlaying ? 'playing' : '';
		html += `<span class="note ${className}">`;
		html += note.name;
		html += '</span>';
	}
	playingNotesDiv.innerHTML = html;
}
