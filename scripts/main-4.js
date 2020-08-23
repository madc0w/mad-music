var tempo = 200;

let mesaureNum = 0;
let intervalId;
let isPlaying = false;
const clips = [{
	fileName: 'snare-1',
	displayName: 'Snare',
}, {
	fileName: 'bass-drum-1',
	displayName: 'Bass 1',
}];

const playingClips = [];

const buffers = {};

function onLoad() {
	const measures = document.getElementById('measures-table');

	{
		let html = '';
		html += '<tr>';
		html += '<td />';
		for (let i = 0; i < beatsPerMesaure; i++) {
			html += `<td class="beat-number" id="beat-${i}">`;
			html += i + 1;
			html += '</td>';
		}
		html += '</tr>';
		for (const clip of clips) {
			html += '<tr>';
			html += '<td class="clip-name">';
			html += clip.displayName;
			html += '</td>';
			for (let i = 0; i < beatsPerMesaure; i++) {
				html += `<td class="note" onClick="toggleNote(this, '${clip.fileName}', ${i})">`;
				html += '</td>';
			}
			html += '</tr>';
		}
		measures.innerHTML = html;
	}

	const toggleButton = document.getElementById('toggle-button');
	toggleButton.onclick = () => {
		isPlaying = !isPlaying;
		toggleButton.innerHTML = isPlaying ? 'STOP' : 'GO';
		if (isPlaying) {
			intervalId = setInterval(loop, tempo);
		} else {
			clearInterval(intervalId);
		}
	};

	const request = new XMLHttpRequest();
	const clipName = 'snare-1';
	const url = `${baseUrl}/${clipName}.mp3`;
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';
	request.onload = () => {
		audioCtx.decodeAudioData(request.response, audioBuffer => {
			buffers[clipName] = audioBuffer;
		});
	}
	request.send();


}

function loop() {
	const beatNum = mesaureNum % beatsPerMesaure;
	const clips = playingClips[beatNum];
	if (clips) {
		for (clip of clips) {
			const source = audioCtx.createBufferSource();
			source.connect(audioCtx.destination);
			source.buffer = buffers[clip];
			source.start();
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
	mesaureNum++;
}

function toggleNote(el, fileName, index) {
	el.classList.toggle('selected');
	if (!playingClips[index]) {
		playingClips[index] = [];
	}
	if (playingClips[index].includes(fileName)) {
		playingClips[index] = playingClips[index].filter(fn => fn != fileName);
	} else {
		playingClips[index].push(fileName);
	}
}
