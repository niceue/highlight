/*! highlight.js 0.1.0
 * (c) 2012-2013 Jony Zhang <zj86@live.cn>, MIT Licensed
 * https://github.com/niceue/highlight.js/
 */
(function(win){
    var ltIE8 = !document.querySelector,
        ruleSet = {};

    function highlight(text, lang){
        switch (typeof text) {
        case 'undefined':
        case 'object':
            highlightElements(text || document);
            break;
        case 'string':
            return parse(text, lang);
        }
    }

    //添加高亮语法
    highlight.add = function(lang, rules) {
        var exp, rule;

        ruleSet[lang] = [];
        ruleSet[lang].toString = joinExp;

        for (var className in rules) {
            rule = rules[className];
            exp = (typeof rule.exp !== "string") ? String(rule.exp).substr(1, String(rule.exp).length-2) : rule.exp;

            ruleSet[lang].push({
                className : className,
                exp : "(" + exp + ")",
                length : (exp.match(/(^|[^\\])\([^?]/g) || "").length + 1, // number of subexps in rule
                replacement : rule.replacement || null
            });
        }
    };

    function highlightElements(dom) {
        if (!dom.getElementsByTagName) return;
        var langRe = /\s?lang-([a-z]+)\s?/;
        loopEls(dom.getElementsByTagName("pre"));
        loopEls(dom.getElementsByTagName("code"));
        function loopEls(els){
            var el, lang;
            for (var i = 0; i < els.length; i++) {
                el = els[i];
                if (!el.className || el.getAttribute('data-highlight')) continue;
                lang = langRe.exec(el.className);
                if (!lang) continue;
                lang = lang[1];
                el.innerHTML = parse(el.innerHTML, lang);
                el.setAttribute('data-highlight', 1);
            }
        }
    }

    function joinExp() {
        var exps = [];
        for (var i = 0; i < this.length; i++) exps.push(this[i].exp);
        return exps.join("|");
    }

    function parse(text, lang) {
        var rules, parsed, arr, nums = '';

        lang = lang || 'js';
        rules = ruleSet[lang];
        parsed = text.replace(/\r?\n$/, '').replace(new RegExp(rules, "g"), function() {
            var i = 0, j = 1, rule;
            while (rule = rules[i++]) {
                if (arguments[j]) {
                    // if no custom replacement defined do the simple replacement
                    if (!rule.replacement) return '<span class="' + rule.className + '">' + arguments[0] + '</span>';
                    else {
                        // replace $0 with the className then do normal replaces
                        var str = rule.replacement.replace("$0", rule.className);
                        for (var k = 1; k <= rule.length - 1; k++) str = str.replace("$" + k, arguments[j + k]);
                        
                        return str;
                    }
                } else j+= rule.length;
            }
        });

        arr = parsed.split(/\r?\n/);
        
        parsed = '<div>' + arr.join('</div><div>')+'</div>';
        if (ltIE8) parsed = parsed.replace(/\s{4}|\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
        
        for (var i=1; i<=arr.length; i++) {
            nums += '<span>'+ i +'</span>';
        }
        parsed = '<div class="code-wrap"><table><tr><td class="line-nums">'+ nums +'</td><td class="line-code">'+ parsed +'</td></tr></table></div>';
        return parsed;
    }

    win.highlight = highlight;
})(this);


highlight.add("html", {
    comment : {
        exp: /&lt;!\s*(--([^\-]|[\r\n]|-[^\-])*--\s*)&gt;/
    },
    tag : {
        exp: /(&lt;\/?)([a-zA-Z]+\s?)/,
        replacement: "$1<span class=\"$0\">$2</span>"
    },
    string : {
        exp  : /'[^']*'|"[^"]*"/
    },
    attribute : {
        exp: /\b([a-zA-Z\-:]+)(=)/,
        replacement: "<span class=\"$0\">$1</span>$2"
    },
    data: {
        exp: /\s(data-[a-zA-z\-]+)/
    },
    doctype : {
        exp: /&lt;!DOCTYPE([^&]|&[^g]|&g[^t])*&gt;/
    }
});
highlight.add("js",{
    comment : {
        exp  : /(\/\/[^\n]*(\n|$))|(\/\*[^*]*\*+([^\/][^*]*\*+)*\/)/
    },
    string : {
        exp  : /'[^'\\]*(\\.[^'\\]*)*'|"[^"\\]*(\\.[^"\\]*)*"/
    },
    number: {
        exp  : /([^"'][+\-]?)(\d+)([^"'])/,
        replacement: "$1<span class=\"$0\">$2</span>$3"
    },
    regex: {
        exp  : /(\/[^\/].+\/)(?=[;,\s\n])/
    },
    keywords : {
        exp  : /\b(arguments|break|case|continue|default|delete|do|else|false|for|function|if|in|instanceof|new|null|return|switch|this|true|typeof|var|void|while|with)\b/
    },
    global : {
        exp  : /\b(toString|valueOf|window|element|prototype|constructor|document|escape|unescape|parseInt|parseFloat|setTimeout|clearTimeout|setInterval|clearInterval|NaN|isNaN|Infinity)\b/
    }
});
highlight.add("css", {
    comment : {
        exp  : /\/\*[^*]*\*+([^\/][^*]*\*+)*\//
    },
    keywords : {
        exp  : /@\w[\w\s]*/
    },
    selectors : {
        exp  : "([\\w-:\\[.#][^{};>]*)(?={)"
    },
    properties : {
        exp  : "([\\w-]+)(?=\\s*:)"
    },
    units : {
        exp  : /([0-9])(px|em|en|%|pt|rem)\b/,
        replacement : "$1<span class=\"$0\">$2</span>"
    },
    colors: {
        exp: /#[A-Za-z0-9]{3,6}/
    },
    urls : {
        exp  : /url\(([^\)]*)\)/,
        replacement : "url(<span class=\"$0\">$1</span>)"
    },
    important: {
        exp: /!important/
    }
 });