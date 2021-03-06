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
	document.getElementById('testArea').innerHTML = "<h3>Test 1A</h3><p>Tests the high frequency cutoff of audio hardware. Move the slider to the right and press the button when you can't hear the tone. NOTE: Will be different between people, perform test yourself.</p><div id='sliderDiv'><input type='range' min='13000' max='20000' value='13000' id='sliderValue'></div><button class='btn' onclick='stopSoundA()'>Stop</button><p id='Freq'></p>";
	getSlider();
	sineWave.play();
}

function getSlider(){
	var slider = document.getElementById('sliderValue');
	var output = document.getElementById('Freq');
	output.innerHTML = slider.value + "Hz";

	slider.oninput = function() {
		output.innerHTML = this.value + "Hz";
		sineWave.frequency = this.value;
	}
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
	sineWave.stop();
	cutoffHigh = sineWave.frequency;
	startSoundB();
}

function startSoundB() {
	document.getElementById('testArea').innerHTML = "<h3>Test 1B</h3><p>Tests the low frequency cutoff of audio hardware. Move the slider to the left and press the button when you can't hear the tone. NOTE: Will be different between people, perform test yourself.</p><div id='sliderDiv'><input type='range' min='1' max='150' value='150' id='sliderValue'></div><button class='btn' onclick='stopSoundB()'>Stop</button><p id='Freq'></p>";	sineWave.frequency = 5000;
	getSlider();
	sineWave.play();
}

function stopSoundB() {
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

var startFreq = 1000;
var endFreq = 2000;

function beginChain() {
	//This function begins the test for audio chaining
	document.getElementById('beginBtn3').style.display = 'none';
	document.getElementById('testAreaChain').innerHTML = "<p>We test a low pass filter, then add a high pass filter to restrict the audio range. We can't tell if this is correct, so we reverse the order.</p>\
	<p>The test runs from 100Hz-3000Hz. Additional test cases are generated every time the button below is pressed.</p>\
	<button class='btn' onclick='changeFreq()'>Generate new frequency range</button><span id='freqRange'>" + startFreq + "Hz - " + endFreq + "Hz</span><br />\
	<button class='btn' onclick='playLowpassFirst()'>Play with lowpass first</button>\
	<button class='btn' onclick='playHighpassFirst()'>Play with highpass first</button>\
	<p>In addition, we can test whether additional filters are affected by filter order.</p>\
	<button class='btn' onclick='addFlanger()'>Add Flanger</button>\
	<button class='btn' onclick='removeFlanger()'>Remove Flanger</button>";

}

var generatorSound = new Pizzicato.Sound({
	source: "wave",
	options: {
		type: "sawtooth",
		frequency: 100
	}
});

var lowPassFilter = new Pizzicato.Effects.LowPassFilter({
		frequency: startFreq,
		peak: 10
});

var highPassFilter = new Pizzicato.Effects.HighPassFilter({
		frequency: endFreq,
		peak: 10
});

var generatorFreq = 0;

var flanger = new Pizzicato.Effects.Flanger({
    time: 0.45,
    speed: 0.2,
    depth: 0.1,
    feedback: 0.1,
    mix: 0.5
});

var flangerAdded = false;

function addFlanger() {
	if (!flangerAdded) {
		flangerAdded = true;
		generatorSound.addEffect(flanger);
	}
}

function removeFlanger() {
	if (flangerAdded) {
		flangerAdded = false;
		generatorSound.removeEffect(flanger);
	}
}

function increaseGeneratorFrequency() {
	generatorSound.frequency += 50;

	if (generatorSound.frequency > 3000) {
		clearInterval(generatorFreq);
		generatorSound.stop();
	}
}

function playHighpassFirst() {
	if (generatorFreq != 0) clearInterval(generatorFreq);
	generatorSound.frequency = 100;

	lowPassFilter.frequency = startFreq;
	highPassFilter.frequency = endFreq;

	generatorSound.removeEffect(highPassFilter);
	generatorSound.removeEffect(lowPassFilter);

	generatorSound.addEffect(highPassFilter);
	generatorSound.addEffect(lowPassFilter);

	generatorSound.play();

	generatorFreq = setInterval(increaseGeneratorFrequency, 100);
}

function playLowpassFirst() {
	//Use a Sin generator, generating the lowpass filter first then the highpass filter
		/*var lowPassFilter = new Pizzicato.Effects.LowPassFilter({
	    frequency: 400,
	    peak: 10
		});*/
		if (generatorFreq != 0) clearInterval(generatorFreq);
		generatorSound.frequency = 100;

		lowPassFilter.frequency = startFreq;
		highPassFilter.frequency = endFreq;

		generatorSound.removeEffect(lowPassFilter);
		generatorSound.removeEffect(highPassFilter);

		generatorSound.addEffect(lowPassFilter);
		generatorSound.addEffect(highPassFilter);

		generatorSound.play();

		generatorFreq = setInterval(increaseGeneratorFrequency, 100);
}

function changeFreq() {
	startFreq = Math.round(Math.random()*3000);
	endFreq = Math.round(Math.random()*3000);

	//After random generation, we simply use this random frequency range
	document.getElementById("freqRange").innerHTML = startFreq + "Hz - " + endFreq + "Hz";
}

function beginInversion() {
	//Invert the audio wave that was uploaded
	document.getElementById('beginBtn2').style.display = 'none';
	document.getElementById('testAreaInversion').innerHTML = "<p>If your audio output chain is working right, you should hear nothing but static in the second button below.</p><button class='btn' onclick='playSound()'>Play</button><button class='btn' onClick='playInvertedSound()'>Play Inverted</button>";
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
		soundPlay.getSourceNode().start();

		soundPlay.on('end', function() {
			scriptNode.disconnect(context.destination);
			soundPlay.getSourceNode().disconnect(scriptNode);
			soundPlay.getSourceNode().stop();
		});

	});
}
