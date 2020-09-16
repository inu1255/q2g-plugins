// ==UserScript==
// @author            inu1255
// @name              淘宝抢免单
// @version           1.1.0
// @minApk            10505
// @cronFreq          1e3
// @namespace         https://github.com/inu1255/q2g-plugins
// @updateURL         https://q2g-plugins.inu1255.cn/freetaobao/index.js
// @readmeURL         https://q2g-plugins.inu1255.cn/freetaobao/README.md
// @settingURL        https://q2g-plugins.inu1255.cn/freetaobao/setting.html
// ==/UserScript==
exports.params = {
	max: 0.4,
	filter: ["充1话费老", "人教版"],
	sound: false, // 启用提示音
	autoClick: true, // 自动点击领取
	msg: "", // 最近免单
};
let prev; // 上次领取的口令
let prevAt = 0; // 上次查询时间
let nextDt = 1e3; // 下次查询间隔
let logs = "";

async function tryN(n, fn, nocheck) {
	var ok;
	while (n-- > 0) {
		if (!nocheck && (await we.getCurrentPackage()) != "com.taobao.taobao") throw new Error("不在淘宝页面");
		if ((ok = await Promise.resolve(fn()))) break;
		await we.sleep(1e3);
	}
	return ok;
}

async function open(key, title) {
	if (title) {
		prev = key;
		exports.params.msg = title;
	}
	let taobaoOpened = (await we.getCurrentPackage()) === "com.taobao.taobao";
	if (taobaoOpened) {
		await we.performGlobalAction(2);
		await we.sleep(800);
	}
	await we.copy(key);
	await we.open("com.taobao.taobao");
	if (!(await tryN(5, () => we.clickByView("com.taobao.taobao:id/tpd_common_action"), true))) return;
	console.log("开始领取");
	let price = 0; // 福利价
	let ok = await tryN(3, async () => {
		let nodes = await we.getNodes(1);
		let hasMore, m, idx; // 有淘礼金红包，且没有抢完
		let /** 立即领取 */ btn, /** 券后价 */ couponPrice, /** 立即领券 */ couponBtn;
		for (let i = 0; i < nodes.length; i++) {
			let node = nodes[i];
			if (node.text == "淘礼金红包") {
				if ((node = nodes[++i])) {
					if (node.text == "￥") return "抢完了";
					hasMore = true;
				}
			} else if (node.text == "立即领取") {
				btn = node;
			} else if (node.text == "优惠券已失效") {
				return "优惠券已失效";
			} else if (node.text == "福利仅限以下商品使用") {
			} else if (btn && (m = /福利价￥\s*([\s\.]+)/.exec(node.text))) {
				price = parseFloat(m[1]) || 0;
			} else if (!couponPrice && (idx = node.text.indexOf("用券后")) >= 0) {
				couponPrice = parseFloat(node.text.slice(idx + 1));
			} else if (node.text == "立即领券") {
				couponBtn = node;
			}
		}
		if (hasMore && btn) {
			if (price > exports.params.max) {
				return `福利价${couponPrice}>${exports.params.max}`;
			} else {
				if (exports.params.autoClick) await we.clickById(btn.id);
				return true;
			}
		}
		if (couponBtn) {
			if (couponPrice > exports.params.max) {
				return `券后价${couponPrice}>${exports.params.max}`;
			} else {
				if (exports.params.autoClick) await we.clickById(btn.id);
				return true;
			}
		}
	});
	if (ok === true) {
		ok = await tryN(5, async () => {
			let nodes = await we.getNodes(1);
			for (let node of nodes) {
				if (node.text == "已达上限") {
					return "已达上限";
				} else if (node.text == "优惠已领完") {
					return "优惠已领完";
				} else if (node.text == "正在跳转详情页…") {
					return true;
				}
			}
		});
	}
	if (ok) console.log(`福利价${price}`, ok);
	if (typeof ok == "string") {
		await we.performGlobalAction(1);
		await we.toast(ok);
		await we.sleep(500);
		if (!taobaoOpened) {
			// 之前不是打开的淘宝，则切换上个应用
			await we.performGlobalAction(3);
			await we.sleep(200);
			await we.performGlobalAction(3);
		}
	} else if (ok) {
		if (exports.params.sound && we.playSound) we.playSound("http://md.afxwl.com/b.mp3");
	}
}

exports.run = function (key) {
	if (!key) return;
	return open(key);
};

exports.getLogs = function () {
	return logs;
};

exports.onTime = async function () {
	if (Date.now() < prevAt + nextDt) return;
	prevAt = Date.now();
	if (!(await we.isScreenOn())) {
		if (!(exports.params.sound && we.playSound)) return;
	}
	let list = await we.get("material/freetaobao", null, {ignore: true});
	let first = list[0];
	let taobaokouling = first.word;
	// 过滤重复免单
	logs = "";
	for (let item of list) {
		logs += "1. " + item.title + " @ " + item.price + "元(" + item.word.slice(1, -1) + ")\n";
	}
	if (logs) logs = "#### 最近免单\n" + logs;
	if (prev == taobaokouling) {
		nextDt = Math.floor(Math.random() * 3e3);
		return;
	}
	if (!prev) prev = taobaokouling;
	// 过滤标题关键词
	let title = first.title;
	try {
		if (exports.params.filter && exports.params.filter.length && new RegExp(exports.params.filter.join("|")).test(title)) return;
	} catch (error) {
		console.log("过滤出错", error);
	}
	// 过滤价格
	let price = first.price;
	if (price > exports.params.max) {
		console.log(title, `价格太高${price}>${exports.params.max}`);
		return;
	}
	// 过滤老订单
	let time = first.time;
	if (time < Date.now() - 30e3) return console.log(title, `肯定抢完了`);
	nextDt = 5e3;
	if (!(await we.isScreenOn())) {
		if (exports.params.sound && we.playSound) we.playSound("http://md.afxwl.com/b.mp3");
		if (
			!(await tryN(
				4,
				() => {
					return we.isScreenOn();
				},
				true
			))
		)
			return;
	}
	await open(taobaokouling, title);
	return;
	if (we.ver.buildVersion < 10508) {
		return onTime10507();
	}
};

async function onTime10508() {
	let ws = await we.newWS("ws://154.8.159.81:8888/");
	let {data} = await ws.once();
	let taobaokouling;
	let first = data[0];
	first.text.replace(/\(([^\)]+)\)/, function (x0, x1) {
		taobaokouling = `¥${x1}¥`;
		return "";
	});
	logs = "";
	for (let item of data) {
		logs += "1. " + item.text.replace(/<br\/>/g, " ").replace(/\[CQ[^\]]+\]/g, "") + "\n";
	}
	if (logs) logs = "#### 最近免单\n" + logs;
	if (prev == taobaokouling) {
		nextDt = Math.floor(Math.random() * 3e3);
		return;
	}
	if (!prev) prev = taobaokouling;
	// 过滤标题关键词
	let title = first.text;
	try {
		if (exports.params.filter && exports.params.filter.length && new RegExp(exports.params.filter.join("|")).test(title)) return;
	} catch (error) {
		console.log("过滤出错", error);
	}
	// 过滤价格
	let price = 0;
	let m = /(\d+\.)?\d+元/.exec(title);
	if (m) price = parseFloat(m[0]);
	if (price > exports.params.max) {
		console.log(title, `价格太高${price}>${exports.params.max}`);
		return;
	}
	// 过滤老订单
	let time = new Date(first.seedTime).getTime();
	if (time < Date.now() - 30e3) return console.log(title, `肯定抢完了`);
	nextDt = 5e3;
	if (!(await we.isScreenOn())) {
		if (exports.params.sound && we.playSound) we.playSound("http://md.afxwl.com/b.mp3");
		if (
			!(await tryN(
				4,
				() => {
					return we.isScreenOn();
				},
				true
			))
		)
			return;
	}
	await open(taobaokouling, title);
}

async function onTime10507() {
	let text = await we.get("http://md.afxwl.com/", null, {ignore: true});
	let m = /￥\w+￥/.exec(text);
	if (!m) return console.error("没有定位到免单商品");
	let taobaokouling = m[0];
	// 过滤重复免单
	logs = "";
	text.replace(/goodstitle:'([^']+)'/g, function (x0, x1) {
		logs += "1. " + x1.replace(/\[CQ[^\]]+\]/g, "") + "\n";
	});
	if (logs) logs = "#### 最近免单\n" + logs;
	if (prev == taobaokouling) {
		nextDt = Math.floor(Math.random() * 3e3);
		return;
	}
	if (!prev) prev = taobaokouling;
	// 过滤标题关键词
	m = /goodstitle:'([^']+)'/.exec(text);
	let title = (m && m[1]) || "";
	try {
		if (exports.params.filter && exports.params.filter.length && new RegExp(exports.params.filter.join("|")).test(title)) return;
	} catch (error) {
		console.log("过滤出错", error);
	}
	// 过滤价格
	let price = 0;
	m = /(\d+\.)?\d+元/.exec(title);
	if (m) price = parseFloat(m[0]);
	if (price > exports.params.max) {
		console.log(title, `价格太高${price}>${exports.params.max}`);
		return;
	}
	// 过滤老订单
	m = /posttime:'([^']+)'/.exec(text);
	let time = 0;
	if (m) time = new Date(m[1].replace(/(\d+)\D(\d+)\D(\d+)\D(\d+)\D(\d+)\D(\d+)\D/g, "$1-$2-$3 $4:$5:$6")).getTime();
	if (time < Date.now() - 30e3) return console.log(title, `肯定抢完了`);
	nextDt = 5e3;
	if (!(await we.isScreenOn())) {
		if (exports.params.sound && we.playSound) we.playSound("http://md.afxwl.com/b.mp3");
		if (
			!(await tryN(
				4,
				() => {
					return we.isScreenOn();
				},
				true
			))
		)
			return;
	}
	await open(taobaokouling, title);
}
