const router = new VueRouter({
	mode: "hash",
	routes: [
		{
			path: "/",
			name: "home",
		},
		{
			path: "/adpkg",
			name: "adpkg",
		},
	],
});
Vue.use(VueRouter);
var app = document.getElementById("app");
new Vue({
	el: app,
	router: router,
	data: function () {
		return {
			// home
			apps_: [],
			params: {},
			// adpkg
			pkg: {},
			cls: {},
			idx: -1,
		};
	},
	computed: {
		apps() {
			let ad = this.params.ad_setting;
			let whites = this.params.white_list;
			return this.apps_
				.map((x) => {
					x._skipCnt = 0;
					x._last = 0;
					x._idx = whites.indexOf(x.pkg);
					x._skip = 0;
					x._hasAD = 0;
					let pkg = ad[x.pkg];
					if (!pkg) return x;
					for (let k in pkg) {
						let v = pkg[k];
						if (v.skip == 1) x._skip++;
						x._hasAD = 1;
						x._skipCnt += v.cnt;
						x._last = Math.max(x._last, v.last);
					}
					return x;
				})
				.sort((a, b) => b._last - a._last);
		},
	},
	watch: {
		"$route.query.pkg"() {
			this.refresh();
		},
	},
	methods: {
		formatDate(t) {
			return Quasar.date.formatDate(t, "YYYY-MM-DD HH:mm:ss");
		},
		save() {
			we.close(JSON.stringify(this.params, (k, v) => (k[0] == "_" ? undefined : v)));
		},
		// adpkg
		toggle(cls) {
			if (cls.skip == 1) cls.skip = 2;
			else cls.skip = 1;
		},
		toggleSkip() {
			let whites = this.params.white_list;
			if (this.idx < 0) {
				this.idx = whites.length;
				whites.push(this.pkg.pkg);
			} else {
				whites.splice(this.idx, 1);
				this.idx = -1;
			}
		},
		async refresh() {
			if (!this.$route.query.pkg) return;
			let whites = this.params.white_list;
			let ad = this.params.ad_setting;
			for (let item of this.apps) {
				if (item.pkg == this.$route.query.pkg) {
					this.pkg = item;
					this.cls = ad[item.pkg];
					this.idx = whites.indexOf(item.pkg);
					break;
				}
			}
		},
	},
	mounted: function () {
		app.style.opacity = 1;
		this.refresh();
		we.getApps(1).then((apps) => (this.apps_ = apps));
		this.params = JSON.parse(we.getParams());
	},
});
