var tempo = 200;
const numRandomNotes = 24;

let mesaureNum = 0;
let intervalId, evolutionIntervalId;
let isPlaying = false;

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
		const numCols = 2;
		for (let col = 0; col < numCols; col++) {
			html += '<div class="col">';
			for (let i = col * noteNames.length / numCols; i < (col + 1) * noteNames.length / numCols; i++) {
				html += `<div onClick="melodyNoteSelected(event, ${i})">${noteNames[i]}</div>`;
			}
			html += '</div>';
		}
		document.getElementById('note-names').innerHTML = html;
	}
	{
		const evolveCheckbox = document.getElementById('evolve-checkbox');
		evolveSlider = document.getElementById('evolution-slider');
		const evolveSliderContainer = document.getElementById('evolution-slider-container');
		evolveSlider.onchange = () => {
			clearInterval(evolutionIntervalId);
			evolutionIntervalId = setInterval(evolve, 8000 - evolveSlider.value * 600);
		};
		evolveCheckbox.onchange = () => {
			clearInterval(evolutionIntervalId);
			evolutionIntervalId = null;
			if (evolveCheckbox.checked) {
				evolveSliderContainer.classList.remove('hidden');
				evolutionIntervalId = setInterval(evolve, 8000 - evolveSlider.value * 600);
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
		html += '<td id="add-remove-beat"><img src="icons/add_circle-24px.svg" onClick="addBeat()"/><img src="icons/remove_circle-24px.svg" onClick="removeBeat()"/></td>';
		html += '</tr>';
		for (const clip of clips.filter(c => c.type == 'rhythm' && c.isDefault)) {
			html += clipRow(clip.fileName);
		}
		rhythmMeasures.innerHTML = html;
		setAddClipRow('rhythm');
	}
	{
		const melodyMeasures = document.getElementById('melody-measures-table');
		let html = '';
		html += '<caption>And melody!</caption>';
		for (const clip of clips.filter(c => c.type == 'melody' && c.isDefault)) {
			html += clipRow(clip.fileName);
		}
		melodyMeasures.innerHTML = html;
		setAddClipRow('melody');
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
				playMelody(clip);
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
	let el = event.target;
	while (el.tagName != 'TD') {
		el = el.parentNode;
	}
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
			document.getElementById('note-duration').innerHTML = '1 &times;';
			document.getElementById('duration-slider').value = 4;
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


function melodyNoteSelected(event, pitchIndex) {
	document.getElementById('note-selection').classList.add('hidden');
	const el = event.target;
	const durationSlider = document.getElementById('duration-slider');
	const duration = Math.pow(2, durationSlider.value - 4);
	const durationWidth = 100 * (1 + parseInt(durationSlider.value)) / (1 + parseInt(durationSlider.max));
	let html = '';
	html += `<div class="note-duration" style="width: ${durationWidth}%;"></div>`;
	html += `<div>${el.innerHTML}</div>`;
	melodyNoteCell.innerHTML = html;
	melodyNoteCell.classList.remove('selecting');
	melodyNoteCell.classList.add('selected');
	animate(melodyNoteCell);
	if (!playingClips[selectedMelodyBeatNum]) {
		playingClips[selectedMelodyBeatNum] = [];
	}
	const note = {
		id: Math.floor(Math.random() * 1e12),
		type: 'melody',
		fileName: selectedFileName,
		pitchIndex,
	};
	if (duration != 1) {
		note.duration = duration;
	}
	playingClips[selectedMelodyBeatNum].push(note);
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
function playMelody(clip) {
	const source = audioCtx.createBufferSource();
	if (!shiftedBuffers[clip.id]) {
		const durationTime = 1000 * buffers[clip.fileName].duration * (clip.duration || 1);
		// console.log(noteNames[pitchIndex]);
		const buffer = buffers[clip.fileName];
		const pitchShift = Math.pow(2, (clip.pitchIndex - noteNames.length / 2) / 12) * durationTime / (1000 * buffer.duration);
		const playbackRate = 1000 * buffer.duration / durationTime;
		const inData = buffer.getChannelData(0);
		const inDataCopy = new Float32Array(inData);
		PitchShift(pitchShift, inDataCopy.length, 1024, 10, audioCtx.sampleRate, inDataCopy);
		let shiftedBuffer = audioCtx.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
		shiftedBuffer.copyToChannel(inDataCopy, 0);
		shiftedBuffers[clip.id] = {
			buffer: shiftedBuffer,
			playbackRate,
		};
	}
	source.playbackRate.value = shiftedBuffers[clip.id].playbackRate;
	source.buffer = shiftedBuffers[clip.id].buffer;
	source.connect(audioCtx.destination);
	source.start();
}

function addRandomNote() {
	let el, beatNum, clip, i = 0;
	do {
		beatNum = Math.floor(Math.random() * beatsPerMesaure);
		clip = clips[Math.floor(Math.random() * clips.length)];
		el = document.getElementById(`note-${clip.fileName}-${beatNum}`);
	} while ((!el || (playingClips[beatNum] && playingClips[beatNum].find(c => c.fileName == clip.fileName))) && i++ < 80);
	if (i > 80) {
		return false;
	}
	if (clip.type == 'rhythm') {
		el.click();
	} else {
		el.classList.add('selected');
		animate(el);
		const pitchIndex = Math.floor(Math.random() * noteNames.length);
		const note = noteNames[pitchIndex];
		const durationSlider = document.getElementById('duration-slider');

		let html = '';
		const durationVal = Math.floor(Math.random() * (1 + parseInt(durationSlider.max)));
		const durationWidth = 100 * (1 + durationVal) / (1 + parseInt(durationSlider.max));
		const duration = Math.pow(2, durationVal - 4);
		html += `<div class="note-duration" style="width: ${durationWidth}%;"></div>`;
		html += `<div>${note}</div>`;
		el.innerHTML = html;
		if (!playingClips[beatNum]) {
			playingClips[beatNum] = [];
		}
		playingClips[beatNum].push({
			id: Math.floor(Math.random() * 1e12),
			fileName: clip.fileName,
			pitchIndex: Math.floor(Math.random() * noteNames.length),
			type: 'melody',
			duration,
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
	const durationSlider = document.getElementById('duration-slider');
	for (let beatNum in playingClips) {
		if (playingClips[beatNum]) {
			for (let note of playingClips[beatNum]) {
				let row = document.getElementById(`clip-row-${note.fileName}`);
				if (!row) {
					const tableEl = document.getElementById(`${note.type}-measures-table`);
					row = tableEl.insertRow(note.type == 'rhythm' ? 1 : 0);
					row.id = `clip-row-${note.fileName}`;
					{
						const cell = row.insertCell(0);
						cell.id = `clip-name-${note.fileName}`;
						cell.classList.add('clip-name');
						const displayName = clips.find(c => c.fileName == note.fileName).displayName;
						cell.innerHTML = `<img src="icons/close-24px.svg" onClick="removeClip('${note.fileName}')"/>${displayName}`;
					}
					for (let i = 0; i < beatsPerMesaure; i++) {
						const cell = row.insertCell(1);
						cell.id = `note-${note.fileName}-${beatsPerMesaure - i - 1}`;
						cell.classList.add('note');
						cell.classList.add(`beat-${beatsPerMesaure - i - 1}`);
					}
				}
				const cell = document.getElementById(`note-${note.fileName}-${beatNum}`);
				cell.classList.add('selected');
				if (note.type == 'melody') {
					let html = '';
					const durationWidth = 100 * (1 + Math.log2(note.duration || 1) + 4) / (1 + parseInt(durationSlider.max));
					html += `<div class="note-duration" style="width: ${durationWidth}%;"></div>`;
					html += `<div>${noteNames[note.pitchIndex]}</div>`;
					cell.innerHTML = html;
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
	const maxIts = 24;
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

function removeClip(fileName) {
	const type = clips.find(c => c.fileName == fileName).type;
	const rowEl = document.getElementById(`clip-row-${fileName}`);
	rowEl.remove();
	for (const beatNum in playingClips) {
		playingClips[beatNum] = playingClips[beatNum].filter(c => c.fileName != fileName);
	}
	setAddClipRow(type);
}

function setAddClipRow(type) {
	let html = '';
	html += `<select onChange="addClip(this, '${type}')">`;
	html += '<option>Add a clip</option>';
	let count = 0;
	for (const clip of clips.filter(c => c.type == type)) {
		if (!document.getElementById(`clip-name-${clip.fileName}`)) {
			html += `<option filename="${clip.fileName}">${clip.displayName}</option>`;
			count++;
		}
	}
	html += '</select>';
	if (count == 0) {
		html = 'No more clips to add!';
	}
	document.getElementById(`add-clip-container-${type}`).innerHTML = html;
}


function addClip(selectEl, type) {
	const optionEl = selectEl.selectedOptions[0];
	const fileName = optionEl.getAttribute('filename');
	if (fileName) {
		optionEl.remove();
		const tabelEl = document.getElementById(`${type}-measures-table`);
		tabelEl.innerHTML += clipRow(fileName);
		setAddClipRow(type);
	}
}

function clipRow(fileName) {
	const displayName = clips.find(c => c.fileName == fileName).displayName;
	let html = `<tr id="clip-row-${fileName}">`;
	html += `<td class="clip-name" id="clip-name-${fileName}">`;
	html += `<img src="icons/close-24px.svg" onClick="removeClip('${fileName}')"/>`;
	html += displayName;
	html += '</td>';
	for (let i = 0; i < beatsPerMesaure; i++) {
		html += clipCell(fileName, i);
	}
	html += '<td></td>';
	html += '</tr>';
	return html;
}

function clipCell(fileName, i) {
	const type = clips.find(c => c.fileName == fileName).type;
	const onClick = type == 'rhythm' ? `toggleNote(this, '${fileName}', ${i})` : `toggleMelodyNote(event, '${fileName}', ${i})`;
	return `<td class="note beat-${i}" id="note-${fileName}-${i}" onClick="${onClick}" onMouseOut="mouseOutCell(this, '${fileName}')" onMouseOver="mouseOverCell(this, '${fileName}')"/>`;
}

function durationChnage() {
	const e = document.getElementById('duration-slider').value - 4;
	const duration = Math.pow(2, e);
	let durationStr = duration;
	if (e < 0) {
		durationStr = `1/${Math.pow(2, -e)}`;
	}
	document.getElementById('note-duration').innerHTML = `${durationStr} &times;`;
}

function addBeat() {
	beatsPerMesaure++;
	const beatNum = beatsPerMesaure - 1;
	{
		const table = document.getElementById('rhythm-measures-table');
		const headerRow = table.rows[0];
		const headerCell = headerRow.insertCell(headerRow.cells.length - 1);
		headerCell.innerHTML = beatsPerMesaure;
		headerCell.id = `beat-${beatNum}`;
		headerCell.classList.add('beat-number');
		for (let i = 1; i < table.rows.length; i++) {
			const row = table.rows[i];
			const cellId = row.cells[0].id;
			const fileName = cellId.substring('clip-name-'.length);
			const cell = row.insertCell(row.cells.length - 1);
			cell.classList.add('note');
			cell.classList.add(`beat-${beatNum}`);
			cell.id = `note-${fileName}-${beatNum}`;
			cell.onclick = () => {
				toggleNote(cell, fileName, beatNum);
			};
			cell.onmouseover = () => {
				mouseOverCell(cell, fileName);
			};
			cell.onmouseout = () => {
				mouseOutCell(cell, fileName);
			};
		}
	}
	{
		const table = document.getElementById('melody-measures-table');
		for (let i = 0; i < table.rows.length; i++) {
			const row = table.rows[i];
			const cellId = row.cells[0].id;
			const fileName = cellId.substring('clip-name-'.length);
			const cell = row.insertCell(row.cells.length - 1);
			cell.classList.add('note');
			cell.classList.add(`beat-${beatNum}`);
			cell.id = `note-${fileName}-${beatNum}`;
			cell.onclick = event => {
				toggleMelodyNote(event, fileName, beatNum);
			};
			cell.onmouseover = () => {
				mouseOverCell(cell, fileName);
			};
			cell.onmouseout = () => {
				mouseOutCell(cell, fileName);
			};
		}
	}
}

function removeBeat() {
	if (beatsPerMesaure > 2) {
		beatsPerMesaure--;

	}
}
