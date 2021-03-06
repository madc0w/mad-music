const maxNotes = 6;
const startSequenceProbability = 0.6;
const stopSequenceProbability = 0.12;

var notes = [];

function loop() {
	console.log('measure: ' + ++measureNum);
	refreshDisplay();
	const _notes = [];
	for (const note of notes) {
		if (Math.random() > stopSequenceProbability) {
			_notes.push(note);
		}
	}
	notes = _notes;
	if (notes.length < maxNotes && (notes.length < 2 || Math.random() < startSequenceProbability)) {
		const i = Math.floor(Math.random() * noteNames.length);
		const name = noteNames[i];
		if (!notes.find(n => n.name == name)) {
			const panNode = audioCtx.createStereoPanner();
			panNode.pan.value = Math.random() * 2 - 1;
			const gainNode = audioCtx.createGain();
			const oscillator = audioCtx.createOscillator();
			oscillator.connect(gainNode);
			gainNode.connect(panNode);
			panNode.connect(audioCtx.destination);
			oscillator.frequency.value = lowFreq * Math.pow(2, i / 12);
			setRandomWave(oscillator);
			// this magically makes things work... no idea why
			oscillator.detune.value = 100;
			oscillator.start(0);
			gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
			gainNode.gain.minValue = 0;
			gainNode.gain.maxValue = 1;
			const duration = Math.ceil(Math.random() * 8);
			const delay = Math.floor(Math.random() * (16 - duration));
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

function stop() {
	for (const note of notes) {
		note.gainNode.disconnect();
		note.ramping = null;
		note.isPlaying = false;
	}
	notes = [];
}
