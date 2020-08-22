const {date} = Quasar;
new Vue({
	el: "#app",
	data: function () {
		return {
			params: {filter:[]},
		};
	},
	computed: {
	},
	watch: {
	},
	methods: {
		save() {
			we.close(JSON.stringify(this.params, (k, v) => (k[0] == "_" ? undefined : v)));
		},
	},
	mounted: function () {
		this.params = JSON.parse(we.getParams());
	},
});
