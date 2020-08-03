var buff = null;

function setup() {
	console.log('setup');
}

function init() {
	const request = new XMLHttpRequest();
	request.open('GET', 'http://heliosophiclabs.com/~mad/projects/mad-music/non.mp3', true);
	request.responseType = 'arraybuffer';
	request.onload = () => {
		audioContext.decodeAudioData(request.response, buffer => {
			buff = buffer;
		}, err => {
			console.error(err);
		});
	}
	request.send();
}

function loop() {

}
