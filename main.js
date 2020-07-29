const startSequenceProbability = 0.24;
const stopSequenceProbability = 0.04;
const tempo = 1600;
const lowFreq = 220;
const attack = 100;
const decay = 60;

const noteNames = [
	'A3', 'A3#', 'B3', 'C3', 'C3#', 'D3', 'D3#', 'E3', 'F3', 'F3#', 'G3', 'A4', 'A4#', 'B4', 'C4', 'C4#', 'D4', 'D4#', 'E4', 'F4', 'F4#', 'G4',
];
var notes = [];
const audioCtx = new AudioContext();
var playingNotesDiv;

function onLoad() {
	playingNotesDiv = document.getElementById('playing-notes');
	addEventListener('keydown', start);
	addEventListener('click', start);
}

var didStart = false;
function start() {
	if (didStart) {
		return;
	}
	didStart = true;
	var beatNum = 0;
	setInterval(() => {
		console.log('beat: ' + beatNum);
		beatNum++;
		const _notes = [];
		for (const note of notes) {
			if (Math.random() > stopSequenceProbability) {
				_notes.push(note);
			}
		}
		notes = _notes;
		if (Math.random() < startSequenceProbability) {
			const i = Math.floor(Math.random() * noteNames.length);
			const name = noteNames[i];
			if (!notes.find(n => n.name == name)) {
				const gainNode = audioCtx.createGain();
				const oscillator = audioCtx.createOscillator();
				oscillator.connect(gainNode);
				oscillator.frequency.value = lowFreq * Math.pow(2, i / 12);
				// oscillator.detune.value = 100; // value in cents
				oscillator.start(0);
				gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
				gainNode.gain.minValue = 0;
				gainNode.gain.maxValue = 1;
				const duration = (Math.floor(Math.random() * 7) + 1) / 8;
				notes.push({
					name,
					oscillator,
					gainNode,
					duration,
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
	console.log('playing ' + note.name, note);
	note.gainNode.connect(audioCtx.destination);
	ramp(note, true);
	setTimeout(() => {
		ramp(note, false);
	}, (note.duration * tempo) - decay);
}

function ramp(note, isUp) {
	if (note.isRamping) {
		console.log('ramp already in progress', note);
	} else {
		if (isUp) {
			note.isPlaying = true;
			refreshDisplay();
		}
		note.isRamping = isUp ? 'up' : 'down';
		const startTime = audioCtx.currentTime;
		const endTime = startTime + (isUp ? attack : decay) / 1000;
		var val = isUp ? 0 : 1;
		const interval = 4;
		const step = (isUp ? 1 : -1) * interval / (1000 * (endTime - startTime));
		const intervalId = setInterval(() => {
			if (audioCtx.currentTime >= endTime) {
				clearInterval(intervalId);
				if (!isUp) {
					try {
						// console.log('disconnect ' + note.name);
						note.gainNode.disconnect(audioCtx.destination);
					} catch (err) {
						console.error(err);
					}
					note.isPlaying = false;
					refreshDisplay();
				}
				note.isRamping = null;
			} else {
				val += step;
				val = Math.min(Math.max(val, 0), 1);
				note.gainNode.gain.value = val;
				// gain.setValueAtTime(val, audioCtx.currentTime);
				// console.log(isUp, val);
			}
		}, interval);
	}
}

function refreshDisplay() {
	var html = '';
	for (const note of notes) {
		const className = note.isPlaying ? 'playing' : '';
		html += `<span class="note ${className}">`;
		html += note.name;
		html += '</span>';
	}
	playingNotesDiv.innerHTML = html;
}
