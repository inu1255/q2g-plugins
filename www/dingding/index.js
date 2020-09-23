// ==UserScript==
// @author            inu1255
// @name              钉钉打卡
// @version           1.0.6
// @minApk            10503
// @cronFreq          60e3
// @namespace         https://github.com/inu1255/q2g-plugins
// @updateURL         https://q2g-plugins.inu1255.cn/dingding/index.js
// @readmeURL         https://q2g-plugins.inu1255.cn/dingding/README.md
// @settingURL        https://q2g-plugins.inu1255.cn/dingding/setting.html
// ==/UserScript==
exports.params = {
	beg: 0,
	end: 0,
	nextAt: 0,
	auto: false, // 到点自动打卡
	weeks: [0, 1, 1, 1, 1, 1, 0], // 周几要打卡
};

let appset = new Set(["com.huawei.android.launcher", "com.alibaba.android.rimet"]);

function timeNow() {
	let now = new Date();
	return now.getHours() * 60 + now.getMinutes();
}

async function tryN(n, fn, nocheck) {
	while (n-- > 0) {
		if (!nocheck && !appset.has(await we.getCurrentPackage())) throw new Error("不是指定的APP");
		if (await Promise.resolve(fn())) break;
		await we.sleep(1e3);
	}
}

/**
 *
 * @param {string} findText
 * @param {{matchText?:string;notFound?:Function;n?:number;nodeCnt?:number}} opts
 * @returns {Promise<AccessibilityNode[]>}
 */
async function waitUntil(findText, opts) {
	let {matchText, notFound, n, nodeCnt} = opts || {};
	if (matchText == null) matchText = findText;
	let nodes;
	await tryN(n || 5, async function () {
		nodes = await we.getNodes(1, findText);
		if (nodeCnt != null && nodeCnt != nodes.length) nodes.length = 0;
		if (nodes.length) {
			for (let node of nodes) {
				if (!matchText || node.text.indexOf(matchText) >= 0) return true;
			}
			nodes.length = 0;
		}
		console.log(findText, notFound);
		if (notFound) await notFound();
	});
	return nodes;
}

async function gotoCompany() {
	// 找到工作通知并进入
	let nodes = await waitUntil("", {matchText: "通讯录", notFound: () => we.performGlobalAction(1)});
	if (!nodes.length) throw new Error("没有找到入口");
	for (let i = 0; i < nodes.length; i++) {
		let node = nodes[i];
		if (node.text === "通讯录" && nodes[i - 3] && nodes[i - 3].text === "文档") {
			await we.clickById(node.id);
			await we.sleep(1e3);
			break;
		}
	}
	nodes = await waitUntil("", {matchText: "通讯录", notFound: () => we.performGlobalAction(1)});
	if (!nodes.length) throw new Error("没有找到入口");
	for (let i = 0; i < nodes.length; i++) {
		let node = nodes[i];
		if (node.text === "通讯录" && nodes[i - 3] && nodes[i - 3].text === "文档") {
			await we.clickById(nodes[i - 2].id);
			await we.sleep(1e3);
			break;
		}
	}
}

async function gotoSign() {
	let nodes = await waitUntil("考勤打卡");
	nodes = nodes.filter((x) => x.bottom - x.top > 10);
	if (!nodes.length) throw new Error("没有找到考勤打卡入口");
	for (let node of nodes.slice(-1)) {
		await we.clickById(node.id);
		await we.clickById(node.id - 1);
	}
}

async function doSign() {
	// 识别打卡时间
	let nodes = await waitUntil("班", {n: 10});
	if (!nodes.length) throw new Error("没有找到打卡入口");
	for (let node of nodes) {
		if (/^上班\d{2}:\d{2}/.test(node.text)) {
			exports.params.beg = parseTime(node.text.slice(2));
		} else if (/^下班\d{2}:\d{2}/.test(node.text)) {
			exports.params.end = parseTime(node.text.slice(2));
			exports.save();
		}
	}
	if (!exports.params.beg || !exports.params.end) throw new Error("没有识别到打卡时间");
	let now = timeNow();
	if (now > exports.params.beg && now < exports.params.end) throw new Error("没到打卡时间");
	// 识别打卡按钮
	nodes = await waitUntil("打卡");
	if (!nodes.length) throw new Error("没有识别到打卡按钮");
	exports.params.nextAt = new Date(new Date().toLocaleDateString()).getTime();
	let signNode;
	for (let i = 0; i < nodes.length; i++) {
		let node = nodes[i];
		if (/已打卡/.test(node.text)) {
			exports.params.nextAt += 43200e3;
		} else if (!signNode && node.text != "未打卡") signNode = node;
	}
	console.log(signNode);
	if (Date.now() < exports.params.nextAt) throw new Error("已经打卡");
	await we.clickById(signNode.id);
	exports.params.nextAt += 43200e3;
	await we.sleep(1000);
	tryN(5, async function () {
		await we.sleep(500);
		let nodes = await we.getNodes(1, "考勤打卡");
		await we.performGlobalAction(1);
		if (nodes.length > 0) return true;
	});
	return;
	// 开始外勤打卡
	nodes = await waitUntil("打卡", {nodeCnt: 2});
	if (!nodes.length) throw new Error("没有识别到打卡按钮2");
	await we.clickById(nodes[nodes.length - 1].id);
}

async function sign() {
	if (!(await we.isScreenOn())) {
		await we.wakeup();
		await we.swape("up");
		await we.sleep(1e3);
		await we.swape("right");
	}
	// let info = await we.deviceInfo();
	// if (/xiaomi/.test(info.brand)) {
	// 	if ((await we.getCurrentPackage()) != "cn.inu1255.quan2go") {
	// 		await we.performGlobalAction(2);
	// 		await we.performGlobalAction(2);
	// 		await we.sleep(500);
	// 		await we.clickByText("券二狗");
	// 	}
	// }
	await we.open("com.alibaba.android.rimet");
	await tryN(
		5,
		async function () {
			return (await we.getCurrentPackage()) === "com.alibaba.android.rimet";
		},
		true
	);
	await gotoCompany();
	await gotoSign();
	await doSign().catch(async (e) => {
		// 之前不是打开的淘宝，则切换上个应用
		await we.performGlobalAction(3);
		await we.sleep(200);
		await we.performGlobalAction(3);
		return Promise.reject(e);
	});
}

function parseTime(t) {
	let ss = t.split(":");
	return +ss[0] * 60 + +ss[1];
}

exports.onTime = async function () {
	// 已经打卡
	if (Date.now() < exports.params.nextAt) return console.log("已打卡");
	let week = new Date().getDay();
	// 不是周1~周5
	if (week < 1 || week > 5) return console.log("周1到周5才打卡");
	let now = timeNow();
	// 没到打卡时间
	if (now > exports.params.beg && now < exports.params.end) return console.log("没到打卡时间");
	if (exports.params.auto) return sign();
	return exports.setText("一键打卡");
};

exports.run = function () {
	exports.setText("");
	return sign();
};
