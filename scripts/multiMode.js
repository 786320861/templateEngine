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
        //返回一个拼接好的html片段
        MultiMode.prototype.innerListOp = function (data, template) {
            var code = "var r = []; \n",
                html = "";
            var reg = /\{([^\}]+)?\}/g,
                match = null,
                cursor = 0, i = 0;
            template = template.replace(/\"/g,"'");
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
            if (/\{#list(\s+\w*)\}/.exec(template)) {
                var innerMatch = /\{#list(\s+\w*)\}/.exec(template),
                    innerEnd = template.lastIndexOf("{#/list}"),
                    innerTemp = template.substring(innerMatch.index, innerEnd + 8),
                    filed = $.trim(innerMatch[1]);
                html = this.splitTemplate(innerTemp, data, filed);
                template = template.substring(0,innerMatch.index) + html.replace(/\n|\r|\t/g,"") + template.substring(innerEnd+8);  //改变模板
            }
            while (match = reg.exec(template)) {
                //console.log(template);
                var m1 = match[1];
                var regOther = /^#[if|else|\/if]+/;
                var match0 = match[0],
                    match1 = m1.substring(1);
                code += "r.push(\"" + template.substring(cursor, match.index).replace(/"/g, "'") + "\");\n";
                var mJudge = m1.match(regOther);
                if (mJudge) {
                    var switchReg = $.trim(mJudge[0]).substring(1);
                    switch (switchReg) {
                        case "if":
                            code += ifCase(match1) + "{\n";
                            break;
                        case "/if":
                            code += "\n}";
                            break;
                        case "else":
                            code += ("\n}" + match1 + "{\n");
                            break;
                        case "elseif":
                            code += ifCase(match1);
                            code += "{\n";
                    }
                } else if (m1 == "this") {
                   // console.log(data);
                    code += "r.push(\"" + data + "\");\n";
                } else {
                    code += "r.push(\"" + data[m1] + "\");";
                }
                cursor = match.index + match0.length;
            }
            code += "r.push(\"" + template.substring(cursor).replace(/"/g, "'") + "\");\n";
            code += "return r.join(\"\");\n";
            var fun = new Function(code);
            html = fun();
            return html;
        };
        //假设进来的模板都是#list和#/list成对出现的，返回的是一个html字符串片段
        MultiMode.prototype.checkHorizontalList = function(template, data){
            var code = "";
            var regList = /(\{#list(\s+\w*)\}|\{#list\})[^#]+\{\#\/list}/g;
            var match, i= 0, cursor = 0;
            while(match = regList.exec(template)){
                var startIndex = match.index;
                code += template.substring(cursor, startIndex);
                cursor = startIndex + match[0].length;
                code += this.innerListOp(data,match[0]);
            }
            return code;
        };
        MultiMode.prototype.concatHtml = function(tpl, data, filed){
            var code = "", str ="";
            if(filed){
                filed = $.trim(filed);
                data = data[filed];
            }
            if(data instanceof Array){
                for (var i = 0; i < data.length; i++) {
                    var di = data[i];
                    str = this.innerListOp(di, tpl);
                    code += str + "\n";
                }
            }else{
                str = this.innerListOp(data, tpl);
                code += str + "\n";
            }
            return code;
        };
        //判断是否有list循环操作
        MultiMode.prototype.splitTemplate = function (template, data, filed) {
            var regList = /\{#list(\s+\w*)\}|\{#list\}/g,
                startMatch = null,
                code = '', str = '',_this = this;
            startMatch = regList.exec(template);
            var lastMatchIndex = template.lastIndexOf("{#/list}");
            var innerTemp = startMatch ? template.substring(startMatch.index + startMatch[0].length, lastMatchIndex) : template;
            code += template.substring(0, startMatch.index);
            //判断中间是否有{#list}
            if(innerTemp.indexOf("{#list")>=0){
                var innerMatch = regList.exec(innerTemp),
                    innerEndIndex = innerTemp.indexOf("{#/list}");
                //并列的循环
                if(innerMatch.index > innerEndIndex){
                    innerTemp = startMatch[0] + innerTemp + "{#/list}";
                    code += _this.checkHorizontalList(innerTemp, data, innerMatch, innerEndIndex);
                }else{
                    code +=  _this.concatHtml(innerTemp, data,filed);
                }
            }else{
                if(filed){
                    data = data[filed];
                }
                code += _this.concatHtml(innerTemp,data);
            }
            code += _this.innerListOp(data, template.substring(lastMatchIndex+8));
            return code;
        };
        MultiMode.prototype.checkArrayOrJson = function (data) {
            var html = '';
            html = this.splitTemplate(options.template, options.data);
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