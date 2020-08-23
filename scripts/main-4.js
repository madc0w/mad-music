var tempo = 200;

var mesaureNum = 0;
var intervalId;
var isPlaying = false;

const clips = ['snare-1', 'snare-1',];

const buffers = {};

function onLoad() {
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
	const clip = clips[mesaureNum % beatsPerMesaure];
	if (clip) {
		const source = audioCtx.createBufferSource();
		source.connect(audioCtx.destination);
		source.buffer = buffers[clip];
		source.start();
	}
	mesaureNum++;
}
