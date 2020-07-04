// ==UserScript==
// @author            inu1255
// @name              快手刷金币
// @version           1.0.0
// @namespace         https://gitee.com/inu1255/q2g-plugins
// @updateURL         https://inu1255.gitee.io/q2g-plugins/kuaishou.js
// ==/UserScript==

var pms = Promise.resolve();
var running = false;
function next() {
	if (!running) return;
	pms = pms
		.then(function () {
			return we.sleep(Math.floor(Math.random() * 3e3) + 3000);
		})
		.then(function () {
			if (!running) return;
			var x = Math.floor(Math.random() * 200) + 400;
			var y = Math.floor(Math.random() * 300) + 100;
			var dy = Math.floor(Math.random() * 100) + 900;
			var s = Math.floor(Math.random() * 10) + 30;
			return we.dispatchGesture(`${x},${y + dy},${x},${y}`, 0, s);
		})
		.then(next)
		.catch(function (e) {
			console.log(e);
			running = false;
		});
}

/**
 * 窗口切换时触发
 * @param {string} pkgname
 * @param {string} clsname
 */
exports.onWindowChange = async function (pkgname, clsname) {
	if (running && running + 1e3 > Date.now()) return;
	console.log(pkgname, clsname);
	if ("com.yxcorp.gifshow.HomeActivity" == clsname) {
		if (running) return;
		we.toast("开始刷金币");
		running = Date.now();
		next();
	} else if (running) {
		running = false;
		we.toast("停止刷金币");
	}
	console.log(clsname);
};
