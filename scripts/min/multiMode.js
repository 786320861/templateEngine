/**
 * Created by sq on 2016/4/7.
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
        MultiMode.prototype.conditions = function(data, str, tag, pos){
            var code = "",
                regFun = /^#[if|else|list|\/if|\/list]+/,
                regFun2 = /[if|else|list|\/if|\/list]+/,
                _this = this;
            if (tag) {
                if (regFun.test(str)) {
                    str = str.substring(1);
                    switch (str.match(regFun2)[0]) {
                        case "if":
                            var ifReg = /\([^\)]+\)/;
                            var d = str.match(ifReg)[0];
                            d = d.replace(/\(|\)/g, "");
                            if(d.indexOf("==")>=0|| d.indexOf("===")>=0){
                                var arr = null,
                                    connector ="",s = '';
                                if(d.indexOf("===")>=0){
                                    arr = d.split("===");
                                    connector = "===";
                                }else{
                                    arr = d.split("==");
                                    connector = "==";
                                }
                                for(var i=0; i<arr.length;i++){
                                    var ai = arr[i];
                                    if(data[ai]){
                                        arr[i] = data[ai];
                                    }
                                }
                                str = "if("+arr[0]+ connector + arr[1]+")";
                            }else{
                                str = str.replace(ifReg, "("+data[d]+")");
                            }
                            code += str + "{";
                            break;
                        case "/if":
                            code += "}";
                            break;
                        case "else":
                            code += ("}" + str + "{");
                            break;
                        case "list":
                            var d = str.replace(/\s+/g, " ").split(" ")[1];
                            //code += "for(var i=0; i<data.length; i++){";
                            for(var i = 0;i<data.length;i++){
                                var di = data[i];
                                code += _this.replaceStr(di, pos);
                            }
                            break;
                        case "/list":
                            code += "}";
                            break;
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
        MultiMode.prototype.replaceStr = function (data, pos) {
            pos = pos ? pos : 0;
            var template = options.template.substring(pos);
           // console.log(template);
            var _this = this;
            var reg = /\{([^\}]+)?\}/g,
                match = null,
                cursor = 0, code = "";

            while (match = reg.exec(template)) {
                pos = match.index + match[0].length;
                code += this.conditions(data,template.slice(cursor, match.index));
                code += this.conditions(data,match[1], true, pos);
                cursor = match.index + match[0].length;
            }
            code += this.conditions(data,template.substr(cursor, template.length - cursor));
            this.code += code;
            console.log(this.code);
        };
        MultiMode.prototype.checkArrayOrJson = function (data) {
            var html = '', fun = null;
            if ($.isArray(data) && data.length) {
                var len = data.length,
                    di = null;
                this.replaceStr(data);
                this.code += 'return r.join("")';
                fun = new Function(this.code.replace(/\n\r\t/g, ""));
                html = fun();
                //console.log(html);
                /*for (var i = 0; i < len; i++) {
                    di = data[i];
                    this.replaceStr(di);
                    fun = new Function(this.code.replace(/\n\r\t/g, ""));
                    html += fun();
                    this.code = "var r = []; \n;"
                }*/
            } else {
                html += this.replaceStr(data);
            }
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