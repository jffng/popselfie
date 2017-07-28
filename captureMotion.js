var MotionCapture = (function() {
	var stream;					// stream obtained from webcam
	var video;					// shows stream
	var captureCanvas;			// internal canvas for capturing full images from video
	var captureContext;			// context for capture canvas
	var diffCanvas;				// internal canvas for diffing downscaled captures
	var diffContext;			// context for diff canvas

	var successCallback;	    // called when init succeeds
	var startCompleteCallback;	// called when start is complete

	var captureInterval;		// interval for continuous captures
	var captureIntervalTime;	// time between captures, in ms
	var captureWidth;			// full captured image width
	var captureHeight;			// full captured image height
	var diffWidth;				// downscaled width for diff/motion
	var diffHeight;				// downscaled height for diff/motion
	var isReadyToDiff;			// has a previous capture been made to diff against?
	var pixelDiffThreshold;		// min for a pixel to be considered significant

	function init(options) {
		// incoming options with defaults
		video = options.video;
		canvasPurple = options.canvasLeft;
		canvasGreen = options.canvasCenter;
		canvasAqua = options.canvasRight;
		captureIntervalTime = 100;
		captureWidth = 480; 
		captureHeight = 480;
		diffWidth = 100;
		diffHeight = 100;
		pixelDiffThreshold = 32;

		// callbacks
		successCallback = options.success;
		startCompleteCallback = options.startCompleteCallback || function() {};
		captureCallback = options.captureCallback || function() {};

		captureCanvas = document.createElement('canvas');
		diffCanvas = document.createElement('canvas');
		isReadyToDiff = false;

		captureCanvas.width = captureWidth;
		captureCanvas.height = captureHeight;
		captureContext = captureCanvas.getContext('2d');

		diffCanvas.width = diffWidth;
		diffCanvas.height = diffHeight;
		diffContext = diffCanvas.getContext('2d');

		canvasPurple.width = canvasAqua.width = canvasGreen.width = diffWidth;
		canvasPurple.height = canvasAqua.height = canvasGreen.height = diffHeight;

		purpleContext = canvasPurple.getContext('2d');
		greenContext = canvasGreen.getContext('2d');
		aquaContext = canvasAqua.getContext('2d');

		requestWebcam();
	}

	function requestWebcam() {
		var constraints = {
			audio: false,
			video: { width: captureWidth, height: captureHeight }
		};

		navigator.mediaDevices.getUserMedia(constraints)
			.then(initSuccess)
			.catch(initError);
	}

	function initSuccess(requestedStream) {
		stream = requestedStream;
		successCallback();
	}

    function initError(error){
        alert(error);
    }

	function startDrawing() {
		if (!stream) {
			throw 'Cannot start after init fail';
		}

		// streaming takes a moment to start
		video.addEventListener('canplay', startComplete);
		video.srcObject = stream;
	}

	function startComplete() {
		video.removeEventListener('canplay', startComplete);
		captureInterval = setInterval(capture, captureIntervalTime);
		startCompleteCallback();
	}

	function capture() {
		// save a full-sized copy of capture
		captureContext.drawImage(video, 0, 0, captureWidth, captureHeight);
		var captureImageData = captureContext.getImageData(0, 0, captureWidth, captureHeight);

		// diff current capture over previous capture, leftover from last time
		diffContext.globalCompositeOperation = 'difference';
		diffContext.drawImage(video, 0, 0, diffWidth, diffHeight);
		var diffImageData = diffContext.getImageData(0, 0, diffWidth, diffHeight);

		if (isReadyToDiff) {
            var rgba = diffImageData.data;

            // TODO: figure out a pattern so that we're not iterating once for the alpha channel, then separately for each canvas
            setAlpha(rgba);

			setColor(rgba, "green");
			greenContext.putImageData(diffImageData, 0, 0);

			setColor(rgba, "purple");
			purpleContext.putImageData(diffImageData, 0, 0);

			setColor(rgba, "aqua");
			aquaContext.putImageData(diffImageData, 0, 0);
		}

		// draw current capture normally over diff, ready for next time
		diffContext.globalCompositeOperation = 'source-over';
		diffContext.drawImage(video, 0, 0, diffWidth, diffHeight);
		isReadyToDiff = true;
	}

    function setAlpha(rgba){
        for (var i = 0; i < rgba.length; i += 4) {
            var pixelDiff = rgba[i] * 0.3 + rgba[i + 1] * 0.6 + rgba[i + 2] * 0.1;
            var alpha = Math.min(255, pixelDiff * (255 / pixelDiffThreshold));
            if (alpha > 80){
                rgba[i+3] = alpha;
            }else {
                rgba[i+3] = 0;
            }
        }
    }

	function setColor(rgba, color) {
        var colors = {
            "green": [0, 255, 0],
            "purple": [255, 102, 255],
            "aqua": [0, 255, 255],
        };

		// pixel adjustments are done by reference directly on diffImageData
		for (var i = 0; i < rgba.length; i += 4) {
            rgba[i] = colors[color][0];
            rgba[i + 1] = colors[color][1];
            rgba[i + 2] = colors[color][2];
		}
	}

    // interface to the capture object
	return {
		init: init,
		start: startDrawing
	};
})();
