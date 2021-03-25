const http = require("http");
const os = require("os");
const URL = require("url");
const fs = require("fs");
let baseURL;
//获取内网ip
function getLocalIp() {
	var map = [];
	var ifaces = os.networkInterfaces();
	for (var dev in ifaces) {
		let device = ifaces[dev][1] || ifaces[dev][0];
		if (device.address.indexOf("192.168") != -1) {
			return device.address;
		}
	}
	return map;
}

var argv = {_: []};
for (let i = 2; i < process.argv.length; i++) {
	let s = process.argv[i];
	let key = "";
	if (s.slice(0, 2) == "--") key = s.slice(2);
	else if (s.slice(0, 1) == "-") key = s.slice(1);
	if (key) {
		let next = process.argv[i + 1];
		if (next != null && next[0] != "-") {
			argv[key] = next;
			i++;
		} else argv[key] = true;
	} else {
		argv._.push(s);
	}
}

const app = http.createServer(function (req, res) {
	let url = URL.parse(req.url);
	let filename = "www" + url.pathname;
	if (filename.endsWith("/")) filename += "index.html";
	if (filename.endsWith(".js")) res.setHeader("Content-type", "text/javascript;charset=utf-8");
	else if (filename.endsWith(".html")) res.setHeader("Content-type", "text/html;charset=utf-8");
	else {
		try {
			fs.createReadStream(filename).pipe(res);
		} catch (error) {}
		return;
	}
	fs.readFile(filename, "utf8", function (err, data) {
		if (err) {
			res.writeHead(404, "Not Found");
			res.end();
		} else {
			res.end(data.replace(/https:\/\/q2g-plugins\.inu1255\.cn/gi, baseURL));
		}
	});
});

const port = argv.port || 8000;
app.listen(port, function () {
	baseURL = `http://${getLocalIp()}:${port}`;
	console.log(`listening ${baseURL}`);
});
