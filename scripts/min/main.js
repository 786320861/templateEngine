require.config({
    baseUrl: '../scripts',
    paths: {
        "jquery": "http://www.hzfanews.com/v2/js/jquery-1.10.2.min",
        "dropdown": "./common/dropdown",
        "multimode": "./multiMode"
    },
    shim: {
        "dropdown": {
            "deps": ['jquery'],
            "exports": './common/dropdown'
        }/*,
        "multimode": {
            "deps": ['jquery'],
            "exports": "./multiMode"
        }*/
    }
});
require(["jquery","dropdown", "multimode"], function($, dropdown){
    //$("#showDropdown").dropdown();
   /* var template = '<div class="list-group-item fn-list-news-box waves-effect waves-custom nt">'+
        '<div class="fn-newsList-bayI clearfix fn-title-container">'+
        '<div class="fn-news-pic pull-right">'+
        '<img src="../image/test.jpg" alt="图片没找到">'+
        '</div>'+
        '<div class="fn-newsTitle-top">'+
        '<h4 class="fn-newsTitle">'+
        '{#if ({viocesize}==1)}'+
        '<span class="label label-success fn-inlineBlock">原创</span>'+
        '{#else}'+
        '<span class="label label-default fn-inlineBlock">转载</span>'+
        '{/if}'+
        '<span>{title}</span>'+
        '</h4>'+
        '<p class="fn-newsTitle-markInfo">{markinfo}</p>'+
    '</div>'+
    '</div>'+
    '<div class="fn-newsList-bayII">'+
        '<div class="fn-newspaper-source">'+
        '<i class="fa fa-globe text-info"></i>'+
        '<span>{papername}</span>'+
    '</div>'+
    '<div class="fn-newsOtherDetails fn-relative">'+
        '<span class="fn-timeago">3个小时前</span>'+
    '<div class="fn-newsTimes fn-absolute">'+
        '<p class="fn-newsPubTime"><i class="fa fa-clock-o"></i>{*str("{createtime}",19)}</p>'+
    '<p class="fn-newsFnTime"><i class="fa fa-clock-o"></i>{*str("{updatetime}",19)}</p>'+
    '</div>'+
    '<ul class="fn-links pull-right fn-clearUl">'+
        '<li title="查看相似文章" class="fn-similarNewsII text-muted"><i class="fa fa-search fa-lg"></i></li>'+
    '<li title="追溯原创文章" class="fn-originalNewsII text-muted"><i class="fa fa-paper-plane-o fa-lg"></i></li>'+
    '<li title="发现" class="fn-found text-muted"><i class="fa fa-external-link fa-lg"></i></li>'+
    '<li title="收藏" class="fn-collection text-muted"><i class="fa fa-star-o fa-lg"></i></li>'+
    '</ul>'+
    '</div>'+
    '</div>'+
    '</div>';*/
    var template = '{#list}' +
        '<div class="list-group-item fn-list-news-box waves-effect waves-custom nt">'+
        '<div class="fn-newsList-bayI clearfix fn-title-container">'+
        '<div class="fn-news-pic pull-right">'+
        '<img src="../image/test.jpg" alt="图片没找到">'+
        '</div>'+
        '<div class="fn-newsTitle-top">'+
        '<h4 class="fn-newsTitle">'+
        '{#if (viocesize==1)}'+
        '<span class="label label-success fn-inlineBlock">原创</span>'+
        '{#else}'+
        '<span class="label label-default fn-inlineBlock">转载</span>'+
        '{#/if}'+
        '<span>{title}</span>'+
        '</h4>'+
        '<p class="fn-newsTitle-markInfo">{markinfo}</p>'+
        '</div>'+
        '</div>'+
        '<div class="fn-newsList-bayII">'+
        '<div class="fn-newspaper-source">'+
        '<i class="fa fa-globe text-info"></i>'+
        '<span>{papername}</span>'+
        '</div>'+
        '<div class="fn-newsOtherDetails fn-relative">'+
        '<span class="fn-timeago">3个小时前</span>'+
        '<div class="fn-newsTimes fn-absolute">'+
        '<p class="fn-newsPubTime"><i class="fa fa-clock-o"></i>{createtime}</p>'+
        '<p class="fn-newsFnTime"><i class="fa fa-clock-o"></i>{updatetime}</p>'+
        '</div>'+
        '<ul class="fn-links pull-right fn-clearUl">'+
        '<li title="查看相似文章" class="fn-similarNewsII text-muted"><i class="fa fa-search fa-lg"></i></li>'+
        '<li title="追溯原创文章" class="fn-originalNewsII text-muted"><i class="fa fa-paper-plane-o fa-lg"></i></li>'+
        '<li title="发现" class="fn-found text-muted"><i class="fa fa-external-link fa-lg"></i></li>'+
        '<li title="收藏" class="fn-collection text-muted"><i class="fa fa-star-o fa-lg"></i></li>'+
        '</ul>'+
        '</div>'+
        '</div>'+
        '</div>' +
        '{#/list}'; /*'{#list}' +*/<!--{#/list}-->
    var template2 = '<div class="fn-news">{*ifExist({flag}, \'<small class="label label-warning">预测</small>\')}<span>{title}</span></div>';
    var data = [
        {
            "region": "",
            "viocesize": 10,
            "same_id": "",
            "updatetime": "2016-04-08 09:58:59.350",
            "paperno": "",
            "markinfo": "中新网4月8日电。内蒙古通辽市中级人民法院昨日通过其官方微博证实，2016年4月6日7时许，该院刑事审判一庭庭长米建军在市中级法院审判大楼坠楼，当场死亡。",
            "keyword": "通辽市,建军,中级,副院长,胜利",
            "articlesequenceid": "262300000001802948",
            "flag": 1,
            "samecount": 31,
            "hotcreatetime": "2016-04-08 12:16:10",
            "keywordold": "[米建军, 自杀, 死亡, 短信, 通辽市, 人民法院, 调查, 披露, 抑郁, 法院]\n",
            "class": "社会,政治",
            "class1": "",
            "class2": "",
            "sameid3": "",
            "articletype": "website",
            "url": "http://www.chinanews.com/sh/2016/04-08/7827219.shtml",
            "imagesource": "http://fwimage.cnfanews.com/websiteimg/2016/20160408/38990/u608p4t47d34722f967dt20160408095643.jpg,172140%D%W",
            "createtime": "2016-04-08 10:16:51.620",
            "revision": "即时新闻",
            "title": "内蒙古一法院庭长疑因抑郁坠亡 曾给领导发自杀短信",
            "editor": "",
            "page": "中国新闻网",
            "paperdate": 20160408,
            "subtitle": "",
            "paperid": 38990,
            "papername": "中国新闻网-滚动新闻"
        },
        {
            "region": "",
            "viocesize": 1,
            "same_id": "",
            "updatetime": "2016-04-08 03:47:39.577",
            "paperno": "",
            "markinfo": "中债资信评估有限责任公司主权评级团队负责人。所谓主权债务评级，是信用评级机构对一国政府作为债务人履行偿债责任的信用意愿与信用能力的评判。",
            "keyword": "评级机构,评级,主权,信心",
            "articlesequenceid": "262300000001700041",
            "flag": 0,
            "samecount": 37,
            "hotcreatetime": "2016-04-08 12:06:10",
            "keywordold": "[评级, 经济, 中国, 机构, 市场, 主权, 信用, 发展, 金融, 存在]\n",
            "class": "经济,房产",
            "class1": "",
            "class2": "",
            "sameid3": "",
            "articletype": "website",
            "url": "http://www.ce.cn/xwzx/gnsz/gdxw/201604/08/t20160408_10244879.shtml",
            "imagesource": "",
            "createtime": "2016-04-08 04:12:39.880",
            "revision": "时事政治",
            "title": "淡定看待评级 坚定向好信心",
            "editor": "",
            "page": "中国经济网—《经济日报》",
            "paperdate": 20160408,
            "subtitle": "",
            "paperid": 20011878,
            "papername": "中国经济网-时政社会-滚动新闻"
        },
        {
            "region": "",
            "viocesize": 1,
            "same_id": "",
            "updatetime": "2016-04-07 06:19:49.030",
            "paperno": "",
            "markinfo": "从小到大姐姐什么都让着妹妹姐姐热恋海归男。农芝核心提示“那些美好的曾经，永远回不去了……”经历了一段感情之殇，周女士经常如此感叹道。",
            "keyword": "夺爱,热恋,出人意料,海归,结局,不料,妹妹,姐姐",
            "articlesequenceid": "262300000001424410",
            "flag": 1,
            "samecount": 34,
            "hotcreatetime": "2016-04-08 12:01:14",
            "keywordold": "[妹妹, 女士, 章先生, 父母, 周女士, 男友, 姐姐, 回家, 家里, 行为]\n",
            "class": "娱乐,社会",
            "class1": "",
            "class2": "",
            "sameid3": "",
            "articletype": "website",
            "url": "http://news.gxnews.com.cn/staticpages/20160407/newgx57058b55-14699867.shtml",
            "imagesource": "http://fwimage.cnfanews.com/websiteimg/2016/20160407/43104/420793e7a74b458d9913a501073bb3ec.jpg,77850%D%W",
            "createtime": "2016-04-07 09:03:51.533",
            "revision": "社会法制",
            "title": "姐姐热恋海归男不料妹妹来夺爱 3人结局出人意料",
            "editor": "",
            "page": "广西新闻网-当代生活报",
            "paperdate": 20160407,
            "subtitle": "",
            "paperid": 43104,
            "papername": "广西新闻网-新闻-广西社会·法制"
        },
        {
            "region": "",
            "viocesize": 1,
            "same_id": "",
            "updatetime": "2016-04-07 05:09:52.483",
            "paperno": "",
            "markinfo": "□通讯员　宁公宣　金陵晚报记者　徐宁　　短短1分钟的时间内，南京一女子竟然被骗走了334万元。　　随后，南京警方先后辗转广东、福建、深圳、北京等省市，摧毁了一个冒用他人身份信息办理",
            "keyword": "提现,冻结,江宁,被骗,专案组,邮件,团伙,转账",
            "articlesequenceid": "2016040718661000025",
            "flag": 1,
            "samecount": 42,
            "hotcreatetime": "2016-04-08 12:01:12",
            "keywordold": "[诈骗, 银行, 女士, 网络, 南京, 警方, 网站, 专案组, 立即, 银行卡]\n",
            "class": "社会,经济",
            "class1": "",
            "class2": "",
            "sameid3": "",
            "articletype": "0",
            "url": "http://jlwb.njnews.cn/jlwb/html/2016-04/07/content_36454.htm",
            "imagesource": "l_36454_A04J20160407C_2.jpg,10527%D%Wl_36454_A04J20160407C_1.jpg,10372%D%W",
            "createtime": "2016-04-07 05:09:52.483",
            "revision": "A04",
            "title": "南京一女子1分钟内被骗走334万",
            "editor": "",
            "page": "重点新闻",
            "paperdate": 20160407,
            "subtitle": "这些钱流入18个账户　警方成功挽回260余万元",
            "paperid": 1866,
            "papername": "金陵晚报"
        }
    ];
    $("#fn-newsList").multiMode({
        "template": template,
        "data": data
    });
});