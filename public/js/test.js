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
	document.getElementById('beginBtn').style.display = 'none';
	document.getElementById('testArea').innerHTML = "<h3>Test 1</h3><p>Tests the high frequency cutoff of audio hardware. Press the button when you can't hear the tone. NOTE: Will be different between people, perform test yourself.</p><button class='btn' onclick='stopSoundA()'>Stop</button><p id='Help'>2400Hz/Sec</p><p id='Freq'></p>";
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
		document.getElementById('Help').innerHTML = (accuracy*100) + "Hz/Sec";
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
	document.getElementById('testArea').innerHTML = "<h3>Test 2</h3><p>Tests the low frequency cutoff of audio hardware. Press the button when you can't hear the tone.</p><button class='btn' onclick='stopSoundB()'>Stop</button><p id='Help'>2400Hz/Sec</p><p id='Freq'></p>";
	sineWave.frequency = 5000;
	sineWave.play();
	interval = setInterval(decreaseFrequency, 100);
}

function stopSoundB() {
	if (counter < 4) {
		accuracy = accuracy/2;
		sineWave.frequency += 200;
		document.getElementById('Help').innerHTML = (accuracy*100) + "Hz/Sec";
		counter++;
		return;
	}
	counter = 0;
	accuracy = 24;
	clearInterval(interval);
	sineWave.stop();
	cutoffLow = sineWave.frequency;
	document.getElementById('testArea').innerHTML = "<h3>Results for " + detectBrowser() + "</h3><p>Here are your results</p><table><tr><td>High Cutoff</td><td>" + cutoffHigh + "</td></tr><tr><td>Low Cutoff</td><td>" + cutoffLow + "</td></tr><table>";
}
