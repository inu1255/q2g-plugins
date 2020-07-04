function isBmobObject(o) {
    return o.objectId && o.$table && typeof o.$save === "function";
}
var Bmob = /** @class */ (function () {
    function Bmob() {
		this.user = { objectId: "", sessionToken: "" };
		if(window.bmobData) Object.assign(this, window.bmobData)
    }
    Bmob.prototype.config = function (appid, restkey) {
        this.appid = appid;
        this.restkey = restkey;
    };
    Bmob.prototype.request = function (path, method, data) {
        var headers = {
            "X-Bmob-Application-Id": this.appid,
            "X-Bmob-REST-API-Key": this.restkey,
            "X-Bmob-Session-Token": this.user.sessionToken,
            "Content-Type": "application/json",
        };
        var opts = { method: method, headers: headers };
        if (data)
            opts.body = JSON.stringify(data);
		return fetch("https://api2.bmob.cn/1/" + path, opts)
			.then(function(x) { return x.json(); })
			.then(function (x) { return (x.code ? Promise.reject(x) : x); });;
    };
    Bmob.prototype.select = function (table, where, values) {
        var _this = this;
        return this.request("cloudQuery", "GET", {
            bql: "select * from " + table + " " + (where || ""),
            values: values,
        }).then(function (list) {
            return Promise.all(list.results.map(function (x) { return _this.create(table, x); }));
        }, function (e) { return (e.code == 101 ? [] : Promise.reject(e)); });
    };
    Bmob.prototype.getOrCreate = function (table, data, keys) {
        var _this = this;
        if (typeof keys === "string")
            keys = keys.split(",");
        var where = "";
        var values = [];
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var k = keys_1[_i];
            if (where)
                where = k + "=?";
            else
                where = " and " + k + "=?";
            values.push(data[k]);
        }
        return this.select(table, where, values).then(function (list) { return (list && list[0]) || _this.create(table, data); });
    };
    Bmob.prototype.watch = function (obj, fn) {
		return new Vue({
			data: { v: obj },
			watch: fn ? { v: { deep: true, handler: fn } } : null,
		}).v;
    };
    Bmob.prototype.create = function (table, data) {
        var _a;
        var _this = this;
        if (isBmobObject(data)) {
            if (data.$table == table)
                return Promise.resolve(data.$save());
            throw new Error("can not create bmob object by bmob object");
        }
        if (!("objectId" in data)) {
            var path = "classes/" + encodeURIComponent(table);
            return this.request(path, "POST", this.user.objectId ? Object.assign({ ACL: (_a = {}, _a[this.user.objectId] = { read: true, write: true }, _a) }, data) : data).then(function (x) {
                return _this.create(table, Object.assign(data, x));
            });
        }
        var that = this;
        var old = {};
        for (var k in data) {
            if (k[0] == "_" || k[0] == "$")
                continue;
            var v = data[k];
            if (!(v && typeof v === "object"))
                old[k] = v;
        }
        Object.defineProperty(data, "__old__", { enumerable: false, value: old });
        // @ts-ignore
        if (!data.$table)
            data.$table = table;
        Object.defineProperty(data, "createdAt", { enumerable: false, value: data["createdAt"] });
        Object.defineProperty(data, "updatedAt", { configurable: true, enumerable: false, value: data["updatedAt"] });
        Object.defineProperty(data, "$dirty", {
            value: function () {
                var obj = {};
                for (var k in this) {
                    if (k[0] == "_" || k[0] == "$")
                        continue;
                    var v = this[k];
                    if (v && typeof v === "object")
                        obj[k] = v;
                    else if (v !== this.__old__[k])
                        obj[k] = v;
                }
                return obj;
            },
        });
        Object.defineProperty(data, "$save", {
            enumerable: false,
            value: function (updatedAt) {
                var _this = this;
                if (updatedAt) {
                    for (var k in this) {
                        if (k[0] == "_" || k[0] == "$")
                            continue;
                        var v = data[k];
                        if (!(v && typeof v === "object"))
                            this.__old__[k] = v;
                    }
                    Object.defineProperty(data, "updatedAt", { value: updatedAt });
                    return this;
                }
                return that.request("classes/" + this.$table + "/" + this.objectId, "PUT", this.$dirty()).then(function (x) { return _this.$save(x.updatedAt); });
            },
        });
        Object.defineProperty(data, "$delete", {
            enumerable: false,
            value: function () {
                var _this = this;
                if (this.$deleted)
                    return Promise.resolve();
                return that.request("classes/" + this.$table + "/" + this.objectId, "DELETE").then(function () {
                    Object.defineProperty(_this, "$deleted", { value: true });
                });
            },
        });
        var h;
        return Promise.resolve(this.watch(data, function () {
            if (h)
                clearTimeout(h);
            h = setTimeout(function () {
                // @ts-ignore
                data.$save();
            }, 1e3);
        }));
    };
    Bmob.prototype.register = function (data) {
        var _this = this;
        return this.request("users", "POST", data).then(function (x) {
            _this.user.objectId = x.objectId;
            _this.user.sessionToken = x.sessionToken;
            return x;
        });
    };
    Bmob.prototype.login = function (data) {
        var _this = this;
        return this.request("login", "GET", data).then(function (x) {
            _this.user.objectId = x.objectId;
            _this.user.sessionToken = x.sessionToken;
            return x;
        });
    };
    Bmob.prototype.loginOrRegister = function (data) {
        var _this = this;
        return this.register(data).catch(function (e) { return (e && e.code == 202 ? _this.login(data) : Promise.reject(e)); });
    };
    return Bmob;
}());
var bmob = new Bmob();
window["bmob"] = bmob;