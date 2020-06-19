const cofs = require("fs-extra");

// 将src中的js打包到www中
async function main() {
	await cofs.mkdirp("www");
	let filenames = await cofs.readdir("src");
	for (let filename of filenames) {
		if (filename.endsWith(".js")) {
			let text = await cofs.readFile("src/" + filename, "utf8");
			let set = new Set();
			text.replace(/\WUI\.(\w+)/g, function (x0, x1) {
				set.add(x1);
			});
			if (set.size > 0) {
				text.replace(/\WUI\.(\w+)/g, function (x0, x1) {
					set.add(x1);
				});
				let map = {};
				for (let ui of set) {
					map[ui] = await cofs.readFile("src/" + ui + ".html", "utf8");
				}
				text = text.replace(/\WUI\.(\w+)/g, function (x0, x1) {
					return x0[0] + JSON.stringify(map[x1]);
				});
			}
			await cofs.writeFile("www/" + filename, text);
		}
	}
}

main();
