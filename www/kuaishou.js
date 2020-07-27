// ==UserScript==
// @author            inu1255
// @name              快手刷金币
// @version           1.0.4
// @namespace         https://gitee.com/inu1255/q2g-plugins
// @updateURL         https://inu1255.gitee.io/q2g-plugins/kuaishou.js
// ==/UserScript==

var running = false;
async function next() {
	try {
		while (running) {
			await we.sleep(Math.floor(Math.random() * 5e3) + 5000);
			if (!running) return;
			var x = Math.floor(Math.random() * 200) + 400;
			var y = Math.floor(Math.random() * 300) + 100;
			var dy = Math.floor(Math.random() * 100) + 900;
			var s = Math.floor(Math.random() * 10) + 30;
			await we.dispatchGesture(`${x},${y + dy},${x},${y}`, 0, s);
		}
	} catch (e) {
		console.error(e);
		running = false;
	}
}

/**
 * 窗口切换时触发
 * @param {string} pkgname
 * @param {string} clsname
 */
exports.onWindowChange = async function (pkgname, clsname) {
	if (running && running + 1e3 > Date.now()) return;
	console.log(pkgname, clsname);
	if (["com.yxcorp.gifshow.HomeActivity", "com.ss.android.ugc.aweme.main.MainActivity"].indexOf(clsname) >= 0) {
		if (running) return;
		we.toast("开始刷金币");
		running = Date.now();
		await next();
		return 1;
	}
	if ("com.yxcorp.gifshow.webview.KwaiWebViewActivity" == clsname) {
		we.sleep(1e3)
			.then(function () {
				return we.getNodes(1, "向右拖动");
			})
			.then(function (nodes) {
				for (var i = 0; i < nodes.length; i++) {
					var node = nodes[i];
					if (/向右拖动/.test(node.text)) {
						return we.dispatchGesture(`${node.left + 10},${node.top + 10},${Math.floor(node.right * 0.75)},${node.top + 14}`, 0, 800);
					}
				}
			});
		return 2;
	}
	if (running) {
		running = false;
		we.toast("停止刷金币");
		return 3;
	}
	return 4;
};
