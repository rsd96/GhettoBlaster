var cutoffHigh = 0;
var cutoffLow = 0;

var interval;
var accuracy = 24;
var counter = 0;

var sineWave = new Pizzicato.Sound({
	source: 'wave',
	options: {
		frequency: 13000
	}
});

function begin() {
	document.getElementById('beginBtn').disabled = true;	// disable the begin button
	document.getElementById('testArea').innerHTML = "<h3>Test 1</h3><p>Tests the high frequency cutoff of audio hardware. Press the button when you can't hear the tone. NOTE: Will be different between people, perform test yourself.</p><button class='btn' onclick='stopSoundA()'>Stop</button><p id='Help'>240Hz/Sec</p><p id='Freq'></p>";
	sineWave.play();
	interval = setInterval(increaseFrequency, 100);
}

function increaseFrequency() {
	sineWave.frequency += accuracy;
	document.getElementById('Freq').innerHTML = sineWave.frequency;
}

function decreaseFrequency() {
	sineWave.frequency -= accuracy;
	document.getElementById('Freq').innerHTML = sineWave.frequency;
}

function stopSoundA() {
	if (counter < 4) {
		accuracy = accuracy/2;
		sineWave.frequency -= 200;
		document.getElementById('Help').innerHTML = (accuracy*10) + "Hz/Sec";
		counter++;
		return;
	}
	counter = 0;
	accuracy = 24;
	clearInterval(interval);
	sineWave.stop();
	cutoffHigh = sineWave.frequency;
	startSoundB();
}

function startSoundB() {
	document.getElementById('testArea').innerHTML = "<h3>Test 2</h3><p>Tests the low frequency cutoff of audio hardware. Press the button when you can't hear the tone.</p><button class='btn' onclick='stopSoundB()'>Stop</button><p id='Help'>240Hz/Sec</p><p id='Freq'></p>";
	sineWave.frequency = 5000;
	sineWave.play();
	interval = setInterval(decreaseFrequency, 100);
}

function stopSoundB() {
	if (counter < 4) {
		accuracy = accuracy/2;
		sineWave.frequency += 200;
		document.getElementById('Help').innerHTML = (accuracy*10) + "Hz/Sec";
		counter++;
		return;
	}
	counter = 0;
	accuracy = 24;
	clearInterval(interval);
	sineWave.stop();
	cutoffLow = sineWave.frequency;
	document.getElementById('testArea').innerHTML = "<div class='col 6'><h3>Results for " + detectBrowser() + "</h3><p>Here are your results</p><table class='w-100'><tr><td>High Cutoff</td><td>" + cutoffHigh + "</td></tr><tr><td>Low Cutoff</td><td>" + cutoffLow + "</td></tr></table></div>";

	//Log the result to the database
	$.get("/users", {browser:detectBrowser(), low:cutoffLow, high : cutoffHigh},

	function(data) {
		document.getElementById('testArea').innerHTML += data;
	}); //The get request is sent to the server
	
	document.getElementById('beginBtn').disabled = false;	// re-enable the begin button
}

function beginChain() {
	//This function begins the test
}

function beginInversion() {
	//Invert the audio wave that was uploaded
	document.getElementById('testAreaInversion').innerHTML = "<p>If your audio output chain is working right, you should hear nothing but static in the second button below.</p><button class='btn' onclick='playSound()'>Play</button><button class='btn' onclick='playInvertedSound()'>Play Inverted</button>";
}

var soundPlay = 0;


//Get the audio context. This audio processor is responsible for changing the audio to be inverted
var context = Pizzicato.context;
var scriptNode = context.createScriptProcessor(2048, 1, 1);

//Sample code for processing a particular audio context
scriptNode.onaudioprocess = function(audioProcessingEvent) {
  // The input buffer is the song we loaded earlier
  var inputBuffer = audioProcessingEvent.inputBuffer;

  // The output buffer contains the samples that will be modified and played
  var outputBuffer = audioProcessingEvent.outputBuffer;

  // Loop through the output channels (in this case there is only one)
  for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
    var inputData = inputBuffer.getChannelData(channel);
    var outputData = outputBuffer.getChannelData(channel);

    // Loop through the samples
    for (var sample = 0; sample < inputBuffer.length; sample++) {
      // make output equal to the negation of the input
      outputData[sample] = -inputData[sample] + inputData[sample];

      // add noise to each output sample
      outputData[sample] += ((Math.random() * 2) - 1) * 0.1;
    }
  }
}

function playSound() {
		soundPlay = new Pizzicato.Sound('./audio/tremolo-guitar.mp3', function() {
			soundPlay.play();
		});
}

function playInvertedSound() {
	//Basic sound inversion filter
	soundPlay = new Pizzicato.Sound('./audio/tremolo-guitar.mp3', function() {
		soundPlay.getSourceNode().connect(scriptNode);
		scriptNode.connect(context.destination);
		soundPlay.play();

		soundPlay.on('end', function() {
			scriptNode.disconnect(context.destination);
			soundPlay.getSourceNode().disconnect(scriptNode);
		});

	});
}
