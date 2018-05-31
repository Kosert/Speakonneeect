self.addEventListener("message", function(e) {
    // the passed-in data is available via e.data
	
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	var audioContext = new AudioContext();
	
	
    var speaker = audioContext.destination;
    var processor = audioContext.createScriptProcessor(4096, 1, 1);
	
	
	
	var encodedData = new Uint8Array(728);
        for (var i = 0; i < 728; i++) {
            encodedData[i] = e.data[i];
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
}, false);

