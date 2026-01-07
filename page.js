

'use strict';

var activePBRButton;
var screenshotKey = false;
var playbackSpeedButtons = false;
var screenshotFunctionality = 0;
var screenshotFormat = "png";
var extension = 'png';
var isAppended = false;
var showScreenshotText = true;  // Default to true (text is shown)
let showBadge = true;

// Retrieve the showText setting when the page loads
chrome.storage.sync.get('showBadge', (res) => {
    if (res.showBadge === false) {
        showBadge = false;
        screenshotButton.style.display = 'none';
    }
});


function CaptureScreenshot() {
    var appendixTitle = "screenshot." + extension;
    var title;

    var headerEls = document.querySelectorAll("h1.title.ytd-video-primary-info-renderer");

    function SetTitle() {
        if (headerEls.length > 0) {
            title = headerEls[0].innerText.trim();
            return true;
        } else {
            return false;
        }
    }

    if (SetTitle() == false) {
        headerEls = document.querySelectorAll("h1.watch-title-container");

        if (SetTitle() == false)
            title = '';
    }

    var player = document.getElementsByClassName("video-stream")[0];
    var time = player.currentTime;

    title += " ";
    let minutes = Math.floor(time / 60)
    time = Math.floor(time - (minutes * 60));

    if (minutes > 60) {
        let hours = Math.floor(minutes / 60)
        minutes -= hours * 60;
        title += hours + "-";
    }

    title += minutes + "-" + time;
    title += " " + appendixTitle;

    var canvas = document.createElement("canvas");
    canvas.width = player.videoWidth;
    canvas.height = player.videoHeight;
    canvas.getContext('2d').drawImage(player, 0, 0, canvas.width, canvas.height);

    // Only show the text if the setting is true
    if (showScreenshotText) {
        var ctx = canvas.getContext('2d');
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.7)';
        ctx.fillText(title, 10, 40);  // Adjust position as needed
    }

    var downloadLink = document.createElement("a");
    downloadLink.download = title;

    function DownloadBlob(blob) {
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.click();
    }

    async function ClipboardBlob(blob) {
        const clipboardItemInput = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([clipboardItemInput]);
    }

    if (screenshotFunctionality == 1 || screenshotFunctionality == 2) {
        canvas.toBlob(async function (blob) {
            await ClipboardBlob(blob);
            if (screenshotFunctionality == 2 && screenshotFormat === 'png') {
                DownloadBlob(blob);
            }
        }, 'image/png');
    }

    if (screenshotFunctionality == 0 || (screenshotFunctionality == 2 && screenshotFormat !== 'png')) {
        canvas.toBlob(async function (blob) {
            DownloadBlob(blob);
        }, 'image/' + screenshotFormat);
    }
}


// function AddScreenshotButton() {
// 	var ytpRightControls = document.getElementsByClassName("ytp-right-controls")[0];
// 	if (!ytpRightControls) {
// 		isAppended = false;
// 		return;
// 	}

function AddScreenshotButton() {
    if (!showBadge) return;

    var ytpRightControls = document.getElementsByClassName("ytp-right-controls")[0];
    if (!ytpRightControls) {
        isAppended = false;
        return;
    }

    if (!screenshotButton.parentNode) {
        ytpRightControls.insertBefore(
            screenshotButton,
            ytpRightControls.childNodes[ytpRightControls.childNodes.length - 2]
        );
    }

    isAppended = true;


  // Insert the screenshot button just before the autoplay button
    ytpRightControls.insertBefore(screenshotButton, ytpRightControls.childNodes[ytpRightControls.childNodes.length - 2]);

	// ytpRightControls.prepend(screenshotButton);
	isAppended = true;

	chrome.storage.sync.get('playbackSpeedButtons', function(result) {
		if (result.playbackSpeedButtons) {
			ytpRightControls.prepend(speed3xButton);
			ytpRightControls.prepend(speed25xButton);
			ytpRightControls.prepend(speed2xButton);
			ytpRightControls.prepend(speed15xButton);
			ytpRightControls.prepend(speed1xButton);

			var playbackRate = document.getElementsByTagName('video')[0].playbackRate;
			switch (playbackRate) {
				case 1:
					speed1xButton.classList.add('SYTactive');
					activePBRButton = speed1xButton;
					break;
				case 2:
					speed2xButton.classList.add('SYTactive');
					activePBRButton = speed2xButton;
					break;
				case 2.5:
					speed25xButton.classList.add('SYTactive');
					activePBRButton = speed25xButton;
					break;
				case 3:
					speed3xButton.classList.add('SYTactive');
					activePBRButton = speed3xButton;
					break;
			}
		}
	});
}

var screenshotButton = document.createElement("button");
screenshotButton.className = "screenshotButton ytp-button";
screenshotButton.style.width = "auto";
// screenshotButton.innerHTML = "Screenshot";
screenshotButton.innerHTML = `
<svg height="24" width="24" viewBox="0 0 24 24" fill="white">
  <path d="M21 5h-3.17l-1.84-2H8.01L6.17 5H3c-1.1 0-2 .9-2 2v12
  c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 13
  c-2.76 0-5-2.24-5-5s2.24-5 5-5
  5 2.24 5 5-2.24 5-5 5zm0-8
  c-1.66 0-3 1.34-3 3s1.34 3 3 3
  3-1.34 3-3-1.34-3-3-3z"/>
</svg>
`;

screenshotButton.style.cssFloat = "left";


// Modify the screenshot button position and text size
// screenshotButton.style.position = "absolute"; // Use absolute positioning
// screenshotButton.style.top = "15px";  // Position the button a little higher (adjust as needed)
screenshotButton.style.right = "230px"; // Keep the button near the left side
screenshotButton.style.position = "absolute";
screenshotButton.style.bottom = "0px"; // move UP
// screenshotButton.style.left = "20px";   // move LEFT

screenshotButton.style.fontSize = "10px"; // Increase the font size
screenshotButton.style.zIndex = "1000"; // Ensure it's above other elements
screenshotButton.style.padding = "10px 20px"; // Adjust padding to make the button bigger


screenshotButton.onclick = CaptureScreenshot;

var speed1xButton = document.createElement("button");
speed1xButton.className = "ytp-button SYText";
speed1xButton.innerHTML = "1×";
speed1xButton.onclick = function() {
	document.getElementsByTagName('video')[0].playbackRate = 1;
	activePBRButton.classList.remove('SYTactive');
	this.classList.add('SYTactive');
	activePBRButton = this;
};

var speed15xButton = document.createElement("button");
speed15xButton.className = "ytp-button SYText";
speed15xButton.innerHTML = "1.5×";
speed15xButton.onclick = function() {
	document.getElementsByTagName('video')[0].playbackRate = 1.5;
	activePBRButton.classList.remove('SYTactive');
	this.classList.add('SYTactive');
	activePBRButton = this;
};

var speed2xButton = document.createElement("button");
speed2xButton.className = "ytp-button SYText";
speed2xButton.innerHTML = "2×";
speed2xButton.onclick = function() {
	document.getElementsByTagName('video')[0].playbackRate = 2;
	activePBRButton.classList.remove('SYTactive');
	this.classList.add('SYTactive');
	activePBRButton = this;
};

var speed25xButton = document.createElement("button");
speed25xButton.className = "ytp-button SYText";
speed25xButton.innerHTML = "2.5×";
speed25xButton.onclick = function() {
	document.getElementsByTagName('video')[0].playbackRate = 2.5;
	activePBRButton.classList.remove('SYTactive');
	this.classList.add('SYTactive');
	activePBRButton = this;
};

var speed3xButton = document.createElement("button");
speed3xButton.className = "ytp-button SYText";
speed3xButton.innerHTML = "3×";
speed3xButton.onclick = function() {
	document.getElementsByTagName('video')[0].playbackRate = 3;
	activePBRButton.classList.remove('SYTactive');
	this.classList.add('SYTactive');
	activePBRButton = this;
};

activePBRButton = speed1xButton;

chrome.storage.sync.get(['screenshotKey', 'playbackSpeedButtons', 'screenshotFunctionality', 'screenshotFileFormat'], function(result) {
	screenshotKey = result.screenshotKey;
	playbackSpeedButtons = result.playbackSpeedButtons;
	if (result.screenshotFileFormat === undefined) {
		screenshotFormat = 'png'
	} else {
		screenshotFormat = result.screenshotFileFormat
	}

	if (result.screenshotFunctionality === undefined) {
		screenshotFunctionality = 0;
	} else {
		screenshotFunctionality = result.screenshotFunctionality;
	}

	if (screenshotFormat === 'jpeg') {
		extension = 'jpg';
	} else {
		extension = screenshotFormat;
	}
});

document.addEventListener('keydown', function(e) {
	if (document.activeElement.contentEditable === 'true' || document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.contentEditable === 'plaintext')
		return true;

	if (playbackSpeedButtons) {
		switch (e.key) {
			case 'q':
				speed1xButton.click();
				e.preventDefault();
				return false;
			case 's':
				speed15xButton.click();
				e.preventDefault();
				return false;
			case 'w':
				speed2xButton.click();
				e.preventDefault();
				return false;
			case 'e':
				speed25xButton.click();
				e.preventDefault();
				return false;
			case 'r':
				speed3xButton.click();
				e.preventDefault();
				return false;
		}
	}

	if (screenshotKey && e.key === 'p') {
		CaptureScreenshot();
		e.preventDefault();
		return false;
	}
});

AddScreenshotButton();

function onDomChange(mutationsList, observer) {
	let run = false;
	for (let mutation of mutationsList) {
		if (mutation.type === 'childList') {
			run = true;
		}
	}

	if (run) {
		let ytpRightControls = document.getElementsByClassName("ytp-right-controls")[0];
		if (ytpRightControls && isAppended === false) {
			AddScreenshotButton();
		}
	}
}

const observer = new MutationObserver(onDomChange);

observer.observe(document.body, {
	childList: true,
	subtree: true
});




chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'TOGGLE_BADGE') {
        showBadge = msg.show;
        screenshotButton.style.display = showBadge ? 'flex' : 'none';
    }
});
