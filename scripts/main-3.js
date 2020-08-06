const phraseGenerationProb = 0.4;
const phraseDestructionProb = 0.1;
const maxPhrases = 4;

// const PitchShiftNode = require('pitch-shift-node');

var phrases = [];
var phrase;

var buff = null;
// const proxyUrl = location.origin == 'file://' ? 'https://cors-anywhere.herokuapp.com/' : '';

function init() {
	// const request = new XMLHttpRequest();
	// request.open('GET', 'http://heliosophiclabs.com/~mad/projects/mad-music/non.mp3', true);
	// // request.open('GET', 'non.mp3', true);
	// request.responseType = 'arraybuffer';
	// request.onload = () => {
	// 	audioCtx.decodeAudioData(request.response, buffer => {
	// 		buff = buffer;
	// 		console.log('length', buff.length / audioCtx.sampleRate);
	// 	}, err => {
	// 		console.error(err);
	// 	});
	// }
	// request.send();

	const record = document.getElementById('start-recording');
	const stop = document.getElementById('stop-recording');
	const soundClips = document.getElementById('sound-clips');
	const constraints = {
		audio: true
	};
	let chunks = [];

	var startTime, recordingTime;
	let onSuccess = stream => {
		const mediaRecorder = new MediaRecorder(stream);
		record.onclick = () => {
			startTime = new Date();
			mediaRecorder.start();
			console.log(mediaRecorder.state);
			console.log('recorder started');
			record.style.background = 'red';

			stop.disabled = false;
			record.disabled = true;
		}

		stop.onclick = () => {
			recordingTime = new Date() - startTime;
			mediaRecorder.stop();
			console.log(mediaRecorder.state);
			console.log('recorder stopped. time: ', recordingTime);
			record.style.background = '';
			record.style.color = '';
			// mediaRecorder.requestData();

			stop.disabled = true;
			record.disabled = false;
		}

		mediaRecorder.onstop = () => {
			console.log('data available after MediaRecorder.stop() called.');

			const clipName = prompt('Enter a name for your sound clip:', 'Unnamed clip');

			const clipContainer = document.createElement('article');
			const clipLabel = document.createElement('p');
			const audio = document.createElement('audio');
			const deleteButton = document.createElement('button');

			clipContainer.classList.add('clip');
			audio.setAttribute('controls', '');
			deleteButton.textContent = 'Delete';
			deleteButton.className = 'delete-recording';

			clipLabel.textContent = clipName || 'Unnamed clip';

			clipContainer.appendChild(audio);
			clipContainer.appendChild(deleteButton);
			clipContainer.appendChild(clipLabel);
			soundClips.appendChild(clipContainer);

			audio.controls = true;
			const blob = new Blob(chunks, {
				type: 'audio/ogg; codecs=opus'
			});
			chunks = [];
			const audioURL = window.URL.createObjectURL(blob);
			audio.src = audioURL;
			console.log('recorder stopped');

			// const pitchNode = new PitchShiftNode(audioCtx, 1.25);
			blob.arrayBuffer().then(recordedBuffer => {
				const source = audioCtx.createBufferSource();
				audioCtx.decodeAudioData(recordedBuffer, audioBuffer => {
					source.buffer = audioBuffer;
				});
				source.connect(audioCtx.destination);
				source.start();
				// source.connect(pitchNode);
				// pitchNode.connect(context.destination);
			});

			deleteButton.onclick = e => {
				let evtTgt = e.target;
				evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
			}

			clipLabel.onclick = () => {
				const existingName = clipLabel.textContent;
				const newClipName = prompt('Enter a new name for your sound clip:');
				clipLabel.textContent = newClipName || existingName;
			}
		}

		mediaRecorder.ondataavailable = e => {
			chunks.push(e.data);
		}
	}

	navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, err => {
		alert(err);
	});

}

function initLoop() {
	const source = audioCtx.createBufferSource();
	source.buffer = buff;

	// const analyser = audioCtx.createAnalyser();
	// analyser.connect(audioCtx.destination);
	// analyser.minDecibels = -140;
	// analyser.maxDecibels = 0;
	// analyser.smoothingTimeConstant = 0.8;
	// analyser.fftSize = 2048;
	// // const dataArray = new Float32Array(analyser.frequencyBinCount);
	// const dataArray = new Uint8Array(analyser.frequencyBinCount);
	// source.connect(analyser);
	// analyser.connect(audioCtx.destination);
	// source.start(0);
	// setTimeout(() => {
	// 	analyser.getByteFrequencyData(dataArray);
	// 	// analyser.getFloatFrequencyData(dataArray);
	// 	console.log('dataArray', dataArray);
	// 	// for (var i = 0; i < analyser.frequencyBinCount; i++) {
	// 	// 	const value = dataArray[i];
	// 	// 	console.log(value);
	// 	// }
	// }, 200);
}

function loop() {
	// console.log('measure: ' + ++measureNum);
	// if (phrases.length < 1 || (phrases.length < maxPhrases && Math.random() < phraseGenerationProb)) {
	// 	var totalDuration = 0;
	// 	const phrase = [];
	// 	do {
	// 		const i = Math.floor(Math.random() * noteNames.length);
	// 		// var i;
	// 		// do {
	// 		// 	i = Math.floor(Math.random() * noteNames.length);
	// 		// } while (noteNames[i].endsWith('#'));
	// 		const name = noteNames[i];
	// 		const panNode = audioCtx.createStereoPanner();
	// 		panNode.pan.value = Math.random() * 2 - 1;
	// 		panNode.connect(audioCtx.destination);

	// 		var duration;
	// 		do {
	// 			duration = Math.ceil(Math.random() * 8);
	// 		} while (totalDuration + tempo * duration / 16 > tempo);
	// 		phrase.push({
	// 			name,
	// 			detune: (i - noteNames.length / 2) * 100,
	// 			panNode,
	// 			duration,
	// 		});
	// 		totalDuration += tempo * duration / 16;
	// 	} while (totalDuration < tempo);

	// 	phrases.push(phrase);

	// 	if (phrases.length > 1 && Math.random() < phraseDestructionProb) {
	// 		phrases.shift();
	// 	}
	// }

	// phrase = phrases[Math.floor(Math.random() * phrases.length)];
	// refreshDisplay();
	// var delay = 0;
	// var prevNote = null;
	// for (const note of phrase) {
	// 	note.isPlaying = false;
	// 	// console.log('delay', delay);
	// 	setTimeout(() => {
	// 		const source = audioCtx.createBufferSource();
	// 		source.detune.value = note.detune;
	// 		source.buffer = buff;
	// 		source.connect(note.panNode);
	// 		source.start(0);
	// 		note.isPlaying = true;
	// 		if (prevNote) {
	// 			prevNote.isPlaying = false;
	// 		}
	// 		prevNote = note;
	// 		refreshDisplay();
	// 	}, delay);
	// 	delay += tempo * note.duration / 16;
	// 	refreshDisplay();
	// }
}

function refreshDisplay() {
	var html = '';
	html += '<div class="mesure-num">';
	html += measureNum;
	html += '</div>';
	for (const note of phrase) {
		const className = note.isPlaying ? 'playing' : '';
		html += `<span class="note ${className}">`;
		html += note.name;
		html += '</span>';
	}
	playingNotesDiv.innerHTML = html;
}

function stop() {
	measureNum = 1;
	phrases = [];
}
