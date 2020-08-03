// var buff = null;

// function init() {

// 	const analyser = audioCtx.createAnalyser();
// 	const audio0 = new Audio();
// 	audio0.src = 'http://heliosophiclabs.com/~mad/projects/mad-music/non.mp3';
// 	audio0.crossOrigin = 'anonymous';
// 	const source = audioCtx.createMediaElementSource(audio0);
// 	// audio0.controls = true;
// 	// audio0.autoplay = true;
// 	// audio0.loop = true;
// 	source.connect(analyser);
// 	analyser.connect(audioCtx.destination);

// 	// const request = new XMLHttpRequest();
// 	// // request.open('GET', 'http://heliosophiclabs.com/~mad/projects/mad-music/non.mp3', true);
// 	// request.open('GET', 'non.mp3', true);
// 	// request.responseType = 'arraybuffer';
// 	// request.onload = () => {
// 	// 	audioCtx.decodeAudioData(request.response, buffer => {
// 	// 		buff = buffer;
// 	// 	}, err => {
// 	// 		console.error(err);
// 	// 	});
// 	// }
// 	// request.send();
// }


// function playSound(buffer) {
// 	const source = audioCtx.createBufferSource(); // creates a sound source
// 	source.buffer = buffer;                    // tell the source which sound to play
// 	source.connect(audioCtx.destination);       // connect the source to the context's destination (the speakers)
// 	source.start(0);                           // play the source now
// 	// note: on older systems, may have to use deprecated noteOn(time);
// }
function loop() {
	// playSound(buff);
}
