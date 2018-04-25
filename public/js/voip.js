function initVoip() {

    var config = { 'worker_path': 'js/worker.min.js' }
    AudioRecorder.init(config);
    
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    const audioContext = new AudioContext();
    const speaker = audioContext.destination;
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    
    if (navigator.getUserMedia) {
        captureMicrophone();
    }
    
    function captureMicrophone() {
    
        const processAudio = ev => {
    
            const inputBuffer = ev.inputBuffer;
            const inputData = inputBuffer.getChannelData(0);
    
            var encodedData = Codec.encode(inputData);
    
            socketController.sendBuffor(encodedData)
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
    
    var audioBuffer;
    var audioBufferArray;
    var frameCount = 4060;
    
    audioBuffer = audioContext.createBuffer(1, frameCount, 48000);
    
    socketController.socket.on('serverSendBuffor', function (data) {
    
        var encodedData = new Uint8Array(728);
        for (var i = 0; i < 728; i++) {
            encodedData[i] = data[i];
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
    });
    
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

