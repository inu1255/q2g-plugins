// ==UserScript==
// @author            inu1255
// @name              广告跳过
// @version           1.1.0
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
	white_list: ["android", "com.android.settings", "com.miui.home", "com.huawei.android.launcher", "cn.inu1255.adskip", "cn.inu1255.quan2go", "com.android.systemui"],
	ad_setting: merge({
		"com.sina.weibo": {
			关闭广告共享计划: {pkg: "com.sina.weibo", cls: "关闭广告共享计划", skip: 1, cnt: 0, last: 0},
			关闭评论区广告: {pkg: "com.sina.weibo", cls: "关闭评论区广告", skip: 1, cnt: 0, last: 0},
			关闭关注浮窗: {pkg: "com.sina.weibo", cls: "关闭关注浮窗", skip: 2, cnt: 0, last: 0},
		},
	}),
};
var open_at = 0; // 浮窗最后弹出时间
var evt_at = 0; // 最近窗口切换时间
var win;
var params_pms;
var html; // 弹窗html
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
					if (!html) html = await we.get("https://q2g-plugins.inu1255.cn/adskip/dlg.html");
					let skip = html ? await win.open({data: html}) : null;
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
function merge(ad_setting) {
	let s = `cn.inu1255.adskip	cn.inu1255.adskip.MainActivity
cn.kuwo.player	android.support.v7.widget.RecyclerView
cn.kuwo.player	android.widget.FrameLayout
cn.kuwo.player	cn.kuwo.player.activities.MainActivity
cn.kuwo.tingshu	cn.kuwo.player.activities.MainActivity
cn.soulapp.android	android.widget.FrameLayout
cn.soulapp.android	cn.soulapp.android.ui.splash.SplashActivity
com.alimama.moon	android.widget.FrameLayout
com.android.browser	com.android.browser.BrowserActivity
com.android.gallery3d	android.app.ProgressDialog
com.baidu.input	android.widget.RelativeLayout
com.baidu.searchbox	com.baidu.browser.search.LightSearchActivity
com.bbk.launcher2	com.bbk.launcher2.Launcher
com.coloros.notificationmanager	com.coloros.notificationmanager.AppNotificationSettingsActivity
com.coloros.recents	com.android.quickstep.RecentsActivity
com.coloros.recents	com.coloros.recents.RecentsActivity
com.coloros.safecenter	com.coloros.safecenter.sysfloatwindow.FloatWindowListActivity
com.coolapk.market	android.widget.FrameLayout
com.coolapk.market	com.coolapk.market.view.splash.SplashActivity
com.douban.frodo	android.widget.FrameLayout
com.dragon.read	android.widget.FrameLayout
com.guess.singer	com.daniel.popwindow.ui.WindowActivity
com.heytap.market	com.heytap.cdo.client.detail.ui.ProductDetailActivity
com.heytap.market	com.heytap.cdo.client.search.SearchActivity
com.heytap.market	com.heytap.cdo.client.ui.activity.MainTabPageActivity
com.huawei.android.internal.app	android.app.Dialog
com.huawei.appmarket	android.widget.FrameLayout
com.huawei.browser	com.huawei.browser.BrowserMainActivity
com.huawei.intelligent	android.view.ViewGroup
com.ifeng.news2	androidx.recyclerview.widget.RecyclerView
com.ifeng.news2	com.ifeng.news2.activity.IfengTabMainActivity
com.jingdong.app.mall	android.support.v7.widget.RecyclerView
com.jingdong.app.mall	android.widget.FrameLayout
com.kiwigames.life.simulator	android.widget.FrameLayout
com.moji.mjweather	android.widget.ListView
com.moji.mjweather	androidx.recyclerview.widget.RecyclerView
com.moji.mjweather	com.moji.mjweather.MainActivity
com.netease.cloudmusic	android.widget.FrameLayout
com.oppo.launcher	android.widget.LinearLayout
com.oppo.launcher	android.widget.ListView
com.oppo.launcher	android.widget.ScrollView
com.oppo.launcher	com.oppo.launcher.Launcher
com.oppo.market	com.heytap.cdo.client.search.c
com.qiyi.video	org.qiyi.android.video.MainActivity
com.ruiqu.fanaticBalls	com.bytedance.sdk.openadsdk.activity.TTRewardExpressVideoActivity
com.sdu.didi.psnger	android.app.Dialog
com.sina.weibo	android.widget.FrameLayout
com.sina.weibo	com.weibo.mobileads.view.b
com.sina.weibo	关闭关注浮窗
com.sina.weibo	关闭广告共享计划
com.sina.weibo	关闭评论区广告
com.smzdm.client.android	android.widget.FrameLayout
com.sohu.inputmethod.sogou.xiaomi	android.widget.FrameLayout
com.sohu.inputmethod.sogouoem	android.widget.FrameLayout
com.ss.android.article.lite	com.ss.android.article.lite.activity.SplashActivity
com.ss.android.ugc.aweme	android.widget.FrameLayout
com.ss.android.ugc.aweme	com.ss.android.ugc.aweme.splash.SplashAdActivity
com.tencent.mm	android.widget.FrameLayout
com.tencent.mm	com.tencent.mm.ui.transmit.SelectConversationUI
com.tencent.mobileqq	aboh
com.tencent.mobileqq	com.tencent.mobileqq.minigame.ui.GameActivity1
com.vivo.floatingball	android.widget.FrameLayout
com.vivo.globalanimation	android.view.View
com.vivo.upslide	android.widget.FrameLayout
com.vivo.upslide	com.vivo.upslide.recents.RecentsActivity
com.wintheshow.quickreply	android.widget.ImageView
com.ximalaya.ting.android	android.widget.FrameLayout
com.ximalaya.ting.android	android.widget.ListView
com.xueqiu.android	android.widget.FrameLayout
com.xunlei.downloadprovider	com.xunlei.downloadprovider.launch.LaunchActivity
com.xunmeng.pinduoduo	android.widget.FrameLayout
com.ygkj.chelaile.standard	dev.xesam.chelaile.app.module.func.HotSplashActivity
com.yinpai	com.yinpai.activity.NewChatActivity
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
