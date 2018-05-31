function initVoip() {

    var config = { 'worker_path': 'js/worker.min.js' }
    AudioRecorder.init(config);
    
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    const audioContext = new AudioContext();
    const speaker = audioContext.destination;
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
	
	var id;

	socketController.socket.on('id_for_client', function (data) {
    
        id = data;		
    });

    if (navigator.getUserMedia) {
        captureMicrophone();
    }
    
    function captureMicrophone() {
    
        const processAudio = ev => {
    
            const inputBuffer = ev.inputBuffer;
            const inputData = inputBuffer.getChannelData(0);
    
            var encodedData = Codec.encode(inputData);
					
            socketController.socket.emit('clientSendBuffor', {id: id, data: encodedData});
        };
    
        const microphoneStream = stream => {
    
            const microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(processor);
            processor.connect(speaker);
        };
    
        processor.addEventListener('audioprocess', processAudio);
    
        const userMediaError = err => console.error(err);
        navigator.getUserMedia({ audio: true }, microphoneStream, userMediaError);
    }
    
	var idList = [];
	var bufforList = [];
	
    socketController.socket.on('serverSendBuffor', function (data) {
		
		if(idList.indexOf(data.id) == -1){
			
			idList.push(data.id);
			bufforList.push(data.data);
		}
		else{
			idList = [];
			idList.push(data.id);			
			play();
			bufforList = [];
			bufforList.push(data.data);
		}
    });
	
	var audioBuffer;
		var audioBufferArray;
		var frameCount = 4060;
    
		audioBuffer = audioContext.createBuffer(1, frameCount, 48000);
	
	function play(){
		
		var encodedData = new Uint8Array(728);
			
		for(var j = 0; j < bufforList.length; j++){
			
			var bufforListPart = bufforList[j];
			
			for (var i = 0; i < 728; i++) {
				encodedData[i] =  encodedData[i] + bufforListPart[i];
			}	
		}
		
		if(bufforList.length > 1){
			
			for (var i = 0; i < 728; i++) {
			
				encodedData[i] =  10 * Math.log10(encodedData[i]);		
			}	
		}
		
		var decodedData = Codec.decode(encodedData);
			
		audioBufferArray = audioBuffer.getChannelData(0);
    
		for (var i = 0; i < frameCount; i++) {
			audioBufferArray[i] = decodedData[i] / 10;
		}
		
		for (var i = 0; i < 300; i++) {
				
			audioBufferArray[i] = audioBufferArray[i] * i / 300;//fade in
			audioBufferArray[frameCount - i - 1] = audioBufferArray[frameCount - i - 1] * i / 300;//fade out
		}
	
        var source = audioContext.createBufferSource();

        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();			
	}
    
    var min = -0.00015;
    var max = 0.00015;
    
    var bufferSize = 2 * audioContext.sampleRate,
        noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate),
        output = noiseBuffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * (max - min) + min;
    }
    
    var whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    whiteNoise.start(0);
    
    whiteNoise.connect(audioContext.destination); 
}

