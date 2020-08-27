var tempo = 200;
const numRandomNotes = 24;

let mesaureNum = 0;
let intervalId, evolutionIntervalId;
let isPlaying = false;
const clips = [
	// rhythm
	{
		fileName: 'bass-drum-1',
		displayName: 'Bass Drum 1',
		type: 'rhythm',
	}, {
		fileName: 'bass-drum-2',
		displayName: 'Bass Drum 2',
		type: 'rhythm',
	}, {
		fileName: 'snare-1',
		displayName: 'Snare',
		type: 'rhythm',
	}, {
		fileName: 'hi-hat-1',
		displayName: 'Hi-hat Closed',
		type: 'rhythm',
	}, {
		fileName: 'hi-hat-2',
		displayName: 'Hi-hat Open',
		type: 'rhythm',
	}, {
		fileName: 'cymbal-1',
		displayName: 'Cymbal 1',
		type: 'rhythm',
	}, {
		fileName: 'cymbal-2',
		displayName: 'Cymbal 2',
		type: 'rhythm',
	}, {
		fileName: 'cymbal-3',
		displayName: 'Cymbal 3',
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
		fileName: 'ding',
		displayName: 'Ding',
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
		fileName: 'gong-3',
		displayName: 'Gong 1',
		type: 'rhythm',
	}, {
		fileName: 'gong-4',
		displayName: 'Gong 2',
		type: 'rhythm',
	}, {
		fileName: 'gong-5',
		displayName: 'Gong 3',
		type: 'rhythm',
	},

	// melody
	{
		fileName: 'piano-note-high',
		displayName: 'Piano High',
		type: 'melody',
	}, {
		fileName: 'piano-note-low',
		displayName: 'Piano Low',
		type: 'melody',
	}, {
		fileName: 'jews-harp',
		displayName: 'Jew\'s Harp 1',
		type: 'melody',
	}, {
		fileName: 'jews-harp-2',
		displayName: 'Jew\'s Harp 2',
		type: 'melody',
	}, {
		fileName: 'violin-note',
		displayName: 'Violin 1',
		type: 'melody',
	}, {
		fileName: 'violin-note-2',
		displayName: 'Violin 2',
		type: 'melody',
	}, {
		fileName: 'violin-note-long',
		displayName: 'Violin 3',
		type: 'melody',
	}, {
		fileName: 'wobbly-note',
		displayName: 'Wobbly',
		type: 'melody',
	}, {
		fileName: 'slap-bass-1',
		displayName: 'Slap Bass 1',
		type: 'melody',
	}, {
		fileName: 'slap-bass-2',
		displayName: 'Slap Bass 2',
		type: 'melody',
	}, {
		fileName: 'slap-bass-3',
		displayName: 'Slap Bass 3',
		type: 'melody',
	}, {
		fileName: 'short-string',
		displayName: 'String',
		type: 'melody',
	}, {
		fileName: 'echo-guitar',
		displayName: 'Echo Guitar',
		type: 'melody',
	}, {
		fileName: 'swoosh',
		displayName: 'Swoosh',
		type: 'melody',
	}, {
		fileName: 'opera-female-1',
		displayName: 'Opera Female 1',
		type: 'melody',
	}, {
		fileName: 'opera-female-2',
		displayName: 'Opera Female 2',
		type: 'melody',
	}, {
		fileName: 'opera-tenor-1',
		displayName: 'Opera Tenor',
		type: 'melody',
	}
];

const buffers = {};
let playingClips = [];
let selectedFileName, selectedMelodyBeatNum, melodyNoteCell, toggleButton, evolveSlider;

function onLoad() {
	{
		document.getElementById('save-button').onclick = event => {
			const saved = localStorage.saved ? JSON.parse(localStorage.saved) : {};
			saved[document.getElementById('save-name').value] = compositionData();
			localStorage.saved = JSON.stringify(saved);
			closeAll();
		};
	}

	const saveModal = document.getElementById('save-modal');
	const loadModal = document.getElementById('load-modal');
	const shareModal = document.getElementById('share-modal');
	document.getElementById('open-load-button').onclick = event => {
		setTimeout(() => {
			const table = document.getElementById('compositions-list');
			let html = '';
			html += '<tr><th>Date</th><th>Name</th></tr>';
			const allCompositions = JSON.parse(JSON.stringify(sampleCompositions));
			const saved = localStorage.saved ? JSON.parse(localStorage.saved) : {};
			for (const name in saved) {
				allCompositions[name] = saved[name];
			}
			for (const name in allCompositions) {
				html += `<tr class="row" onClick="load('${name}')">`;
				const date = new Date(allCompositions[name].date);
				const dateStr = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
				html += `<td>${dateStr}</td>`;
				html += `<td>${name}</td>`;
				html += '</tr>';
			}
			table.innerHTML = html;
			loadModal.classList.remove('hidden');
		}, 20);
	};
	document.getElementById('open-save-button').onclick = event => {
		setTimeout(() => {
			saveModal.classList.remove('hidden');
			document.getElementById('save-name').focus();
		}, 20);
	};
	document.getElementById('open-share-button').onclick = event => {
		setTimeout(() => {
			shareModal.classList.remove('hidden');
			const shareUrlInput = document.getElementById('share-url');
			let url = location.href;
			if (url.indexOf('?') > 0) {
				url = url.substring(0, url.indexOf('?'));
			}
			const data = compositionData();
			url += '?composition=' + encodeURI(JSON.stringify(data));
			shareUrlInput.value = url;
			shareUrlInput.select();
			shareUrlInput.setSelectionRange(0, 1e6); // For mobile devices
			document.execCommand('copy');

		}, 20);
	};

	const noteSelectionDiv = document.getElementById('note-selection');
	function closeAll() {
		noteSelectionDiv.classList.add('hidden');
		saveModal.classList.add('hidden');
		loadModal.classList.add('hidden');
		shareModal.classList.add('hidden');
		if (melodyNoteCell) {
			melodyNoteCell.classList.remove('selecting');
		}
	}
	document.onkeyup = event => {
		if (event.key == 'Escape') {
			closeAll();
		}
	};
	document.onclick = event => {
		if (event.target.tagName != 'INPUT') {
			closeAll();
		}
	};

	{
		let html = '';
		for (let col = 0; col < 2; col++) {
			html += '<div class="col">';
			for (let i = col * noteNames.length / 2; i < (col + 1) * noteNames.length / 2; i++) {
				html += `<div onClick="melodyNoteSelected(event, ${i})">${noteNames[i]}</div>`;
			}
			html += '</div>';
		}
		noteSelectionDiv.innerHTML = html;
	}
	{
		const evolveCheckbox = document.getElementById('evolve-checkbox');
		evolveSlider = document.getElementById('evolution-slider');
		const evolveSliderContainer = document.getElementById('evolution-slider-container');
		evolveSlider.onchange = () => {
			clearInterval(evolutionIntervalId);
			evolutionIntervalId = setInterval(evolve, 8000 - evolveSlider.value * tempo);
		};
		evolveCheckbox.onchange = () => {
			clearInterval(evolutionIntervalId);
			evolutionIntervalId = null;
			if (evolveCheckbox.checked) {
				evolveSliderContainer.classList.remove('hidden');
				evolutionIntervalId = setInterval(evolve, 8000 - evolveSlider.value * tempo);
			} else {
				evolveSliderContainer.classList.add('hidden');
			}
		};
	}
	{
		const rhythmMeasures = document.getElementById('rhythm-measures-table');
		let html = '';
		html += '<caption>Instant music. Just add rhythm...</caption>';
		html += '<tr>';
		html += '<td />';
		for (let i = 0; i < beatsPerMesaure; i++) {
			html += `<td class="beat-number" id="beat-${i}">${i + 1}</td>`;
		}
		html += '</tr>';
		for (const clip of clips.filter(c => c.type == 'rhythm')) {
			html += `<tr id="clip-row-${clip.fileName}">`;
			html += `<td class="clip-name" id="clip-name-${clip.fileName}">`;
			html += `<img src="icons/close-24px.svg" onClick="removeClip('${clip.fileName}', 'rhythm')"/>`;
			html += clip.displayName;
			html += '</td>';
			for (let i = 0; i < beatsPerMesaure; i++) {
				html += `<td class="note beat-${i}" id="note-${clip.fileName}-${i}" onClick="toggleNote(this, '${clip.fileName}', ${i})" onMouseOut="mouseOutCell(this, '${clip.fileName}')" onMouseOver="mouseOverCell(this, '${clip.fileName}')"/>`;
			}
			html += '</tr>';
		}
		rhythmMeasures.innerHTML = html;
	}
	{
		const melodyMeasures = document.getElementById('melody-measures-table');
		let html = '';
		html += '<caption>And melody!</caption>';
		for (const clip of clips.filter(c => c.type == 'melody')) {
			html += `<tr id="clip-row-${clip.fileName}">`;
			html += `<td class="clip-name" id="clip-name-${clip.fileName}">`;
			html += `<img src="icons/close-24px.svg" onClick="removeClip('${clip.fileName}', 'rhythm')"/>`;
			html += clip.displayName;
			html += '</td>';
			for (let i = 0; i < beatsPerMesaure; i++) {
				html += `<td class="note beat-${i}" id="note-${clip.fileName}-${i}" onClick="toggleMelodyNote(event, '${clip.fileName}', ${i})" onMouseOut="mouseOutCell(this, '${clip.fileName}')" onMouseOver="mouseOverCell(this, '${clip.fileName}')"/>`;
			}
			html += '</tr>';
		}
		melodyMeasures.innerHTML = html;
	}

	const tempoSlider = document.getElementById('tempo-slider');
	tempoSlider.onchange = el => {
		tempo = 800 - parseInt(el.target.value);
		if (isPlaying) {
			clearInterval(intervalId);
			intervalId = setInterval(loop, tempo);
		}
	};

	const resetButton = document.getElementById('reset-button');
	resetButton.onclick = reset;

	const randomButton = document.getElementById('random-button');
	randomButton.onclick = () => {
		reset();
		for (let i = 0; i < numRandomNotes; i++) {
			addRandomNote();
		}
		toggleButton.onclick();
	};

	toggleButton = document.getElementById('toggle-button');
	toggleButton.onclick = () => {
		// testNote();

		isPlaying = !isPlaying;
		toggleButton.innerHTML = isPlaying ? 'STOP' : 'GO';
		if (isPlaying) {
			intervalId = setInterval(loop, tempo);
		} else {
			clearInterval(intervalId);
			intervalId = null;
			clearInterval(evolutionIntervalId);
			evolutionIntervalId = null;
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

	if (location.search && location.search.startsWith('?composition=')) {
		const composition = JSON.parse(decodeURI(location.search.substring('?composition='.length)));
		setComposition(composition);
	}

}

function loop() {
	if (document.getElementById('evolve-checkbox').checked && !evolutionIntervalId) {
		evolutionIntervalId = setInterval(evolve, 8000 - evolveSlider.value * tempo);
	}

	const beatNum = mesaureNum % beatsPerMesaure;
	const clips = playingClips[beatNum];
	if (clips) {
		for (let clip of clips) {
			const source = audioCtx.createBufferSource();
			source.connect(audioCtx.destination);
			if (clip.type == 'melody') {
				play(clip);
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
	animate(el);
	if (!playingClips[index]) {
		playingClips[index] = [];
	}
	if (playingClips[index].find(c => c.fileName == fileName)) {
		playingClips[index] = playingClips[index].filter(c => c.fileName != fileName);
	} else {
		playingClips[index].push({
			id: Math.floor(Math.random() * 1e12),
			type: 'rhythm',
			fileName,
		});
	}
}

function toggleMelodyNote(event, fileName, index) {
	const el = event.target;
	if (el.tagName == 'TD') {
		const isSelected = el.classList.contains('selected');
		if (!playingClips[index]) {
			playingClips[index] = [];
		}
		if (isSelected) {
			el.classList.remove('selected');
			animate(el);
			playingClips[index] = playingClips[index].filter(c => c.fileName != fileName);
			el.innerHTML = '';
		} else {
			setTimeout(() => {
				el.classList.add('selecting');
				selectedFileName = fileName;
				selectedMelodyBeatNum = index;
				melodyNoteCell = el;
				const noteSelectionDiv = document.getElementById('note-selection');
				noteSelectionDiv.classList.remove('hidden');
				const height = parseInt(document.defaultView.getComputedStyle(noteSelectionDiv).height);
				const width = parseInt(document.defaultView.getComputedStyle(noteSelectionDiv).width);
				const y = Math.min(event.y, innerHeight - height) - 24;
				const x = Math.min(event.x + 18, innerWidth - width - 24);
				noteSelectionDiv.style.top = `${y}px`;
				noteSelectionDiv.style.left = `${x}px`;
			}, 20);
		}
	}
}


function melodyNoteSelected(event, pitchIndex) {
	document.getElementById('note-selection').classList.add('hidden');
	const el = event.target;
	melodyNoteCell.innerHTML = el.innerHTML;
	melodyNoteCell.classList.remove('selecting');
	melodyNoteCell.classList.add('selected');
	animate(melodyNoteCell);
	if (!playingClips[selectedMelodyBeatNum]) {
		playingClips[selectedMelodyBeatNum] = [];
	}
	playingClips[selectedMelodyBeatNum].push({
		id: Math.floor(Math.random() * 1e12),
		type: 'melody',
		fileName: selectedFileName,
		pitchIndex,
	});
}


function mouseOverCell(el, fileName) {
	const cell = document.getElementById(`clip-name-${fileName}`);
	cell.classList.add('selected');
}

function mouseOutCell(el, fileName) {
	const cell = document.getElementById(`clip-name-${fileName}`);
	cell.classList.remove('selected');
}

const shiftedBuffers = {};
function play(clip) {
	const source = audioCtx.createBufferSource();
	let shiftedBuffer;
	if (shiftedBuffers[clip.id]) {
		shiftedBuffer = shiftedBuffers[clip.id];
	} else {
		const durationTime = 1000 * buffers[clip.fileName].duration;
		// console.log(noteNames[pitchIndex]);
		const buffer = buffers[clip.fileName];
		const pitchShift = Math.pow(2, (clip.pitchIndex - noteNames.length / 2) / 12) * durationTime / (1000 * buffer.duration);
		const playbackRate = 1000 * buffer.duration / durationTime;
		source.playbackRate.value = playbackRate;
		const inData = buffer.getChannelData(0);
		const inDataCopy = new Float32Array(inData);
		PitchShift(pitchShift, inDataCopy.length, 1024, 10, audioCtx.sampleRate, inDataCopy);
		shiftedBuffer = audioCtx.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
		shiftedBuffer.copyToChannel(inDataCopy, 0);
		shiftedBuffers[clip.id] = shiftedBuffer;
	}
	source.buffer = shiftedBuffer;
	source.connect(audioCtx.destination);
	source.start();
}

function addRandomNote() {
	let beatNum, clip, i = 0;
	do {
		beatNum = Math.floor(Math.random() * beatsPerMesaure);
		clip = clips[Math.floor(Math.random() * clips.length)];
	} while (playingClips[beatNum] && playingClips[beatNum].find(c => c.fileName == clip.fileName) && i++ < 80);
	if (i > 80) {
		return false;
	}
	const el = document.getElementById(`note-${clip.fileName}-${beatNum}`);
	if (clip.type == 'rhythm') {
		el.click();
	} else {
		el.classList.add('selected');
		animate(el);
		const pitchIndex = Math.floor(Math.random() * noteNames.length);
		const note = noteNames[pitchIndex];
		el.innerHTML = note;
		if (!playingClips[beatNum]) {
			playingClips[beatNum] = [];
		}
		playingClips[beatNum].push({
			id: Math.floor(Math.random() * 1e12),
			fileName: clip.fileName,
			pitchIndex: Math.floor(Math.random() * noteNames.length),
			type: 'melody',
		});
	}
	return true;
}

function removeRandomNote() {
	const notes = [];
	for (let i in playingClips) {
		for (const c of playingClips[i]) {
			notes.push({
				i,
				fileName: c.fileName,
			});
		}
	}
	if (notes.length > 0) {
		const toRemove = notes[Math.floor(Math.random() * notes.length)];
		const removingClip = playingClips[toRemove.i].find(c => c.fileName == toRemove.fileName);
		const el = document.getElementById(`note-${removingClip.fileName}-${toRemove.i}`);
		el.innerHTML = '';
		el.classList.remove('selected');
		animate(el);
		playingClips[toRemove.i] = playingClips[toRemove.i].filter(c => c.fileName != toRemove.fileName);
	}
}

function load(name) {
	reset();
	let composition = (localStorage.saved && JSON.parse(localStorage.saved)[name]);
	const saveNameInput = document.getElementById('save-name');
	if (composition) {
		saveNameInput.value = name;
	} else {
		composition = sampleCompositions[name];
		saveNameInput.value = name + ' - Copy';
	}
	setComposition(composition);
}

function setComposition(composition) {
	tempo = composition.tempo;
	document.getElementById('tempo-slider').value = (800 - tempo).toString();
	playingClips = composition.playingClips;
	for (let beatNum in playingClips) {
		if (playingClips[beatNum]) {
			for (let note of playingClips[beatNum]) {
				const cell = document.getElementById(`note-${note.fileName}-${beatNum}`);
				cell.classList.add('selected');
				if (note.type == 'melody') {
					cell.innerHTML = noteNames[note.pitchIndex];
				}
			}
		}
	}
}

function reset() {
	isPlaying = false;
	clearInterval(intervalId);
	intervalId = null;
	clearInterval(evolutionIntervalId);
	evolutionIntervalId = null;
	toggleButton.innerHTML = 'GO';
	playingClips = [];
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

function animate(el) {
	const maxIts = 16;
	let it = 0;
	el.style.backgroundColor = 'white';
	const animateIntervalId = setInterval(() => {
		if (++it > maxIts) {
			clearInterval(animateIntervalId);
			el.style = '';
		} else {
			el.style.opacity = (maxIts - it) / maxIts;
		}
	}, 20);
}

function evolve() {
	addRandomNote();
	removeRandomNote();
};

function compositionData() {
	return {
		date: new Date().getTime(),
		playingClips,
		tempo,
	};
}

function removeClip(fileName, type) {
	const rowEl = document.getElementById(`clip-row-${fileName}`);
	rowEl.remove();
	for (const beatNum in playingClips) {
		playingClips[beatNum] = playingClips[beatNum].filter(c => c.fileName != fileName);
	}
}
