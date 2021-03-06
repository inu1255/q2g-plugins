// ==UserScript==
// @author            inu1255
// @name              wifi密码复制
// @version           1.0.1
// @namespace         https://github.com/inu1255/q2g-plugins
// @updateURL         https://q2g-plugins.inu1255.cn/wificopy.js
// ==/UserScript==
async function getpwd() {
	if (await we.getScreenCapture()) {
		let data = await we.scan();
		let m = /P:(.+);;$/.exec(data.text);
		if (m) {
			await we.copy(m[1]);
			we.toast("密码已复制: " + m[1]);
			return true;
		}
	}
}

exports.run = async function () {
	if (!((await we.applyVirtualDisplay()) && (await we.initScreenCapture()))) return we.toast("复制失败: 没有截屏权限");
	await we.open("android.settings.WIFI_SETTINGS");
	let cnt;
	cnt = 3;
	while (cnt--) {
		await we.sleep(500);
		if ((await we.clickSubText("已连接", 32)) || (await we.clickSubText("分享密码", 32))) break;
	}
	cnt = 3;
	while (cnt--) {
		await we.sleep(500);
		if (await getpwd()) break;
	}
	we.closeVirtualDisplay();
	await we.performGlobalAction(1);
	await we.performGlobalAction(1);
};
