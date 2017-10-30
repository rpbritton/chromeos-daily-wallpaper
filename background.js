const locations = [
	{'name': 'World Wide', 'code': 'en-WW'},
	{'name': 'Australia', 'code': 'en-AU'},
	{'name': 'Brazil', 'code': 'pt-BR'},
	{'name': 'Canada English', 'code': 'en-CA'},
	{'name': 'Canada French', 'code': 'fr-CA'},
	{'name': 'China', 'code': 'zh-CN'},
	{'name': 'Germany', 'code': 'de-DE'},
	{'name': 'France', 'code': 'fr-FR'},
	{'name': 'United Kingdom', 'code': 'en-GB'},
	{'name': 'India', 'code': 'hi-IN'},
	{'name': 'Japan', 'code': 'ja-JP'},
	{'name': 'United States', 'code': 'en-US'}
];
chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.local.set({'location': locations[0].code});
});

chrome.contextMenus.create({
	'title': 'Refresh wallpaper',
	'contexts': ['page_action'],
	'id': 'refresh'
});
chrome.contextMenus.create({
	'title': 'Choose your region',
	'contexts': ['page_action'],
	'id': 'location'
}, () => {
	for (let location of locations) {
		chrome.contextMenus.create({
			'title': location.name,
			'contexts': ['page_action'],
			'id': location.code,
			'type': 'radio',
			'parentId': 'location'
		});
	}
});
chrome.contextMenus.onClicked.addListener(contextMenu => {
	(contextMenu.menuItemId == 'refresh') && getWallpaper();
	if (contextMenu.parentMenuItemId == 'location') {
		chrome.storage.local.set({'location': contextMenu.menuItemId});
		getWallpaper();
	}
});

chrome.runtime.getPlatformInfo(platformInfo => {
	if (platformInfo.os == 'cros') {
		chrome.alarms.create('get_wallpaper', {
			'when': Date.now()+100,
			'periodInMinutes': 60
		});
		chrome.alarms.onAlarm.addListener(alarm => {
			(alarm.name == 'get_wallpaper') && getWallpaper();
		});
	}
	else {
		chrome.browserAction.setBadgeBackgroundColor({'color': [244, 67, 54, 255]});
		chrome.browserAction.setBadgeText({'text': 'X'});
		chrome.browserAction.setTitle({'title': 'Daily Wallpaper only supported on ChromeOS'});
	}
});

function getWallpaper() {
	chrome.storage.local.get('location', location => {
		console.log(location.location);
		new Promise((resolve, reject) => {
			let request = new XMLHttpRequest();
			request.onload = function() {
				(this.status == 200) ? resolve(this.response) : reject(this.statusText);
			}
			request.onerror = function() {
				reject(Error('xhr error'));
			}
			request.open('GET', `http://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=${location.location}`);
			request.send();
		}).then(response => {
			chrome.wallpaper.setWallpaper({
				'url': `http://www.bing.com${JSON.parse(response).images[0].url}`,
				'layout': 'CENTER_CROPPED',
				'filename': 'daily_wallpaper_from_bing'
			}, () => {
				console.log('wallpaper refreshed');
			});
		}).catch(error => {
			console.error('could not fetch wallpaper, retrying in an hour');
		});
	});
}
