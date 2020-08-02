const phraseGenerationProb = 0.4;
const phraseDestructionProb = 0.1;
const maxPhrases = 4;
const phrases = [];

function onLoad() {
	addEventListener('keydown', start);
	addEventListener('click', start);

}

var didStart = false;
function start() {
	if (didStart) {
		return;
	}
	didStart = true;
	setInterval(() => {
		console.log('measure: ' + ++measureNum);
		if (phrases.length < 1 || (phrases.length < maxPhrases && Math.random() < phraseGenerationProb)) {
			var totalDuration = 0;
			const phrase = [];
			do {
				var i;
				do {
					i = Math.floor(Math.random() * noteNames.length);
				} while (noteNames[i].endsWith('#'));
				const name = noteNames[i];
				const panNode = audioCtx.createStereoPanner();
				panNode.pan.value = Math.random() < 0.5 ? 1 : -1;
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
				var duration;
				do {
					duration = Math.ceil(Math.random() * 4);
				} while (totalDuration + tempo * duration / 8 > tempo);
				phrase.push({
					name,
					oscillator,
					gainNode,
					panNode,
					duration,
					delay: 0,
				});
				totalDuration += tempo * duration / 8;
			} while (totalDuration < tempo);

			phrases.push(phrase);

			if (phrases.length > 1 && Math.random() < phraseDestructionProb) {
				phrases.shift();
			}
		}

		const phrase = phrases[Math.floor(Math.random() * phrases.length)];
		var delay = 0;
		for (const note of phrase) {
			// console.log('delay', delay);
			setTimeout(() => {
				play(note);
			}, delay);
			delay += tempo * note.duration / 8;
		}
	}, tempo);
}

function refreshDisplay() {
	// var html = '';
	// html += '<div class="mesure-num">';
	// html += measureNum;
	// html += '</div>';
	// for (const note of notes) {
	// 	const className = note.isPlaying ? 'playing' : '';
	// 	html += `<span class="note ${className}">`;
	// 	html += note.name;
	// 	html += '</span>';
	// }
	// playingNotesDiv.innerHTML = html;
}