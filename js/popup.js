$(function () {
	$('#full-screenshot').on('click', function () {
		var bg = chrome.extension.getBackgroundPage();
		bg.startScreenshots('full');
	});

	$('#visual-screenshot').on('click', function () {
		var bg = chrome.extension.getBackgroundPage();
		bg.startScreenshots('visual');
	});
});