// ==UserScript==
// @author            inu1255
// @name              广告跳过
// @version           1.1.10
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
const launchers = [
	"com.oppo.launcher", // OPPO桌面
	"com.vivo.launcher", // vivo桌面
	"com.emui.launcher", // 华为桌面
	"com.huawei.android.launcher", // 华为桌面
	"com.miui.home", // 小米桌面
	"com.oneplus.hydrogen.launcher", // 一加桌面
	"com.meizu.flyme.launcher", // 魅族桌面
];
const onlyTextPkg = new Set(["com.tencent.qqmusic"]);
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
	].concat(launchers),
	ad_setting: merge({
		"com.sina.weibo": {
			关闭广告共享计划: {pkg: "com.sina.weibo", cls: "关闭广告共享计划", skip: 1, cnt: 0, last: 0},
			关闭评论区广告: {pkg: "com.sina.weibo", cls: "关闭评论区广告", skip: 1, cnt: 0, last: 0},
			关闭关注浮窗: {pkg: "com.sina.weibo", cls: "关闭关注浮窗", skip: 2, cnt: 0, last: 0},
		},
	}),
};
var open_at = 0; // 浮窗最后弹出时间
var globalID = 0; // 最近窗口切换ID
var clickAt = 0; // 上次点击时间
var prevPkg = ""; // 上个包
var changePkgAt = 0; // 切换软件时间
var win;
var params_pms;
var html; // 弹窗html
var size;
function onSkip(cls) {
	if (cls) {
		if (cls.skip == 1) {
			cls.cnt++;
			cls.last = Date.now();
		}
		we.post("ad_setting/set", cls);
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
	if (params_pms) return params_pms;
	return (params_pms = Promise.all([
		getAdSetting(0),
		we.get("setting/get", {k:'ad_white_list'}).then((data) => {
			if (data) exports.params.white_list = data;
		}),
	]).then(() => exports.params));
};
exports.setParams = function () {
	params_pms = null;
	return exports.getParams();
};
/**
 * 窗口切换时触发
 * @param {string} pkgname
 * @param {string} clsname
 */
exports.onWindowChange = async function (pkgname, clsname) {
	// if (prevPkg == pkgname) return;
	if ((!prevPkg || ~launchers.indexOf(prevPkg)) && prevPkg != pkgname) {
		changePkgAt = Date.now();
		console.log(prevPkg, "-->", pkgname);
	}
	let exit = launchers.indexOf(prevPkg) < 0 && changePkgAt + 10e3 < Date.now();
	prevPkg = pkgname;
	if (exit) return;
	// 禁止1秒内连续点击
	if (!win) win = we.newFloatWindow("adskip");
	if (!size) size = await we.screenSize();
	let h = size.y - (size.f || 0);
	let w32 = (size.x * 2) / 3;
	let w31 = size.x * 3;
	let hb = h - w31;
	let white_list = exports.params.white_list;
	if (white_list.indexOf(pkgname) >= 0) return;
	if (/^(com\.android|cn\.inu1255)|\.input/.test(pkgname)) return;
	let currentID = ++globalID; // 如果下个窗口事件已发生，中断当前操作
	console.log("#" + currentID, "进入", pkgname, clsname);
	if (clickAt + 3e3 > Date.now()) {
		console.log(`3秒内点击过,忽略`);
		return;
	}
	let ad_setting = exports.params.ad_setting;
	let n = 5;
	do {
		let list = await we.getNodes();
		let hasSkip = false;
		let elCnt = 0;
		list = list.filter((x) => {
			if (x.pkg != pkgname) return false;
			if (x.left && x.top) elCnt++;
			if (x.left < w32 || x.bottom > w31 || x.top < hb) return false;
			if (/android\.launcher$/.test(x.pkg) && x.text.length >= 8) return false;
			if (/跳过|skip/i.test(x.text)) return (hasSkip = true);
			if (x.text || x.right - x.left > 200 || x.bottom - x.top > 200) return false;
			return true;
		});
		if (hasSkip || onlyTextPkg.has(pkgname)) list = list.filter((x) => /跳过|skip/i.test(x.text));
		// 禁止1秒内连续点击
		if (clickAt + 3e3 > Date.now()) {
			console.log("#" + currentID, "禁止连续点击", pkgname, clsname);
			break;
		}
		if (currentID != globalID) {
			console.log("#" + currentID, "中断", pkgname, clsname);
			break;
		}
		// 有跳过按钮 或者 元素比较少
		if ((hasSkip || elCnt < 10) && list.length) {
			console.log("#" + currentID, elCnt, hasSkip, "OOOOO", pkgname, clsname, list);
			clickAt = Date.now();
			for (let item of list) {
				let id = item.id;
				let pkg = ad_setting[pkgname] || (ad_setting[pkgname] = {});
				let cls = pkg[clsname] || (pkg[clsname] = {pkg: pkgname, cls: clsname, skip: 0, cnt: 0, last: 0});
				if (cls.skip == 1) {
					we.clickById(id).then((x) => x && onSkip(cls));
					await we.sleep(1e3);
					// if (currentID == globalID) {
					// 	we.clickById(id);
					// 	console.log("再次点击", currentID, globalID);
					// }
				} else if (cls.skip == 0 && !open_at) {
					open_at = Date.now();
					setTimeout(function () {
						if (open_at + 9e3 < Date.now()) win.close();
					}, 10e3);
					if (!html) html = await we.get("https://q2g-plugins.inu1255.cn/adskip/dlg.html");
					let skip = html ? await win.open({data: html}) : null;
					open_at = 0;
					if (typeof skip === "number") {
						if (skip) cls.skip = skip;
						if (skip == 1) {
							we.clickById(id).then((x) => x && onSkip(cls));
							we.toast("添加成功");
						} else if (skip) onSkip(cls);
					}
					break;
				}
			}
			// n = -1255;
			break;
		} else {
			console.log("#" + currentID, elCnt, hasSkip, "XXXXX", pkgname, clsname);
		}
		await we.sleep(1e3);
		if (currentID != globalID) {
			console.log("#" + currentID, "中断", pkgname, clsname);
			break;
		}
	} while (--n > 0);
};

/**
 * 窗口内容变化时触发
 * @param {string} pkg
 * @param {string} cls
 */
exports.onContentChange = async function (pkg, cls) {
	if (!win) win = we.newFloatWindow("adskip");
	if (pkg != "com.sina.weibo" || cls != "com.sina.weibo.feed.DetailWeiboActivity") return;
	let sina_weibo = exports.params.ad_setting["com.sina.weibo"];
	if (sina_weibo["关闭广告共享计划"].skip == 1) await we.clickByView("com.sina.weibo:id/iv_ad_x").then((x) => x && onSkip(sina_weibo["关闭广告共享计划"]));
	if (sina_weibo["关闭评论区广告"].skip == 1)
		await we
			.clickByView("com.sina.weibo:id/ll_close")
			.then(function (ok) {
				if (ok) return we.clickByText("不感兴趣");
			})
			.then((x) => x && onSkip(sina_weibo["关闭评论区广告"]));
	if (sina_weibo["关闭关注浮窗"].skip == 1) await we.clickByView("com.sina.weibo:id/close_layout").then((x) => x && onSkip(sina_weibo["关闭关注浮窗"]));
};
function merge(ad_setting) {
	let s = ``;
	for (let line of s.split("\n")) {
		line = line.trim();
		if (!line) continue;
		let [pkg, cls] = line.split(/\s+/);
		let c = ad_setting[pkg] || (ad_setting[pkg] = {});
		if (!c[cls]) c[cls] = {pkg, cls, skip: 1, cnt: 0, last: 0};
	}
	return ad_setting;
}
