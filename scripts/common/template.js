/**
 * Created by sq on 2016/4/11.
 * ²Î¿¼https://gist.github.com/barretlee/7765698
 */
function tplEngine(str, data){
    var reg = /<%(^\})%>/g,
        regOut = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g,
        code = 'var str = [];\n',
        cursor = 0;
    var add = function(line, js){
        js ? (code += line.match(regOut) ? line + "\n" : 'str.push(' + line + ');\n') : (code += line != '' ? 'str.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
        return add;
    };

    while(match = reg.exec(tpl)){
        add(tpl.slice(cursor, match.index))(match[1], true);
        cursor = match.index + match[0].length;
    }

    add(tpl.substr(cursor, tpl.length - cursor));
    code += 'return str.join("");';
    console.log(code);
    return new Function(code.replace(/\r\t\n/g, '')).apply(data);
}
/*
(function($){
    $.fn.templateEN = function(){
        function TemplateEN(tpl, data){
            this.tpl = tpl;
            this.data = data;
        }

        TemplateEN.prototype.tplEngine = function(){
            var tpl = this.tpl,
                data  = this.data;

        }

    }
})(jQuery);*/
