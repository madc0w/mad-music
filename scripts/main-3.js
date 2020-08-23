const phraseGenerationProb = 0.4;
const phraseDestructionProb = 0.16;
const maxPhrases = 4;
var beatsPerMesaure = 4;

var phrases = [];
var phrase;
var goButton, soundClips;
var buffers = [];

function onLoad() {
	playingNotesDiv = document.getElementById('playing-notes');
	stopButton = document.getElementById('stop-button');
	goButton = document.getElementById('go-button');
	const beatsPerMeasureDropdown = document.getElementById('beats-per-measure-dropdown');
	goButton.disabled = true;

	beatsPerMeasureDropdown.onchange = e => {
		beatsPerMesaure = parseInt(e.target.options.item(e.target.selectedIndex).innerText);
		stop();
		if (buffers.length > 0) {
			start();
		}
	};

	stopButton.onclick = () => {
		clearInterval(mainLoopIntervalId);
		stop();
		refreshDisplay();
	};
	goButton.onclick = () => {
		start();
	};

	const prerecordedClips = document.getElementById('prerecorded-clips').children;
	for (var i = 0; i < prerecordedClips.length; i++) {
		const el = prerecordedClips.item(i);
		el.onclick = () => {
			const fileName = el.getAttribute('file');
			const request = new XMLHttpRequest();
			const url = `${baseUrl}/${fileName}`;
			request.open('GET', url, true);
			request.responseType = 'arraybuffer';
			request.onload = () => {
				addClip(url, request.response, el.innerText);
				// el.classList.add('loaded');
			}
			request.send();
		};
	}

	init();
}


function init() {
	const toggleRecordingButton = document.getElementById('toggle-recording');
	soundClips = document.getElementById('sound-clips');
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
			const blob = new Blob(chunks, {
				type: 'audio/ogg; codecs=opus'
			});
			chunks = [];
			const audioUrl = window.URL.createObjectURL(blob);
			blob.arrayBuffer().then(recordedBuffer => {
				addClip(audioUrl, recordedBuffer);
			});
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

var currPhraseRepeatNum = 0;
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
				duration = Math.ceil(Math.random() * Math.min(6, (beatsPerMesaure - 1)));
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

	if (currPhraseRepeatNum == 0) {
		currPhraseRepeatNum = Math.random() < 0.3 ? 2 : 4;
		phrase = phrases[Math.floor(Math.random() * phrases.length)];
	}
	currPhraseRepeatNum--;
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
	if (phrase) {
		for (const note of phrase) {
			const className = note.isPlaying ? 'playing' : '';
			html += `<span class="note ${className}">`;
			html += '<div>';
			html += note.name;
			html += '</div>';
			html += '<div class="duration">';
			html += note.duration;
			html += '</div>';
			html += '</span>';
		}
	}
	playingNotesDiv.innerHTML = html;
}

function stop() {
	currPhraseRepeatNum = 0;
	measureNum = 1;
	phrases = [];
	phrase = null;
	refreshDisplay();
}

function addClip(audioUrl, recordedBuffer, name) {
	const clipContainer = document.createElement('article');
	const audio = document.createElement('audio');
	const deleteButton = document.createElement('button');

	clipContainer.classList.add('clip');
	audio.setAttribute('controls', '');
	deleteButton.textContent = 'Delete';
	deleteButton.className = 'delete-recording';
	if (name) {
		const nameElement = document.createElement('div');
		nameElement.classList.add('clip-name');
		nameElement.innerText = name;
		clipContainer.appendChild(nameElement);
	}
	clipContainer.appendChild(audio);
	clipContainer.appendChild(deleteButton);
	soundClips.appendChild(clipContainer);

	audio.controls = true;
	audio.src = audioUrl;
	audioCtx.decodeAudioData(recordedBuffer, audioBuffer => {
		goButton.disabled = false;
		deleteButton.bufferIndex = buffers.length;
		buffers.push(audioBuffer);
	});

	deleteButton.onclick = e => {
		let button = e.target;
		buffers.splice(button.bufferIndex, 1);
		if (buffers.length == 0) {
			didStart = false;
			goButton.disabled = true;
			stop();
			clearInterval(mainLoopIntervalId);
		}
		button.parentNode.parentNode.removeChild(button.parentNode);
	}
}
