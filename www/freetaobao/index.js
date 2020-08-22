// ==UserScript==
// @author            inu1255
// @name              淘宝抢免单
// @version           1.0.0
// @minApk            10505
// @cronFreq          1e3
// @namespace         https://github.com/inu1255/q2g-plugins
// @updateURL         https://q2g-plugins.inu1255.cn/freetaobao/index.js
// @settingURL        https://q2g-plugins.inu1255.cn/freetaobao/setting.html
// ==/UserScript==
exports.params = {
	max: 0.4,
	filter: ["充1话费老", "人教版"],
	sound: false, // 启用提示音
	msg: "",
};
let prev; // 上次领取的口令
let prevAt = 0; // 上次查询时间
let nextDt = 1e3; // 下次查询间隔

async function tryN(n, fn) {
	var ok;
	while (n-- > 0) {
		if ((ok = await Promise.resolve(fn()))) break;
		await we.sleep(1e3);
	}
	return ok;
}

async function open(key, title) {
	prev = key;
	exports.params.msg = title;
	if ((await we.getCurrentPackage()) === "com.taobao.taobao") {
		await we.performGlobalAction(2);
		await we.sleep(800);
	}
	await we.copy(key);
	await we.open("com.taobao.taobao");
	if (!(await tryN(5, () => we.clickByView("com.taobao.taobao:id/tpd_common_action")))) return;
	console.log("开始领取");
	let ok = await tryN(3, async () => {
		let nodes = await we.getNodes(1);
		let hasMore, m, idx; // 有淘礼金红包，且没有抢完
		let /** 立即领取 */ btn, /** 福利价 */ price, /** 券后价 */ couponPrice, /** 立即领券 */ couponBtn;
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
				price = parseFloat(m[1]);
			} else if (!couponPrice && (idx = node.text.indexOf("用券后")) >= 0) {
				couponPrice = parseFloat(node.text.slice(idx + 1));
			} else if (node.text == "立即领券") {
				couponBtn = node;
			}
		}
		if (hasMore && btn) {
			if (0 && price > exports.params.max) {
				return `福利价${couponPrice}>${exports.params.max}`;
			} else {
				console.log(`福利价${price}`);
				await we.clickById(btn.id);
				return true;
			}
		}
		if (couponBtn) {
			if (couponPrice > exports.params.max) {
				return `券后价${couponPrice}>${exports.params.max}`;
			} else {
				await we.clickById(btn.id);
				return true;
			}
		}
	});
	if (ok) console.log(`领取结果`, ok);
	return ok;
}

exports.onTime = async function () {
	if (Date.now() < prevAt + nextDt) return;
	prevAt = Date.now();
	if (!(await we.isScreenOn())) return; // 熄屏时跳过
	let text = await we.get("http://md.afxwl.com/", null, {ignore: true});
	let m = /￥\w+￥/.exec(text);
	if (!m) return console.error("没有定位到免单商品");
	let taobaokouling = m[0];
	// 过滤重复免单
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
	m = /(\d\.)?\d元/.exec(title);
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
	let msg = await open(taobaokouling, title);
	if (typeof msg == "string") {
		await we.performGlobalAction(1);
		await we.toast(msg);
		await we.sleep(500);
		await we.performGlobalAction(3);
		await we.sleep(500);
		await we.performGlobalAction(3);
	} else if (msg) {
		if (exports.params.sound) we.playSound("http://md.afxwl.com/b.mp3");
	}
};