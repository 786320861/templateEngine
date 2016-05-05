/**
 * Created by sq on 2016/4/7.
 * 支持list if语句，不支持嵌套使用
 * list语句传入的是array 对象，其他的传入的是obj对象
 */
(function ($) {
    $.extend({
        multiMode: function(options){
            var _default = {
                "template": "",       //必须传进去               "_class": "",         //默认为fn+mode
                "removeClass": "",    //需要移除的class
                "data": [],           //解析的数据�?                "beforeInit": null,
                "afterInit": null
            };
            options = $.extend({}, _default, options);
            //var $con = options.$con;
            function MultiMode() {
                this.options = options;
                this.$con = this.options.$con;
            }
            //返回一个拼接好的html片段
            MultiMode.prototype.innerListOp = function (data, template) {
                var code = "var r = []; \n",
                    html = "";
                var reg = /\{([^\}]+)?\}/g,
                    match = null,
                    cursor = 0, i = 0;
                template = template.replace(/\"/g,"'");
                //当时if或者elseif时， tag-true: if  tag-false: true
                function ifCase(str, tag) {
                    var regInner = /\((.+)\)/g, matchInner = null;
                    if(matchInner = regInner.exec(str)){
                        var ss = matchInner[1];
                        var regIf = /[a-zA-Z]\w*/g,
                            matchIf = null;
                        while(matchIf = regIf.exec(ss)){
                            var ssIf = matchIf[0];
                            //看一下是不是穿进去一个字符串
                            var ii = str.indexOf(ssIf);
                            if(str.substring(ii-1, ii) !== '"'){   //排除字符串的情况
                                if(data[ssIf] !== undefined){
                                    if(typeof data[ssIf] === "number"){
                                        str = str.replace(ssIf, data[ssIf]);
                                    }else{
                                        str = str.replace(ssIf, "\""+data[ssIf]+"\"");
                                    }
                                }else{
                                    str = str.replace(ssIf, undefined);
                                }
                            }
                        }
                    }else{
                        console.log("判断条件必须包含在(英文括号)里面");
                    }
                    if (!tag) {
                        str = str.replace("elseif", "}else if");
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
                                code += ifCase(match1, true) + "{\n";
                                break;
                            case "/if":
                                code += "\n}";
                                break;
                            case "else":
                                code += ("\n}" + match1 + "{\n");
                                break;
                            case "elseif":
                                code += ifCase(match1, false);
                                code += "{\n";
                        }
                    } else if (m1 == "this") {
                        // console.log(data);
                        code += "r.push(\"" + data + "\");\n";
                    } else {
                        var quatMatch = null;
                        if (data[m1] !== undefined) {
                            if (typeof data[m1] === "string") {     //检测是否是字符串，非字符串没有match方法，会报错
                                if (quatMatch = data[m1].match(/"\w*"|"[\u4E00-\u9FA5\uf900-\ufa2d]+"/g)) {
                                    code += "r.push(\"" + data[m1].replace(/"\w*"|"[\u4E00-\u9FA5\uf900-\ufa2d]+"/g, function (mm) {
                                        return "“" + mm.replace(/"/g, "").replace(/\t|\n|\r/g, " ") + "”";
                                    }) + "\");";
                                } else {
                                    code += "r.push(\"" + data[m1].replace(/\t|\n|\r/g, " ").replace(/"/g,"'").replace(/\\/g, "") + "\");";
                                }
                            } else {
                                code += "r.push(\"" + data[m1] + "\");";
                            }                            
                        }
                    }
                    cursor = match.index + match0.length;
                }
                code += "r.push(\"" + template.substring(cursor).replace(/"/g, "\'") + "\");\n";
                code += "return r.join(\"\");\n";
                var fun = new Function(code);
                html = fun();
                return html;
            };
            //假设进来的模板都{#list}{#/list}成对出现的，返回的是一个html字符串片段
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
                if((data instanceof Array)){
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
                code += _this.innerListOp(data,template.substring(0, startMatch.index));
                //判断中间是否有{#list}
                if(innerTemp.indexOf("{#list")>=0){
                    var innerMatch = regList.exec(innerTemp),
                        innerEndIndex = innerTemp.indexOf("{#/list}");
                    //并列的循环
                    if(innerMatch.index > innerEndIndex){
                        innerTemp = startMatch[0] + innerTemp + "{#/list}";
                        code += _this.checkHorizontalList(innerTemp, data, innerMatch, innerEndIndex);
                    }else{
                        code +=  _this.concatHtml(innerTemp, data, filed);
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
                html = this.splitTemplate(this.options.template, data);
                return html;
            };
            MultiMode.prototype.buildHtml = function (dd) {
                var data = dd || this.options.data,
                    html = "",
                    _this = this;
                if (data instanceof Object) {
                    if((data instanceof Array) && !data.length){
                        html = "";
                    }else{
                        html = _this.checkArrayOrJson(data);
                    }
                } else if (typeof data == "string") {
                    data = JSON.parse(data);
                    html = _this.checkArrayOrJson(data);
                }
                return html;
            };
            MultiMode.prototype.init = function () {
                this.options.beforeInit && this.options.beforeInit();
                this.$con.addClass(this.options._class).removeClass(this.options.removeClass).html(this.buildHtml());
                this.options.afterInit && this.options.afterInit();
            };
            MultiMode.prototype.append = function(data){
                this.$con.append(this.buildHtml(data));
            };
            MultiMode.prototype.prepend = function(data){
                this.$con.prepend(this.buildHtml(data));
            };
            return (new MultiMode());
        }
    });
})(jQuery);