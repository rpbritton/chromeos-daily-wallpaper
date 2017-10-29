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

chrome.alarms.create({
	'when': Math.ceil(Date.now()/1000/60/60/24)*24*60*60*1000,
	'periodInMinutes': 1440
});
chrome.alarms.onAlarm.addListener(alarm => {
	getWallpaper();
});

function getWallpaper() {
	xhrGet('http://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US').then(response => {
		chrome.wallpaper.setWallpaper({
			'url': `http://www.bing.com${JSON.parse(response).images[0].url}`,
			'layout': 'CENTER_CROPPED',
			'filename': 'bing_wallpaper'
		}, () => {
			console.log("wallpaper set!");
		});
	}).catch(error => {
		console.error("could not fetch wallpaper, retrying in 30 seconds");
		setTimeout(() => {
			getWallpaper();
		}, 30000);
	});
}
getWallpaper();
