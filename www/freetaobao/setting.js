const {date} = Quasar;
new Vue({
	el: "#app",
	data: function () {
		return {
			params: {
				max: 0.4,
				filter: ["充1话费老", "人教版"],
				sound: false, // 启用提示音
				autoClick: true, // 自动点击领取
				msg: "", // 最近免单
			},
		};
	},
	computed: {},
	watch: {},
	methods: {
		save() {
			we.close(JSON.stringify(this.params, (k, v) => (k[0] == "_" ? undefined : v)));
		},
	},
	mounted: function () {
		this.params = Object.assign({}, this.params, JSON.parse(we.getParams()));
	},
});
