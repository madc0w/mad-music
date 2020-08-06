const phraseGenerationProb = 0.4;
const phraseDestructionProb = 0.1;
const maxPhrases = 4;

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

	var startTime, recordingTime;
	let onSuccess = stream => {
		const mediaRecorder = new MediaRecorder(stream);

		var isRecording = false;
		toggleRecordingButton.onclick = () => {
			isRecording = !isRecording;
			if (isRecording) {
				startTime = new Date();
				mediaRecorder.start();
				toggleRecordingButton.style.background = 'red';
				toggleRecordingButton.innerText = 'Stop';
			} else {
				recordingTime = new Date() - startTime;
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
			const deleteButton = document.createElement('button');

			clipContainer.classList.add('clip');
			audio.setAttribute('controls', '');
			deleteButton.textContent = 'Delete';
			deleteButton.className = 'delete-recording';
			clipLabel.textContent = `Clip ${clipNum}`;
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
			blob.arrayBuffer().then(recordedBuffer => {
				audioCtx.decodeAudioData(recordedBuffer, decodedData => {
					goButton.disabled = false;
					buffers.push(decodedData);
				});
			});

			deleteButton.onclick = e => {
				let evtTgt = e.target;
				evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
			}
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
			// var i;
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
			} while (totalDuration + tempo * duration / 16 > tempo);
			phrase.push({
				name,
				detune: (i - noteNames.length / 2) * 100,
				panNode,
				duration,
			});
			totalDuration += tempo * duration / 16;
		} while (totalDuration < tempo);

		phrases.push(phrase);

		if (phrases.length > 1 && Math.random() < phraseDestructionProb) {
			phrases.shift();
		}
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
			source.detune.value = note.detune;
			source.buffer = buffers[Math.floor(Math.random() * buffers.length)];
			source.connect(note.panNode);
			source.start();
			note.isPlaying = true;
			if (prevNote) {
				prevNote.isPlaying = false;
			}
			prevNote = note;
			refreshDisplay();
		}, delay);
		delay += tempo * note.duration / 16;
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
