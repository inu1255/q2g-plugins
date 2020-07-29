// ==UserScript==
// @author            inu1255
// @name              广告跳过
// @version           1.0.7
// @namespace         https://gitee.com/inu1255/q2g-plugins
// @settingURL        https://inu1255.gitee.io/q2g-plugins/adskip/
// @updateURL         https://inu1255.gitee.io/q2g-plugins/adskip.js
// @logoURL           https://inu1255.gitee.io/q2g-plugins/adskip.png
// ==/UserScript==
/**
 * 设置页面需要的权限
 * we.getApps
 */
// 初始化配置信息
exports.params = {
	white_list: ["android", "com.android.settings", "com.miui.home", "com.huawei.android.launcher", "cn.inu1255.adskip", "cn.inu1255.quan2go", "com.android.systemui"],
	ad_setting: {
		"com.sina.weibo": {
			关闭广告共享计划: {pkg: "com.sina.weibo", cls: "关闭广告共享计划", skip: 1, cnt: 0, last: 0},
			关闭评论区广告: {pkg: "com.sina.weibo", cls: "关闭评论区广告", skip: 1, cnt: 0, last: 0},
			关闭关注浮窗: {pkg: "com.sina.weibo", cls: "关闭关注浮窗", skip: 2, cnt: 0, last: 0},
		},
	},
};
var open_at = 0; // 浮窗最后弹出时间
var evt_at = 0; // 最近窗口切换时间
var win;
var params_pms;
function onSkip(cls) {
	if (cls) {
		cls.cnt++;
		cls.last = Date.now();
		bmob.create("ad_setting", cls);
	}
}
exports.getParams = function () {
	if (params_pms) return params_pms;
	return (params_pms = Promise.all([
		bmob.select("ad_setting").then((list) => {
			let ad_setting = exports.params.ad_setting;
			for (let item of list) {
				let pkgs = ad_setting[item.pkg] || (ad_setting[item.pkg] = {});
				pkgs[item.cls] = item;
			}
		}),
		bmob.select("params", "k='ad_white_list'").then((list) => {
			if (list.length) exports.params.white_list = list[0].v;
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
	if (!win) win = we.newFloatWindow("adskip");
	let white_list = exports.params.white_list;
	if (white_list.indexOf(pkgname) >= 0) return;
	var t = (evt_at = Date.now()); // 如果下个窗口事件已发生，中断当前操作
	let ad_setting = exports.params.ad_setting;
	let n = 3;
	do {
		let list = await we.getNodes(1, "跳过");
		list = list.filter((x) => !/android\.launcher$/.test(x.pkg) && x.text.length < 8);
		if (list.length) {
			for (let item of list) {
				let id = item.id;
				let pkg = ad_setting[pkgname] || (ad_setting[pkgname] = {});
				let cls = pkg[clsname] || (pkg[clsname] = {pkg: pkgname, cls: clsname, skip: 0, cnt: 0, last: 0});
				if (cls.skip == 1) we.clickById(id).then((x) => x && onSkip(cls));
				else if (cls.skip == 0) {
					open_at = Date.now();
					setTimeout(function () {
						if (open_at + 2900 < Date.now()) win.close();
					}, 3e3);
					console.log(item);
					let skip = await win.open({data: UI.adskip});
					if (typeof skip === "number") {
						if (skip) cls.skip = skip;
						if (skip == 1) we.clickById(id).then((x) => x && onSkip(cls));
						else if (skip) onSkip();
					}
				}
			}
			n = -1255;
			break;
		}
		await we.sleep(1e3);
	} while (--n > 0 && t >= evt_at);
	if (n > -1) console.log(pkgname, "没有广告");
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
