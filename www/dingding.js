// ==UserScript==
// @author            inu1255
// @name              钉钉打卡
// @version           1.0.0
// @minApk            10503
// @cronFreq          60e3
// @namespace         https://gitee.com/inu1255/q2g-plugins
// @updateURL         https://inu1255.gitee.io/q2g-plugins/dingding.js
// ==/UserScript==
console.log("dingding loaded");
exports.params = {
	beg: 0,
	end: 0,
	nextAt: 0,
};

let appset = new Set(["com.huawei.android.launcher", "com.alibaba.android.rimet"]);

function timeNow() {
	let now = new Date();
	return now.getHours() * 60 + now.getMinutes();
}

async function tryN(n, fn) {
	while (n-- > 0) {
		if (!appset.has(await we.getCurrentPackage())) throw new Error("不是指定的APP");
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
			await we.sleep(500);
			await we.clickById(nodes[i - 1].id);
			await we.sleep(1e3);
			break;
		}
	}
}

async function gotoSign() {
	let nodes = await waitUntil("考勤打卡");
	if (!nodes.length) throw new Error("没有找到考勤打卡入口");
	await we.clickById(nodes[nodes.length - 1].id);
}

async function doSign() {
	// 识别打卡时间
	let nodes = await waitUntil("查看规则");
	if (!nodes.length) throw new Error("没有找到打卡入口");
	if (!exports.params.beg || !exports.params.end) {
		// 还不知道打卡时间段
		await we.clickById(nodes[0].id);
		nodes = await waitUntil(":", {matchText: "-"});
		for (let node of nodes) {
			let m = /(\d{2}:\d{2})-(\d{2}:\d{2})/.exec(node.text);
			if (m) {
				let ss = m[0].split("-");
				exports.params.beg = parseTime(ss[0]);
				exports.params.end = parseTime(ss[1]);
				await we.performGlobalAction(1);
				exports.save();
				break;
			}
		}
	}
	if (!exports.params.beg || !exports.params.end) throw new Error("没有识别到打卡时间");
	let now = timeNow();
	if (now > exports.params.beg && now < exports.params.end) throw new Error("不在考勤范围内");
	// 识别打卡按钮
	nodes = await waitUntil("打卡");
	if (!nodes.length) throw new Error("没有识别到打卡按钮");
	exports.params.nextAt = new Date(new Date().toLocaleDateString()).getTime();
	let signNode;
	for (let i = 0; i < nodes.length; i++) {
		let node = nodes[i];
		if (node.text.startsWith("打卡时间")) {
			exports.params.nextAt += 43200e3;
		} else if (!signNode && node.text != "更新打卡") signNode = node;
	}
	if (Date.now() < exports.params.nextAt) throw new Error("已经打卡");
	console.log(signNode);
	await we.clickById(signNode.id);
	return;
	// 开始外勤打卡
	nodes = await waitUntil("打卡", {nodeCnt: 2});
	if (!nodes.length) throw new Error("没有识别到打卡按钮2");
	await we.clickById(nodes[nodes.length - 1].id);
	exports.params.nextAt += 43200e3;
}

async function sign() {
	console.log("sign");
	if (!(await we.isScreenOn())) {
		await we.wakeup();
		await we.swape("up");
		await we.sleep(1e3);
		await we.swape("right");
	}
	await we.open("com.alibaba.android.rimet");
	await tryN(5, async function () {
		return (await we.getCurrentPackage()) === "com.alibaba.android.rimet";
	});
	await gotoCompany();
	await gotoSign();
	await doSign();
}

function parseTime(t) {
	let ss = t.split(":");
	return +ss[0] * 60 + +ss[1];
}

exports.onTime = async function () {
	let now = timeNow();
	let week = new Date().getDay();
	// 不是周1~周5
	if (week < 1 || week > 5) return console.log("周1到周5才打卡");
	// 提前15分钟打卡
	if (now < exports.params.beg - 15) return console.log("离上班不到15分钟");
	// 不在打卡范围内
	if (now > exports.params.beg && now < exports.params.end) return console.log("不在打卡范围内");
	// 已经打卡
	if (Date.now() < exports.params.nextAt) return console.log("已打卡");
	await sign();
};

exports.run = function () {
	return sign();
};
