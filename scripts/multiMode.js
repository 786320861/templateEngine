/**
 * Created by sq on 2016/4/7.
 * 支持list if语句，不支持嵌套使用
 * list语句传入的是array 对象，其他的传入的是obj对象
 */
define(['jquery'], function ($) {
    $.fn.multiMode = function (options) {
        var _default = {
            "mode": "abstract",   // "abstract"(默认)/"list"/"card"
            "template": "",       //必须传递
            "_class": "",         //默认为fn+mode
            "removeClass": "",    //需要移除的class
            "data": [],           //解析的数据值
            "beforeInit": null,
            "afterInit": null
        };
        options = $.extend({}, _default, options);
        var $this = $(this);

        function MultiMode() {
            this.code = "var r = [];\n";
        }
        /* function arr(data, len) {
         if (typeof data == "string") {
         data = data.split(",").slice(0, len);
         }
         return data.join(',');
         }

         function str(data, len) {
         return data.substr(0, len);
         }

         function ifExist(tag, str) {
         if (tag) {
         return str;
         } else {
         return "";
         }
         }*/
        //单独抽取出来
        MultiMode.prototype.list = function (data, template) {
            var _this = this;
            var code = '';
            for (var j = 0; j < data.length; j++) {
                var di = data[j];
                code += _this.replaceStr(di, template);
            }
            return code;
        },
            MultiMode.prototype.conditions = function (data, str, tag) {
                var code = "",
                    regFun = /^#[if|else|list|\/if|\/list]+/,
                    regFun2 = /[if|else|list|\/if|\/list]+/;
                if (typeof str == "object") {
                    var match = str;
                    str = str[1];
                }
                //当时if或者elseif时，
                function ifCase(str) {
                    var ifReg = /\([^\)]+\)/;
                    var m = str.match(ifReg),
                        d = m[0],
                        key = $.trim(str.substring(0, m.index));
                    d = d.replace(/\(|\)/g, "");
                    if (d.indexOf("==") >= 0 || d.indexOf("===") >= 0) {
                        var arr = null,
                            connector = "", s = '';
                        if (d.indexOf("===") >= 0) {
                            arr = d.split("===");
                            connector = "===";
                        } else {
                            arr = d.split("==");
                            connector = "==";
                        }
                        for (var i = 0; i < arr.length; i++) {
                            var ai = arr[i];
                            if (data[ai]) {
                                arr[i] = data[ai];
                            }
                        }
                        if (key === "if") {
                            str = "if(" + arr[0] + connector + arr[1] + ")";
                        } else {
                            str = "}else if(" + arr[0] + connector + arr[1] + ")";
                        }
                    } else {
                        var rep = d;
                        if (data[d] || data[d] === 0 || data[d] === null || data[d] === "") {
                            rep = data[d];
                        }
                        if (key == "if") {
                            str = str.replace(ifReg, "(" + rep + ")");
                        } else {
                            str = str.replace("elseif", "}else if");
                            str = str.replace(ifReg, "(" + rep + ")");
                        }
                    }
                    return str;
                }

                if (tag) {
                    if (regFun.test(str)) {
                        str = str.substring(1);
                        switch (str.match(regFun2)[0]) {
                            case "if":
                                str = ifCase(str);
                                code += str + "{";
                                break;
                            case "/if":
                                code += "}";
                                break;
                            case "else":
                                code += ("}" + str + "{");
                                break;
                            case "elseif":
                                code += ifCase(str);
                                code += "{";
                        }
                        code += "\n";
                    } else {
                        code += 'r.push("' + data[str] + '");\n;';
                    }
                } else {
                    code += ((str != "") ? 'r.push("' + str.replace(/"/g, '\\"') + '");\n' : '')
                }
                return code;
            },
            MultiMode.prototype.replaceStr = function (data, template) {
                var template = template ? template : options.template;
                var _this = this;
                var reg = /\{([^\}]+)?\}/g,
                    match = null,
                    cursor = 0, code = "";
                while (match = reg.exec(template)) {
                    if (/\{#list\}/.exec(match)) {
                        if (data instanceof Array) {
                            var start = match.index + match[0].length;
                            var endArr = /\{#\/list\}/.exec(template),
                                end = endArr.index;
                            cursor = end;
                            template = options.template.substring(start, end);
                            _this.list(data, template);
                            break;
                        } else {
                            console.error('请传入一个数组');
                        }
                    } else {
                        code += this.conditions(data, template.slice(cursor, match.index));
                        code += this.conditions(data, match, true, template);
                        cursor = match.index + match[0].length;
                    }
                }
                var finalCode = this.conditions(data, template.substr(cursor, template.length - cursor));
                code += finalCode;
                this.code += code;
            };
        MultiMode.prototype.checkArrayOrJson = function (data) {
            var html = '', fun = null;
            this.replaceStr(data);
            this.code += 'return r.join("")';
            fun = new Function(this.code.replace(/\n\r\t/g, ""));
            html = fun();
            return html;
        };
        MultiMode.prototype.buildHtml = function () {
            var data = options.data,
                html = "",
                _this = this;
            if (data instanceof Object) {
                html = _this.checkArrayOrJson(data)
            } else if (typeof data == "string") {
                data = JSON.parse(data);
                html = _this.checkArrayOrJson(data);
            }
            return html;
        };
        MultiMode.prototype.init = function () {
            options.beforeInit && options.beforeInit();
            $this.addClass(options._class).removeClass(options.removeClass).html(this.buildHtml());
            options.afterInit && options.afterInit();
        };
        var exe = new MultiMode();
        exe.init();
    }
});