// ==UserScript==
// @author            inu1255
// @name              刷钱流
// @version           1.0.1
// @minApk            10800
// @cronFreq          1e3
// @namespace         https://github.com/inu1255/q2g-plugins
// @updateURL         https://q2g-plugins.inu1255.cn/money/index.js
// @readmeURL         https://q2g-plugins.inu1255.cn/money/README.md
// ==/UserScript==
let prevpkg = "";
let prevcls = "";
let waitNode = null;
let last_click_at = 0;
let baseURL = "https://q2g-plugins.inu1255.cn/money/";

function click(node) {
	last_click_at = Date.now();
	console.log("click", node);
	if (node.id) return we.clickById(node.id);
	if (node.x != null && node.y != null) return we.clickXY(node.x, node.y);
	if (node.left != null)
		return we.clickXY((node.left + node.right) / 2, (node.top + node.bottom) / 2);
	if (typeof node === "string") return we.clickByPath(node);
	return console.error("node error:", node);
}

async function clickImage(src) {
	let node = await we.matchTemplate("", src, 1);
	if (node.value < 0.02) {
		await click(node);
		return true;
	}
	return false;
}

exports.onWindowChange = async function (pkg, cls) {
	if (pkg != (await we.getCurrentPackage())) return;
	if (pkg == prevpkg) {
		runners.run(pkg, "change", [prevpkg, cls]);
	}
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
	if (
		pkg == "com.game.matrix_crazygame" &&
		prevcls == "com.convergemob.naga.app.FullscreenActivity"
	) {
		if (node.right < 100 && node.bottom < 200 && +node.text) {
			// 倒计时界面
			node.t = Date.now() + node.text * 1e3 + 500;
			waitNode = node;
		}
	}
};

let runners = {
	run(pkg, fname, args) {
		fname = fname || "run";
		args = args || [];
		let runner = runners[pkg];
		if (!runner) return;
		let fn = runner[fname];
		if (typeof fn == "function") return fn.apply(runner, args);
	},
	// 疯狂乐斗
	"com.game.matrix_crazygame": {
		async run() {
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
		},
	},
	// WiFi福利
	"com.wifi.welfare.v": {
		async run() {
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
		},
	},
	// 滚动方块
	"com.gwkj.luckycube.ttcs": {},
	// 拼接大神
	"com.yunqu.game.pjds": {
		/** 看广告次数 */
		count: 0,
		/** 当前运行状态 <100:上次提现后看广告次数 100*/
		state: 0,
		init() {
			this.count = 0;
			this.state = 0;
		},
		change(prevcls, cls) {
			if (cls == "com.yunqu.game.pjds.UnityPlayerActivity" && prevcls != cls) {
				this.count++;
				this.state++;
			}
		},
		async run() {
			// 游戏界面
			if (prevcls == "com.yunqu.game.pjds.UnityPlayerActivity") {
				if (this.state < 100) {
					if (
						(await clickImage(baseURL + prevpkg + "/open.png")) ||
						(await clickImage(baseURL + prevpkg + "/continue.png")) ||
						(await clickImage(baseURL + prevpkg + "/blq.png"))
					)
						return;
					if (this.state > 5) {
						this.state = 100;
					}
					if (
						(await clickImage(baseURL + prevpkg + "/ts.png")) ||
						(await clickImage(baseURL + prevpkg + "/ts1.png"))
					)
						return;
				} else if (this.state == 100 && (await clickImage(baseURL + prevpkg + "/tx.png"))) {
					this.state++;
					return;
				} else if (this.state == 101 && (await clickImage(baseURL + prevpkg + "/0.3.png"))) {
					this.state++;
					return;
				} else if (this.state == 102 && (await clickImage(baseURL + prevpkg + "/ljtx.png"))) {
					this.state++;
					return;
				} else if (this.state == 103 && (await clickImage(baseURL + prevpkg + "/0.5.png"))) {
					this.state++;
					return;
				} else if (this.state == 104 && (await clickImage(baseURL + prevpkg + "/ljtx.png"))) {
					this.state++;
					return;
				} else if (this.state == 105 && (await clickImage(baseURL + prevpkg + "/home.png"))) {
					this.state = 0;
					return;
				}
			}
			// 广告界面
			else {
				let nodes = await we.getNodes();
				for (let node of nodes) {
					if (node.text && ~node.text.indexOf("跳过") && (await click(node))) return;
					// com.bytedance.sdk.openadsdk.activity.base.TTRewardExpressVideoActivity
					if (node.view == ":id/tt_video_ad_close" && (await click(node))) return;
					// com.wannuosili.sdk.ad.video.RewardVideoActivity
					if (node.view == ":id/reward_ad_close" && (await click(node))) return;
					if (node.view == ":id/tt_splash_skip_btn" && (await click(node))) return;
				}
				for (let node of nodes) {
					// com.qq.e.ads.RewardvideoPortraitADActivity
					if (node.text == "点击下载" && (await click("Vandroid:id/content>0>0>c"))) return;
				}
			}
		},
	},
};
exports.params = runners;

async function clearup() {
	await we.performGlobalAction(3);
	await we.sleep(1e3);
	await click("V:id/clear_all_recents_image_button");
}

let lastday = 0;
exports.onTime = async function () {
	let today = Math.floor((Date.now() + 28800e3) / 86400e3);
	if (lastday != today) {
		for (let k in runners) {
			let v = runners[k];
			v.init && v.init();
		}
		lastday = today;
	}
	if (waitNode && waitNode.pkg == prevcls && waitNode.t < Date.now()) {
		await click(waitNode);
		waitNode = null;
		return;
	}
	// 如果已经完成，就跳下一个应用
	let pms = runners.run(prevpkg);
	let finish = await pms;
	if (finish) {
		await clearup();
		await we.open();
	}
};
