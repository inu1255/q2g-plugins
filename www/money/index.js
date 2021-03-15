// ==UserScript==
// @author            inu1255
// @name              刷钱流
// @version           1.0.0
// @minApk            10800
// @cronFreq          1e3
// @namespace         https://github.com/inu1255/q2g-plugins
// @updateURL         https://q2g-plugins.inu1255.cn/money/index.js
// @readmeURL         https://q2g-plugins.inu1255.cn/money/README.md
// ==/UserScript==
exports.params = {};
let prevpkg = "";
let prevcls = "";
let waitNode = null;
let last_click_at = 0;

function click(node) {
	last_click_at = Date.now();
	console.log("click", node);
	if (node.id) return we.clickById(node.id);
	if (node.x != null && node.y != null) return we.clickXY(node.x, node.y);
	if (node.left != null) return we.clickXY((node.left + node.right) / 2, (node.top + node.bottom) / 2);
	if (typeof node === "string") return we.clickByPath(node);
	return console.error("node error:", node);
}

exports.onWindowChange = async function (pkg, cls) {
	if (pkg != (await we.getCurrentPackage())) return;
	prevpkg = pkg;
	prevcls = cls;
	console.log(pkg, cls);
	if (pkg == "com.android.vending") {
		await we.performGlobalAction(1);
		await we.performGlobalAction(1);
	}
};

exports.onContentChange = async function (pkg, cls, node) {
	if (!node) return;
	if (node.pkg != pkg) return;
	// if (node.right != 1080 && node.view != "ms") console.log(node);
	if (pkg == "com.game.matrix_crazygame" && prevcls == "com.convergemob.naga.app.FullscreenActivity") {
		if (node.right < 100 && node.bottom < 200 && +node.text) {
			// 倒计时界面
			node.t = Date.now() + node.text * 1e3 + 500;
			waitNode = node;
		}
	}
};

exports.onTime = async function () {
	if (waitNode && waitNode.pkg == prevcls && waitNode.t < Date.now()) {
		await click(waitNode);
		waitNode = null;
		return;
	}
	// 疯狂乐斗
	if (prevpkg == "com.game.matrix_crazygame") {
		let nodes = await we.getNodes();
		for (let node of nodes) {
			if (node.text == "（30秒视频）") return await click(node);
			if (node.view == ":id/tt_video_ad_close") return await click(node);
		}
		for (let node of nodes) {
			if (node.text && ~node.text.indexOf("知道了")) return await click(node);
		}
		let n = 0;
		for (let node of nodes) {
			if (/^[\.\d]+元$/.test(node.text)) {
				n++;
				if (n > 1) return await click(node);
			}
		}
		if (Date.now() - last_click_at > 30e3) {
			// 点击左上角关闭图标
			await click("Vroot>1>0>0");
			// let size = await we.screenSize();
			// await click({x: 70, y: 60 + size.h});
		}
	}
	// WiFi福利
	else if (prevpkg == "com.wifi.welfare.v") {
		let nodes = await we.getNodes();
		for (let node of nodes) {
			// 关闭弹窗广告
			if (node.view == ":id/close") return await click(node);
			// 看视频翻倍
			if (node.view == ":id/watch_award_video_tv") return await click(node);
			// 关闭视频广告
			if (node.view == ":id/adb_action_mode_done") return await click(node);
			if (node.view == ":id/tt_video_ad_close") return await click(node);
			if (node.text == "继续赚钱") return await click(node);
			if (node.text == "跳过" && Date.now() - last_click_at > 3e3) return await click(node);
		}
		for (let node of nodes) {
			if (node.text && ~node.text.indexOf("知道了")) return await click(node);
		}
		for (let node of nodes) {
			if (node.text == "点击下载") return await click("Vandroid:id/content>0>0>c");
		}
		let n = 0;
		for (let node of nodes) {
			if (/^[\.\d]+元$/.test(node.text)) {
				n++;
				if (n > 1) return await click(node);
			}
		}
	}
};
