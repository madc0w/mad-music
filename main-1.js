const startSequenceProbability = 0.2;
const stopSequenceProbability = 0.12;
const tempo = 2000;
const noteNames = [
	'A3', 'A3#', 'B3', 'C3', 'C3#', 'D3', 'D3#', 'E3', 'F3', 'F3#', 'G3', 'A4', 'A4#', 'B4', 'C4', 'C4#', 'D4', 'D4#', 'E4', 'F4', 'F4#', 'G4',
];
// const noteNames = [
// 	'A3', 'A3#', 'B3', 'C3', 'C3#', 'D3', 'D3#', 'E3', 'F3',
// ];
const lowFreq = 220;
const attack = tempo / 12;
const decay = tempo / 10;

const audioCtx = new AudioContext();
const notes = [];
var playing = {};
var currSequence = {};
var startTime;
var playingNotesDiv;
const sequenceInteravalIds = [];

function onLoad() {
	playingNotesDiv = document.getElementById('playing-notes');
	stopButton = document.getElementById('stop-button');
	stopButton.onclick = () => {
		for (const noteId in playing) {
			if (playing[noteId]) {
				togglePlay(playing[noteId]);
			}
		}
		playing = {};
		currSequence = {};
		for (const id of sequenceInteravalIds) {
			clearInterval(id);
		}
		refreshDisplay();
	};

	var didInit = false;
	function f(event) {
		if (event.srcElement.id != 'stop-button') {
			if (!didInit) {
				startTime = new Date().getTime();
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
						id: i,
						name,
						oscillator,
						gainNode,
					});
					gainNode.gain.minValue = 0;
					gainNode.gain.maxValue = 1;
				}

				setInterval(() => {
					if (Math.random() < startSequenceProbability) {
						startSequence();
					}
				}, tempo);
			}
			startSequence();
		}
	}
	addEventListener('keydown', f);
	addEventListener('click', f);
}

function startSequence() {
	var note;
	do {
		note = notes[Math.floor(Math.random() * notes.length)];
	} while (currSequence[note.id]);
	// const note = notes[Math.random() < 0.5 ? 11 : 14];
	const factor = Math.ceil(Math.random() * 8);
	note.duration = (Math.floor(Math.random() * 7) + 1) / 8;

	const syncTime = tempo - (new Date().getTime() % tempo);
	setTimeout(() => {
		if (currSequence[note.id]) {
			console.log('already playing sequence ' + note.name);
		} else {
			console.log('starting ' + note.name, note);
			currSequence[note.id] = note;
			const intervalId = setInterval(f, factor * tempo);
			sequenceInteravalIds.push(intervalId);
			f();
			function f() {
				togglePlay(note);
				refreshDisplay();
				setTimeout(() => {
					togglePlay(note);
					if (Math.random() < stopSequenceProbability) {
						console.log('stopping ' + note.name);
						clearInterval(intervalId);
						playing[note.id] = null;
						currSequence[note.id] = null;
						refreshDisplay();
					}
				}, note.duration * tempo);
			}
		}
	}, syncTime);
}

function togglePlay(note) {
	playing[note.id] = playing[note.id] ? null : note;
	refreshDisplay();

	if (playing[note.id]) {
		console.log('playing ' + note.name, note);
		note.gainNode.connect(audioCtx.destination);
	} else {
		setTimeout(() => {
			note.gainNode.disconnect(audioCtx.destination);
		}, decay);
	}
	const isPlay = !!playing[note.id];
	ramp(note, isPlay);
	return isPlay;
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

function refreshDisplay() {
	var html = '';
	for (const noteId in currSequence) {
		if (currSequence[noteId]) {
			const className = playing[noteId] ? 'playing' : '';
			html += `<span class="note ${className}">`;
			html += currSequence[noteId].name;
			html += '</span>';
		}
	}
	playingNotesDiv.innerHTML = html;
}
