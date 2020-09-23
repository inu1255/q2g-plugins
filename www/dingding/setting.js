const {date} = Quasar;
new Vue({
	el: "#app",
	data: function () {
		return {
			params: {
				beg: 0,
				end: 0,
				nextAt: 0,
				auto: false, // 到点自动打卡
				weeks: [0, 1, 1, 1, 1, 1, 0], // 周几要打卡
			},
		};
	},
	computed: {
		beg() {
			return this.toTime(this.params.beg);
		},
		end() {
			return this.toTime(this.params.end);
		},
		nextAt() {
			let t = Math.max(this.params.nextAt, Date.now());
			let nextAt = date.formatDate(t, "YYYY-MM-DD HH:mm");
			let d = date.formatDate(t, "YYYY-MM-DD ");
			if (nextAt > d + this.beg && nextAt < d + this.end) nextAt = d + this.end;
			return this.fromNow(nextAt);
		},
	},
	watch: {},
	methods: {
		save() {
			we.close(JSON.stringify(this.params, (k, v) => (k[0] == "_" ? undefined : v)));
		},
		fromTime(s) {
			let [a, b] = s.split(":");
			this.params.beg = a * 60 + +b;
		},
		toTime(s) {
			return (Math.floor(s / 60) + 100 + "").slice(1) + ":" + ((s % 60) + 100 + "").slice(1);
		},
		diff: function (v, digits, suffix) {
			suffix = suffix || "";
			var s = "";
			var ts = [
				[86400e3 * 365, "年"],
				[86400e3 * 30, "月"],
				[86400e3, "天"],
				[3600e3, "小时"],
				[60e3, "分钟"],
				[1e3, "秒"],
			];
			for (var i = 0; i < ts.length; i++) {
				var unit = ts[i];
				var diff = v / unit[0];
				var tmp = Math.floor(diff);
				if (tmp) {
					if (digits) {
						var n = Math.pow(10, digits);
						s = Math.floor((v / unit[0]) * n) / n;
					} else {
						s = tmp;
					}
					s += unit[1];
					break;
				}
			}
			if (s) return s + suffix;
		},
		fromNow: function (v, digits, def) {
			this.tick;
			digits = digits || 0;
			if (!v) return def || "未设置";
			v = +new Date(v);
			var suffix = "";
			if (v > 86400e3 * 365) {
				v -= Date.now();
				suffix = v > 0 ? "后" : "前";
			}
			var s = this.diff(Math.abs(v), digits, suffix);
			if (s) return s;
			return "刚刚";
		},
	},
	mounted: function () {
		this.params = Object.assign({}, this.params, JSON.parse(we.getParams()));
	},
});
