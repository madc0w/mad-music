const phraseGenerationProb = 0.4;
const phraseDestructionProb = 0.16;
const maxPhrases = 4;
var beatsPerMesaure = 8;

var phrases = [];
var phrase;
var goButton;

var clipNum = 0;
var buffers = [];

function onLoad() {
	playingNotesDiv = document.getElementById('playing-notes');
	stopButton = document.getElementById('stop-button');
	goButton = document.getElementById('go-button');
	goButton.disabled = true;

	stopButton.onclick = () => {
		stop();
		refreshDisplay();
	};
	goButton.onclick = () => {
		start();
	};

	init();
}


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

	const toggleRecordingButton = document.getElementById('toggle-recording');
	const soundClips = document.getElementById('sound-clips');
	let chunks = [];

	let onSuccess = stream => {
		const mediaRecorder = new MediaRecorder(stream);

		var isRecording = false;
		toggleRecordingButton.onclick = () => {
			isRecording = !isRecording;
			if (isRecording) {
				mediaRecorder.start();
				toggleRecordingButton.style.background = 'red';
				toggleRecordingButton.innerText = 'Stop';
			} else {
				mediaRecorder.stop();
				toggleRecordingButton.style.background = '';
				toggleRecordingButton.style.color = '';
				toggleRecordingButton.innerText = 'Record';
			}
		}

		mediaRecorder.onstop = () => {
			clipNum++;
			const clipContainer = document.createElement('article');
			const clipLabel = document.createElement('p');
			const audio = document.createElement('audio');
			// const deleteButton = document.createElement('button');

			clipContainer.classList.add('clip');
			audio.setAttribute('controls', '');
			// deleteButton.textContent = 'Delete';
			// deleteButton.className = 'delete-recording';
			clipLabel.textContent = `Clip ${clipNum}`;
			clipContainer.appendChild(audio);
			// clipContainer.appendChild(deleteButton);
			clipContainer.appendChild(clipLabel);
			soundClips.appendChild(clipContainer);

			audio.controls = true;
			const blob = new Blob(chunks, {
				type: 'audio/ogg; codecs=opus'
			});
			chunks = [];
			const audioURL = window.URL.createObjectURL(blob);
			audio.src = audioURL;
			blob.arrayBuffer().then(recordedBuffer => {
				audioCtx.decodeAudioData(recordedBuffer, audioBuffer => {
					goButton.disabled = false;
					buffers.push(audioBuffer);
				});
			});

			// deleteButton.onclick = e => {
			// 	let evtTgt = e.target;
			// 	evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
			// }
		}

		mediaRecorder.ondataavailable = e => {
			chunks.push(e.data);
		}
	}

	navigator.mediaDevices.getUserMedia({
		audio: true
	}).then(onSuccess, err => {
		alert(err);
	});
}

function loop() {
	console.log('measure: ' + ++measureNum);
	if (phrases.length < 1 || (phrases.length < maxPhrases && Math.random() < phraseGenerationProb)) {
		var totalDuration = 0;
		const phrase = [];
		do {
			const i = Math.floor(Math.random() * noteNames.length);
			// do {
			// 	i = Math.floor(Math.random() * noteNames.length);
			// } while (noteNames[i].endsWith('#'));
			const name = noteNames[i];
			const panNode = audioCtx.createStereoPanner();
			panNode.pan.value = Math.random() * 2 - 1;
			panNode.connect(audioCtx.destination);

			var duration;
			do {
				duration = Math.ceil(Math.random() * 8);
			} while (totalDuration + tempo * duration / beatsPerMesaure > tempo);
			const durationTime = tempo * duration / beatsPerMesaure;
			// const durationTime = buffers.length * 1000;
			const buffer = buffers[Math.floor(Math.random() * buffers.length)];
			const pitchShift = Math.pow(2, (i - noteNames.length / 2) / 12) * durationTime / (1000 * buffer.duration);
			const playbackRate = 1000 * buffer.duration / durationTime;
			const note = {
				buffer,
				name,
				pitchShift,
				playbackRate,
				panNode,
				duration,
			};
			// console.log(note);
			phrase.push(note);
			totalDuration += tempo * duration / beatsPerMesaure;
		} while (totalDuration < tempo);

		// // for testing
		// const notes = [{
		// 	i: 8,
		// 	duration: 8,
		// }, {
		// 	i: 10,
		// 	duration: 4,
		// }, {
		// 	i: 12,
		// 	duration: 4,
		// }];
		// for (const _note of notes) {
		// 	const panNode = audioCtx.createStereoPanner();
		// 	panNode.pan.value = Math.random() * 2 - 1;
		// 	panNode.connect(audioCtx.destination);
		// 	const name = noteNames[_note.i];
		// 	const durationTime = tempo * _note.duration / beatsPerMesaure;
		// 	const buffer = buffers[Math.floor(Math.random() * buffers.length)];
		// 	const pitchShift = Math.pow(2, (_note.i - noteNames.length / 2) / 12) * durationTime / (1000 * buffer.duration);
		// 	const playbackRate = 1000 * buffer.duration / durationTime;
		// 	const note = {
		// 		buffer,
		// 		name,
		// 		pitchShift,
		// 		playbackRate,
		// 		panNode,
		// 		duration: _note.duration,
		// 	};
		// 	console.log(note);
		// 	phrase.push(note);
		// }

		phrases.push(phrase);

	}
	if (phrases.length > 1 && Math.random() < phraseDestructionProb) {
		phrases.shift();
	}

	phrase = phrases[Math.floor(Math.random() * phrases.length)];
	refreshDisplay();
	var delay = 0;
	var prevNote = null;
	for (const note of phrase) {
		note.isPlaying = false;
		// console.log('delay', delay);
		setTimeout(() => {
			const source = audioCtx.createBufferSource();
			source.playbackRate.value = note.playbackRate;
			const inData = note.buffer.getChannelData(0);
			const inDataCopy = new Float32Array(inData);
			PitchShift(note.pitchShift, inDataCopy.length, 1024, 10, audioCtx.sampleRate, inDataCopy);
			const audioBufferCopy = audioCtx.createBuffer(note.buffer.numberOfChannels, note.buffer.length, note.buffer.sampleRate);
			audioBufferCopy.copyToChannel(inDataCopy, 0);
			source.buffer = audioBufferCopy;

			console.log('note', note);
			// console.log('duration', source.buffer.duration);
			source.connect(note.panNode);
			source.start();
			note.isPlaying = true;
			if (prevNote) {
				prevNote.isPlaying = false;
			}
			prevNote = note;
			refreshDisplay();
		}, delay);
		delay += tempo * note.duration / beatsPerMesaure;
		refreshDisplay();
	}
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
