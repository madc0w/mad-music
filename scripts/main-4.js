var tempo = 200;
const numRandomNotes = 24;

let mesaureNum = 0;
let intervalId;
let isPlaying = false;
const clips = [{
	fileName: 'bass-drum-1',
	displayName: 'Bass Drum',
}, {
	fileName: 'snare-1',
	displayName: 'Snare',
}, {
	fileName: 'hi-hat-1',
	displayName: 'High Hat 1',
}, {
	fileName: 'hi-hat-2',
	displayName: 'High Hat 2',
	// }, {
	// 	fileName: 'swoosh',
	// 	displayName: 'Swoosh',
}, {
	fileName: 'gunshot',
	displayName: 'Gunshot',
}, {
	fileName: 'boom',
	displayName: 'Boom',
}, {
	fileName: 'boom-rattle',
	displayName: 'Boom Rattle',
}, {
	fileName: 'clap-1',
	displayName: 'Clap 1',
}, {
	fileName: 'clap-2',
	displayName: 'Clap 2',
}, {
	fileName: 'jews-harp',
	displayName: 'Jew\'s Harp 1',
}, {
	fileName: 'jews-harp-2',
	displayName: 'Jew\'s Harp 2',
}, {
	fileName: 'gong-2',
	displayName: 'Gong 1',
}, {
	fileName: 'gong-3',
	displayName: 'Gong 2',
}, {
	fileName: 'gong-4',
	displayName: 'Gong 3',
}, {
	fileName: 'gong-5',
	displayName: 'Gong 4',
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
				html += `<td class="note beat-${i}" id="note-${clip.fileName}-${i}" onClick="toggleNote(this, '${clip.fileName}', ${i})">`;
				html += '</td>';
			}
			html += '</tr>';
		}
		measures.innerHTML = html;
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
			const clipName = clips[Math.floor(Math.random() * clips.length)].fileName;
			document.getElementById(`note-${clipName}-${beatNum}`).click();
		}
		toggleButton.onclick();
	};

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
	if (playingClips[index].includes(fileName)) {
		playingClips[index] = playingClips[index].filter(fn => fn != fileName);
	} else {
		playingClips[index].push(fileName);
	}
}
