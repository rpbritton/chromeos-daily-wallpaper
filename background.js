function xhrGet(url) {
	return new Promise((resolve, reject) => {
		let request = new XMLHttpRequest();
		request.onload = function() {
			(this.status == 200) ? resolve(this.responseText) : reject(this.statusText);
		}

		request.onerror = function() {
			reject(Error("xhr error"));
		}

		request.open('GET', url);
		request.send();
	});
}

xhrGet('http://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US').then(response => {
	chrome.wallpaper.setWallpaper({
		'url': `http://www.bing.com${JSON.parse(response).images[0].url}`,
		'layout': 'CENTER_CROPPED',
		'filename': 'bing wallpaper'
	});
}).catch(error => {
	
});

chrome.wallpaper.setWallpaper({
	'url': `background.jpg`,
	'layout': 'CENTER_CROPPED',
	'filename': 'bing_wallpaper'
}, () => {
	console.log("wallpaper set!");
});
