var screenshotsType = '';

var dpr = window.devicePixelRatio;

var Screenshot = {
	canvas: document.createElement("canvas"),
	y_value: 0,
	scrollHeight: 0,
    scrollWidth: 0,
	getCurrentPageSize: function () {
		var self = this;
		chrome.tabs.sendMessage(Screenshot.tabId, {option: 'getCurrentPageSize'}, self.getPageSizeDone);
	},
	getPageSizeDone: function (pageSize) {
        console.log(pageSize);

		Screenshot.scrollWidth = pageSize.scrollWidth;
        Screenshot.scrollHeight = pageSize.scrollHeight;
        Screenshot.clientWidth = pageSize.clientWidth;
        Screenshot.clientHeight = pageSize.clientHeight;

        Screenshot.canvas.width = pageSize.scrollWidth;
        Screenshot.canvas.height = pageSize.scrollHeight;
        Screenshot.startCapture();
	},
	startCapture: function () {
		if (screenshotsType == 'full') {
			Screenshot.startFullCapture();
		} else if (screenshotsType == 'visual') {
			Screenshot.captureVisualPage();
		}
	},
	startFullCapture: function () {
		var self = this;
		self.y_value = 0;
		self.scrollPage(Screenshot.tabId, 0, 0 - this.scrollHeight);
	},
	scrollPage: function(tabId, x, y){
        var self = this;
        chrome.tabs.sendMessage(tabId, {option: 'scrollPage', x: x, y: y}, self.onScrollDone);
    },
    onScrollDone: function(resMsg) {
        setTimeout(function(){
        	Screenshot.captureFullPage();
        }, 1000);
    },
	captureVisualPage: function () {
		var self = this;
        var width = self.clientWidth;
        var height = self.clientHeight;

        Screenshot.canvas.width = width;
        Screenshot.canvas.height = height;

        chrome.tabs.captureVisibleTab(null, {format: 'jpeg', quality: 100}, function(img) {
            var webImg = new Image();
            var canvas = self.canvas;

            webImg.onload = function() {
                var ctx = canvas.getContext("2d");
                ctx.drawImage(webImg, 0, 0, width * dpr, height * dpr, 0, 0, width, height);
                Screenshot.downloadImg();
            };

            webImg.src = img;
        });
	},
	captureFullPage: function () {
		var self = this;
        var width = self.clientWidth;
        var height = self.clientHeight;

        chrome.tabs.captureVisibleTab(null, {format: 'jpeg', quality: 100}, function(img) {
            var webImg = new Image();
            var canvas = self.canvas;

            if (Screenshot.y_value + Screenshot.clientHeight >= Screenshot.scrollHeight) {
                webImg.onload = function() {
                    var ctx = canvas.getContext("2d");
                    var x = Screenshot.scrollHeight % Screenshot.clientHeight;
                    var y = Screenshot.clientHeight - x;
                    console.log('x=' + x);
                    console.log('y=' + y);
                    ctx.drawImage(webImg, 0, y * dpr, width * dpr, x * dpr, 0, self.y_value, width, x);
                    Screenshot.downloadImg();
                };
            } else {
                webImg.onload = function() {
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(webImg, 0, 0, width * dpr, height * dpr, 0, Screenshot.y_value, width, height);
                    Screenshot.y_value += Screenshot.clientHeight;
                    self.scrollPage(self.tabId, 0, Screenshot.clientHeight);
                };
            }

            webImg.src = img;
        });
	},
	downloadImg: function () {
		var canvas = Screenshot.canvas;
		var date = new Date();
        canvas.toBlob(function(blob) {
            saveAs(blob, date.getTime() + '.jpeg');
        });
	}
}

function startScreenshots (type) {
	screenshotsType = type;
	getCurrentTabId(function (tabId) {
		Screenshot.tabId = tabId;
		Screenshot.getCurrentPageSize();
	});
}

// 获取当前选项卡ID
function getCurrentTabId(callback)
{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
    {
        if(callback) callback(tabs.length ? tabs[0].id: null);
    });
}