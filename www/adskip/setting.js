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
const {date} = Quasar;
Vue.use(VueRouter);
new Vue({
	el: "#app",
	router: router,
	data: function () {
		return {
			total: 0,
			// home
			apps_: [],
			params: null,
			// adpkg
			pkg: {},
			cls: {},
			idx: -1,
		};
	},
	computed: {
		apps() {
			if (!this.params) return [];
			let ad = this.params.ad_setting;
			let whites = this.params.white_list;
			let total = 0;
			let list = this.apps_
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
					total += x._skipCnt;
					return x;
				})
				.sort((a, b) => {
					var t = b._last - a._last;
					if (t) return t;
					var t = b._hasAD - a._hasAD;
					if (t) return t;
					return b._idx - a._idx;
				});
			this.total = total;
			return list;
		},
	},
	watch: {
		"$route.query.pkg"() {
			this.refresh();
		},
	},
	methods: {
		save() {
			// we.close(JSON.stringify(this.params, (k, v) => (k[0] == "_" ? undefined : v)));
			we.close(0);
		},
		formatDate(t) {
			return date.formatDate(t, "YYYY-MM-DD HH:mm:ss");
		},
		// adpkg
		async toggle(cls) {
			if (cls.skip == 1) cls.skip = 2;
			else cls.skip = 1;
			await we.post('ad_setting/set', cls)
		},
		async toggleSkip() {
			let whites = this.params.white_list;
			if (!this.white) this.white = { v: [] }
			if (this.idx < 0) {
				this.idx = whites.length;
				whites.push(this.pkg.pkg);
			} else {
				whites.splice(this.idx, 1);
				this.idx = -1;
			}
			this.white.v = Array.from(whites)
			await we.post('setting/set', { k: 'ad_white_list', v: whites })
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
		this.params = JSON.parse(we.getParams());
		this.refresh();
		we.getApps(1).then((apps) => (this.apps_ = apps));
	},
});
