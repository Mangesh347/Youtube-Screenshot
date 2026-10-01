'use strict';

var screenshotKey = false;
var screenshotFunctionality = 0;
var screenshotFormat = "png";
var extension = 'png';
var isAppended = false;
var showScreenshotText = true;
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

    if (!SetTitle()) {
        headerEls = document.querySelectorAll("h1.watch-title-container");
        if (!SetTitle()) title = '';
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

    if (showScreenshotText) {
        var ctx = canvas.getContext('2d');
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.7)';
        ctx.fillText(title, 10, 40);
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
}

var screenshotButton = document.createElement("button");
screenshotButton.className = "screenshotButton ytp-button";
screenshotButton.style.width = "auto";
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
screenshotButton.style.right = "230px";
screenshotButton.style.position = "absolute";
screenshotButton.style.bottom = "0px";
screenshotButton.style.fontSize = "10px";
screenshotButton.style.zIndex = "1000";
screenshotButton.style.padding = "10px 20px";

screenshotButton.onclick = CaptureScreenshot;

chrome.storage.sync.get(['screenshotKey', 'screenshotFunctionality', 'screenshotFileFormat'], function(result) {
	screenshotKey = result.screenshotKey;
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
