// ==UserScript==
// @author            inu1255
// @name              快手刷金币
// @version           1.0.8
// @namespace         https://github.com/inu1255/q2g-plugins
// @updateURL         https://q2g-plugins.inu1255.cn/kuaishou.js
// ==/UserScript==

var running = false;
async function next() {
	try {
		while (running) {
			await we.sleep(Math.floor(Math.random() * 5e3) + 5000);
			if (!running) return;
			let nodes = await we.getNodes(1);
			for (let node of nodes) {
				if (/以后再说|我知道了/.test(node.text)) {
					await we.clickById(node.id);
					await we.sleep(500);
				} else if (/立即升级|立即邀请/.test(node.text)) {
					await we.performGlobalAction(1);
					await we.sleep(500);
				}
			}
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
	if (
		["com.yxcorp.gifshow.HomeActivity", "com.ss.android.ugc.aweme.main.MainActivity"].indexOf(clsname) >= 0 ||
		("android.app.Dialog" == clsname && pkgname == "com.kuaishou.nebula")
	) {
		if (running) return;
		we.toast("开始刷金币");
		running = Date.now();
		await next();
		return 1;
	}
	if ("com.yxcorp.gifshow.webview.KwaiWebViewActivity" == clsname) {
		await we.sleep(1e3);
		let nodes = await we.getNodes(1, "向右拖动");
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (/向右拖动/.test(node.text)) {
				await we.dispatchGesture(`${node.left + 10},${node.top + 10},${Math.floor(node.right * 0.75)},${node.top + 14}`, 0, 800);
				break;
			}
		}
		return 2;
	}
	if (running) {
		running = false;
		we.toast("停止刷金币");
		return 3;
	}
	return 4;
};
