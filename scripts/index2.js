require.config({
    baseUrl: '../scripts',
    paths: {
        "jquery": "http://www.hzfanews.com/v2/js/jquery-1.10.2.min",
        "dropdown": "./common/dropdown",
        "template": "./common/template"
    },
    shim: {
        "dropdown": {
            "deps": ['jquery'],
            "exports": './common/dropdown'
        }
    }
});
require(["jquery","dropdown", "template"], function($, dropdown){
    //$("#showDropdown").dropdown();
    var template = '<div class="list-group-item fn-list-news-box waves-effect waves-custom nt">'+
        '<span class="fa fa-square-o fn-checkbox"></span><div class="fn-newsList-bayI clearfix fn-title-container">'+
        '<div class="fn-news-pic pull-right">'+
        '<img src="../image/test.jpg" alt="ͼƬû�ҵ�">'+
        '</div>'+
        '<div class="fn-newsTitle-top">'+
        '<h4 class="fn-newsTitle">'+
        '<% if ({viocesize}==1){ %>'+
        '<span class="label label-success fn-inlineBlock">ԭ��</span>'+
        '<% }/if %>{#else}'+
        '<span class="label label-default fn-inlineBlock">ת��</span>'+
        '{/if}'+
        '<span><%title%></span>'+
        '</h4>'+
        '<p class="fn-newsTitle-markInfo"><%markinfo%></p>'+
        '</div>'+
        '</div>'+
        '<div class="fn-newsList-bayII">'+
        '<div class="fn-newspaper-source">'+
        '<i class="fa fa-globe text-info"></i>'+
        '<span><%papername%></span>'+
        '</div>'+
        '<div class="fn-newsOtherDetails fn-relative">'+
        '<span class="fn-timeago">3��Сʱǰ</span>'+
        '<div class="fn-newsTimes fn-absolute">'+
        '<p class="fn-newsPubTime"><i class="fa fa-clock-o"></i><%createtime%></p>'+
        '<p class="fn-newsFnTime"><i class="fa fa-clock-o"></i><%updatetime%><p>'+
        '</div>'+
        '<ul class="fn-links pull-right fn-clearUl">'+
        '<li title="�鿴��������" class="fn-similarNewsII text-muted"><i class="fa fa-search fa-lg"></i></li>'+
        '<li title="׷��ԭ������" class="fn-originalNewsII text-muted"><i class="fa fa-paper-plane-o fa-lg"></i></li>'+
        '<li title="����" class="fn-found text-muted"><i class="fa fa-external-link fa-lg"></i></li>'+
        '<li title="�ղ�" class="fn-collection text-muted"><i class="fa fa-star-o fa-lg"></i></li>'+
        '</ul>'+
        '</div>'+
        '</div>'+
        '</div>';
    var template2 = '<div class="fn-news">{*ifExist({flag}, \'<small class="label label-warning">Ԥ��</small>\')}<span>{title}</span></div>';
    var data = [
        {
            "region": "",
            "viocesize": 10,
            "same_id": "",
            "updatetime": "2016-04-08 09:58:59.350",
            "paperno": "",
            "markinfo": "������4��8�յ硣���ɹ�ͨ�����м�����Ժ����ͨ����ٷ�΢��֤ʵ��2016��4��6��7ʱ����Ժ��������һͥͥ���׽��������м���Ժ���д�¥׹¥������������",
            "keyword": "ͨ����,����,�м�,��Ժ��,ʤ��",
            "articlesequenceid": "262300000001802948",
            "flag": 1,
            "samecount": 31,
            "hotcreatetime": "2016-04-08 12:16:10",
            "keywordold": "[�׽���, ��ɱ, ����, ����, ͨ����, ����Ժ, ����, ��¶, ����, ��Ժ]\n",
            "class": "���,����",
            "class1": "",
            "class2": "",
            "sameid3": "",
            "articletype": "website",
            "url": "http://www.chinanews.com/sh/2016/04-08/7827219.shtml",
            "imagesource": "http://fwimage.cnfanews.com/websiteimg/2016/20160408/38990/u608p4t47d34722f967dt20160408095643.jpg,172140%D%W",
            "createtime": "2016-04-08 10:16:51.620",
            "revision": "��ʱ����",
            "title": "���ɹ�һ��Ժͥ����������׹�� �����쵼����ɱ����",
            "editor": "",
            "page": "�й�������",
            "paperdate": 20160408,
            "subtitle": "",
            "paperid": 38990,
            "papername": "�й�������-��������"
        },
        {
            "region": "",
            "viocesize": 1,
            "same_id": "",
            "updatetime": "2016-04-08 03:47:39.577",
            "paperno": "",
            "markinfo": "��ծ���������������ι�˾��Ȩ�����ŶӸ����ˡ���ν��Ȩծ������������������������һ��������Ϊծ�������г�ծ���ε�������Ը���������������С�",
            "keyword": "��������,����,��Ȩ,����",
            "articlesequenceid": "262300000001700041",
            "flag": 0,
            "samecount": 37,
            "hotcreatetime": "2016-04-08 12:06:10",
            "keywordold": "[����, ����, �й�, ����, �г�, ��Ȩ, ����, ��չ, ����, ����]\n",
            "class": "����,����",
            "class1": "",
            "class2": "",
            "sameid3": "",
            "articletype": "website",
            "url": "http://www.ce.cn/xwzx/gnsz/gdxw/201604/08/t20160408_10244879.shtml",
            "imagesource": "",
            "createtime": "2016-04-08 04:12:39.880",
            "revision": "ʱ������",
            "title": "������������ �ᶨ�������",
            "editor": "",
            "page": "�й����������������ձ���",
            "paperdate": 20160408,
            "subtitle": "",
            "paperid": 20011878,
            "papername": "�й�������-ʱ�����-��������"
        },
        {
            "region": "",
            "viocesize": 1,
            "same_id": "",
            "updatetime": "2016-04-07 06:19:49.030",
            "paperno": "",
            "markinfo": "��С������ʲô���������ý�����������С�ũ֥������ʾ����Щ���õ���������Զ�ز�ȥ�ˡ�����������һ�θ���֮�䣬��Ůʿ������˸�̾����",
            "keyword": "�ᰮ,����,��������,����,���,����,����,���",
            "articlesequenceid": "262300000001424410",
            "flag": 1,
            "samecount": 34,
            "hotcreatetime": "2016-04-08 12:01:14",
            "keywordold": "[����, Ůʿ, ������, ��ĸ, ��Ůʿ, ����, ���, �ؼ�, ����, ��Ϊ]\n",
            "class": "����,���",
            "class1": "",
            "class2": "",
            "sameid3": "",
            "articletype": "website",
            "url": "http://news.gxnews.com.cn/staticpages/20160407/newgx57058b55-14699867.shtml",
            "imagesource": "http://fwimage.cnfanews.com/websiteimg/2016/20160407/43104/420793e7a74b458d9913a501073bb3ec.jpg,77850%D%W",
            "createtime": "2016-04-07 09:03:51.533",
            "revision": "��ᷨ��",
            "title": "������������в����������ᰮ 3�˽�ֳ�������",
            "editor": "",
            "page": "����������-�������",
            "paperdate": 20160407,
            "subtitle": "",
            "paperid": 43104,
            "papername": "����������-����-������ᡤ����"
        },
        {
            "region": "",
            "viocesize": 1,
            "same_id": "",
            "updatetime": "2016-04-07 05:09:52.483",
            "paperno": "",
            "markinfo": "��ͨѶԱ�������������������ߡ����������̶�1���ӵ�ʱ���ڣ��Ͼ�һŮ�Ӿ�Ȼ��ƭ����334��Ԫ����������Ͼ������Ⱥ�շת�㶫�����������ڡ�������ʡ�У��ݻ���һ��ð�����������Ϣ����",
            "keyword": "����,����,����,��ƭ,ר����,�ʼ�,�Ż�,ת��",
            "articlesequenceid": "2016040718661000025",
            "flag": 1,
            "samecount": 42,
            "hotcreatetime": "2016-04-08 12:01:12",
            "keywordold": "[թƭ, ����, Ůʿ, ����, �Ͼ�, ����, ��վ, ר����, ����, ���п�]\n",
            "class": "���,����",
            "class1": "",
            "class2": "",
            "sameid3": "",
            "articletype": "0",
            "url": "http://jlwb.njnews.cn/jlwb/html/2016-04/07/content_36454.htm",
            "imagesource": "l_36454_A04J20160407C_2.jpg,10527%D%Wl_36454_A04J20160407C_1.jpg,10372%D%W",
            "createtime": "2016-04-07 05:09:52.483",
            "revision": "A04",
            "title": "�Ͼ�һŮ��1�����ڱ�ƭ��334��",
            "editor": "",
            "page": "�ص�����",
            "paperdate": 20160407,
            "subtitle": "��ЩǮ����18���˻��������ɹ����260����Ԫ",
            "paperid": 1866,
            "papername": "������"
        }
    ];
    $("#fn-newsList").multiMode({
        "template": template,
        "data": data
    });
});