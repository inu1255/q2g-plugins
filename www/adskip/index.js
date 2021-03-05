// ==UserScript==
// @author            inu1255
// @name              广告跳过
// @version           1.3.1
// @namespace         https://github.com/inu1255/q2g-plugins
// @settingURL        https://q2g-plugins.inu1255.cn/adskip/setting.html
// @updateURL         https://q2g-plugins.inu1255.cn/adskip/index.js
// @logoURL           https://q2g-plugins.inu1255.cn/adskip/icon.png
// ==/UserScript==
/**
 * 设置页面需要的权限
 * we.getApps
 */
// 初始化配置信息
var launcher = "";
var size; // 屏幕大小
const launchers = [
	"com.oppo.launcher", // OPPO桌面
	"com.vivo.launcher", // vivo桌面
	"com.emui.launcher", // 华为桌面
	"com.huawei.android.launcher", // 华为桌面
	"com.miui.home", // 小米桌面
	"com.oneplus.hydrogen.launcher", // 一加桌面
	"com.meizu.flyme.launcher", // 魅族桌面
];
const onlyTextPkg = new Set(["com.tencent.qqmusic", "com.qq.reader", "cn.wps.moffice_eng"]);
exports.params = {
	white_list: [
		"android",
		"com.android.settings",
		"com.tencent.mm", // 微信
		"com.iflytek.inputmethod", // 迅飞
		"com.sohu.inputmethod.sogou", // 搜狗输入
		"com.baidu.input", // 百度输入
		"com.baidu.input_huawei", // 百度输入华为
		"cn.inu1255.adskip",
		"cn.inu1255.quan2go",
		"com.android.systemui",
	],
	ad_setting: {
		"com.sina.weibo": {
			关闭广告共享计划: {pkg: "com.sina.weibo", cls: "关闭广告共享计划", skip: 1, cnt: 0, last: 0},
			关闭评论区广告: {pkg: "com.sina.weibo", cls: "关闭评论区广告", skip: 1, cnt: 0, last: 0},
			关闭关注浮窗: {pkg: "com.sina.weibo", cls: "关闭关注浮窗", skip: 2, cnt: 0, last: 0},
		},
		"com.kugou.android": {
			"com.kugou.android.app.splash.SplashActivity": {pkg: "com.kugou.android", cls: "com.kugou.android.app.splash.SplashActivity", skip: 1, cnt: 0, last: 0},
		},
	},
	ad: {},
};
var open_at = 0; // 浮窗最后弹出时间
var globalID = 0; // 最近窗口切换ID
var clickAt = 0; // 上次点击时间
var prevPkg = ""; // 上个包
var changePkgAt = 0; // 切换软件时间
var switch_expire_at = 0; // 开屏广告跳过结止时间
var switch_duration = 9e3;
var win;
var html; // 弹窗html
function onSkip(cls) {
	if (cls) {
		if (cls.skip == 1) {
			cls.cnt++;
			cls.last = Date.now();
		}
		we.post("ad_setting/set", cls, {ignore: true});
	}
}
function getAdSetting(page) {
	return we.get("ad_setting/all").then(({list}) => {
		let ad_setting = exports.params.ad_setting;
		for (let item of list) {
			let pkgs = ad_setting[item.pkg] || (ad_setting[item.pkg] = {});
			pkgs[item.cls] = item;
		}
	});
}
exports.getParams = function () {
	return Promise.all([
		getAdSetting(0),
		we.get("setting/get", {k: "ad_white_list"}, {ignore: true}).then((data) => {
			if (data) exports.params.white_list = data;
		}),
		we.dbget("ad", null).then((data) => {
			if (data) exports.params.ad = data;
		}),
	]).then(() => exports.params);
};
exports.setParams = function () {
	return exports.getParams();
};
function isLauncher(pkg) {
	return launcher ? launcher == pkg : ~launchers.indexOf(pkg);
}
/**
 * 窗口切换时触发
 * @param {string} pkgname
 * @param {string} clsname
 */
exports.onWindowChange = async function (pkgname, clsname) {
	if (!win) win = we.newFloatWindow("adskip");
	if (!launcher && we.getLauncherName) launcher = await we.getLauncherName();
	if (!size) size = await we.screenSize();
	// 上次
	if ((!prevPkg || isLauncher(prevPkg)) && prevPkg != pkgname) {
		changePkgAt = Date.now();
		console.log(prevPkg, "-->", pkgname);
	}
	let exit = !isLauncher(prevPkg) && changePkgAt + 10e3 < Date.now();
	prevPkg = pkgname;
	if (exit) return;
	if (isLauncher(prevPkg)) return;
	let white_list = exports.params.white_list;
	if (white_list.indexOf(pkgname) >= 0) return;
	if (/^(cn\.inu1255)|\.input/.test(pkgname)) return;
	let currentID = ++globalID; // 如果下个窗口事件已发生，中断当前操作
	console.log("#" + currentID, "进入", pkgname, clsname);
	if (clickAt + 3e3 > Date.now()) {
		console.log(`3秒内点击过,忽略`);
		return;
	}
	if (clsname == "com.weibo.mobileads.view.b") {
		await we.open("com.sina.weibo", "com.sina.weibo.MainTabActivity", {flags: 0x10000000});
		return;
	}
	switch_expire_at = Date.now() + switch_duration;
	if (await run(pkgname).catch((x) => 0)) return;
	// 1.7.7版本后contentchange事件有效，使用contentchange事件来跳过广告
	if (+we.ver.buildVersion > 10706) return;
	while (currentID == globalID) {
		if (await run(pkgname).catch((x) => 0)) return;
		if (!(await trySkip(pkgname, clsname, currentID))) break;
		await we.sleep(300);
	}
};

async function trySkip(pkgname, clsname, currentID) {
	if (switch_expire_at < Date.now()) return;
	let skipCls = false;
	let ad_setting = exports.params.ad_setting;
	skipCls = ad_setting[pkgname] && ad_setting[pkgname][clsname];
	// 禁止1秒内连续点击
	if (clickAt + 3e3 > Date.now()) {
		console.log("禁止连续点击", pkgname, clsname);
		return;
	}
	let b = Date.now();
	if (skipCls && skipCls.skip == 1 && we.clickByPath) {
		if (await we.clickByPath(onlyTextPkg.has(pkgname) ? "t[\\d\\s]*(跳过|skip)[\\d\\s]*" : "x[\\d\\s]*(跳过|skip)[\\d\\s]*", pkgname)) {
			onSkip(skipCls);
			clickAt = Date.now();
			switch_expire_at = 0;
			console.log("#" + currentID, "直接跳过:", Date.now() - switch_expire_at + switch_duration, Date.now() - b, "秒", skipCls);
			return;
		}
	}
	{
		if (currentID != globalID) {
			console.log("#" + currentID, "中断2", Date.now() - switch_expire_at + switch_duration, pkgname, clsname);
			return;
		}
		let b = Date.now();
		let list;
		if (clsname == "com.kugou.android.app.splash.SplashActivity") {
			let nodes = await we.getNodes(0);
			console.log("酷狗开屏广告", nodes.length);
			if (nodes.length == 1) list = nodes;
		}
		if (!list) {
			let nodes = await we.getNodes(3);
			list = nodes.filter((x) => {
				if (x.pkg != pkgname) return false;
				if (/android\.launcher$/.test(x.pkg) && x.text.length >= 8) return false;
				if (~["自动跳过", "广告跳过"].indexOf(x.text)) return false;
				if (/跳过|skip/i.test(x.text)) return true;
				if (onlyTextPkg.has(pkgname)) return false;
				if (/skip/.test(x.view)) return true;
				if (/close|cancel/.test(x.view)) {
					var px = (x.left + x.right) / 2;
					if (px > size.x * 0.4 && px < size.x * 0.6 && x.top > size.y / 2) return true;
				}
				return false;
			});
		}
		console.log("用时:", Date.now() - switch_expire_at + switch_duration, Date.now() - b, "秒", list);
		// 禁止1秒内连续点击
		if (clickAt + 3e3 > Date.now()) {
			console.log("#" + currentID, "禁止连续点击", pkgname, clsname);
			return;
		}
		// 有跳过按钮 或者 元素比较少
		if (list.length) {
			console.log("跳过", "OOOOO", pkgname, clsname, list);
			clickAt = Date.now();
			switch_expire_at = 0;
			for (let item of list) {
				let id = item.id;
				if (await checkAndClick(pkgname, clsname, item, () => we.clickById(id))) return;
			}
			// n = -1255;
			return;
		} else {
			console.log("#" + currentID, "XXXXX", pkgname, clsname);
		}
	}
	return true;
}

async function checkAndClick(pkgname, clsname, node, clickFunction) {
	let ad_setting = exports.params.ad_setting;
	let pkg = ad_setting[pkgname] || (ad_setting[pkgname] = {});
	let cls = pkg[clsname] || (pkg[clsname] = {pkg: pkgname, cls: clsname, skip: 0, cnt: 0, last: 0});
	if (cls.skip == 1) {
		clickFunction().then((x) => x && onSkip(cls));
	} else if (cls.skip == 0 && !open_at) {
		open_at = Date.now();
		setTimeout(function () {
			if (open_at + 9e3 < Date.now()) win.close();
		}, 10e3);
		let skip;
		if (!html) html = await we.get("https://q2g-plugins.inu1255.cn/adskip/dlg.html");
		if (html) {
			var close;
			if (we.showPoint) close = we.showPoint((node.left + node.right) / 2, (node.top + node.bottom) / 2, true);
			size = size || (await we.screenSize());
			skip = await win.open({data: html, x: 100, y: size.y - 500 - size.f, width: size.x - 200, height: 315, forceLayout: true});
			close && close();
		}
		open_at = 0;
		if (typeof skip === "number") {
			if (skip) cls.skip = skip;
			if (skip == 1) {
				clickFunction().then((x) => x && onSkip(cls));
				we.toast("添加成功");
			} else if (skip) onSkip(cls);
		}
		return true;
	}
}

async function oncontent(pkgname, clsname, node) {
	if (!node) return;
	if (clickAt + 3e3 > Date.now()) return;
	let white_list = exports.params.white_list;
	if (white_list.indexOf(pkgname) >= 0) return;
	if (/^(cn\.inu1255)|\.input/.test(pkgname)) return;
	if (/跳过|skip/i.test(node.text) || (!onlyTextPkg.has(pkgname) && /skip/.test(node.view))) {
		clickAt = Date.now();
		await checkAndClick(pkgname, clsname, node, () => we.clickXY((node.left + node.right) / 2, (node.top + node.bottom) / 2));
	} else {
		await trySkip(pkgname, clsname, globalID);
	}
}

/**
 * 窗口内容变化时触发
 * @param {string} pkg
 * @param {string} cls
 */
exports.onContentChange = async function (pkg, cls, node) {
	if (!win) win = we.newFloatWindow("adskip");
	if (cls == "com.sina.weibo.feed.DetailWeiboActivity") {
		let sina_weibo = exports.params.ad_setting["com.sina.weibo"];
		if (sina_weibo["关闭广告共享计划"].skip == 1) await we.clickByView("com.sina.weibo:id/iv_ad_x", 2).then((x) => x && onSkip(sina_weibo["关闭广告共享计划"]));
		if (sina_weibo["关闭评论区广告"].skip == 1)
			await we
				.clickByView("com.sina.weibo:id/ll_close", 2)
				.then(function (ok) {
					if (ok) return we.sleep(500).then(() => we.clickByPath("T不感兴趣", "com.sina.weibo", 2));
				})
				.then((x) => x && onSkip(sina_weibo["关闭评论区广告"]));
		if (sina_weibo["关闭关注浮窗"].skip == 1) await we.clickByView("com.sina.weibo:id/close_layout", 2).then((x) => x && onSkip(sina_weibo["关闭关注浮窗"]));
	}
	if (await run(pkg).catch((x) => 0)) return;
	await oncontent(pkg, cls, node);
};
async function run(pkg) {
	if (!we.click) return;
	let data = exports.params.ad[pkg];
	if (!data) return;
	for (let k in data) {
		let steps = data[k];
		let isFirst = true; // [第一步, 第一步成功]
		let ok = false;
		for (let step of steps) {
			let retry = 5;
			ok = false;
			while (retry-- > 0) {
				ok = await we.click(step, pkg);
				if (ok) {
					isFirst = false;
					break;
				} else if (isFirst) {
					break;
				}
				await we.sleep(500);
			}
			if (!ok) break;
		}
		if (!isFirst) {
			console.log(k, ok ? "执行成功" : "执行失败");
			return true;
		} else {
			console.log(k, "不成功");
		}
	}
}
