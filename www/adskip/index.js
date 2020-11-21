// ==UserScript==
// @author            inu1255
// @name              广告跳过
// @version           1.1.3
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

exports.params = {
	white_list: [
		"android",
		"com.android.settings",
		"com.miui.home",
		"com.huawei.android.launcher",
		"com.tencent.mm", // 微信
		"com.iflytek.inputmethod", // 迅飞
		"com.sohu.inputmethod.sogou", // 搜狗输入
		"com.baidu.input", // 百度输入
		"com.baidu.input_huawei", // 百度输入华为
		"cn.inu1255.adskip",
		"cn.inu1255.quan2go",
		"com.android.systemui",
	],
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
var win;
var params_pms;
var html; // 弹窗html
var size;
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
	// 禁止1秒内连续点击
	if (clickAt + 3e3 > Date.now()) return;
	if (!win) win = we.newFloatWindow("adskip");
	if (!size) size = await we.screenSize();
	let h = size.y - (size.f || 0);
	let w32 = (size.x * 2) / 3;
	let w31 = size.x * 3;
	let hb = h - w31;
	let white_list = exports.params.white_list;
	if (white_list.indexOf(pkgname) >= 0) return;
	if (/^(com\.android|cn\.inu1255)|\.input/.test(pkgname)) return;
	if (prevPkg == pkgname) return;
	prevPkg = pkgname;
	let currentID = ++globalID; // 如果下个窗口事件已发生，中断当前操作
	console.log("#" + currentID, "进入", pkgname, clsname);
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
			if (x.right - x.left > 200 || x.bottom - x.top > 200) return false;
			return true;
		});
		if (hasSkip) list.filter((x) => x.text);
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
				if (cls.skip == 1) we.clickById(id).then((x) => x && onSkip(cls));
				else if (cls.skip == 0) {
					open_at = Date.now();
					setTimeout(function () {
						if (open_at + 9e3 < Date.now()) win.close();
					}, 10e3);
					if (!html) html = await we.get("https://q2g-plugins.inu1255.cn/adskip/dlg.html");
					let skip = html ? await win.open({data: html}) : null;
					if (typeof skip === "number") {
						if (skip) cls.skip = skip;
						if (skip == 1) {
							we.clickById(id).then((x) => x && onSkip(cls));
							we.toast("添加成功");
						} else if (skip) onSkip();
					}
					break;
				}
			}
			n = -1255;
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
	let s = `cn.kuwo.player	cn.kuwo.player.activities.MainActivity
cn.kuwo.tingshu	cn.kuwo.player.activities.MainActivity
cn.opda.a.phonoalbumshoushou	android.view.View
cn.opda.a.phonoalbumshoushou	android.widget.RelativeLayout
cn.soulapp.android	android.widget.FrameLayout
cn.soulapp.android	cn.soulapp.android.ui.splash.SplashActivity
com.alimama.moon	android.widget.FrameLayout
com.android.bankabc	com.android.bankabc.homepage.HomeActivity
com.android.browser	com.android.browser.BrowserActivity
com.android.gallery3d	android.app.ProgressDialog
com.autonavi.minimap	android.widget.FrameLayout
com.baidu.BaiduMap	com.baidu.baidumaps.MapsActivity
com.baidu.input	android.widget.RelativeLayout
com.baidu.input_huawei	android.inputmethodservice.SoftInputWindow
com.baidu.input_huawei	android.widget.FrameLayout
com.baidu.tieba	com.baidu.tieba.LogoActivity
com.bbk.facewake	android.widget.FrameLayout
com.bbk.launcher2	com.bbk.launcher2.Launcher
com.chinarainbow.tft	android.widget.FrameLayout
com.coloros.notificationmanager	com.coloros.notificationmanager.AppNotificationSettingsActivity
com.coloros.recents	com.android.quickstep.RecentsActivity
com.coloros.recents	com.coloros.recents.RecentsActivity
com.coloros.safecenter	com.coloros.safecenter.sysfloatwindow.FloatWindowListActivity
com.coolapk.market	android.widget.FrameLayout
com.coolapk.market	com.coolapk.market.view.splash.SplashActivity
com.guess.singer	com.daniel.popwindow.ui.WindowActivity
com.heytap.market	com.heytap.cdo.client.detail.ui.ProductDetailActivity
com.heytap.market	com.heytap.cdo.client.search.SearchActivity
com.heytap.market	com.heytap.cdo.client.ui.activity.MainTabPageActivity
com.huawei.android.internal.app	android.app.Dialog
com.huawei.appmarket	android.widget.FrameLayout
com.huawei.appmarket	com.huawei.appmarket.MainActivity
com.huawei.browser	com.huawei.browser.BrowserMainActivity
com.huawei.intelligent	android.view.ViewGroup
com.ifeng.news2	androidx.recyclerview.widget.RecyclerView
com.ifeng.news2	com.ifeng.news2.activity.IfengTabMainActivity
com.iflytek.inputmethod	android.inputmethodservice.SoftInputWindow
com.iflytek.inputmethod	android.widget.FrameLayout
com.kiwigames.life.simulator	android.widget.FrameLayout
com.miui.securitycenter	android.view.View
com.moji.mjweather	androidx.recyclerview.widget.RecyclerView
com.moji.mjweather	com.moji.mjweather.MainActivity
com.netease.cloudmusic	android.widget.FrameLayout
com.netease.cloudmusic	com.netease.cloudmusic.activity.LoadingActivity
com.oppo.launcher	android.widget.LinearLayout
com.oppo.launcher	android.widget.ListView
com.oppo.launcher	android.widget.ScrollView
com.oppo.launcher	com.oppo.launcher.Launcher
com.polaris.drawboard	com.polaris.drawboard.MySplashActivity
com.ruiqu.fanaticBalls	com.bytedance.sdk.openadsdk.activity.TTRewardExpressVideoActivity
com.sdu.didi.psnger	android.widget.FrameLayout
com.smzdm.client.android	android.widget.FrameLayout
com.snail.android.lucky	android.widget.FrameLayout
com.sohu.inputmethod.sogouoem	android.widget.FrameLayout
com.ss.android.article.lite	com.ss.android.article.lite.activity.SplashActivity
com.ss.android.article.video	com.ss.android.article.video.activity.SplashActivity
com.sup.android.superb	android.widget.FrameLayout
com.tencent.mtt	com.tencent.mtt.MainActivity
com.tencent.qqlive	com.tencent.qqlive.ona.activity.SplashHomeActivity
com.vivo.floatingball	android.widget.FrameLayout
com.vivo.upslide	android.widget.FrameLayout
com.vivo.upslide	com.vivo.upslide.recents.RecentsActivity
com.wintheshow.quickreply	android.widget.ImageView
com.xiaoshuodaquan.ebook.app	com.biquge.ebook.app.ui.activity.WelComeActivity
com.ximalaya.ting.android	android.widget.FrameLayout
com.ximalaya.ting.android	android.widget.ListView
com.ximalaya.ting.android	com.ximalaya.ting.android.host.activity.WelComeActivity
com.xueqiu.android	android.widget.FrameLayout
com.xueqiu.android	com.xueqiu.android.common.splash.SplashActivity
com.xunlei.downloadprovider	com.xunlei.downloadprovider.launch.LaunchActivity
com.zhihu.android	android.widget.FrameLayout
com.zhihu.android	com.zhihu.android.app.ui.activity.LauncherActivity
com.zidongdianji	android.widget.FrameLayout
com.zui.launcher	android.app.Dialog
ginlemon.flowerfree	ginlemon.flower.HomeScreen
net.oneplus.launcher	android.widget.ListView
net.oneplus.launcher	android.widget.RelativeLayout
net.oneplus.launcher	net.oneplus.launcher.Launcher
tv.danmaku.bili	android.support.v7.widget.RecyclerView
tv.danmaku.bili	android.widget.FrameLayout
tv.danmaku.bili	android.widget.HorizontalScrollView
tv.danmaku.bili	tv.danmaku.bili.MainActivityV2`;
	for (let line of s.split("\n")) {
		let [pkg, cls] = line.trim().split(/\s+/);
		let c = ad_setting[pkg] || (ad_setting[pkg] = {});
		if (!c[cls]) c[cls] = {pkg, cls, skip: 1, cnt: 0, last: 0};
	}
	return ad_setting;
}
