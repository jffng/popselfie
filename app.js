function init() {
	MotionCapture.start();
}

MotionCapture.init({
	video: document.getElementById('video'),
	canvasLeft: document.getElementById('left'),
	canvasCenter: document.getElementById('center'),
	canvasRight: document.getElementById('right'),
	success: init
});
