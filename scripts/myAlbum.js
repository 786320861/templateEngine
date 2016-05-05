
var channelID = 0 ;
var ajaxrequest;
var updaterequest;
var pageSize = 10; //ÿ�μ��ص���������
var toLoad = true; //�Ƿ�������� Ĭ��Ϊ����
var lock = false; //��������������ֹ�ظ���������

var selectIds = []; //ѡ�еļ�¼
var selectKeyIds = []; //ѡ�еļ�¼
var postUrl = "../Command/dataJson.aspx";
var dataPostPageUrl = "../Command/dataPost.aspx";
var dateTag = ""; //�����б������������
var myDate = new Date();
var sameIds = new Array(10);
var articleSameIds = [];    //�����жϸ��³����������Ƿ����ظ���
var startDate = "1900-01-01";
var endDate = "1900-01-01";
var treeJson= new Object();
var ifUpdateAlbum = false;
var currtAlbumId;
var _channelType="p";
var _rules = "";
var pollingTimer = null;
var pollingTime = 20000;

$(document).ready(function () {
    var $newslist = $("#newslist");
    //InitSelfChannel();
    LoadData(); //��������
    AdjustPage(); //����ҳ����ʾ
    $(window).resize(function () {
        AdjustPage();
    });
    //��#newslist���scrollTop data�������ж����Ϲ������¹���Ĭ�ϸ�0
    $newslist.data("scrollTop", 0);
    //��������
    $newslist.scroll(function () {
        LoadNewsList();
    });
    ThreeColumnsSplitter("splitter1", "splitter2"); //������1ע������¼�
    ThreeColumnsSplitter("splitter2", "splitter1"); //������2ע������¼�

    $('#daterange').dateRangePicker(
        {
            autoClose: true,
            endDate: myDate.Format("yyyy-MM-dd"),
            showShortcuts: false,
            minDays: 1,
            maxDays: 90,
            getValue: function () {
                return this.innerHTML.replace("&nbsp;&nbsp;<i class='fa fa-times-circle fa-lg text-info' onclick='DafaultDateRange(this)'></i>", "");
            },
            setValue: function (s) {
                this.innerHTML = s + "&nbsp;&nbsp;<i class='fa fa-times-circle fa-lg text-info' onclick='DafaultDateRange(this)'></i>";
                startDate = s.split('��')[0].replace(/ /g, "");
                endDate = s.split('��')[1].replace(/ /g, "");
                SearchNews();
            }
        });

    ScrollTop("#newslist", "#scrollTop")

    $("#makealbum").click(function () {
        ifUpdateAlbum = false;
        $("#divCollection .modal-body > iframe").attr("src", "searchSource.aspx?nocache=" + Math.random());
        $("#divCollection .modal-body > iframe").css("height", "450px");
        $("#divCollection #myModalLabel").html("����������Ŀ");
        $("#divCollection .btn-primary").attr("onclick", "MakeMyAlbum()");
        $("#divCollection").modal("show");
        //$("#divCollection").modal({show:true,backdrop:false});
    });


    $(".fa-filter").click(function () {
        $("#divCollection .modal-body > iframe").attr("src", "selectSource.aspx?id=" + $("#txt_cid").val());
        $("#divCollection .modal-body > iframe").css("height", "398px");
        $("#divCollection #myModalLabel").html("ѡ������Դ");
        $("#divCollection .btn-primary").attr("onclick", "ChangeSource()");
        $("#divCollection").modal("show");
        //$("#divCollection").modal({show:true,backdrop:false});
    });

    TouchFrameClose();

    FindCurrentNews();

    //�������С���ر��Լ�
    $("#downTip").click(function () {
        $(this).hide();
    });

});

//����ҳ����ʾ
function AdjustPage() {
    $("#leftnav").css("height", (document.documentElement.clientHeight - 140) + "px");
    $("#newslist").css("max-height", (document.documentElement.clientHeight - 230) + "px");
    var $frame = $("#myframe"),
        fh = document.documentElement.clientHeight - 100,
        $fBody = $frame.contents().find("body");
    $frame.css("height", fh + "px");
    $fBody.css({ "height": fh + "px", "overflow": "hidden" });
    $fBody.find("#newscontent").css({ "height": fh + "px", "overflow": "auto" });
}

//����ҳ������
function LoadData() {
    //��Ӹ�Ŀ¼��
    //$.ajaxSettings.async = false;
    //$.when(AsyncGetRootTree()).done(function(){ OpenTree($("#txt_rid").val(), "tnode_0", 1);}).fail(function(){ alert("Ƶ�����ݻ�ȡ��������"); }).done(function(){InitNewsList($("#txt_cid").val(), "0", pageSize);}).fail(function(){ alert("�����б����ݻ�ȡ��������"); }).done(function(){ GetNews($("#newslist a:eq(0)").find("strong").eq(0).html(), $("#txt_nid").val()); }).fail(function(){ alert("�������ݻ�ȡ��������"); });

    $.when(AsyncGetRootTree()).done(function () {
        if(treeJson.userType != "admin") {
            $.when(OpenTree($("#txt_rid").val(), "tnode_0", 1)).done(function () {
                InitSelfChannel();
                $(".fnchannel").eq(0).addClass("active");
                SetChannelInfo($(".fnchannel").eq(0).attr("title"), $(".fnchannel").eq(0).attr("id").replace("cnode_", ""));
                $.when(InitNewsList($("#txt_cid").val(), "0", pageSize)).done(function () {
                    GetNews($("#newslist a:eq(1)"), $("#newslist a:eq(1)").find("p").eq(0).html(), $("#txt_nid").val());
                    $("#newslist a:eq(1)").addClass("active_gray");
                });
            });
        } else
            InitSelfChannel();
    });
}

function BindNewsSource(channelId)
{
    $.getJSON(postUrl + "?whatDo=GetNewsSourceByChannelID&channelId=" + channelId, function (viewdata) {
        for (var i = 0, l = viewdata.length; i < l; i++) {
            $('#ddlNewsSource').append("<option value='" + viewdata[i].sourceID + "' selected='selected'>" + viewdata[i].sourceName + "</option>");
        }
        $('#ddlNewsSource').multiselect('destroy');
        $('#ddlNewsSource').multiselect({
            nonSelectedText: '��Ŀ����Դ����',
            allSelectedText: '��Ŀ����Դ����',
            includeSelectAllOption: true,
            enableFiltering: true,
            maxHeight: 400,
            buttonWidth: 300,
            onDropdownHidden: function(event) {
                NoticeNewsHotSpotStart();
                _channelType = "pf";
                InitNewsList($("#txt_cid").val(), "0", pageSize);
            }
        });
    });
}

//����Ŀ������������
function ThreeColumnsSplitter(targetObj, followObj) {
    var oBox = document.getElementById(targetObj);
    var oDrag = new Drag(oBox, {
        handle: oBox,
        limit: false,
        direction: 'h'
    });
    var oldPosition = 0;
    var newPosition = 0;
    //��ʼ��קʱ����
    oDrag.onStart = function () {
        $("#" + targetObj).css("background-color", "#233445");
        $("#mask").show();
        oldPosition = $("#" + targetObj).offset().left;
    };
    //��ʼ��קʱ����
    oDrag.onMove = function () {};
    //��ʼ��קʱ����
    oDrag.onStop = function () {
        newPosition = this.drag.offsetLeft;
        if (targetObj == "splitter1") {
            $("aside").eq(0).width($("aside").eq(0).width() + newPosition - oldPosition);
            $("#" + followObj).offset({
                "left": this.drag.offsetLeft + $("aside").eq(1).width()
            });
        } else {
            $("aside").eq(1).width($("aside").eq(1).width() + newPosition - oldPosition);
        }
        $("#mask").hide();
        $("#" + targetObj).css("background-color", "transparent");
    };
    oDrag.lockY = !oDrag.lockY;
}

//����Ƶ��
function ChangeChannel(obj, cname, cid, channelType) {
    if(pollingTimer!=null)
        NoticeNewsHotSpotEnd();
    $("#fntree a").each(function (i) {
        $(this).removeClass("active");
    });
    $("#accordion .panel-heading").each(function (i) {
        $(this).removeClass("active_blue");
    });
    $(obj).addClass("active");
    $(obj).addClass("active_blue");
    $("#txtKeyWord").val("");
    $("#ddlSource").get(0).selectedIndex = 0;
    SetChannelInfo(cname, cid);
    _channelType = channelType;
    if(channelType=="p")
        $('.sfilter').show();
    else if(channelType=="s")
        $('.sfilter').hide();
    BindNewsSource(cid.replace("C",""));
    $.when(InitNewsList(cid, "0", pageSize)).done(function () {
        GetNews($("#newslist a:eq(1)"), $("#newslist a:eq(1)").find("p").eq(0).html(), $("#txt_nid").val());
        $("#newslist a:eq(1)").addClass("active_gray");
        if(cid.replace("C","")=="5247"||cid.replace("C","")=="6402"||$("#txt_cid").val().replace("C","")=="9387") {
            $("#txt_recent_update_date").val(new Date().Format("yyyy-MM-dd hh:mm:ss") + ".000");
            NoticeNewsHotSpotStart();
        }
    }).fail(function () {
        alert("�������ݻ�ȡ��������");
    });
}

function DafaultDateRange(obj) {
    StopEventBubble(obj);
    $("#daterange").html("ѡ������");
    startDate = "1900-01-01";
    endDate = "1900-01-01";
    SearchNews();
}

//����
function SearchNews() {
    if(pollingTimer!=null)
        NoticeNewsHotSpotEnd();
    $.when(InitNewsList($("#txt_cid").val(), "0", pageSize)).done(function () {
        GetNews($("#newslist a:eq(1)"), $("#newslist a:eq(1)").find("p").eq(0).html(), $("#txt_nid").val());
        $("#newslist a:eq(1)").addClass("active_gray");
        if($("#txt_cid").val().replace("C","")=="5247"||$("#txt_cid").val().replace("C","")=="6402"||$("#txt_cid").val().replace("C","")=="9387")
            NoticeNewsHotSpotStart();
    }).fail(function () {
        alert("�������ݻ�ȡ��������");
    });
}

//������ڵ��ȡ�����¼�
function OpenTree(pid, tNode, tLevel) {
    if ($.trim($("#" + tNode).next("div").eq(0).html()) == "") {
        //$("#" + tNode).next("div").eq(0).html("<span class=\"text-danger text-center\">���ݼ�����...</span>");
        $("#" + tNode).find("i").removeClass("fa-folder");
        $("#" + tNode).find("i").addClass("fa-folder-open");
        if(treeJson.userType == "admin")
            return AsyncGetChildrenTree(pid, tNode, tLevel); //��ȡ�ӽڵ�����
        else
            return GetChildrenTree(pid, tNode, tLevel); //��ȡ�ӽڵ�����
    } else {
        if ($("#" + tNode).next("div").eq(0).css("display") == "none") {
            $("#" + tNode).find("i").removeClass("fa-folder");
            $("#" + tNode).find("i").addClass("fa-folder-open");
            $("#" + tNode).next("div").eq(0).show();
        } else {
            $("#" + tNode).find("i").removeClass("fa-folder-open");
            $("#" + tNode).find("i").addClass("fa-folder");
            $("#" + tNode).next("div").eq(0).hide();
        }
    }
}

//�첽��ȡtree�ĸ��ڵ�����
function AsyncGetRootTree() {
    var dtd = $.Deferred(); //�ں����ڲ����½�һ��Deferred����
    if (ajaxrequest) {
        ajaxrequest.abort();
    }
    SysMonitor();

    //treenav����ģ�����
    ajaxrequest = $.getJSON(postUrl + "?whatDo=GetDefaultChannelTree&exceptTestAndSpecial=1", function (viewdata) {
        treeJson = viewdata;
        var source = $("#tpl_tree").html();
        var template = Handlebars.compile(source);
        Handlebars.registerHelper('list', function (items, options) {
            var out = "";
            var offsetIndex = 0;
            for (var i = 0, l = items.length; i < l; i++) {
                //options.fn(items[i])
                if (items[i].pid == -100) {
                    //���õ�ǰ��ʼѡ�еĸ�id
                    if(offsetIndex == 0)
                        $("#txt_rid").val(items[i].id);
                    out = out + "<a href=\"javascript:;\" id=\"tnode_" + offsetIndex + "\" class=\"list-group-item no-border\" title=\"" + items[i].text + "\" onclick=\"OpenTree('" + items[i].id + "','tnode_" + offsetIndex + "',1)\"><i class=\"fa fa-fw fa-folder text-warning\"></i>" + items[i].text + "</a><div class=\"list-group list-normal m-b-none\"></div>";
                    offsetIndex++;
                }
            }
            return out;
        });
        $("#fntree").html(template(viewdata)); // + Math.random()
        dtd.resolve(); // �ı�Deferred�����ִ��״̬
    });
    return dtd.promise(); // ����promise����
}

//��ȡtree�ӽڵ�����
function GetChildrenTree(pid, tNode, tLevel) {
    var dtd = $.Deferred(); //�ں����ڲ����½�һ��Deferred����
    SysMonitor();

    //treenav����ģ�����
    var source = $("#tpl_tree").html();
    var template = Handlebars.compile(source);
    var stop = false;
    Handlebars.registerHelper('list', function (items, options) {
        var out = "";
        var temp = "";
        var offsetIndex = 0;
        for (var i = 0, l = tLevel * 4; i < l; i++) {
            temp += "&nbsp;";
        }
        for (var i = 0, l = items.length; i < l; i++) {
            if(items[i].pid == pid) {
                if (items[i].classes != 'channel') {
                    out = out + "<a href=\"javascript:;\" id=\"" + tNode + "_" + tLevel + "_" + offsetIndex + "\" class=\"list-group-item no-border\" title=\"" + items[i].text + "\" onclick=\"OpenTree('" + items[i].id + "','" + tNode + "_" + tLevel + "_" + offsetIndex + "'," + (tLevel + 1) + ")\">" + temp + "<i class=\"fa fa-fw fa-folder text-warning\"></i>" + items[i].text + "</a><div class=\"list-group list-normal m-b-none\"></div>";
                    stop = true;
                } else {
                    if (offsetIndex == 0)
                        $("#txt_cid").val(items[i].id);
                    out = out + "<a href=\"javascript:;\" id=\"cnode_" + items[i].id + "\" class=\"list-group-item no-border fnchannel\" title=\"" + items[i].text + "\" onclick=\"ChangeChannel(this,'" + escape(items[i].text) + "','" + items[i].id + "', 'p')\">" + temp + "<i class=\"fa fa-fw fa-file-text\"></i>" + items[i].text + "</a>";
                }
                offsetIndex++;
            }
        }
        return out;
    });
    $("#" + tNode).next("div").eq(0).html(template(treeJson));
    if(!stop)
        GetChildrenTree("'" + items[i].id + "','" + tNode + "_" + tLevel + "_" + offsetIndex + "'," + (tLevel + 1));
    dtd.resolve(); // �ı�Deferred�����ִ��״̬
    return dtd.promise(); // ����dtd����
}

//�첽��ȡtree�ӽڵ�����
function AsyncGetChildrenTree(pid, tNode, tLevel) {
    var dtd = $.Deferred(); //�ں����ڲ����½�һ��Deferred����
    if (ajaxrequest) {
        ajaxrequest.abort();
    }
    SysMonitor();


    //treenav����ģ�����
    ajaxrequest = $.getJSON(postUrl + "?whatDo=GetChildrenTree&exceptTestAndSpecial=1&pid=" + pid, function (viewdata) {
        var source = $("#tpl_tree").html();
        var template = Handlebars.compile(source);
        Handlebars.registerHelper('list', function (items, options) {
            var out = "";
            var temp = "";
            for (var i = 0, l = tLevel * 4; i < l; i++) {
                temp += "&nbsp;";
            }
            for (var i = 0, l = items.length; i < l; i++) {
                //options.fn(items[i])
                if (items[i].classes != 'channel') //'" + tNode + "_" + tLevel + "_" + i + "'
                    out = out + "<a href=\"javascript:;\" id=\"" + tNode + "_" + tLevel + "_" + i + "\" class=\"list-group-item no-border\" title=\"" + items[i].text + "\" onclick=\"OpenTree('" + items[i].id + "','" + tNode + "_" + tLevel + "_" + i + "'," + (tLevel + 1) + ")\">" + temp + "<i class=\"fa fa-fw fa-folder text-warning\"></i>" + items[i].text + "</a><div class=\"list-group list-normal m-b-none\"></div>";
                else {
                    if (i == 0)
                        $("#txt_cid").val(items[i].id);
                    out = out + "<a href=\"javascript:;\" id=\"cnode_" + items[i].id + "\" class=\"list-group-item no-border fnchannel\" title=\"" + items[i].text + "\" onclick=\"ChangeChannel(this,'" + escape(items[i].text) + "','" + items[i].id + "','p')\">" + temp + "<i class=\"fa fa-fw fa-file-text\"></i>" + items[i].text + "</a>";
                }
            }
            return out;
        });
        //$("#" + tNode).html(template(viewdata)); // + Math.random()
        $("#" + tNode).next("div").eq(0).html(template(viewdata));
        dtd.resolve(); // �ı�Deferred�����ִ��״̬
    });
    return dtd.promise(); // ����dtd����
}

function InitSelfChannel()
{
    //treenav����ģ�����
    $.getJSON(postUrl + "?whatDo=GetAlbumList", function (viewdata) {
        var source = $("#tpl_self_channel").html();
        var template = Handlebars.compile(source);
        $("#accordion").html(template(viewdata));
        //
        $(".fa-edit").click(function() {
            StopEventBubble(this);
            ifUpdateAlbum = true;
            var id = $(this).attr('refval');
            var name = $(this).attr('reftext');
            currtAlbumId = id;
            $("#divCollection .modal-body > iframe").attr("src", "searchSource.aspx?id=" + id + "&name=" + encodeURIComponent(name) + "&nocache=" + Math.random());
            $("#divCollection").modal("show");
        });
    });
}

//��ʼ��ȡ�����б�����
function InitNewsList(cid, sidx, count) {
    var dtd = $.Deferred(); //�ں����ڲ����½�һ��Deferred����
    SysMonitor();


    var hasTodayTag = false;
    var hasYesterdayTag = false;
    var hasHistoryTag = false;
    var hasOtherTag = false;
    var imgPath = "";
    var tempImg = new Array();
    var keypar = $("#txtRedKey").val();
    lock = true;
    var cityID = "";
    if (cityID == "") cityID = "0";
    var source = $('#ddlSource').val();
    var keyWords = $("#txtKeyWord").val();
    if (keyWords != "") {}

    var url = "";
    if(_channelType=="p")
        url = postUrl + "?whatDo=GetSearchSimilarityListNewVision&id=" + cid.replace('C', '') + "&start=" + sidx + "&limit=" + count + "&startDate=" + startDate + "&endDate=" + endDate + "&cityID=" + cityID + "&source=" + source + "&keyWords=" + encodeURIComponent(keyWords) + "&markinfo=1"; //encodeURI();
    else if(_channelType=="s")
        url = postUrl + "?whatDo=GetSearchSimilarityListForUserAlbum&id=" + cid.replace('C', '') + "&start=" + sidx + "&limit=" + count + "&startDate=" + startDate + "&endDate=" + endDate + "&cityID=" + cityID + "&source=" + source + "&keyWords=" + encodeURIComponent(keyWords) + "&markinfo=1"; //encodeURI();
    else if(_channelType=="pf")    //��������Դ
        url = postUrl + "?whatDo=GetSearchSimilarityListByFilterSource&id=" + cid.replace('C', '') + "&start=" + sidx + "&limit=" + count + "&startDate=" + startDate + "&endDate=" + endDate + "&rules=" + _rules + "&source=" + source + "&keyWords=" + encodeURIComponent(keyWords) + "&markinfo=1"; //encodeURI();
    $("#newslist").html("");
    $("#newslist").append("<div id=\"loader\" class=\"center\" style=\"width:100px;margin-left: auto;margin-right: auto;margin-top:15px;\"><img src=\"images/ajax-loader.gif\" style=\"margin-left: auto;margin-right: auto;\" align=\"center\" /></div>"); //<span class=\"text-danger\">���ڼ�����</span>
    $("#txt_cid").val(cid);
    $('#txt_rows').val("0");
    //newslist����ģ�����
    toLoad = true;
    if (ajaxrequest) {
        ajaxrequest.abort();
    }
    ajaxrequest = $.getJSON(url, function (viewdata) {
        if (viewdata != null && viewdata.total != null)
            $("#channelinfo").find(".badge").eq(0).html(viewdata.total);
        var source = $("#tpl_newslist").html();
        var template = Handlebars.compile(source);
        Handlebars.registerHelper('list', function (items, options) {
            $("#txt_nid").val(items[0].articlesequenceid);
            var out = "";
            var tempDate = "";
            sameIds.length = 0;
            for (var i = 0, l = items.length; i < l; i++) {

                tempDate = items[i].updatetime.substr(0, 10).replace(/\-/g, "");
                //options.fn(items[i])
                if (!items[i].same_id || ($("#same_1_" + items[i].same_id).length == 0 && sameIds.indexOf(items[i].same_id) < 0)) {
                    sameIds.push(items[i].same_id);

                    if (myDate.Format("yyyyMMdd") < tempDate && !hasOtherTag) {
                        hasOtherTag = true;
                        dateTag = "ot";
                        out = out + "<a href=\"#\" id=\"otherTag\" class=\"list-group-item bg-lighter no-border\" onclick=\"ShrinkNewsList('otherTag','" + dateTag + "')\"> <i class=\"fa fa-caret-down\"></i>&nbsp;������</a>";
                    } else if (myDate.Format("yyyyMMdd") == tempDate && !hasTodayTag) {
                        hasTodayTag = true;
                        dateTag = "nt";
                        out = out + "<a href=\"#\" id=\"todayTag\" class=\"list-group-item bg-light no-border\" onclick=\"ShrinkNewsList('todayTag','" + dateTag + "')\"> <i class=\"fa fa-caret-down\"></i>&nbsp;����</a>";
                    } else if ((myDate.Format("yyyyMMdd") - 1) == tempDate && !hasYesterdayTag) {
                        hasYesterdayTag = true;
                        dateTag = "ny";
                        out = out + "<a href=\"#\" id=\"yesterdayTag\" class=\"list-group-item bg-lighter no-border\" onclick=\"ShrinkNewsList('yesterdayTag','" + dateTag + "')\"> <i class=\"fa fa-caret-down\"></i>&nbsp;����</a>";
                    } else if ((myDate.Format("yyyyMMdd") - 1) > tempDate && !hasHistoryTag) {
                        hasHistoryTag = true;
                        dateTag = "nh";
                        out = out + "<a href=\"#\" id=\"historyTag\" class=\"list-group-item bg-lighter no-border\" onclick=\"ShrinkNewsList('historyTag','" + dateTag + "')\"> <i class=\"fa fa-caret-down\"></i>&nbsp;��ʷ</a>";
                    }
                    out = out + "<a id=\"nid_" + items[i].articlesequenceid + "\" href=\"javascript:;\" class=\"list-group-item " + dateTag + "\" onclick=\"GetNews(this,'" + escape(items[i].title) + "','" + items[i].articlesequenceid + "')\">";
                    if (items[i].viocesize >= 1 && items[i].viocesize <= 9)
                        out = out + "<span class=\"label label-success\">ԭ��</span>&nbsp;";
                    else if (items[i].viocesize >= 10 && items[i].viocesize <= 50)
                        out = out + "<span class=\"label label-default\">ת��</span>&nbsp;";
                    if (items[i].imagesource != null && items[i].imagesource != "") //��ͼƬ
                    {
                        if (items[i].imagesource.toLowerCase().indexOf("http") == 0) { //ֱ�Ӷ�ȡ
                            tempImg = items[i].imagesource.split("%D%W");  //��һ��ͼƬ�������ߣ�ȡ�����
                            if (tempImg.length > 1 && tempImg[1] != "")
                                out = out + "<p class=\"first-letter-big\">" + TagKey(items[i].title, keyWords) + "</p>" + (items[i].subtitle != "" && items[i].subtitle != null ? "<br class=\"fn-br\">��&nbsp;<small>" + items[i].subtitle + "</small>" : "") + "<table><tr><td style=\"width:75%\">" + ShowIconByArticleType(items[i].articletype, items[i].articlesequenceid) + "&nbsp;<small class=\"text-muted\">" + CleanHtmlTags(items[i].markinfo).substr(0, 55) + "...</small></td><td style=\"width:25%\"><div style=\"width:80px; height:80px;overflow:hidden;display:table-cell;vertical-align:middle;text-align:center;\"><img style=\"max-width:80px;max-height:80px;_width:expression(this.width > this.height ? this.height : this.width);\" src=\"" + tempImg[1].split(",")[0] + "\"></div></td></tr>";
                            else
                                out = out + "<p class=\"first-letter-big\">" + TagKey(items[i].title, keyWords) + "</p>" + (items[i].subtitle != "" && items[i].subtitle != null ? "<br class=\"fn-br\">��&nbsp;<small>" + items[i].subtitle + "</small>" : "") + "<table><tr><td style=\"width:75%\">" + ShowIconByArticleType(items[i].articletype, items[i].articlesequenceid) + "&nbsp;<small class=\"text-muted\">" + CleanHtmlTags(items[i].markinfo).substr(0, 55) + "...</small></td><td style=\"width:25%\"><div style=\"width:80px; height:80px;overflow:hidden;display:table-cell;vertical-align:middle;text-align:center;\"><img style=\"max-width:80px;max-height:80px;_width:expression(this.width > this.height ? this.height : this.width);\" src=\"" + tempImg[0].split(",")[0] + "\"></div></td></tr>";
                        }
                        //<input type=\"checkbox\" onclick=\"SelectNewsList(this,'" + items[i].articlesequenceid + "')\" / >
                        else {
                            imgPath = GetOssUrl(GetOssKey(3, items[i].paperid, tempDate, items[i].revision, items[i].imagesource.split(",", 1)));
                            out = out + "<p class=\"first-letter-big\">" + TagKey(items[i].title, keyWords) + "</p>" + (items[i].subtitle != "" && items[i].subtitle != null ? "<br class=\"fn-br\">��&nbsp;<small>" + items[i].subtitle + "</small>" : "") + "<table><tr><td style=\"width:75%\">" + ShowIconByArticleType(items[i].articletype, items[i].articlesequenceid) + "&nbsp;<small class=\"text-muted\">" + CleanHtmlTags(items[i].markinfo).substr(0, 55) + "...</small></td><td style=\"width:25%\"><div style=\"width:80px; height:80px;overflow:hidden;display:table-cell;vertical-align:middle;text-align:center;\"><img style=\"max-width:80px;max-height:80px;_width:expression(this.width > this.height ? this.height : this.width);\" src=\"" + imgPath + "\"></div></td></tr>";
                        }
                    } else
                        out = out + "<p class=\"first-letter-big\">" + TagKey(items[i].title, keyWords) + "</p>" + (items[i].subtitle != "" && items[i].subtitle != null ? "<br class=\"fn-br\">��&nbsp;<small>" + items[i].subtitle + "</small>" : "") + "<table style=\"margin-top:10px;\"><tr><td>" + ShowIconByArticleType(items[i].articletype, items[i].articlesequenceid) + "&nbsp;<small class=\"text-muted\">" + CleanHtmlTags(items[i].markinfo) + "...</small></td></tr>";
                    if (items[i].memo4 != null && items[i].memo4 != "")
                        out = out + "<tr><td colspan=\"2\"><br class=\"fn-br\"><small style=\"color:#8AC1E8\"><i class=\"fa fa-tag\"></i></small>&nbsp;<span style=\"border: 1px solid #8AC1E8;border-radius: 4px;font-size: 12px;padding: 1px 3px 1px 3px;color: #8AC1E8;\">" + items[i].memo4 + "</span></td></tr>";
                    if (ShowIconByArticleType(items[i].articletype, items[i].articlesequenceid) == "news") {
                        out = out + "</table><div class=\"line line-dashed\"></div><table style=\"width:100%;\"><tbody><tr><td colspan=\"2\"><small class=\"text-info\"><i class=\"fa fa-file-text-o f_" + items[i].articlesequenceid + "\">&nbsp;" + items[i].papername + "<script>" + GetColumName(items[i].articlesequenceid, items[i].paperid, items[i].page) + "<\/script>" + (items[i].paperno != "" && items[i].paperno != null ? "&nbsp;/&nbsp;" + items[i].paperno : "") + "</i></small></td></tr><tr><td style=\"width:215px;\"><small class=\"text-info\">";
                        out = out + "<i class=\"fa fa-clock-o\">&nbsp;ԭ�ķ�����" + items[i].paperdate + "</i>";
                    }
                    else {
                        out = out + "</table><div class=\"line line-dashed\"></div><table style=\"width:100%;\"><tbody><tr><td colspan=\"2\"><small class=\"text-info\"><i class=\"fa fa-file-text-o\">&nbsp;" + items[i].papername + (items[i].paperno != "" && items[i].paperno != null ? "&nbsp;/&nbsp;" + items[i].paperno : "") + "</i></small></td></tr><tr><td style=\"width:215px;\"><small class=\"text-info\">";
                        out = out + "<i class=\"fa fa-clock-o\">&nbsp;ԭ�ķ�����" + items[i].updatetime.substr(0, 19) + "</i>";
                    }
                    out = out + "</small></td><td align=\"right\"><i class=\"fa fa-external-link text-muted fa-lg\" onclick=\"FindHot(this,'" + items[i].keyword + "')\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"����\" data-original-title=\"����\"></i></td></tr><tr><td style=\"width:215px;\"><small class=\"text-info\"><i class=\"fa fa-clock-o\">&nbsp;������⣺" + items[i].createtime.substr(0, 19) + "</i></small></td>"; //</tbody></table></a>";
                    out = out + "<td align=\"right\"><i class=\"fa fa-star-o text-muted fa-lg\" onclick=\"CollectNews(this,'" + items[i].articlesequenceid + "')\"></i></td></tr>"
                    out = out + "<tr><td colspan=\"2\" style=\"padding-top:10px;\">";
                    if (items[i].same_count != null && items[i].same_count > 1)
                        out = out + "<div onclick=\"GetSameIdNewsList(this,'" + items[i].articlesequenceid + "','" + items[i].same_id + "'," + (items[i].same_count - 1) + ")\" style=\"border-bottom: 0px solid rgb(92, 184, 92); width: 35%; display: inline-block; float: left;\"><small class=\"text-info\"><i class=\"fa fa-caret-down\">&nbsp;�鿴��������</i></small></div>";
                    //                                    else
                    //                                        out = out + "</tbody></table></a>";
                    if (typeof (items[i].same_id) !== "undefined")
                        out = out + "<div onclick=\"FindOriginal(this,'" + items[i].articlesequenceid + "','" + items[i].same_id + "'," + (items[i].same_count - 1) + ")\" style=\"border-bottom: 0px solid rgb(92, 184, 92); width: 35%; display: inline-block; float: left;\"><small class=\"text-info\"><i class=\"fa fa-caret-down\">&nbsp;׷��ԭ������</i></small></div>";
                    out = out + "<ul class=\"fn-similarity-block\" style=\"list-style-type:none;padding-left:0px;padding-top:5px\"><li style=\" display:none;padding-bottom:10px;padding-left:10px;padding-right:10px;margin-top:20px;padding-top:0px\" class=\"sameNews\" id=\"same_1_" + items[i].same_id + "\"></li><li style=\" display:none;padding-bottom:10px;padding-left:10px;padding-right:10px;margin-top:20px;padding-top:0px\" class=\"sameNews\" id=\"same_2_" + items[i].same_id + "\"></li><li style=\" display:none;padding-left:10px;padding-bottom:10px;padding-right:10px;margin-top:20px;padding-top:0px\" class=\"sameNews\" id=\"same_3_" + items[i].same_id + "\"></li></ul></td></tr></tbody></table></a>";
                    //out = out + "<div class=\"line line-dashed\"></div><table style=\"width:100%;border-collapse:collapse;border:1px solid red;\"><tr align=\"right\"><td style=\"border:5px solid red;\"><i class=\"fa fa-star text-warning fa-lg\"></i></td></tr></table></a>";
                }
            }
            if (sameIds.length < 10)
                out = out + "<a href=\"#\" id=\"morebtn\" class=\"list-group-item bg-lighter text-center\" onclick=\"LoadNewsList()\">�������</a>";
            return out;
        });
        $("#newslist #loader").remove();
        $('#txt_rows').val(viewdata.rows.length);
        //�������ݣ���������Ƶ����£�����ȥ��
        var altData = handleSimilarData(viewdata);
        $("#newslist").append(template(altData)); // + Math.random()
        lock = false;
        dtd.resolve(); // �ı�Deferred�����ִ��״̬
    });
    return dtd.promise(); // ����promise����
}
function handleSimilarData(viewData) {
    var altData = {
        rows: []
    };
    var rows = viewData.rows, len = rows.length,ri = null;
    for (var i = 0; i < len; i++) {
        ri = rows[i];
        var tag = articleSameIds.indexOf(ri.same_id);
        if (tag<0) {
            articleSameIds.push(ri.same_id);
            altData.rows.push(ri);
        }
    }
    return altData;
}
//��ȡ�����б��¼�
function LoadNewsList() {
    var $newslist = $("#newslist"),
        newslist = $newslist[0];
    var vst = parseInt(newslist.scrollTop);
    var vsh = parseInt(newslist.scrollHeight);
    var vch = parseInt(newslist.clientHeight);
    var len = $('#txt_rows').val();
    var scrollTop = $newslist.scrollTop();
    if (scrollTop >= $newslist.data("scrollTop")) {
        //����������ף��ж��Ƿ�Ҫ��������
        if ((vst + vch >= vsh - 30) && toLoad && !lock) { //����50px����ǰ����//-50
            lock = true;
            $("#loader").remove();
            GetNewsList($("#txt_cid").val(), len, pageSize);
        }
    }
    $newslist.data("scrollTop", scrollTop);
}
//׷�ӻ�ȡ�����б�����
function GetNewsList(cid, sidx, count) {
    $downTip = $("#downTip");
    SysMonitor();
    var _val = newslist.scrollHeight-newslist.clientHeight;
    var hasTodayTag = $("#todayTag").length > 0 ? true : false;
    var hasYesterdayTag = $("#yesterdayTag").length > 0 ? true : false;
    var hasHistoryTag = $("#historyTag").length > 0 ? true : false;
    var hasOtherTag = $("#otherTag").length > 0 ? true : false;
    var imgPath = "";
    var tempImg = new Array();
    var keypar = $("#txtRedKey").val();

    var cityID = "";
    if (cityID == "") cityID = "0";
    var source = $('#ddlSource').val();
    var keyWords = $("#txtKeyWord").val();
    if (keyWords != "") {}

    var url = "";
    if(_channelType=="p")
        url = postUrl + "?whatDo=GetSearchSimilarityListNewVision&id=" + cid.replace('C', '') + "&start=" + sidx + "&limit=" + count + "&startDate=" + startDate + "&endDate=" + endDate + "&cityID=" + cityID + "&source=" + source + "&keyWords=" + encodeURIComponent(keyWords) + "&markinfo=1"; //encodeURI();
    else if(_channelType=="s")
        url = postUrl + "?whatDo=GetSearchSimilarityListForUserAlbum&id=" + cid.replace('C', '') + "&start=" + sidx + "&limit=" + count + "&startDate=" + startDate + "&endDate=" + endDate + "&cityID=" + cityID + "&source=" + source + "&keyWords=" + encodeURIComponent(keyWords) + "&markinfo=1"; //encodeURI();
    else if(_channelType=="pf")  //��������Դ
        url = postUrl + "?whatDo=GetSearchSimilarityListByFilterSource&id=" + cid.replace('C', '') + "&start=" + sidx + "&limit=" + count + "&startDate=" + startDate + "&endDate=" + endDate + "&rules=" + _rules + "&source=" + source + "&keyWords=" + encodeURIComponent(keyWords) + "&markinfo=1"; //encodeURI();
    if ($("#morebtn").length > 0)
        $("#morebtn").remove();

    //$("#newslist #loader").remove();
    $("#newslist").append("<div id=\"loader\" class=\"center\" style=\"width:100px;height: 30px; line-height:30px;margin:auto;\"><img src=\"images/ajax-loader.gif\" style=\"margin-left: auto;margin-right: auto;\" align=\"center\" /></div>");
    if (ajaxrequest) {
        ajaxrequest.abort();
    }
    //newslist����ģ�����
    ajaxrequest = $.get(url, function (viewdata) {
        var source = $("#tpl_newslist").html();
        var template = Handlebars.compile(source);
        Handlebars.registerHelper('list', function (items, options) {
            if (items.length == 0 || !items) {
                return;
            }
            var out = "";
            var tempDate = "";
            if ($("#nid_" + items[0].articlesequenceid).length == 0 || ($("#nid_" + items[0].articlesequenceid).length != 0 && items.length == pageSize)) {
                sameIds.length = 0;
                for (var i = 0, l = items.length; i < l; i++) {

                    tempDate = items[i].updatetime.substr(0, 10).replace(/\-/g, "");
                    //options.fn(items[i])
                    if (items[i].same_id == null || ($("#same_1_" + items[i].same_id).length == 0 && sameIds.indexOf(items[i].same_id) < 0)) {
                        sameIds.push(items[i].same_id);
                        if (myDate.Format("yyyyMMdd") < tempDate && !hasOtherTag) {
                            hasOtherTag = true;
                            dateTag = "ot";
                            out = out + "<a href=\"#\" id=\"otherTag\" class=\"list-group-item bg-lighter no-border\" onclick=\"ShrinkNewsList('otherTag','" + dateTag + "')\"> <i class=\"fa fa-caret-down\"></i>&nbsp;������</a>";
                        } else if (myDate.Format("yyyyMMdd") == tempDate && !hasTodayTag) {
                            hasTodayTag = true;
                            dateTag = "nt";
                            out = out + "<a href=\"#\" id=\"todayTag\" class=\"list-group-item bg-lighter no-border\" onclick=\"ShrinkNewsList('todayTag','" + dateTag + "')\"> <i class=\"fa fa-caret-down\"></i>&nbsp;����</a>";
                        } else if ((myDate.Format("yyyyMMdd") - 1) == tempDate && !hasYesterdayTag) {
                            hasYesterdayTag = true;
                            dateTag = "ny";
                            out = out + "<a href=\"#\" id=\"yesterdayTag\" class=\"list-group-item bg-lighter no-border\" onclick=\"ShrinkNewsList('yesterdayTag','" + dateTag + "')\"> <i class=\"fa fa-caret-down\"></i>&nbsp;����</a>";
                        } else if ((myDate.Format("yyyyMMdd") - 1) > tempDate && !hasHistoryTag) {
                            hasHistoryTag = true;
                            dateTag = "nh";
                            out = out + "<a href=\"#\" id=\"historyTag\" class=\"list-group-item bg-lighter no-border\" onclick=\"ShrinkNewsList('historyTag','" + dateTag + "')\"> <i class=\"fa fa-caret-down\"></i>&nbsp;��ʷ</a>";
                        }
                        out = out + "<a id=\"nid_" + items[i].articlesequenceid + "\" href=\"javascript:;\" class=\"list-group-item " + dateTag + "\" onclick=\"GetNews(this,'" + escape(items[i].title) + "','" + items[i].articlesequenceid + "')\">";
                        //                                            if(items[i].viocesize >= 1 && items[i].viocesize <= 9 )
                        //                                                out = out + "<div class=\"triangle-top-right-green\"><div class=\"triangle-text\">ԭ</div></div>";
                        //                                            else if(items[i].viocesize >= 10 && items[i].viocesize <= 50 )
                        //                                                out = out + "<div class=\"triangle-top-right-gray\"><div class=\"triangle-text\">ת</div></div>";
                        if (items[i].viocesize >= 1 && items[i].viocesize <= 9)
                            out = out + "<span class=\"label label-success\">ԭ��</span>&nbsp;";
                        else if (items[i].viocesize >= 10 && items[i].viocesize <= 50)
                            out = out + "<span class=\"label label-default\">ת��</span>&nbsp;";
                        if (items[i].imagesource != null && items[i].imagesource != "") //��ͼƬ
                        {
                            if (items[i].imagesource.toLowerCase().indexOf("http") == 0) { //ֱ�Ӷ�ȡ
                                tempImg = items[i].imagesource.split("%D%W");  //��һ��ͼƬ�������ߣ�ȡ�����
                                if (tempImg.length > 1 && tempImg[1] != "")
                                    out = out + "<p class=\"first-letter-big\">" + TagKey(items[i].title, keyWords) + "</p>" + (items[i].subtitle != "" && items[i].subtitle != null ? "<br class=\"fn-br\">��&nbsp;<small>" + items[i].subtitle + "</small>" : "") + "<table><tr><td style=\"width:75%\">" + ShowIconByArticleType(items[i].articletype, items[i].articlesequenceid) + "&nbsp;<small class=\"text-muted\">" + CleanHtmlTags(items[i].markinfo).substr(0, 55) + "...</small></td><td style=\"width:25%\"><div style=\"width:80px; height:80px;overflow:hidden;display:table-cell;vertical-align:middle;text-align:center;\"><img style=\"max-width:80px;max-height:80px;_width:expression(this.width > this.height ? this.height : this.width);\" src=\"" + tempImg[1].split(",")[0] + "\"></div></td></tr>";
                                else
                                    out = out + "<p class=\"first-letter-big\">" + TagKey(items[i].title, keyWords) + "</p>" + (items[i].subtitle != "" && items[i].subtitle != null ? "<br class=\"fn-br\">��&nbsp;<small>" + items[i].subtitle + "</small>" : "") + "<table><tr><td style=\"width:75%\">" + ShowIconByArticleType(items[i].articletype, items[i].articlesequenceid) + "&nbsp;<small class=\"text-muted\">" + CleanHtmlTags(items[i].markinfo).substr(0, 55) + "...</small></td><td style=\"width:25%\"><div style=\"width:80px; height:80px;overflow:hidden;display:table-cell;vertical-align:middle;text-align:center;\"><img style=\"max-width:80px;max-height:80px;_width:expression(this.width > this.height ? this.height : this.width);\" src=\"" + tempImg[0].split(",")[0] + "\"></div></td></tr>";
                            }
                            else {
                                imgPath = GetOssUrl(GetOssKey(3, items[i].paperid, tempDate, items[i].revision, items[i].imagesource.split(",", 1)));
                                out = out + "<p class=\"first-letter-big\">" + TagKey(items[i].title, keyWords) + "</p>" + (items[i].subtitle != "" && items[i].subtitle != null ? "<br class=\"fn-br\">��&nbsp;<small>" + items[i].subtitle + "</small>" : "") + "<table><tr><td style=\"width:75%\">" + ShowIconByArticleType(items[i].articletype, items[i].articlesequenceid) + "&nbsp;<small class=\"text-muted\">" + CleanHtmlTags(items[i].markinfo).substr(0, 55) + "...</small></td><td style=\"width:25%\"><div style=\"width:80px; height:80px;overflow:hidden;display:table-cell;vertical-align:middle;text-align:center;\"><img style=\"max-width:80px;max-height:80px;_width:expression(this.width > this.height ? this.height : this.width);\" src=\"" + imgPath + "\"></div></td></tr>";
                            }
                        } else
                            out = out + "<p class=\"first-letter-big\">" + TagKey(items[i].title, keyWords) + "</p>" + (items[i].subtitle != "" && items[i].subtitle != null ? "<br class=\"fn-br\">��&nbsp;<small>" + items[i].subtitle + "</small>" : "") + "<table style=\"margin-top:10px;\"><tr><td>" + ShowIconByArticleType(items[i].articletype, items[i].articlesequenceid) + "&nbsp;<small class=\"text-muted\">" + CleanHtmlTags(items[i].markinfo) + "...</small></td></tr>";
                        if (items[i].memo4 != null && items[i].memo4 != "")
                            out = out + "<tr><td colspan=\"2\"><br class=\"fn-br\"><small style=\"color:#8AC1E8\"><i class=\"fa fa-tag\"></i></small>&nbsp;<span style=\"border: 1px solid #8AC1E8;border-radius: 4px;font-size: 12px;padding: 1px 3px 1px 3px;color: #8AC1E8;\">" + items[i].memo4 + "</span></td></tr>";
                        if (ShowIconByArticleType(items[i].articletype, items[i].articlesequenceid) == "news") {
                            out = out + "</table><div class=\"line line-dashed\"></div><table style=\"width:100%;\"><tbody><tr><td colspan=\"2\"><small class=\"text-info\"><i class=\"fa fa-file-text-o f_" + items[i].articlesequenceid + "\">&nbsp;" + items[i].papername + "<script>" + GetColumName(items[i].articlesequenceid, items[i].paperid, items[i].page) + "<\/script>" + (items[i].paperno != "" && items[i].paperno != null ? "&nbsp;/&nbsp;" + items[i].paperno : "") + "</i></small></td></tr><tr><td style=\"width:215px;\"><small class=\"text-info\">";
                            out = out + "<i class=\"fa fa-clock-o\">&nbsp;ԭ�ķ�����" + items[i].paperdate + "</i>";
                        }
                        else {
                            out = out + "</table><div class=\"line line-dashed\"></div><table style=\"width:100%;\"><tbody><tr><td colspan=\"2\"><small class=\"text-info\"><i class=\"fa fa-file-text-o\">&nbsp;" + items[i].papername + (items[i].paperno != "" && items[i].paperno != null ? "&nbsp;/&nbsp;" + items[i].paperno : "") + "</i></small></td></tr><tr><td style=\"width:215px;\"><small class=\"text-info\">";
                            out = out + "<i class=\"fa fa-clock-o\">&nbsp;ԭ�ķ�����" + items[i].updatetime.substr(0, 19) + "</i>";
                        }
                        out = out + "</small></td><td align=\"right\"><i class=\"fa fa-external-link text-muted fa-lg\" onclick=\"FindHot(this,'" + items[i].keyword + "')\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"����\" data-original-title=\"����\"></i></td></tr><tr><td style=\"width:215px;\"><small class=\"text-info\"><i class=\"fa fa-clock-o\">&nbsp;������⣺" + items[i].createtime.substr(0, 19) + "</i></small></td>"; //</tbody></table></a>";
                        out = out + "<td align=\"right\"><i class=\"fa fa-star-o text-muted fa-lg\" onclick=\"CollectNews(this,'" + items[i].articlesequenceid + "')\"></i></td></tr>"
                        out = out + "<tr><td colspan=\"2\" style=\"padding-top:10px;\">";
                        if (items[i].same_count != null && items[i].same_count > 1)
                            out = out + "<div onclick=\"GetSameIdNewsList(this,'" + items[i].articlesequenceid + "','" + items[i].same_id + "'," + (items[i].same_count - 1) + ")\" style=\"border-bottom: 0px solid rgb(92, 184, 92); width: 35%; display: inline-block; float: left;\"><small class=\"text-info\"><i class=\"fa fa-caret-down\">&nbsp;�鿴��������</i></small></div>";
                        //                                    else
                        //                                        out = out + "</tbody></table></a>";
                        if (typeof (items[i].same_id) !== "undefined")
                            out = out + "<div onclick=\"FindOriginal(this,'" + items[i].articlesequenceid + "','" + items[i].same_id + "'," + (items[i].same_count - 1) + ")\" style=\"border-bottom: 0px solid rgb(92, 184, 92); width: 35%; display: inline-block; float: left;\"><small class=\"text-info\"><i class=\"fa fa-caret-down\">&nbsp;׷��ԭ������</i></small></div>";
                        out = out + "<ul class=\"fn-similarity-block\" style=\"list-style-type:none;padding-left:0px;padding-top:5px\"><li style=\" display:none;padding-bottom:10px;padding-left:10px;padding-right:10px;margin-top:20px;padding-top:0px\" class=\"sameNews\" id=\"same_1_" + items[i].same_id + "\"></li><li style=\" display:none;padding-bottom:10px;padding-left:10px;padding-right:10px;margin-top:20px;padding-top:0px\" class=\"sameNews\" id=\"same_2_" + items[i].same_id + "\"></li><li style=\" display:none;padding-left:10px;padding-bottom:10px;padding-right:10px;margin-top:20px;padding-top:0px\" class=\"sameNews\" id=\"same_3_" + items[i].same_id + "\"></li></ul></td></tr></tbody></table></a>";
                        //out = out + "<div class=\"line line-dashed\"></div><table style=\"width:100%;border-collapse:collapse;border:1px solid red;\"><tr align=\"right\"><td style=\"border:5px solid red;\"><i class=\"fa fa-star text-warning fa-lg\"></i></td></tr></table></a>";
                    }
                }
                return out;
            }
        });
        //���Ѿ��۵���չ��
        if ($("#historyTag")[0]) {
            if ($("#historyTag").find("i").is(".fa-caret-right"))
                ShrinkNewsList("historyTag", "nh");
        } else if ($("#yesterdayTag")[0]) {
            if ($("#yesterdayTag").find("i").is(".fa-caret-right"))
                ShrinkNewsList("yesterdayTag", "ny");
        } else if ($("#todayTag")[0]) {
            if ($("#todayTag").find("i").is(".fa-caret-right"))
                ShrinkNewsList("todayTag", "nt");
        }
        viewdata = JSON.parse(viewdata);
        $('#txt_rows').val($('#txt_rows').val() * 1 + viewdata.rows.length);
        var altData = handleSimilarData(viewdata);
        var totalLen = viewdata.rows.length,
            collapseLen = totalLen - altData.rows.length;
        setDownTipPos();
        $("#downTip span").eq(0).text(totalLen).end().eq(1).text(collapseLen);
        $downTip.show();
        $("#loader").remove();
        clearTimeout(timeout);
        var timeout = setTimeout(hideDownTip, 2000);
        //������ظ�������Ϊ0��ʱ��
        $("#newslist").append(template(altData));
        lock = false;
    });
}
function hideDownTip() {
    var $downTip = $("#downTip");
    $downTip.hide();
}
//������ʾ���λ�ã�ʹ�������������м�
function setDownTipPos() {
    var height = $(".sidebar-large").eq(0).outerHeight();
    $("#downTip").css("top", (height - 30) / 2 + "px");
}
//�����ݸ�������
function UpdateNews(cid, sidx, count) {
    SysMonitor();
    var imgPath = "";
    var tempImg = new Array();
    var keypar = $("#txtRedKey").val();
    lock = true;
    var cityID = "";
    if (cityID == "") cityID = "0";
    var source = $('#ddlSource').val();
    var keyWords = $("#txtKeyWord").val();
    if (keyWords != "") {}

    var tempStartDate = $("#txt_recent_update_date").val();
    var tempEndDate = new Date().Format("yyyy-MM-dd hh:mm:ss") + ".000";
    $("#txt_recent_update_date").val(tempEndDate);
    var url = postUrl + "?whatDo=GetSearchSimilarityListNewVision&id=" + cid.replace('C', '') + "&start=" + sidx + "&limit=" + count + "&startDate=" + tempStartDate + "&endDate=" + tempEndDate + "&cityID=" + cityID + "&source=" + source + "&keyWords=" + encodeURIComponent(keyWords) + "&markinfo=1"; //encodeURI();

    if (updaterequest) {
        updaterequest.abort();
    }
    //newslist����ģ�����
    updaterequest = $.getJSON(url, function (viewdata) {
        var source = $("#tpl_newslist").html();
        var template = Handlebars.compile(source);
        Handlebars.registerHelper('list', function (items, options) {
            var out = "";
            var tempDate = "";
            sameIds.length = 0;
            for (var i = 0, l = items.length; i < l; i++) {
                $('#txt_rows').val($('#txt_rows').val()*1+1);
                tempDate = items[i].updatetime.substr(0, 10).replace(/\-/g, "");
                //options.fn(items[i])
                sameIds.push(items[i].same_id);
                out = out +"<a id=\"nid_" + items[i].articlesequenceid + "\" href=\"javascript:;\" class=\"list-group-item " + dateTag + "\" onclick=\"GetNews(this,'" + escape(items[i].title) + "','" + items[i].articlesequenceid + "')\">";
//                                    if($("#txt_cid").val().replace("C","") == "5247"||$("#txt_cid").val().replace("C","")=="6402")
//                                        out = out +"<i class=\"fa fa-circle text-success\"></i>&nbsp;"
//                                    if(items[i].viocesize >= 1 && items[i].viocesize <= 9 )
//                                        out = out + "<div class=\"triangle-top-right-green\"><div class=\"triangle-text\">ԭ</div></div>";
//                                    else if(items[i].viocesize >= 10 && items[i].viocesize <= 50 )
//                                        out = out + "<div class=\"triangle-top-right-gray\"><div class=\"triangle-text\">ת</div></div>";
                if(items[i].viocesize >= 1 && items[i].viocesize <= 9 )
                    out = out +"<span class=\"label label-success\">ԭ��</span>&nbsp;";
                else if(items[i].viocesize >= 10 && items[i].viocesize <= 50 )
                    out = out +"<span class=\"label label-default\">ת��</span>&nbsp;";
                if (items[i].imagesource != null && items[i].imagesource != "") //��ͼƬ
                {
                    if (items[i].imagesource.toLowerCase().indexOf("http") == 0) { //ֱ�Ӷ�ȡ
                        tempImg = items[i].imagesource.split("%D%W");  //��һ��ͼƬ�������ߣ�ȡ�����
                        if(tempImg.length > 1 && tempImg[1] != "")
                            out = out + "<p class=\"first-letter-big\">" + TagKey(items[i].title, keyWords) + "</p>" + (items[i].subtitle != "" && items[i].subtitle != null ? "<br class=\"fn-br\">��&nbsp;<small>" + items[i].subtitle + "</small>" : "") + "<table><tr><td style=\"width:75%\"><i class=\"fa fa-circle text-success\"></i>&nbsp;"+ShowIconByArticleType(items[i].articletype, items[i].articlesequenceid)+"&nbsp;<small class=\"text-muted\">" + CleanHtmlTags(items[i].markinfo).substr(0, 55) + "...</small></td><td style=\"width:25%\"><div style=\"width:80px; height:80px;overflow:hidden;display:table-cell;vertical-align:middle;text-align:center;\"><img style=\"max-width:80px;max-height:80px;_width:expression(this.width > this.height ? this.height : this.width);\" src=\"" + tempImg[1].split(",")[0] + "\"></div></td></tr>";
                        else
                            out = out + "<p class=\"first-letter-big\">" + TagKey(items[i].title, keyWords) + "</p>" + (items[i].subtitle != "" && items[i].subtitle != null ? "<br class=\"fn-br\">��&nbsp;<small>" + items[i].subtitle + "</small>" : "") + "<table><tr><td style=\"width:75%\"><i class=\"fa fa-circle text-success\"></i>&nbsp;"+ShowIconByArticleType(items[i].articletype, items[i].articlesequenceid)+"&nbsp;<small class=\"text-muted\">" + CleanHtmlTags(items[i].markinfo).substr(0, 55) + "...</small></td><td style=\"width:25%\"><div style=\"width:80px; height:80px;overflow:hidden;display:table-cell;vertical-align:middle;text-align:center;\"><img style=\"max-width:80px;max-height:80px;_width:expression(this.width > this.height ? this.height : this.width);\" src=\"" + tempImg[0].split(",")[0] + "\"></div></td></tr>";
                    }
                    else {
                        imgPath = GetOssUrl(GetOssKey(3, items[i].paperid, tempDate, items[i].revision, items[i].imagesource.split(",", 1)));
                        out = out + "<p class=\"first-letter-big\">" + TagKey(items[i].title, keyWords) + "</p>" + (items[i].subtitle != "" && items[i].subtitle != null ? "<br class=\"fn-br\">��&nbsp;<small>" + items[i].subtitle + "</small>" : "") + "<table><tr><td style=\"width:75%\"><i class=\"fa fa-circle text-success\"></i>&nbsp;"+ShowIconByArticleType(items[i].articletype, items[i].articlesequenceid)+"&nbsp;<small class=\"text-muted\">" + CleanHtmlTags(items[i].markinfo).substr(0, 55) + "...</small></td><td style=\"width:25%\"><div style=\"width:80px; height:80px;overflow:hidden;display:table-cell;vertical-align:middle;text-align:center;\"><img style=\"max-width:80px;max-height:80px;_width:expression(this.width > this.height ? this.height : this.width);\" src=\"" + imgPath + "\"></div></td></tr>";
                    }
                } else
                    out = out + "<p class=\"first-letter-big\">" + TagKey(items[i].title, keyWords) + "</p>" + (items[i].subtitle != "" && items[i].subtitle != null ? "<br class=\"fn-br\">��&nbsp;<small>" + items[i].subtitle + "</small>" : "") + "<table style=\"margin-top:10px;\"><tr><td><i class=\"fa fa-circle text-success\"></i>&nbsp;"+ShowIconByArticleType(items[i].articletype, items[i].articlesequenceid)+"&nbsp;<small class=\"text-muted\">" + CleanHtmlTags(items[i].markinfo) + "...</small></td></tr>";
                if (items[i].memo4 != null && items[i].memo4 != "")
                    out = out + "<tr><td colspan=\"2\"><br class=\"fn-br\"><small style=\"color:#8AC1E8\"><i class=\"fa fa-tag\"></i></small>&nbsp;<span style=\"border: 1px solid #8AC1E8;border-radius: 4px;font-size: 12px;padding: 1px 3px 1px 3px;color: #8AC1E8;\">" + items[i].memo4 + "</span></td></tr>";
                if (ShowIconByArticleType(items[i].articletype, items[i].articlesequenceid) == "news") {
                    out = out + "</table><div class=\"line line-dashed\"></div><table style=\"width:100%;\"><tbody><tr><td colspan=\"2\"><small class=\"text-info\"><i class=\"fa fa-file-text-o f_" + items[i].articlesequenceid + "\">&nbsp;" + items[i].papername + "<script>" + GetColumName(items[i].articlesequenceid, items[i].paperid, items[i].page) + "<\/script>" + (items[i].paperno!="" && items[i].paperno!=null ? "&nbsp;/&nbsp;" + items[i].paperno : "") + "</i></small></td></tr><tr><td style=\"width:215px;\"><small class=\"text-info\">";
                    out = out + "<i class=\"fa fa-clock-o\">&nbsp;ԭ�ķ�����" + items[i].paperdate + "</i>";
                }
                else {
                    out = out + "</table><div class=\"line line-dashed\"></div><table style=\"width:100%;\"><tbody><tr><td colspan=\"2\"><small class=\"text-info\"><i class=\"fa fa-file-text-o\">&nbsp;" + items[i].papername + (items[i].paperno!="" && items[i].paperno!=null ? "&nbsp;/&nbsp;" + items[i].paperno : "") + "</i></small></td></tr><tr><td style=\"width:215px;\"><small class=\"text-info\">";
                    out = out + "<i class=\"fa fa-clock-o\">&nbsp;ԭ�ķ�����" + items[i].updatetime.substr(0, 19) + "</i>";
                }
                out = out + "</small></td><td align=\"right\"><i class=\"fa fa-external-link text-muted fa-lg\" onclick=\"FindHot(this,'" + items[i].keyword + "')\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"����\" data-original-title=\"����\"></i></td></tr><tr><td style=\"width:215px;\"><small class=\"text-info\"><i class=\"fa fa-clock-o\">&nbsp;������⣺" + items[i].createtime.substr(0, 19) + "</i></small></td>";//</tbody></table></a>";
                out = out + "<td align=\"right\"><i class=\"fa fa-star-o text-muted fa-lg\" onclick=\"CollectNews(this,'" + items[i].articlesequenceid + "')\"></i></td></tr>"
                out = out + "<tr><td colspan=\"2\" style=\"padding-top:10px;\">";
                if (items[i].same_count != null && items[i].same_count > 1)
                    out = out + "<div onclick=\"GetSameIdNewsList(this,'" + items[i].articlesequenceid + "','" + items[i].same_id  + "'," + (items[i].same_count - 1) + ")\" style=\"border-bottom: 0px solid rgb(92, 184, 92); width: 35%; display: inline-block; float: left;\"><small class=\"text-info\"><i class=\"fa fa-caret-down\">&nbsp;�鿴��������</i></small></div>";
//                                    else
//                                        out = out + "</tbody></table></a>";
                out = out + "<div onclick=\"FindOriginal(this,'" + items[i].articlesequenceid + "','" + items[i].same_id  + "'," + (items[i].same_count - 1) + ")\" style=\"border-bottom: 0px solid rgb(92, 184, 92); width: 35%; display: inline-block; float: left;\"><small class=\"text-info\"><i class=\"fa fa-caret-down\">&nbsp;׷��ԭ������</i></small></div>";
                out = out + "<ul class=\"fn-similarity-block\" style=\"list-style-type:none;padding-left:0px;padding-top:5px\"><li style=\" display:none;padding-bottom:10px;padding-left:10px;padding-right:10px;margin-top:20px;padding-top:0px\" class=\"sameNews\" id=\"same_1_" + items[i].same_id + "\"></li><li style=\" display:none;padding-bottom:10px;padding-left:10px;padding-right:10px;margin-top:20px;padding-top:0px\" class=\"sameNews\" id=\"same_2_" + items[i].same_id + "\"></li><li style=\" display:none;padding-left:10px;padding-bottom:10px;padding-right:10px;margin-top:20px;padding-top:0px\" class=\"sameNews\" id=\"same_3_" + items[i].same_id + "\"></li></ul></td></tr></tbody></table></a>";
                //out = out + "<div class=\"line line-dashed\"></div><table style=\"width:100%;border-collapse:collapse;border:1px solid red;\"><tr align=\"right\"><td style=\"border:5px solid red;\"><i class=\"fa fa-star text-warning fa-lg\"></i></td></tr></table></a>";

            }
            if(items.length>0) {
                var audio5js = new Audio5js({
                    ready: function () {
                        this.load('audio/9.mp3');
                        this.play();
                    }
                });
                //��ʾ����
                if($(".noticetip").is(":hidden")) {
                    //��������(����)
                    $("#ucl").html(items.length);
                    $(".noticetip").show();
                } else {
                    //��������(�ۼ�)
                    $("#ucl").html($("#ucl").html() * 1 + items.length);
                }
            }
            return out;
        });
        //���Ѿ��۵���չ��
        if ($("#historyTag")[0]) {
            if ($("#historyTag").find("i").is(".fa-caret-right"))
                ShrinkNewsList("historyTag", "nh");
        } else if ($("#yesterdayTag")[0]) {
            if ($("#yesterdayTag").find("i").is(".fa-caret-right"))
                ShrinkNewsList("yesterdayTag", "ny");
        } else if ($("#todayTag")[0]) {
            if ($("#todayTag").find("i").is(".fa-caret-right"))
                ShrinkNewsList("todayTag", "nt");
        }
        $("#newslist a").eq(1).before(template(viewdata)); // + Math.random()
        lock = false;
    });
}

function GetSameIdNewsList(obj, newsId,sameId, sameCount) {
    StopEventBubble(obj);
    SysMonitor();

    $(obj).siblings().css("border-bottom-width","0px");
    $("#same_1_" + sameId).css("background","#F1F5F9");
    $("#same_1_" + sameId).siblings().css("display","none");

    if($.trim($("#same_1_" + sameId).html())=="")
    {
        $(obj).append("<div class=\"load\" style=\"margin-top: -20px;left: 310px;position: absolute;\"><img src=\"images/loader.gif\" style=\"width: 12px;height: 12px;\"></div>");
        var url = postUrl + "?whatDo=SearchArticeListBySameId&key=" + sameId + "&cid=" + $("#txt_cid").val();
        //newslist����ģ�����
        var viewHtml = "";
        var realSameCount = 0;
        $.getJSON(url, function (data) {
            //                            for(var i = 0;i < sameCount + 1; i++) {  //��1Ϊ�˷�ֹ��ʾ��ǰ��ƪ����
            //                                if(data.rows[i] != null && data.rows[i].articlesequenceid != newsId && realSameCount != sameCount) {
            $(obj).find(".text-danger").eq(0).addClass("h4");
            $(obj).find(".text-danger").eq(0).html(data.rows.length>0?data.rows.length - 1:0);
            $(obj).css({"border-bottom-width":"5px"});
            $("#same_1_" + sameId).css({"border":"1px solid #ccc","display":"block"});
            viewHtml+="<p style=\"margin-top:10px;\">��ƥ��&nbsp;<font class=\"text-danger\">"+(data.rows.length-1)+"</font>&nbsp;ƪ��������</p>"
            for(var i = 0;i < data.rows.length; i++) {
                if(data.rows[i] != null && data.rows[i].articlesequenceid != newsId) {
                    viewHtml += "<div class=\"line line-dashed\"></div><a href=\"javascript:void(0);\" onclick=\"GetNews(this,'" +  escape(data.rows[i].title) + "','" + data.rows[i].articlesequenceid + "')\" style=\"display:block\">";
                    //                                    if(data.rows[i].viocesize >= 1 && data.rows[i].viocesize <= 9 )
                    //                                        viewHtml += "<div class=\"triangle-top-right-green\"><div class=\"triangle-text\">ԭ</div></div>";
                    //                                    else if(data.rows[i].viocesize >= 10 && data.rows[i].viocesize <= 50 )
                    //                                        viewHtml += "<div class=\"triangle-top-right-gray\"><div class=\"triangle-text\">ת</div></div>";
                    if(data.rows[i].viocesize >= 1 && data.rows[i].viocesize <= 9 )
                        viewHtml = viewHtml +"<p><span class=\"label label-success\">ԭ��</span>&nbsp;";
                    else if(data.rows[i].viocesize >= 10 && data.rows[i].viocesize <= 50 )
                        viewHtml = viewHtml +"<p><span class=\"label label-default\">ת��</span>&nbsp;";
                    else
                        viewHtml = viewHtml +"<p>";
                    viewHtml += data.rows[i].title + "</p>";
                    viewHtml += "<table style=\"width:100%;\"><tbody>";
                    if (ShowIconByArticleType(data.rows[i].articletype, data.rows[i].articlesequenceid) == "news") {
                        viewHtml += "<tr><td colspan=\"2\"><small class=\"text-info\"><i class=\"fa fa-file-text-o f_" + data.rows[i].articlesequenceid + "\">&nbsp;" + data.rows[i].papername + "<script>" +  GetColumName(data.rows[i].articlesequenceid, data.rows[i].paperid, data.rows[i].page) + "<\/script>" + (data.rows[i].paperno!="" && data.rows[i].paperno!=null ? "&nbsp;/&nbsp;" + data.rows[i].paperno : "") + "</i></small></td></tr>";
                        viewHtml += "<tr><td style=\"width:215px;\"><small class=\"text-info\">"
                        viewHtml += "<i class=\"fa fa-clock-o\">&nbsp;ԭ�ķ�����" + data.rows[i].paperdate + "</i>";
                    }
                    else {
                        viewHtml += "<tr><td colspan=\"2\"><small class=\"text-info\"><i class=\"fa fa-file-text-o\">&nbsp;" + data.rows[i].papername + (data.rows[i].paperno!="" && data.rows[i].paperno!=null ? "&nbsp;/&nbsp;" + data.rows[i].paperno : "") + "</i></small></td></tr>";
                        viewHtml += "<tr><td style=\"width:215px;\"><small class=\"text-info\">"
                        viewHtml += "<i class=\"fa fa-clock-o\">&nbsp;ԭ�ķ�����" + data.rows[i].updatetime.substr(0, 19) + "</i>";
                    }
                    viewHtml += "</small></td><td align=\"right\"><i class=\"fa fa-external-link text-muted fa-lg\" onclick=\"FindHot(this,'" + data.rows[i].keyword + "')\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"����\" data-original-title=\"����\"></i></td></tr>";
                    viewHtml += "<tr><td style=\"width:215px;\"><small class=\"text-info\"><i class=\"fa fa-clock-o\">&nbsp;������⣺" + data.rows[i].createtime.substr(0, 19) + "</i></small></td>";
                    viewHtml += "<td align=\"right\"><i class=\"fa fa-star-o text-muted fa-lg\" onclick=\"CollectNews(this,'" + data.rows[i].articlesequenceid + "')\"></i></td></tr></tbody></table></a>"
                    //realSameCount++;
                }
            }
            $("#same_1_" + sameId).html(viewHtml);
            $(obj).find(".load").remove();
        });
    } else {
        if($("#same_1_" + sameId).is(":hidden")) {
            $("#same_1_" + sameId).show();
            $(obj).css("border-bottom-width","5px");
        }
        else {
            $("#same_1_" + sameId).hide();
            $(obj).css("border-bottom-width","0px");
        }
    }
}

function FindOriginal(obj, newsId,sameId,sameCount) {
    StopEventBubble(obj);
    SysMonitor();

    $(obj).siblings().css("border-bottom-width","0px");
    $("#same_2_" + sameId).css("background","#F1F5F9");
    $("#same_2_" + sameId).siblings().css("display","none");

    if($.trim($("#same_2_" + sameId).html())=="")
    {
        $(obj).append("<div class=\"load\" style=\"margin-top: -20px;left: 310px;position: absolute;\"><img src=\"images/loader.gif\" style=\"width: 12px;height: 12px;\"></div>");
        var url = postUrl + "?whatDo=SearchArticeListBySameId3&key=" + sameId;
        //newslist����ģ�����
        var viewHtml = "";
        var realSameCount = 0;
        $.getJSON(url, function (data) {
            //                            for(var i = 0;i < sameCount + 1; i++) {  //��1Ϊ�˷�ֹ��ʾ��ǰ��ƪ����
            //                                if(data.rows[i] != null && data.rows[i].articlesequenceid != newsId && realSameCount != sameCount) {
            $(obj).find(".text-danger").eq(0).addClass("h4");
            $(obj).find(".text-danger").eq(0).html(data.rows.length>0?data.rows.length - 1:0);
            $(obj).css({"border-bottom-width":"5px"});
            $("#same_2_" + sameId).css({"border":"1px solid #ccc","display":"block"});
            for(var i = 0;i < data.rows.length; i++) {
                if(data.rows[i] != null && data.rows[i].articlesequenceid != newsId && data.rows[i].viocesize >= 1 && data.rows[i].viocesize <= 9 ) {
                    viewHtml += "<div class=\"line line-dashed\"></div><a href=\"javascript:void(0);\" onclick=\"GetNews(this,'" +  escape(data.rows[i].title) + "','" + data.rows[i].articlesequenceid + "')\" style=\"display:block\">";
                    //                                    if(data.rows[i].viocesize >= 1 && data.rows[i].viocesize <= 9 )
                    //                                        viewHtml += "<div class=\"triangle-top-right-green\"><div class=\"triangle-text\">ԭ</div></div>";
                    //                                    else if(data.rows[i].viocesize >= 10 && data.rows[i].viocesize <= 50 )
                    //                                        viewHtml += "<div class=\"triangle-top-right-gray\"><div class=\"triangle-text\">ת</div></div>";
                    viewHtml = viewHtml +"<p><span class=\"label label-success\">ԭ��</span>&nbsp;";
                    viewHtml += data.rows[i].title + "</p>";
                    viewHtml += "<table style=\"width:100%;\"><tbody>";
                    if (ShowIconByArticleType(data.rows[i].articletype, data.rows[i].articlesequenceid) == "news") {
                        viewHtml += "<tr><td colspan=\"2\"><small class=\"text-info\"><i class=\"fa fa-file-text-o f_" + data.rows[i].articlesequenceid + "\">&nbsp;" + data.rows[i].papername + "<script>" +  GetColumName(data.rows[i].articlesequenceid, data.rows[i].paperid, data.rows[i].page) + "<\/script>" + (data.rows[i].paperno!="" && data.rows[i].paperno!=null ? "&nbsp;/&nbsp;" + data.rows[i].paperno : "") + "</i></small></td></tr>";
                        viewHtml += "<tr><td style=\"width:215px;\"><small class=\"text-info\">"
                        viewHtml += "<i class=\"fa fa-clock-o\">&nbsp;ԭ�ķ�����" + data.rows[i].paperdate + "</i>";
                    }
                    else {
                        viewHtml += "<tr><td colspan=\"2\"><small class=\"text-info\"><i class=\"fa fa-file-text-o\">&nbsp;" + data.rows[i].papername + (data.rows[i].paperno!="" && data.rows[i].paperno!=null ? "&nbsp;/&nbsp;" + data.rows[i].paperno : "") + "</i></small></td></tr>";
                        viewHtml += "<tr><td style=\"width:215px;\"><small class=\"text-info\">"
                        viewHtml += "<i class=\"fa fa-clock-o\">&nbsp;ԭ�ķ�����" + data.rows[i].updatetime.substr(0, 19) + "</i>";
                    }
                    viewHtml += "</small></td><td align=\"right\"><i class=\"fa fa-external-link text-muted fa-lg\" onclick=\"FindHot(this,'" + data.rows[i].keyword + "')\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"����\" data-original-title=\"����\"></i></td></tr>";
                    viewHtml += "<tr><td style=\"width:215px;\"><small class=\"text-info\"><i class=\"fa fa-clock-o\">&nbsp;������⣺" + data.rows[i].createtime.substr(0, 19) + "</i></small></td>";
                    viewHtml += "<td align=\"right\"><i class=\"fa fa-star-o text-muted fa-lg\" onclick=\"CollectNews(this,'" + data.rows[i].articlesequenceid + "')\"></i></td></tr></tbody></table></a>"
                    realSameCount++;
                }
            }
            viewHtml = "<p style=\"margin-top:10px;\">��ƥ��&nbsp;<font class=\"text-danger\">"+realSameCount+"</font>&nbsp;ƪԭ������</p>" + viewHtml;
            $("#same_2_" + sameId).html(viewHtml);
            $(obj).find(".load").remove();
        });
    } else {
        if($("#same_2_" + sameId).is(":hidden")) {
            $("#same_2_" + sameId).show();
            $(obj).css("border-bottom-width","5px");
        }
        else {
            $("#same_2_" + sameId).hide();
            $(obj).css("border-bottom-width","0px");
        }
    }
}

function NoticeNewsHotSpotStart() {
    pollingTimer = window.setInterval("NoticeNewsHotSpot()",pollingTime);
}

function NoticeNewsHotSpotEnd() {
    window.clearInterval(pollingTimer);
    $("#ucl").html(0);
    $(".noticetip").hide();
}

//�ȵ��¼���������
function NoticeNewsHotSpot() {
    if($("#txt_cid").val().replace("C","")=="5247"||$("#txt_cid").val().replace("C","")=="6402"||$("#txt_cid").val().replace("C","")=="9387")
        UpdateNews($("#txt_cid").val().replace("C",""),0,10);
}


function CollectNews(obj, aid) {
    StopEventBubble(obj);
    SysMonitor();


    selectIds.splice(0, 1);
    selectIds.push(aid);
    //$('#divCollection').modal('show');
    FavoritesFormList_new(obj);
}

//�ղ�
function FavoritesFormList_new(obj) {
    var kidStr = "";
    for (var i = 0; i < selectIds.length; i++) {
        if (kidStr == "") {
            kidStr = selectIds[i];
        } else kidStr += "," + selectIds[i];
    }
    if (kidStr == "") {
        alert("��ѡ��Ҫ�ղص���Ϣ!");
        return;
    } else { //���
        AddNewsCollection(obj, kidStr, $("#txt_ctid").val());
        //addNewsCollection_new(kidStr, document.getElementById("iframeCollection").contentWindow.GetSelectValue());
    }
}

function SetChannelInfo(cname, cid) {
    $("#channelinfo i").html("<a href=\"#cnode_" + cid + "\" class=\"text-info\">&nbsp;<strong style=\"font-family: ΢���ź�;\">" + unescape(cname) + "</strong></a>");
}

function ShrinkNewsList(objId, dateType) {
    if (!$("." + dateType).is(":hidden")) {
        $("#" + objId).find("i").removeClass("fa-caret-down");
        $("#" + objId).find("i").addClass("fa-caret-right");
        $("." + dateType).hide();
    } else {
        $("#" + objId).find("i").removeClass("fa-caret-right");
        $("#" + objId).find("i").addClass("fa-caret-down");
        $("." + dateType).show();
    }
}

function MakeMyAlbum()
{
    var tempObj = $("#iframeSearch").contents();
    var sourceIds = tempObj.find("#selectedItemValue").val().replace(/elem_/g, "");
    var name = encodeURIComponent(tempObj.find('#albumName').val());
    if($.trim(name) == ""){
        tempObj.find("#albumName").addClass("bg-focus parsley-validated parsley-error");
        return;
    }
    if($.trim(sourceIds) == "")
        return;

    if(!ifUpdateAlbum)  //���
        $.post(dataPostPageUrl, { "whatDo": "MakeMyAlbum","name": name,"source": sourceIds,"nocache": Math.random() },
            function(data){
                $.alert({
                    title: '<h4>' + data.msg + '</h4>',
                    columnClass: 'col-md-4 col-md-offset-4 col-sm-4 col-sm-offset-4',
                    //title: false,
                    content: false,
                    confirmButton: 'ȷ��',
                    confirmButtonClass: 'btn-primary',
                    confirm: function () {
                        var out = "<div id=\"cnode_" + data.myChannelID + "\" class=\"panel\" style=\"cursor:pointer;display:none;\">";
                        out += "<div class=\"panel-heading\" onclick=\"ChangeChannel(this,'" + escape(data.myChannelName) + "','" + data.myChannelID + "','s')\">";
                        out += "<i class=\"fa fa-edit text-success\" title=\"�༭��Ŀ��Ϣ\" data-original-title=\"�༭��Ŀ��Ϣ\" refval=\"" + data.myChannelID + "\" reftext=\"" + data.myChannelName + "\"></i>";
                        out += "<a href=\"javascript:void(0);\" style=\"font-size:14px\">&nbsp;<strong><b>" + data.myChannelName + "</b></strong></a>";
                        out += "<button type=\"button\" class=\"close\" onclick=\"DeleteAlbum(this,'" + data.myChannelID + "')\"><i class=\"fa fa-times text-danger\"></i></button>";
                        out += "</div>";
                        out += "</div>";
                        $("#divCollection").modal("hide");
                        //$('#divCollection').on('hidden.bs.modal', function (e) {
                        $("#accordion").append(out);
                        $("#cnode_" + data.myChannelID).fadeIn("500");
                        //$(this).removeData('bs.modal')
                        $("#cnode_" + data.myChannelID + " .fa-edit").click(function() {
                            StopEventBubble(this);
                            ifUpdateAlbum = true;
                            currtAlbumId = data.myChannelID;
                            $("#divCollection .modal-body > iframe").attr("src", "searchSource.aspx?id=" + data.myChannelID + "&name=" + encodeURIComponent(data.myChannelName));
                            $("#divCollection").modal("show");
                        });
                        //})
                    }
                });
            }, "json");
    else
        $.post(dataPostPageUrl, { "whatDo": "UpdateMyAlbum","id": currtAlbumId,"name": name,"source": sourceIds,"nocache": Math.random() },
            function(data){
                $.alert({
                    title: '<h4>' + data.msg + '</h4>',
                    columnClass: 'col-md-4 col-md-offset-4 col-sm-4 col-sm-offset-4',
                    //title: false,
                    content: false,
                    confirmButton: 'ȷ��',
                    confirmButtonClass: 'btn-primary',
                    confirm: function () {
                        $("#divCollection").modal("hide");
                        //$('#divCollection').on('hidden.bs.modal', function (e) {
                        $("#cnode_" + currtAlbumId + " .panel-heading").unbind('click').bind('click',function(){ ChangeChannel(this, escape(data.myChannelName), currtAlbumId, 's') });
                        $("#cnode_" + currtAlbumId + " .fa-edit").unbind('click').bind('click',function(){
                            StopEventBubble(this);
                            ifUpdateAlbum = true;
                            currtAlbumId = data.myChannelID;
                            $("#divCollection .modal-body > iframe").attr("src", "searchSource.aspx?id=" + data.myChannelID + "&name=" + encodeURIComponent(data.myChannelName));
                            $("#divCollection").modal("show");
                        });
                        $("#cnode_" + currtAlbumId + " .fa-edit").attr("refval",currtAlbumId).attr("reftext",data.myChannelName);
                        $("#cnode_" + currtAlbumId).find("b").eq(0).html(data.myChannelName);
                        //$(this).removeData('bs.modal')
                        //})
                    }
                });
            }, "json");
}

function ChangeSource()
{
    _channelType="p";
    var tempObj = $("#iframeSearch").contents();
    var sourceIds = tempObj.find("#selectedItemValue").val().replace(/elem_/g, "");
    if($.trim(sourceIds) != "")
        _channelType="pf";
    _rules = sourceIds;
    SearchNews();

}

function FindHot(obj,key)
{
    StopEventBubble(obj);
    $("#divDiscover .modal-body > iframe").attr("src", "discover.aspx?key=" + encodeURIComponent(key));
    $("#divDiscover .modal-title").html("�������ţ�" + key);
    //$("#divDiscover .modal-body > iframe").css("width", "950px");
    $("#divDiscover .modal-body > iframe").css("height", "650px");
    $("#divDiscover").modal("show");
}
