var tempo = 200;
const numRandomNotes = 24;

let mesaureNum = 0;
let intervalId;
let isPlaying = false;
const clips = [{
	fileName: 'swoosh',
	displayName: 'Swoosh',
	type: 'melody',
}, {
	fileName: 'bass-drum-1',
	displayName: 'Bass Drum',
	type: 'rhythm',
}, {
	fileName: 'snare-1',
	displayName: 'Snare',
	type: 'rhythm',
}, {
	fileName: 'hi-hat-1',
	displayName: 'High Hat 1',
	type: 'rhythm',
}, {
	fileName: 'hi-hat-2',
	displayName: 'High Hat 2',
	type: 'rhythm',
}, {
	fileName: 'gunshot',
	displayName: 'Gunshot',
	type: 'rhythm',
}, {
	fileName: 'pipe',
	displayName: 'Pipe',
	type: 'rhythm',
}, {
	fileName: 'boom',
	displayName: 'Boom',
	type: 'rhythm',
}, {
	fileName: 'boom-rattle',
	displayName: 'Boom Rattle',
	type: 'rhythm',
}, {
	fileName: 'clap-1',
	displayName: 'Clap 1',
	type: 'rhythm',
}, {
	fileName: 'clap-2',
	displayName: 'Clap 2',
	type: 'rhythm',
}, {
	fileName: 'jews-harp',
	displayName: 'Jew\'s Harp 1',
	type: 'rhythm',
}, {
	fileName: 'jews-harp-2',
	displayName: 'Jew\'s Harp 2',
	type: 'rhythm',
}, {
	fileName: 'gong-2',
	displayName: 'Gong 1',
	type: 'rhythm',
}, {
	fileName: 'gong-3',
	displayName: 'Gong 2',
	type: 'rhythm',
}, {
	fileName: 'gong-4',
	displayName: 'Gong 3',
	type: 'rhythm',
}, {
	fileName: 'gong-5',
	displayName: 'Gong 4',
	type: 'rhythm',
}];

const playingClips = [];

const buffers = {};

function onLoad() {
	{
		const rhythmMeasures = document.getElementById('rhythm-measures-table');
		let html = '';
		html += '<tr>';
		html += '<td />';
		for (let i = 0; i < beatsPerMesaure; i++) {
			html += `<td class="beat-number" id="beat-${i}">${i + 1}</td>`;
		}
		html += '</tr>';
		for (const clip of clips.filter(c => c.type == 'rhythm')) {
			html += '<tr>';
			html += '<td class="clip-name">';
			html += clip.displayName;
			html += '</td>';
			for (let i = 0; i < beatsPerMesaure; i++) {
				html += `<td class="note beat-${i}" id="note-${clip.fileName}-${i}" onClick="toggleNote(this, '${clip.fileName}', ${i})"/>`;
			}
			html += '</tr>';
		}
		rhythmMeasures.innerHTML = html;
	}
	{
		const melodyMeasures = document.getElementById('melody-measures-table');
		let html = '';
		html += '<tr>';
		html += '<td />';
		for (let i = 0; i < beatsPerMesaure; i++) {
			html += `<td class="beat-number" id="beat-${i}">${i + 1}</td>`;
		}
		html += '</tr>';
		for (const clip of clips.filter(c => c.type == 'melody')) {
			html += '<tr>';
			html += '<td class="clip-name">';
			html += clip.displayName;
			html += '</td>';
			for (let i = 0; i < beatsPerMesaure; i++) {
				html += `<td class="note beat-${i}" id="note-${clip.fileName}-${i}" onClick="toggleMelodyNote(event, '${clip.fileName}', ${i})"/>`;
			}
			html += '</tr>';
		}
		melodyMeasures.innerHTML = html;
	}

	const tempoSlider = document.getElementById('tempo-slider');
	tempoSlider.onchange = el => {
		tempo = parseInt(el.target.value);
		if (isPlaying) {
			clearInterval(intervalId);
			intervalId = setInterval(loop, tempo);
		}
	};

	function reset() {
		isPlaying = false;
		clearInterval(intervalId);
		toggleButton.innerHTML = 'GO';
		playingClips.splice(0, playingClips.length);
		const noteEls = document.getElementsByClassName('note');
		for (const el of noteEls) {
			el.classList.remove('selected');
			el.innerHTML = '';
		}
		const beatNumEls = document.getElementsByClassName('beat-number');
		for (const el of beatNumEls) {
			el.classList.remove('current');
		}
		mesaureNum = 0;
	}

	const resetButton = document.getElementById('reset-button');
	resetButton.onclick = reset;

	const randomButton = document.getElementById('random-button');
	randomButton.onclick = () => {
		reset();
		for (let i = 0; i < numRandomNotes; i++) {
			const beatNum = Math.floor(Math.random() * beatsPerMesaure);
			const clip = clips[Math.floor(Math.random() * clips.length)];
			const el = document.getElementById(`note-${clip.fileName}-${beatNum}`);
			if (clip.type == 'rhythm') {
				el.click();
			} else {
				el.classList.toggle('selected');
				const pitchIndex = Math.floor(Math.random() * noteNames.length);
				const note = noteNames[pitchIndex];
				el.innerHTML = note;
				if (!playingClips[beatNum]) {
					playingClips[beatNum] = [];
				}
				playingClips[beatNum].push({
					fileName: clip.fileName,
					pitchIndex: el.selectedIndex - 1,
				});
			}
		}
		toggleButton.onclick();
	};

	const toggleButton = document.getElementById('toggle-button');
	toggleButton.onclick = () => {
		// testNote();

		isPlaying = !isPlaying;
		toggleButton.innerHTML = isPlaying ? 'STOP' : 'GO';
		if (isPlaying) {
			intervalId = setInterval(loop, tempo);
		} else {
			clearInterval(intervalId);
		}
	};

	for (const clip of clips) {
		const request = new XMLHttpRequest();
		const url = `${baseUrl}/${clip.fileName}.mp3`;
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';
		request.onload = () => {
			audioCtx.decodeAudioData(request.response, audioBuffer => {
				buffers[clip.fileName] = audioBuffer;
			});
		}
		request.send();
	}

}

function loop() {
	const beatNum = mesaureNum % beatsPerMesaure;
	const clips = playingClips[beatNum];
	if (clips) {
		for (clip of clips) {
			const source = audioCtx.createBufferSource();
			source.connect(audioCtx.destination);
			if (clip.pitchIndex) {
				play(clip.fileName, 1000 * buffers[clip.fileName].duration, clip.pitchIndex);
			} else {
				source.buffer = buffers[clip.fileName];
				source.start();
			}
		}
	}

	for (let i = 0; i < beatsPerMesaure; i++) {
		const beatTd = document.getElementById(`beat-${i}`);
		if (beatNum == i) {
			beatTd.classList.add('current');
		} else {
			beatTd.classList.remove('current');
		}
	}
	{
		const noteCells = document.getElementsByClassName('note');
		for (const noteCell of noteCells) {
			noteCell.classList.remove('current');
		}
	}
	{
		const noteCells = document.getElementsByClassName(`beat-${beatNum}`);
		for (const noteCell of noteCells) {
			noteCell.classList.add('current');
		}
	}
	mesaureNum++;
}

function toggleNote(el, fileName, index) {
	el.classList.toggle('selected');
	if (!playingClips[index]) {
		playingClips[index] = [];
	}
	if (playingClips[index].find(c => c.fileName == fileName)) {
		playingClips[index] = playingClips[index].filter(c => c.fileName != fileName);
	} else {
		playingClips[index].push({
			fileName
		});
	}
}

function toggleMelodyNote(event, fileName, index) {
	const el = event.target;
	if (el.tagName == 'TD') {
		const isSelected = el.classList.contains('selected');
		el.classList.toggle('selected');
		if (!playingClips[index]) {
			playingClips[index] = [];
		}
		if (isSelected) {
			playingClips[index] = playingClips[index].filter(c => c.fileName != fileName);
			el.innerHTML = '';
		} else {
			let html = `<select onChange="melodyNoteSelected(event, '${fileName}', ${index})">`;
			html += `<option>-</option>`;
			for (const note of noteNames) {
				html += `<option>${note}</option>`;
			}
			html += '</select>';
			el.innerHTML = html;

			// no.
			// el.childNodes[0].click();
			// nope also:
			// setTimeout(() => {
			// 	const mouseEvent = document.createEvent('MouseEvents');
			// 	mouseEvent.initMouseEvent('mousedown', true, true, window);
			// 	el.childNodes[0].dispatchEvent(mouseEvent);
			// }, 100);
			// see https://stackoverflow.com/questions/430237/is-it-possible-to-use-js-to-open-an-html-select-to-show-its-option-list
		}
	}
}


function melodyNoteSelected(event, fileName, index) {
	const el = event.target;
	el.parentNode.innerHTML = el.selectedOptions[0].innerHTML;
	playingClips[index].push({
		fileName,
		pitchIndex: el.selectedIndex - 1,
	});
}

function testNote() {
	const durationTime = 600;
	for (let i in noteNames) {
		setTimeout(() => {
			play('jews-harp', durationTime, i);
		}, i * durationTime);
	}
}

function play(bufferName, durationTime, pitchIndex) {
	// console.log(noteNames[pitchIndex]);
	const buffer = buffers[bufferName];
	const pitchShift = Math.pow(2, (pitchIndex - noteNames.length / 2) / 12) * durationTime / (1000 * buffer.duration);
	const playbackRate = 1000 * buffer.duration / durationTime;
	const source = audioCtx.createBufferSource();
	source.playbackRate.value = playbackRate;
	const inData = buffer.getChannelData(0);
	const inDataCopy = new Float32Array(inData);
	PitchShift(pitchShift, inDataCopy.length, 1024, 10, audioCtx.sampleRate, inDataCopy);
	const audioBufferCopy = audioCtx.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
	audioBufferCopy.copyToChannel(inDataCopy, 0);
	source.buffer = audioBufferCopy;
	source.connect(audioCtx.destination);
	source.start();
}
