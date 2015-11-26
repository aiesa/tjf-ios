//jQuery no conflit.
$.noConflict();

//Global definative and user constant

// Search preference
var COMP_LIST_PER_PAGE = 20;
var HISTORY_LIST_PER_PAGE = 10;
var CONTACT_LIST_PER_PAGE = 10;
var MAX_FILE_ATTACH = 5242880;  //5MB in bytes
var TIMEOUT_DEFAULT = 1000*60;

var AttendanceType = [{type:"Staff"}, {type:"Other company"}, {type:"Other"}];


//var host = 'http://192.168.0.102/imon';
var host = 'http://imon.prk.icu.gov.my';
//var host = 'http://corrad-imon.azurewebsites.net';

var AJAX_LIST = [];

// URL preference
var API_URL = host + "/api_generator.php?api_name=";
var IMAGE_URL = host + "/img/profile/";
var ATTACH_URL = host + "/";
var UPLOAD_URL = host + "/api_generator.php?api_name=INSERT_GAMBAR";

// Application setting
var DEBUG_MODE = true;

// In-apps function usage. Do not touch
var dashboardLoaded = false;
var companyDetailLoaded = false;
var silentConnectionError = false;
var myScroller;
var mask_queue = [];
var company_data = {};
var ciid_data = {};
var dialogExitShowed = false;
var DEVICE_READY = false;
var CAN_CLOSE_MASK = true;
var DISABLE_MASK = false;
var CAN_VIEW_REPORT = true;
var isUserSRE = false, isUserMSC = false;
var attendance_other_data = [];
var firstTimeLoaded = false;

var KATEGORI_PROJEK = {
    PJK : 'Projek Khas/Teknikal',
    PMR : 'Projek Mesra Rakyat',
    PIA: 'Projek PIA/PIAS',
    RMLT: 'RMLT'
}

var project_data = {};
var kemajuan_data = {};
var isu_data = {};

/*
APPFRAMEWORK SETTING

This function runs once the page is loaded, but intel.xdk is not yet active */
//$.ui.animateHeaders=false;
var webRoot = "./";
// $.os.android=true;
$.ui.autoLaunch = false;
$.ui.openLinksNewTab = false;
//$.ui.loadDefaultHash=false;
//$.ui.splitview=false;
$.ui.slideSideMenu = true;
$.ui.setRightSideMenuWidth("280px");
$.ui.disableSplitView();
//$.ui.enableRightSideMenu();
$.ui.resetScrollers=false;
if(!$.os.ios &&! $.os.android){
      $.os.desktop=true;
    }


/**

post_data: call ajax request to post data.
api - api name to call
request - request to send
success
error
silenterror - false by default
checkdevice - true by default.
*/
function post_data(api, request, success, error, silenterror, checkdevice, ajaxoption)
{
    post_data_url(API_URL+api, request, success, error, silenterror, checkdevice, ajaxoption);
}

function post_data_url(api, request, success, errorCallBack, silenterror, checkdevice, ajaxoption)
{
    var TX = "" + Math.random();
    var info = {};
    var settings = $.extend({
        dataType:"json",
        cache:false,
        timeout: TIMEOUT_DEFAULT,
    }, ajaxoption);

    checkdevice = typeof checkdevice !== 'undefined' ? checkdevice : true;
    silenterror = typeof silenterror !== 'undefined' ? silenterror : false;

    if ( checkdevice && DEVICE_READY)
    {
        info.email = window.localStorage.getItem("current_user:email");
        info.uuid = device.uuid;
    }

    var merged = {};
    for ( var i in request) {
        if (request.hasOwnProperty(i))
            merged[i] = request[i];
    }
    //if($.isPlainObject( merged ))
    //    app.log(merged);

    mask_queue.push(api);
    var ajax = $.ajax({
        type: 'POST',
        //headers: {'OPEN-API-Key':'2h47xFs'},
        url: api,
        cache: settings.cache,
        timeout: settings.timeout,
        dataType: settings.dataType,
        //header:{id:1,username:'bill'},
        complete:function(data){
            var index = mask_queue.indexOf(api);
            if (index > -1) {
                mask_queue.splice(index, 1);
            }

            if($.ui&&mask_queue.length==0)
                $.ui.hideMask();
            DISABLE_MASK = false;

        },
        beforeSend:function(data){
           if($.ui&&!DISABLE_MASK)
                $.ui.showMask();
        },
        error: function(jqXHR, textStatus, errorThrown){
            app.log(textStatus + ":"+jqXHR.responseText+" Error thrown:"+errorThrown);
            if(textStatus == "error")
            {
                // //post_data_url(api, request, success, errorCallBack, silenterror, checkdevice, ajaxoption);
                // if(host==external_host&&silentConnectionError)
                //     host = internal_host;
                // else
                //     host = external_host;
                // app.log("Changed host to "+host);
                //retry if possible
            }

            $.ui.hideMask();
            if(typeof errorCallBack !== 'undefined' )
            {
                errorCallBack();
            }
            else
            {

            }
            if(!silenterror&&!silentConnectionError)
            {
                window.plugins.toast.showShortBottom('Limited or no connectivity');
                silentConnectionError = true;

                //silent connection error for 10s
                setTimeout(function(){
                    silentConnectionError = false;
                    app.log("Enable back silent connection error.");
                }, 10000);
                app.log("error toasted");
            }
            if (api == 'get_staff_info_by_email')
            {
                //pergi ke login page semula jika tiada network connection semasa auto-login..
                $.ui.loadContent("#login",false,false,"flip");
            }
        },
        data: merged,
        success: success
    });

    AJAX_LIST.push(ajax);
}
function get_data(api, request, success)
{
    // TO be implemented
    var TX = "" + Math.random();

    mask_queue.push(TX);
    $.ajax({
        type: 'GET',
        //headers: {'OPEN-API-Key':'2h47xFs'},
        url: API_URL+api+"&TX="+TX,

        //header:{id:1,username:'bill'},
        dataType: "text",
        complete:function(data){
            var index = mask_queue.indexOf(TX);
            if (index > -1) {
                mask_queue.splice(index, 1);
            }

            if($.ui&&mask_queue.length==0)
                $.ui.hideMask();
        },
        data:request,
        beforeSend:function(data){
            if($.ui)
            $.ui.showMask();
        },
        cache: false,
        success: success
    });
}

function extractDate(date)
{
    return  date.substr(8,2) +"-"+ date.substr(5,2)+"-"+date.substr(0,4);
}

function goToLocation(dest) {
    //destination_GOOGLEMAP = dest;
    var url = "geo:?q="  + dest +"&z=14";
    app.log(url);
    window.location.href = url;

}
function onSuccessGetCurrentLocation(position) {
        //alert(destination_GOOGLEMAP);
            window.location.href = "geo:" + position.coords.latitude + "," + position.coords.longitude + "?q="  + destination_GOOGLEMAP + "&z=14";
            //hide_loading();
}
function onErrorGetCurrentLocation(error){
    //retry..
    getCurrentLocation(destination_GOOGLEMAP);
}

function showHide(obj, objToHide) {
    var el = $("#" + objToHide)[0];

    if (obj.className == "expanded") {
        obj.className = "collapsed";
    } else {
        obj.className = "expanded";
    }
    $(el).toggle();
}

function loadedCasesSummary()
{
    mask_queue=[];
    $.ui.hideMask();
    var current_user_email = window.localStorage.getItem("current_user:email");
    var data = {staffemail:current_user_email};

    var folder = $("#casesSummary .folder-current-user")[0];
    post_data('get_no_of_cases_by_email', data,
        function(info){
            if(!info)
                return false;
            var totalInteraction = 0;
            var totalInteractionWeekly = 0;
            for (var i = 0; i < info.length ;i++) {
                var connector = "";

                switch(info[i].codeName)
                {
                    case "Open":
                        connector = ".openc";
                        break;
                    case "Closed":
                        connector = ".closedc";
                        break;
                    case "Reopen":
                        connector = ".reopenc";
                        break;
                    case "Resolved":
                        connector = ".resolvedc";
                        break;
                    case "Pending":
                        connector = ".pendingc";
                        break;
                    case "Exception":
                        connector = ".exceptionc";
                        break;

                }
            }
            $(folder).find(".users-num-list .fa").addClass("fa-fw");
        });
}

function loadedAccountSummary()
{
    var current_user_email = window.localStorage.getItem("current_user:email");
    var data = {staffemail:current_user_email};

    mask_queue=[];
    $.ui.hideMask();

    var folder = $("#accountSummary .folder-current-user")[0];
    // post_data('get_no_of_companies_by_email', data,
    //     function(info) {
    //         if(info && info[0].Email==current_user_email)
    //         {
    //             $(folder).find(".total_company_hmh").text(info[0].NoOfCompany);
    //         }
    //         else
    //         {
    //             $(folder).find(".total_company_hmh").text("0");
    //         }
    //     });
    // post_data('get_no_of_interaction_by_email', data,
    //     function(info){
    //         if(!info)
    //             return false;
    //         var totalInteraction = 0;
    //         var totalInteractionWeekly = 0;
    //         $(folder).find(".interaction-generated").remove();
    //         for (var i = 0; i < info.length ;i++) {

    //             row = $(folder).find(".interaction-template").clone().removeClass("interaction-template").removeAttr("style").addClass("interaction-generated");
    //             jQuery(folder).find(".interaction-template").after(row);
    //             row.find(".interaction-type").html("<span style='width: 55%;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;display: inline-flex;margin-left: 10px;'>"+info[i].InteractionType+"</span>");
    //             row.find(".users-num").text(info[i].NoALL);
    //             row.find(".weeks-num").text(info[i].NoCWEEK);
    //             if(info[i].InteractionType.match(/email/i)||info[i].InteractionType.match(/phone/i)||info[i].InteractionType.match(/visit/i))
    //             {
    //                 totalInteraction += info[i].NoALL;
    //                 totalInteractionWeekly += info[i].NoCWEEK;
    //             }


    //             jQuery(row.find(".interaction-type")[0]).prepend(interactionIconType(info[i].InteractionType));


    //             var ii = i % 5;
    //             if (ii == 0) { row.find(".interaction-type").addClass("blue"); }
    //             else if (ii == 1) { row.find(".interaction-type").addClass("green"); }
    //             else if (ii == 2) { row.find(".interaction-type").addClass("black"); }
    //             else if (ii == 3) { row.find(".interaction-type").addClass("teal"); }
    //             else if (ii == 4) { row.find(".interaction-type").addClass("orange"); }
    //             else if (ii == 5) { row.find(".interaction-type").addClass("blue"); }

    //         }
    //         $(folder).find(".touchpoints .users-num").text(totalInteraction);
    //         $(folder).find(".touchpoints .weeks-num").text(totalInteractionWeekly);


    //         $(folder).find(".users-num-list .fa").addClass("fa-fw");

    //     });
}

function interactionIconType(InteractionType)
{
    if(InteractionType == "Request")
    {
        return "<i class='fa fa-pencil-square-o' style='color:cornflowerblue;margin-left:10px'>&nbsp; </i>&nbsp;&nbsp;&nbsp;";
    }

    else if(InteractionType == "Letter")
    {
        return "<i class='fa fa-inbox' style='color:rgb(73, 184, 101);margin-left:10px'>&nbsp; </i>&nbsp;&nbsp;&nbsp;";
    }

    else if(InteractionType == "Site Visit")
    {
        return "<i class='fa fa-map-marker' style='color:cadetBlue;margin-left:10px'>&nbsp; </i>&nbsp;&nbsp;&nbsp;";
    }

    else if(InteractionType == "Meeting")
    {
        return "<i class='fa fa-briefcase' style='color:pink;margin-left:10px'>&nbsp; </i>&nbsp;&nbsp;&nbsp;";
    }
}
var loadFront = false;
function loadedFrontPanel()
{
    listLoaded = false;
    alreadyScrolled=false;
    companyDetailLoaded = false;

    $.ui.clearHistory();
    var username = window.localStorage.getItem("imon-username");

    if(!username)
        return false;

    var data = {
        username:username,
    };

    $('.error_display').hide().css({opacity:0});

    //certain variable are not worth it to load everytime
    if(!loadFront)
    {
        post_data('GET_USER_INFO', data,
            function(info){
            	//alert('1');
                //app.log(JSON.stringify(info));
                // Bind on click.
                //var staff_info = info.staff_list.staff;

                window.localStorage.setItem("imon-agency", info.USERAGENCY);
                window.localStorage.setItem("imon-commentallow", info.USERCOMMENTALLOW);
                window.localStorage.setItem("imon-updateallow", info.USERUPDATEALLOW);
                window.localStorage.setItem("imon-userid", info.USERID);
                window.localStorage.setItem("imon-level", info.USERLEVEL);

                if (typeof(info) == 'undefined')
                    return;

                $("#user-row .user-name").text(info.NAME);
                $("#user-row .user-division").text(info.DESIGNATION);
                $("#user-row .user-position").text(info.LASTUPDATE);
                $("#user-row .user-email").text(info.EMAIL);
                //set staff photo.
                $("#user-row .user-icon").css("backgroundImage", "url('"+IMAGE_URL+info.IMAGEFILE+"')").removeAttr("src");
				//alert('2');
                //HASNOLMIZAM27082014
                //var im = IMAGE_URL+current_user_email+"&staffemail="+current_user_email;
                //$(".status-grid-head").css("background", "url('" + im + "') no-repeat 0px 0px");
                //$(".status-grid-head").css("background-size", "100% auto");
                //$(".status-grid-head").css("width", "100%");
                //$(".status-grid-head").css("opacity", "0.2");
                //$(".status-grid-head").css("margin-left", "-40px");


                data = {daerah:"SEMUA", agensi: info.USERAGENCY, userlevel: info.USERLEVEL};
                post_data('GET_PROJEK_COUNT', data,
                    function(info) {
                        if(info)
                        {
                            $(".total_touch").text(info.PKT);
                            $(".total_cases").text(info.PMR);
                            $(".total_company").text(info.PIA_PIAS);
                            $(".total_cm").text(info.RMLT);
                        }
                        else
                        {
                            $(".total_company").text("0");
                        }
                    });

                post_data("GET_RUJ_DAERAH", {},
                    function(info){
                        // Populate data into select.
                        if(info && info.length)
                        {
                            var agency = window.localStorage.getItem("imon-agency", info.USERAGENCY);

                            $(".daerah_select option.generated").remove();
                            for (var i = 0; i < info.length; i++) {
                                if(agency>16||agency==info[i].ID_DAERAH)
                                    $(".daerah_select").append("<option class='generated' value='"+info[i].ID_DAERAH+"'>"+info[i].KETERANGAN+"</option>");

                            }
                            if(agency<=16)
                            {
                                jQuery(".hidedaerah").hide().parent().val(agency);
                            }
                            else
                            {
                                jQuery(".hidedaerah").show();
                            }
                        }
                    });


                //$(".company_link").attr("href", "#companylist/"+current_user_email);
                jQuery('.wrap').css({display:'block'}).transition({opacity:1});
                loadFront = true;

            }, function(){
                jQuery('#frontpanel .error_display').show().transition({opacity:1});
                jQuery('#frontpanel .wrap').transition({opacity:0}).hide();

            });
    } else { //else just load interaction

    }


}

function loadLatestInteraction(api, target, isrefresh){
    var current_user_email = window.localStorage.getItem("current_user:email");
    var count = $(target+" .latest-generated").length;
    var data = {
        email: current_user_email,
        page: Math.floor( count / HISTORY_LIST_PER_PAGE ) + 1,
        rpp: HISTORY_LIST_PER_PAGE
    };
    jQuery(target+" .last_row.scrollmorelatest").fadeOut();
    $(target+" .last_row").remove();



    var element = $(target);

    if(isrefresh!==undefined)
       data.page = 1;


    post_data(api, data,
        function(info) {
            if(info)
            {
                if(isrefresh!==undefined)
                    $(".latest-interaction").empty();
                for(var i=0;i<info.length;i++)
                {
                    var messagefull = info[i].messagefull;
                    messagefull = messagefull.replace("0 yesterday", "yesterday");

                    var sub = '<a class="latest-generated"><div class="chat-people-grid"> \
                                                    <div class="chat-people-pic-grid" style="margin-left:10px">\
                                                            '+interactionIconType(info[i].InteractionActionType) +'\
                                                    </div>\
                                                    <div class="chat-people-message" style="margin-left:65px;width:80%">\
            <h3 style="margin-top:5px;margin-right:0px;margin-left:15px;">'+info[i].AccountName+'</h3>\
            <i class="fa fa-chevron-right comp_arrow" style="color: #e3000b;float: right;"></i>\
            <div style="font-style:italic;font-size:12px;margin-top:5px;margin-right:0px;margin-left:15px;color:#8F8F8F">'+messagefull+'</div>\
                                                    </div>\
                                                    <div class="clear"> </div>\
                                                </div></a>';
                    sub = $(sub).attr("href", "#companyDetail/"+info[i].AccountID+"/"+info[i].ContactInteractionID).attr("onclick", "openTab('tab-history')");
                    element.append(sub);
                }
                if(info.length<HISTORY_LIST_PER_PAGE)
                {
                    element.append('<p>End of list</p>');
                }
                else
                {
                    element.append('<p class="last_row scrollmorelatest"><a onclick="loadLatestInteraction(\''+api+'\',\''+target+'\')" class="button load-more-button block" style="background-color:#b9b9bd;color:white">Load more...</a></p>');
                }
            }
        }, function(){
            if(jQuery(target+" .last_row.scrollmorelatest").fadeIn().length<1)
                element.append('<p class="last_row"><a onclick="loadLatestInteraction(\''+api+'\',\''+target+'\')" class="button load-more-button block" style="background-color:#b9b9bd;color:white">Retry</a></p>');

        });
    //mask_queue = [];
}
function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}

function loadedDashboard()
{
    listLoaded = false;
    if(dashboardLoaded)
    {
        app.log("dashboard created!");
        return false;
    }

    //$(".folder-group").remove();
    $(".folder-content-generated").remove();

    // Load get_subordinates_by_email

    var current_user_email = window.localStorage.getItem("current_user:email");
    //app.log(current_user_email);

    var data = {
        email:current_user_email,
        staffemail:current_user_email
    };

    post_data('get_subordinates_by_email', data,
    function(info){
        // Bind on click.
        // Load and clone subcordinate.

        var staffs;
        if(info&&info.staff_list!==undefined)
        {
            staffs = info.staff_list.staff;
        }
        else
        {
            staffs = info;
        }

        //incase reloaded twice
        $(".folder-content-generated").remove();

        if (typeof(staffs) != 'undefined')
        {
            if(!Array.isArray(staffs))
            {
                var tempArray = [];
                tempArray.push(staffs);
                staffs = tempArray;
            }
            // Load and clone subcordinate.
            for (var i = 0; i < staffs.length ; i++) {
                var row;
                var className = ("folder-"+staffs[i].staff_no).replace(/ /g,"_");
                // if(($(".jaf-row div.folder").length%2) > 0)
                // {
                //     app.log("new icon");
                //     row = $( "#folder-original" ).clone().css({"display":"inline-block"}).appendTo( ".jaf-row" ).removeAttr('id').attr('id', className);
                // }
                // else

                app.log("new row");
                row = $( "#folder-original" ).clone().css({"display":"inline-block"}).removeAttr('id').attr('id', className);
                $("<div class='jaf-row jaf-container folder-content-generated'/>").append(row).appendTo(".folder-group");
                //}
                var folContent = $("#folder-content-original").clone().removeAttr('id').addClass(className).addClass("folder-content-generated").addClass("folderContent").appendTo(".app-folders-container");
                row.find(".user-name").text(staffs[i].staff_name);
                // row.find(".user-phone-button").attr("href","tel:"+staffs[i].staff_no);
                row.find(".user-phone-button").hide();
                setPhoneNumber(staffs[i].email, row);

                row.find(".user-email-button").attr("href","mailto:"+staffs[i].email);
                row.find(".user-email").text(staffs[i].email);
                row.find(".user-icon").css("backgroundImage", "url('"+IMAGE_URL+current_user_email+"&staffemail="+staffs[i].email+"')").removeAttr("src");

                $("."+className+" .total_company_hmh").attr("href", "#companylist/"+staffs[i].email);

                getInteractionData(staffs[i].email, $("."+className)[0]);
            }
        }

        init_app_folder();
        dashboardLoaded = true;
        CAN_CLOSE_MASK = true;
        $.ui.hideMask();
        jQuery(".app-folders-container").css({"opacity":0, "display":"block"}).transition({"opacity":1});
    });

}

function setPhoneNumber(staffemail, row)
{
    var current_user_email = window.localStorage.getItem("current_user:email");

    post_data('get_staff_info_by_email', {email:current_user_email, staffemail: staffemail}, function(info){
        row.find(".user-phone-button").attr("href","tel:"+info.hand_phone).show();
    });
}

function loadedLoginPanel()
{
    // Prevent user from pressing Back button to return dashboard.
    $('.error-message').text("");
    $.ui.clearHistory();

    if(cordova&&cordova.getAppVersion)
        cordova.getAppVersion().then(function (version) {
          $('#appversion, #appversion2').text(version);
    });
}

function loadedNewContactBasic(what)
{

    //alert("ernteressda");
    var current_user_email = window.localStorage.getItem("current_user:email");

    var validator = jQuery("#form-add-new-contact-basic" ).validate({
        submitHandler: function(form) {
            //form.submit();
            var data = {
                email:current_user_email,
                accountid:$(".adc-account-id").val(),
                contactname:$(".adc-name").val(),
                designationcid:$(".adc-position").val(),
                contactemail:$(".adc-email").val(),
                contactphone:$(".adc-phone").val()
            };

            post_data("save_newcontact", data, function(info){
                if(info)
                {
                    $("#afui").popup({
                        title: "Save new contact",
                        message: "Contact succesfully added.",
                        cancelText: "OK",
                        cancelCallback: function(){},
                        cancelOnly: true
                    });
                    $.ui.hideModal();


                    if($("#adc-add-mode").val()==0)
                    {
                       $(".ai-contact-name").append("<option value='"+info[0].ContactID+"'>"+$(".adc-name").val()+"</option>").val(info[0].ContactID);
                        //jQuery(".list-attend-client").transition({opacity:1});
                    }
                    else
                    {
                        loadedCompanyContact();
                    }
                    $("#form-add-new-contact-basic")[0].reset();
                }
            });
            return false;
        },
        messages: {
            name: {
                required: "Name is required"
            },
            position: {
                required : "Designation is required"
            }
        }
    });
}

function populateProjectList(data, target)
{

    if(!data)
        return;
    target = typeof target !== 'undefined' ? target : "companylist";


    var count = jQuery(".company_list").filter(":visible").length;
    for (var i = 0; i < data.length; i++) {
        var row = $( "#template_comp_list" ).clone().css({"display":"block"}).appendTo( "#"+target+" .list_cont" ).removeAttr('id').attr('id', 'ac'+data[i].ID_PROJEK).addClass("company_list");
        row.find("h3 .title").html(data[i].NAMA_PROJEK);
        row.find(".c-username").text(data[i].AGENSI_PELAKSANA);

        row.find(".menu_list .c-touch").text(data[i].STATUS_KEMAJUAN).parent().parent().addClass(data[i].ST_CODE);
        row.find(".menu_list .c-phone").text(data[i].PERATUS_JADUAL+"%");
        row.find(".menu_list .c-email").text(data[i].PERATUS_SEBENAR+"%");
        row.find(".menu_list .c-walkin").text(data[i].ISU);

        row.find(".comp-detail-link").attr("href", "#companyDetail/"+data[i].ID_PROJEK).attr("onclick", "openTab('tab-info')");;
        //Logo
        // row.find(".c-logo").attr("src", COMPANY_LOGO_URL+data[i].AccountID).error( function(info){

        //          //$(this).attr('src', '1001tech.png');
        //          $(this).attr("src", 'images/company_placeholder4.png');

        // });
        //row.find(".favoriteAccount").attr("onclick", "toggleFavoriteStar('"+data[i].AccountID+"')");
        var last = false;
        if(i+1==data.length)
            last = true;

    };

    CAN_CLOSE_MASK = true;
    //create extra rows.
}


function scrollMoreButton(api)
{
    $("#companylist .list_cont").append('<li class="last_row scrollmore company_list"><a onclick="scrollMoreClick(\''+api+'\')" class="button load-more-button block" style="">Load more...</a></li>');

}

function scrollMoreEnded()
{
   $("#companylist .list_cont").append('<li class="last_row endoflist company_list"><p>End of list</p></li>');

}

function saveAttachmentToArray()
{
    $.ui.scrollToTop("anchor-attachment");
    var accountid = $("#attachment-accountid").val();
    var filename;
    var type;

    //batch upload attachment.
    if(!fileAttached)
    {
        alert("No file selected!");
        return;
    }

    var fileURL = fileAttached.url;
    // Validation.
    if(!$("#attachment-description").val())
    {
        alert("Please enter some description.");
        return;
    }

    if(!accountid)
    {
        app.log("No attachment id");
    }
    app.log("saving account id: "+accountid);


    if(fileAttached.filename!==undefined)
    {
        app.log("fileType id: "+fileAttached.type);
        filename = fileAttached.filename;
        type = fileAttached.type;
    }
    else
    {
        filename = fileURL.substr(fileURL.lastIndexOf('/')+1);
        type = "*/*";
    }
    var attachmentsub = $("<li class='ai-attach-list'><a class='linken' style='margin-right:40px'><i class='fa fa-paperclip'></i> "+filename+"</a><div class='delete-attachlist'><a><i class='fa fa-times'></i></a></div></li>")
        .attr("upload-desc", $("#attachment-description").val())
        .attr("upload-type", type)
        .attr("upload-url", fileURL);
    if(fileAttached.uploadType == "attachment"&&type== "*/*")
        attachmentsub.find("a.linken").removeClass("linken");
    jQuery(".panel:visible").find(".attached-list").append(attachmentsub[0]).show();
    $(".attached-list p").show();

    fileURL = null;
    $("#attachment-description").val("");
    $("#upload-result").empty().hide();
    $("#smallImage").attr("src", "");
    $.ui.hideModal();

}
var downloadFile;
function openFile(file, fileType)
{
    window.plugins.fileOpener.open(encodeURI(file), fileType);
}
function openAndDownloadFile(file, fileType, fileName)
{
    fileName = fileName.substr(fileName.lastIndexOf('/')+1)
    fileName = fileName.substr(fileName.lastIndexOf('%2F')+1)
    if(fileName===undefined)
        downloadFile = {file:file, fileType:fileType}
    else
        downloadFile = {file:file, fileType:fileType, fileName: fileName}
    $.ui.showMask();
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);

}

function fail(error) {
    console.log(error)
    $.ui.hideMask();
}

function gotFS(fileSystem) {
    console.log("Root folder"+fileSystem.root.toURL());
    console.log("internal url"+fileSystem.root.toInternalURL());
    console.log("native url"+fileSystem.root.nativeURL);
    fileSystem.root.getDirectory("Download", {create: true, exclusive: false}, gotDir, fail);
}

function gotDir(dirEntry) {
    var filename = downloadFile.fileName;
    dirEntry.getFile(filename, {create: true, exclusive: false}, gotFile, fail);
}

function gotFile(fileEntry) {
    // Start FileTransfer here...
    console.log(JSON.stringify(fileEntry));
    var fileTransfer = new FileTransfer();
    var uri = encodeURI(downloadFile.file);
    var filepath = fileEntry.nativeURL;

    fileTransfer.download( uri, filepath,
        function(entry) {
            $.ui.hideMask();
            window.plugins.fileOpener.open(entry.nativeURL, downloadFile.fileType);
            console.log("download complete: " + entry.fullPath);
        },
        function(error) {
            $.ui.hideMask();
            console.log("download error source " + error.source);
            console.log("download error target " + error.target);
            console.log("upload error code" + error.code);
        }
    );
}


function delete_attendance()
{
    var current_user_email = window.localStorage.getItem("current_user:email");
    var file_list =  $(".queue-delete-contact");
    if(file_list.length==0)
    {
        return;
    }

    for(var i=0;i<file_list.length;i++)
    {
        var data = {
            contactreportattendanceid:file_list.eq(i).attr("data-crai"),
            email: current_user_email
        };
        if(file_list.eq(i).hasClass("other"))
        {
            post_data('delete_attendance_others_by_contactreportattendanceid', data, function(info){
                app.log("Attachment succesfully deleted: "+data.contactreportattendanceid);
            });
        }
        else
        {
            post_data('delete_attendance_by_contactreportattendanceid', data, function(info){
                app.log("Attachment succesfully deleted: "+data.contactreportattendanceid);
            });
        }

    }
}
function deleteAttachment()
{
    var current_user_email = window.localStorage.getItem("imon-username");

    var file_list =  $(".delete-attachment");
    if(file_list.length==0)
    {
        return;
    }

    app.log("Picture to delete: "+file_list.length);
    for(var i=0;i<file_list.length;i++)
    {
        var data = {
            id_gambar:file_list.eq(i).attr("data-docId")
        };
        post_data('DELETE_GAMBAR', data, function(info){
            if(info.STATUS == "OK")
            {
                app.log("Attachment succesfully deleted: "+data.documentid);
            }
        });
    }
}

function uploadAttachment(id_kemajuan)
{
    var file_list =  $(".ai-attach-list");

    if(file_list.length==0)
    {
        //CAN_CLOSE_MASK = true;
        $.ui.hideMask();
        $.ui.goBack();
        app.log("No files found to upload.");
        //$("#form-save-basic-interaction")[0].reset();
        $('.ai-attach-list').remove();
        //promptInteractionDetail(accountid, ciid);
        app.toast("Information saved");

        //refresher orb
        companyDetailLoaded = false;
        loadedCompanyDetail();
        return;

    }
    app.log(file_list.length + " files to upload.");
    var user_id = window.localStorage.getItem("imon-userid");
    var uri = encodeURI(UPLOAD_URL);

//    app.log("File List = " + JSON.stringify(file_list));
    for(var i=0;i<file_list.length;i++)
    {
        var data = {
            keterangan : file_list.eq(i).attr('upload-desc'),
            id_kemajuan: id_kemajuan,
            id_kemaskini: user_id
        };
        var options = new FileUploadOptions();
        var filename1 = file_list.eq(i).attr('upload-url');
        options.fileKey="file";
        options.fileName=filename1.substr(filename1.lastIndexOf('/')+1);
        options.mimeType=file_list.eq(i).attr('upload-type');

        var headers={'headerParam':'headerValue'};
        options.headers = headers;
        options.params = data;
        var ft = new FileTransfer();
        app.log("Setting filename: "+options.fileName);
        mask_queue.push(options.fileName);
        $.ui.showMask();
        (function(filename){
            ft.upload(filename1, uri,
                function(r){   //Success upload.
                    app.log("Code = " + r.responseCode);
                    app.log("Response = " + r.response);;
                    app.log("Sent = " + r.bytesSent);
                    // The last upload
                    var fileID = filename;

                    var index = mask_queue.indexOf(fileID);
                    app.log("removing - "+fileID)
                    if (index > -1) {
                        mask_queue.splice(index, 1);
                    }

                    if(mask_queue.length==0)
                    {
                        // promptInteractionDetail(accountid, ciid);
                        $.ui.hideMask();
                        $.ui.goBack();
                        $('.ai-attach-list').remove();
                        app.toast("Information saved");
                        companyDetailLoaded = false;
                        loadedCompanyDetail();
                    }
                    else
                    {
                        app.log(JSON.stringify(mask_queue));
                    }

                },
                failUpload, options);
        })(options.fileName);


    }
}

function uploadUpdateAttachment(ciid, accountid)
{
    var file_list =  $(".ai-attach-list");

    if(file_list.length==0)
    {
        CAN_CLOSE_MASK = true;
        $.ui.hideMask();
        $.ui.goBack();
        openHistoryTab(accountid);
        app.log("No files found to upload.");
        $("#form-update-basic-interaction")[0].reset();
        $('.ai-attach-list').remove();
        loadBasicInteractionHistory(accountid);
        app.toast("Information saved");
        return;

    }
    app.log(file_list.length + " files to upload.");
    var current_user_email = window.localStorage.getItem("current_user:email");
    var uri = encodeURI(UPLOAD_URL);

//    app.log("File List = " + JSON.stringify(file_list));
    for(var i=0;i<file_list.length;i++)
    {
        var data = {
            ciid : ciid,
            email: current_user_email,
            documentdesc: file_list.eq(i).attr('upload-desc')
        };
        var options = new FileUploadOptions();
        var filename1 = file_list.eq(i).attr('upload-url');
        options.fileKey="file";
        options.fileName=filename1.substr(filename1.lastIndexOf('/')+1);
        options.mimeType=file_list.eq(i).attr('upload-type');

        var headers={'headerParam':'headerValue'};
        options.headers = headers;
        options.params = data;
        var ftx = new FileTransfer();

        mask_queue.push(filename1);
        $.ui.showMask();
        (function(fileName){
            ftx.upload(filename1, uri,
            function(r){   //Success upload.
                app.log("Code = " + r.responseCode);
                app.log("Response = " + r.response);;
                app.log("Sent = " + r.bytesSent);
                // The last upload

                var index = mask_queue.indexOf(fileName);
                if (index > -1) {
                    mask_queue.splice(index, 1);
                }

                if(mask_queue.length==0)
                {
                    $.ui.hideMask();
                    $.ui.goBack();
                    $('.ai-attach-list').remove();
                    openHistoryTab(accountid);
                    app.toast("Information saved");
                }
                else
                {
                    app.log(JSON.stringify(mask_queue));
                }
            },
            failUpload, options);
        })(options.fileName);

    }
}

function promptInteractionDetail(accountid, contactinteractionid)
{
    $("#afui").popup({
        title: "Add Interaction Details",
        message: "The interaction has been saved succesfully. Do you want to continue adding the detail interaction?",
        cancelText: "No",
        cancelCallback: function(){
            openHistoryTab(accountid);
        },
        cancelOnly: false,
        doneText: "Yes",
        doneCallback: function () {
            //open add detail interaction dialog.
            //$.ui.showModal();
            $.ui.loadContent("#interactionDetails/"+accountid+"/"+contactinteractionid,false,false,"up");
        }
    });
}

function failUpload(error) {
    alert("An error has occurred: Code = " + error.code);
    app.log("upload error source " + error.source);
    app.log("upload error target " + error.target);
    $.ui.hideMask();
}

function openHistoryTab(accountid)
{
    var tab = 'tab-history';
    $("#companyDetail").find(".tab-selected").removeClass('tab-selected');
    $("#companyDetail").find(".button.pressed").removeClass('pressed');
    $("#companyDetail").find("a[tab-link='"+tab+"']").addClass('pressed');
    $("#companyDetail").find("."+tab).addClass('tab-selected');
    loadBasicInteractionHistory(accountid);
}

function openTab(tab)
{
    $("#companyDetail").find(".tab-selected").removeClass('tab-selected');
    $("#companyDetail").find(".button.pressed").removeClass('pressed');
    $("#companyDetail").find("a[tab-link='"+tab+"']").addClass('pressed');
    $("#companyDetail").find("."+tab).addClass('tab-selected');
}

function scrollMoreClick(api)
{
    var count = jQuery(".company_list").filter(":visible").length;
    var current_user_email = window.localStorage.getItem("current_user:email");
    var cluster=$("#select_company_filter").val();

    var hash = location.hash.replace(/^.*?#/, '');
    var pairs = hash.split('/');
    var staffemail = pairs[1];

    var data = {
        page: Math.floor( count / COMP_LIST_PER_PAGE ) + 1,
        rpp:COMP_LIST_PER_PAGE,
        cluster:cluster,
        keyword: $("#search-company-list").val(),
        email: current_user_email,
        staffemail:(staffemail)?staffemail:""
    };
    jQuery(".last_row.scrollmore").fadeOut();

    //self.scrollToBottom();
    app.log(JSON.stringify(data));
    post_data(api, data,
        function(info){
            if(!info)
            {
                printEndResult();
                return;
            }

            jQuery(".last_row.scrollmore").remove();
            populateProjectList(info);
            if( info.length < COMP_LIST_PER_PAGE )
                scrollMoreEnded();
            else
                scrollMoreButton(api);

            // Populate data into dictionary.
            for (var i = 0, emp; i < info.length; i++) {
                emp = info[i];
                company_data[ emp.AccountID ] = emp;
            }
     }, function(){
        jQuery(".last_row.scrollmore").fadeIn();
     });
}

function printEndResult()
{
    $("<li class='company_list'><p>Tiada projek dijumpai</p></li>").appendTo("#companylist .list_cont");
}
function loadedProjectLocation()
{
    var hash = location.hash.replace(/^.*?#/, '');
    var pairs = hash.split('/');
    var current_user_email = window.localStorage.getItem("imon-username");
    var lat = pairs[2];
    var lon = pairs[3];
    var projek_id = pairs[1];

    if(lat && lon)
        initializeMap(lat, lon);
    else
    {
        $.ui.showMask();
        navigator.geolocation.getCurrentPosition(onSuccessLocation, onErrorLocation, { timeout: 30000, enableHighAccuracy:true });
    }

    if(projek_id)
        $('.save-location').attr('onclick', 'saveLatitudeLongitude(\''+projek_id+'\');');

    $('.navigate-location').attr('onclick', 'openCoordinate();');
}

function openCoordinate()
{
    if(marker)
    {
        //var url = "geo:q="+marker.position.lat()+","+marker.position.lng()+"&z=14";
        var lat=marker.position.lat(), lng = marker.position.lng();
        //var url = "geo://"+lat+","+lng+"?q="+lat+","+lng;//+" (Lokasi projek)";
        WazeNavigator.navigateByPosition({lat:lat, lng:lng});

    }
}
// onSuccess Callback
// This method accepts a Position object, which contains the
// current GPS coordinates
//
function onSuccessLocation(position) {
    // alert('Latitude: '          + position.coords.latitude          + '\n' +
    //       'Longitude: '         + position.coords.longitude         + '\n' +
    //       'Altitude: '          + position.coords.altitude          + '\n' +
    //       'Accuracy: '          + position.coords.accuracy          + '\n' +
    //       'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
    //       'Heading: '           + position.coords.heading           + '\n' +
    //       'Speed: '             + position.coords.speed             + '\n' +
    //       'Timestamp: '         + position.timestamp                + '\n');
    initializeMap(position.coords.latitude, position.coords.longitude);
    $.ui.hideMask();
}

// onError Callback receives a PositionError object
//
function onErrorLocation(error) {
    $.ui.hideMask();
    // /alert('code: '    + error.code    + '\n' +
    //      'message: ' + error.message + '\n');

    app.log("error on getting current location");

    var lat = 4.5977616;
    var lon = 101.0902157;
    //default to ipoh locations
    app.toast("Error getting current coordinate, please check your settings.");
    initializeMap(lat,lon);
}

var mapObject;
var marker;

function initializeMap(lat, lon) {
    var mapOptions = {
        center: new google.maps.LatLng(lat, lon),
        zoom: 10,
        draggable: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var button = $('<a class="button"> Current Location</a>');
    button.off().on('click', function(){
        $(this).prepend('<i class="fa fa-circle-o-notch fa-spin" id="spininggeo"/>');
        navigator.geolocation.getCurrentPosition(
            function(position){ //success
                $('#spininggeo').remove();

                app.log(position.coords.latitude+" "+position.coords.longitude);
                mapObject.panTo({lat: position.coords.latitude, lng: position.coords.longitude});
                mapObject.setZoom(13);
                updateLocation();

            }, function(){ //failed
                console.log("Error GPS");
                $('#spininggeo').remove();
                app.toast("Error getting current coordinate, please check your settings.");
            }, { timeout: 30000 }
        );
    });
    if(!mapObject)
    {
        //$('#gmaps').append('<div id="mappingdragon" style="overflow:visible"></div>');
        mapObject = new google.maps.Map(document.getElementById("gmaps"), mapOptions);
        mapObject.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(button[0]);

        if(lat)
        {
            var loc = {lat: Number(lat), lng: Number(lon)};
            marker = new google.maps.Marker({position: loc, map: mapObject});
        }
    }
}

function unloadProjectLocation()
{
     $('#gmaps').empty();
     mapObject = undefined;
     marker = undefined;

}

function updateLocation(lat, lon)
{
    if(mapObject)
    {
        if(!lat)
        {
            var loc = mapObject.getCenter();
        }
        else
        {
            var loc = {lat: lat, lng: lon};
        }

        if(!marker)
        {
            marker = new google.maps.Marker({position: loc, map: mapObject});
        }
        else
        {
            marker.setPosition(loc);
        }
    }
}

function toCurrency(number)
{
    return parseFloat(number).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function loadedCompanyDetail(what)
{
    var hash = location.hash.replace(/^.*?#/, '');
    var pairs = hash.split('/');
    var current_user_email = window.localStorage.getItem("imon-username");
    var current_user_id = window.localStorage.getItem("imon-userid");
    var projek_id = pairs[1];

    if(companyDetailLoaded)
    {
        return;
    }

    $(".comp-detail-link")[0].scrollIntoView();

    $('#company-detail').css({'opacity':0});
    $("#companyDetail .company_list").remove();

    var data = {
        projek_id: projek_id
    };
    post_data('GET_PROJEK_INFO', data, function(info) {
        if(info)
        {
            $("#companyDetail .company_list").remove();


            //populateProjectList(info, "companyDetail");

            var new_detail = $('#company-detail');//.clone().css({'display':'block'}).removeAttr('id').addClass("comp_details").appendTo(comp_details);

            var row = $( "#template_comp_list" ).clone().css({"display":"block"}).appendTo( "#companyDetail .list_cont" ).removeAttr('id').attr('id', 'ac'+data.PROJEK_ID).addClass("company_list");
            row.find("h3 .title").html(info.NAMA_PROJEK);
            row.find(".c-username").text(info.AGENSI_PELAKSANA);
            row.find(".c-touch").text(info.STATUS_KEMAJUAN).parent().parent().addClass(info.ST_CODE);
            // row.find(".c-touch").text(info.STATUS_KEMAJUAN);
            row.find(".c-phone").text(info.PERATUS_JADUAL+"%");
            row.find(".c-email").text(info.PERATUS_SEBENAR+"%");
            row.find(".c-walkin").text("Isu: "+info.NO_ISU);


            //Logo

            //comp_details.addClass("detail-added");
            // Enable tab button.
            new_detail.find('.tab-button').bind("click", function(){
                var tab = $(this).attr('tab-link');
                $(this).parent().parent().find(".tab-selected").removeClass('tab-selected');
                $(this).parent().parent().find(".button.pressed").removeClass('pressed');
                $(this).addClass('pressed');
                $(this).parent().parent().find("."+tab).addClass('tab-selected');
            });

            new_detail.find(".c-cluster-name").text(info.ID_PROJEK);
            new_detail.find(".c-comp-reg").text(info.TAHUN_PROJEK);
            new_detail.find(".c-msc-file-id").text(info.NO_PROJEK);
            new_detail.find(".c-account-code").text(info.NAMA_PROJEK);
            new_detail.find(".c-daerah").text(info.DAERAH);
            new_detail.find(".c-account-type").text(toCurrency(info.NILAI_PERUNTUKAN));
            new_detail.find(".c-category").text(toCurrency(info.KOS_PROJEK));
            new_detail.find(".c-industry").text(info.TKH_MULA);
            new_detail.find(".c-account-group").text(info.TKH_SIAP_ASAL);
            new_detail.find(".c-classification").text(info.TKH_SIAP_SEBENAR);
            new_detail.find(".c-parent-company").text(info.LOKASI);
            new_detail.find(".c-parlimen").text(info.PARLIMEN);
            new_detail.find(".c-dun").text(info.DUN);
            new_detail.find(".c-comp-location").text(info.KATEGORI_PROJEK);
            new_detail.find(".c-bumi-status").text(info.AGENSI_PELAKSANA);
            new_detail.find(".c-business-phone").text(info.KONTRAKTOR);
            if(info.NO_TEL_KONTRAKTOR)
                new_detail.find(".tel_kon_button").attr("href","tel:"+info.NO_TEL_KONTRAKTOR).show();
            else
                new_detail.find(".tel_kon_button").hide();

            new_detail.find(".c-fax").text(info.KONSULTAN);
            if(info.NO_TEL_KONSULTAN)
                new_detail.find(".tel_konsultan_button").attr("href","tel:"+info.NO_TEL_KONSULTAN).show();
            else
                new_detail.find(".tel_konsultan_button").hide();

            new_detail.find(".c-website").text(info.STATUS_KEMAJUAN);
            new_detail.find(".c-ac-meeting-date").text(info.NAMA_INCAJ);
            new_detail.find(".c-comp-email").text(info.TKH_KEMASKINI);
            new_detail.find(".c-business-phone").text(info.KEMASKINI_OLEH);
            new_detail.find(".c-operation").text(info.NAMA_KEMASKINI);

            $('.cbp-generated').remove();
            populateBasicInteractionHistory(info.KEMAJUAN_LIST);
            populateProjekIsu(info.ISU_LIST);

            new_detail.show().addClass("halen");
            var url_img = "";
            var color = "";
            switch(info.KATEGORI_PROJEK)
            {
                case KATEGORI_PROJEK["PJK"]: url_img = "images/khas.png";
                color="#009FDA";
                break;
                case KATEGORI_PROJEK["PMR"]: url_img = "images/mesra.png";
                color="#9EAD0B";
                break;
                case KATEGORI_PROJEK["PIA"]: url_img = "images/piapias.png";
                color="#0BB1A8";
                break;
                case KATEGORI_PROJEK["RMLT"]: url_img = "images/RMLT.png";
                color="#B3103E";
                break;
            }

            //Hide or show location save button
            if(current_user_id == 1 || current_user_id == info.ID_INCAJ || !info.ID_INCAJ )
                $('.save-location').show();
            else
                $('.save-location').hide();


            //location button
            if(info.LATITUD && info.LONGITUD)
                $('.locButton').attr('href', '#projectLocation/'+info.ID_PROJEK+'/'+info.LATITUD+"/"+info.LONGITUD);
            else
                $('.locButton').attr('href', '#projectLocation/'+info.ID_PROJEK);

            $("#companyDetail .c-logo").attr("src", url_img).css('backgroundColor', color);

            jQuery("#companyDetail .company_list h3").transition({"margin-left":"73px"});
            jQuery("#companyDetail .company_list .item").transition({"opacity":"1"});
            jQuery('#company-detail').transition({'opacity':1});
            companyDetailLoaded = true;

            if(info.ST_CODE=="SS")
            {
                $('#add-project-kemajuan-button').hide();
                $('#add-project-isu-button').hide();
            }
            else
            {
                $('#add-project-kemajuan-button').show();
                $('#add-project-isu-button').show();

                $('#add-project-isu-button').attr('href', '#addProjekIsu/'+info.ID_PROJEK);
                $('#add-project-kemajuan-button').attr('href', '#addProjekKemajuan/'+info.ID_PROJEK);
            }

        }
        else
        {
            jQuery('#companyDetail .error_display').show().transition({opacity:1});
            jQuery('#companyDetail .comp_details').transition({opacity:0}).hide();
            jQuery('#companyDetail .list_cont').empty().transition({opacity:0}).hide();
        }
    }, function(){
        jQuery('#companyDetail .error_display').show().transition({opacity:1});
        jQuery('#companyDetail .comp_details').transition({opacity:0}).hide();
        jQuery('#companyDetail .list_cont').empty().transition({opacity:0}).hide();
    });
}


function loadedCompanyContact(what)
{
    var hash = location.hash.replace(/^.*?#/, '');
    var pairs = hash.split('/');
    var current_user_email = window.localStorage.getItem("current_user:email");
    var accountid = pairs[1];

    var data = {accountid:accountid};
    $(".contact-generated").remove();

    $("#adc-add-mode").val(1);
    $(".add-new-contact-button").removeAttr('onclick').attr('onclick', 'modalAddNewContactBasic(\''+accountid+'\')');

    post_data('get_list_of_contact_by_accountid', data,
        function(info) {
            if(info)
            {
                app.log("contact found!");

                for(var i=0;i<info.length;i++)
                {
                    var businessNo = "", businessState = "";
                    if(info[i].BusinessPhone)
                        businessNo = info[i].BusinessPhone.split(";");
                    if(info[i].BusinessPhoneCC)
                        businessState = info[i].BusinessPhoneCC.split(";");
                    var businessText = "";

                    if(businessNo.length > 0)
                    {
                        for(var j=0;j<businessNo.length;j++)
                        {
                            var businessPhone = "";
                            if(businessNo[j])
                            {
                                if(businessState && businessState[j])
                                {
                                    businessPhone = businessState[j] + businessNo[j];
                                }
                                else
                                {
                                    businessPhone = businessNo[j];
                                }
                                 businessText = businessText+'<li class="contactSLi ctc-business" ><a href="tel:'+businessPhone+'"><h3>Business</h3>'+businessPhone+'&nbsp;<i class="ui label green fa fa-phone fa-lg" style="float:right;font-size:16px"></i></a></li>';

                            }
                        }
                    }

                    var mobileNo = "", mobileState = "";
                    if(info[i].MobilePhone)
                        mobileNo = info[i].MobilePhone.split(";");
                    if(info[i].MobilePhoneCC)
                        mobileState = info[i].MobilePhoneCC.split(";");
                    var mobileText = "";

                    if(mobileNo.length > 0)
                    {
                        for(var j=0;j<mobileNo.length;j++)
                        {
                            var mobilePhone = "";
                            if(mobileNo[j])
                            {
                                if(mobileState && mobileState[j])
                                {
                                    mobilePhone = mobileState[j] + mobileNo[j];
                                }
                                else
                                {
                                    mobilePhone = mobileNo[j];
                                }
                                mobileText = mobileText+'<li class="contactSLi ctc-mobile" ><a href="tel:'+mobilePhone+'"><h3>Mobile Phone</h3>'+mobilePhone+' &nbsp;<i class="ui label green fa fa-phone fa-lg" style="float:right;font-size:16px"></i></a></li>';
                            }
                        }
                    }


                    var faxNo = "", faxState = "";
                    if(info[i].Fax)
                        faxNo = info[i].Fax.split(";");
                    if(info[i].FaxCC)
                        faxState = info[i].FaxCC.split(";");
                    var faxText = "";

                    if(faxNo.length > 0)
                    {
                        for(var j=0;j<faxNo.length;j++)
                        {
                            var fax = "";
                            if(faxNo[j])
                            {
                                if(faxState && faxState[j])
                                {
                                    fax = faxState[j] + faxNo[j];
                                }
                                else
                                {
                                    fax = faxNo[j];
                                }
                                faxText = faxText+'<li class="contactSLi ctc-mobile" ><a href="tel:'+fax+'"><h3>Fax</h3><span class="ctc-business">'+fax+'</span> &nbsp;<i class="ui label orange fa fa-fax fa-lg" style="float:right;font-size:16px"></i></a></li>';
                            }
                        }
                    }


                    var sub = $(".contact-template").clone().removeClass("contact-template").addClass("contact-generated").attr("id", "cid"+info[i].ContactID).show();
                    sub.find(".ctc-name").text(info[i].Name);

                    if(info[i].Role) sub.find("span.ctc-role").text(info[i].Role); else sub.find(".ctc-role").remove();
                    if(info[i].Department) sub.find("span.ctc-department").text(info[i].Department); else sub.find(".ctc-department").remove();
                    if(mobileText)
                    {
                        sub.find("ul").append(mobileText);
                    }
                    else
                        sub.find(".ctc-mobile").remove();
                    if(businessText)
                    {
                        sub.find("ul").append(businessText);
                    }
                    else
                        sub.find(".ctc-business").remove();
                    if(info[i].Email)
                    {
                        sub.find("span.ctc-email").text(info[i].Email);
                        sub.find(".ctc-email a").attr('href', 'mailto:'+info[i].Email)
                    } else
                        sub.find(".ctc-email").remove();

                    if(faxText)
                    {
                        sub.find("ul").append(faxText);
                    }
                    else
                        sub.find(".ctc-fax").remove();
                    $(".company-contact-list").append(sub);
                }
            }
            else
            {
                $("#ac"+accountid+" .c-contact-toggle .fa-circle-o").css("color: rgb(173, 173, 173);");
            }
        });

}
function toggleInteractionDetail(obj, ContactInteractionID)
{

    $(obj).parent().find(".interaction-detail").toggleClass('showen');

    //check for attachment and so on attachment-basic-list
    if($(obj).parent().find(".interaction-detail").hasClass('showen'))
    {
        jQuery($(obj).parent().find(".history-arrow")[0]).transition({"rotate":"180"});
    }
    else
    {
        jQuery($(obj).parent().find(".history-arrow")[0]).transition({"rotate":"0"});
        underPressed = false;

    }
}

function scrollMoreBasicInteractionClick(api, accountid)
{
    var count = $(".cbp-generated").length;
    var data = {
        accountid: accountid,
        page: Math.floor( count / HISTORY_LIST_PER_PAGE ) + 1,
        keyword: $("#interaction_search").val(),
        rpp: HISTORY_LIST_PER_PAGE
    };

    jQuery(".last_row.scrollmorehistory").fadeOut();

    //self.scrollToBottom();
    app.log(JSON.stringify(data));
    post_data(api, data,
        function(info){
            if(!info)
            {
                printEndBasicInteractionResult(accountid);
                return;
            }
            jQuery(".last_row.scrollmorehistory").remove();
            populateBasicInteractionHistory(info, accountid);
            if( info.length < HISTORY_LIST_PER_PAGE )
                scrollMoreBasicInteractionEnded(accountid);
            else
                scrollMoreBasicInteractionButton(api, accountid);
     }, function(){
        jQuery(".last_row.scrollmorehistory").fadeIn();
     });
}

function printEndBasicInteractionResult(accountid)
{
     $(".tab-cbp_tmtimeline").append("<li style='margin-left:30%'>No interaction history</li>");
}

function printOnErrorBasicInteraction(api, accountid)
{
    $("#company-detail .cbp_tmtimeline").append('<li class="last_row scrollmorehistory"><a onclick="scrollMoreBasicInteractionClick(\''+api+'\', \''+accountid+'\')" class="button load-more-button block" style="background-color:#E3000B;color:white;margin-left:30%">Reload content</a></li>');
}

var alreadyScrolled = false;
function loadBasicInteractionHistory(accountid)
{

    var data = {
        accountid: accountid,
        page: 1,
        keyword: $("#interaction_search").val(),
        rpp: HISTORY_LIST_PER_PAGE
    };
    var api = 'get_list_of_basicinteractionhistory_by_accountidkeywordpage';

    var hash = location.hash.replace(/^.*?#/, '');
    var pairs = hash.split('/');
    var ciid = pairs[2];

    $("#company-detail .cbp-generated").remove();
    $("#company-detail .scrollmorehistory").remove();
    $("#company-detail .endofhistory").remove();

    post_data(api, data,
        function(info){
            if(!info)
            {
                scrollMoreBasicInteractionEnded();
                app.log("#company-detail .cbp_tmtimeline");
                return;
            }
            populateBasicInteractionHistory(info, accountid, ciid);
            if( info.length < HISTORY_LIST_PER_PAGE )
                scrollMoreBasicInteractionEnded();
            else
                scrollMoreBasicInteractionButton(api, accountid);

        }, function(){
            printOnErrorBasicInteraction(api, accountid);
        });
}

function scrollMoreBasicInteractionButton(api, accountid)
{
    $("#company-detail .cbp_tmtimeline").append('<li class="last_row scrollmorehistory"><a onclick="scrollMoreBasicInteractionClick(\''+api+'\', \''+accountid+'\')" class="button load-more-button block" style="background-color:#E3000B;color:white;margin-left:30%">Load more...</a></li>');

}

function scrollMoreBasicInteractionEnded(accountid)
{
   $("#company-detail .cbp_tmtimeline").append('<li class="last_row endofhistory" style="margin-left:30%"><p>End of list</p></li>');

}

function populateBasicInteractionHistory(info)
{
    var username = window.localStorage.getItem("imon-username");
    var commentallow = window.localStorage.getItem("imon-commentallow");
    var updateallow = window.localStorage.getItem("imon-updateallow");

    kemajuan_data = {};

    for (var i = 0; info && i < info.length; i++) {

        var row = $( "#company-detail .cbp_tmtimeline-template" ).clone().css({"display":"block"}).
            appendTo( "#company-detail  .timeline-status" ).removeClass("cbp_tmtimeline-template").
            addClass("cbp-generated").attr("id", "ih"+info[i].ID_KEMAJUAN);

        row.find(".interaction-header, .history-arrow, .cbp_tmicon").attr("onclick","toggleInteractionDetail(this, '"+info[i].ID_KEMAJUAN+"')");
        row.find(".i_subject").text(info[i].STATUS_KEMAJUAN);
        row.find(".i_contact").text(info[i].ContactName);
        row.find(".interaction-header").text(info[i].TKH_LAWATAN);
        row.find(".interaction-type").text(info[i].InteractionActionType);
        row.find(".i_venue").text(info[i].PERATUS_JADUAL);
        row.find(".i_kemaskini").text(info[i].NAMA_KEMASKINI);
        row.find(".i_startdate").text(info[i].PERATUS_SEBENAR);
        row.find(".i_enddate").text(info[i].TKH_KEMASKINI);
        row.find(".i_desc").text(info[i].CATATAN);
        row.find(".i_update_button").attr('href', '#updateProjekKemajuan/'+i+'/'+info[i].ID_KEMAJUAN);
        row.find(".i_komen_button").attr('href', '#updateKemajuanKomen/'+info[i].ID_KEMAJUAN);

        if(commentallow=="0")
            row.find(".i_komen_button").hide();
        if(updateallow=="0")
            row.find(".i_update_button").hide();

        if(info[i].GAMBAR_LIST && info[i].GAMBAR_LIST.length)
        {
            for(var j = 0; j < info[i].GAMBAR_LIST.length; j++)
            {
                row.find(".img_file").append('<p>'+info[i].GAMBAR_LIST[j].KETERANGAN_GAMBAR+'</p><img style="background-image:url(\''+ATTACH_URL+encodeURI(info[i].GAMBAR_LIST[j].URL_GAMBAR)+'\');" src="'+ATTACH_URL+encodeURI(info[i].GAMBAR_LIST[j].URL_GAMBAR)+'" height="1" width="1"/>');
            }
        }
        else
        {
             row.find(".img_file").hide();
        }

        if(info[i].KOMEN)
        {
            row.find('.i_komen_message').text(info[i].KOMEN);
            row.find('.i_kemaskini_komen').text(info[i].NAMA_KOMEN+" ("+info[i].TKH_KOMEN+")");

        }
        else
        {

            row.find('.i_komen, .status_comment').hide();
        }


        //row.find(".cbp_tmtime span").text(info[i].TKH_LAWATAN);

        row.find(".panel .cbp_tmicon").addClass(info[i].ST_CODE).append("<i class='fa fa-pencil-square-o'></i>");

        emp = info[i];
        kemajuan_data[ emp.ID_KEMAJUAN ] = emp;
    }

}


function populateProjekIsu(info)
{
    var username = window.localStorage.getItem("imon-username");
    var commentallow = window.localStorage.getItem("imon-commentallow");
    var updateallow = window.localStorage.getItem("imon-updateallow");
    isu_data = {};

    for (var i = 0; info && i < info.length; i++) {

        var row = $( "#company-detail .cbp_tmtimeline-issue-template" ).clone().css({"display":"block"}).
            appendTo( "#company-detail  .timeline-issue" ).removeClass("cbp_tmtimeline-issue-template").
            addClass("cbp-generated").attr("id", "is"+info[i].ID_ISU);
        row.find(".interaction-header, .history-arrow, .cbp_tmicon").attr("onclick","toggleInteractionDetail(this, '"+info[i].ID_ISU+"')");
        row.find(".interaction-header").text(info[i].TKH_KEMASKINI);
        row.find(".i_isu").text(info[i].ISU);
        row.find(".i_tindakan").text(info[i].TINDAKAN);
        row.find(".i_j_selesai").text(info[i].TKH_JANGKA_SELESAI);
        row.find(".i_sumber_isu").text(info[i].SUMBER_ISU);
        row.find(".i_kemaskini").text(info[i].NAMA_KEMASKINI);
        row.find(".panel .cbp_tmicon").append("<i class='fa fa-info-circle'></i>");
        row.find(".u_update_button").attr('href', '#updateProjekIsu/'+info[i].ID_ISU);
        row.find(".u_komen_button").attr('href', '#updateIsuKomen/'+info[i].ID_ISU);
        if(commentallow=="0")
            row.find(".u_komen_button").hide();
        if(updateallow=="0")
            row.find(".u_update_button").hide();
        if(info[i].TKH_SELESAI)
        {
            row.find(".selesai_pada").text("Selesai pada: " + info[i].TKH_SELESAI);
            row.find(".cbp_tmicon").css('backgroundColor', 'green');
        }
        else
        {
            row.find(".selesai_pada").text("Jangkaan selesai: " + info[i].TKH_JANGKA_SELESAI).css('backgroundColor', '#F9EDED');
        }

        if(info[i].KOMEN)
        {
            row.find('.i_komen_message').text(info[i].KOMEN);
            row.find('.i_kemaskini_komen').text(info[i].NAMA_KOMEN+" ("+info[i].TKH_KOMEN+")");
            row.find(".selesai_pada").append('<i class="fa fa-comment status_comment" style="color:red;float: right;"></i>');

        }
        else
        {

            row.find('.i_komen, .status_comment').hide();
        }
        emp = info[i];
        isu_data[ emp.ID_ISU ] = emp;
    }

}


function loadCase(ContactInteractionID, TicketID)
{
    var row = $("#ih"+ContactInteractionID+" ");
    var data = {
        ticketid:TicketID
    };

    post_data("get_case_details_by_ticketid", data, function(info){
        if(info)
        {
            row.find(".ic_subject").text(info[0].Subject);
            row.find(".ic_desc").text(info[0].Description);
            row.find(".ic_channel").text(info[0].TicketChannel);
            row.find(".ic_priority").text(info[0].TicketPriority);
            row.find(".ic_status").text(info[0].TicketStatus);
            row.find(".ic_category").text(info[0].TicketCategory);
            row.find(".ic_services").text(info[0].Services);
            row.find(".ic_subservices").text(info[0].SubServices);
            row.find(".ic_respondbydate").text(extractDate(info[0].RespondByDate.date));
            row.find(".ic_requestor").text(info[0].RequestorName);
            row.find(".tab-selected").removeClass('tab-selected');
            row.find(".tab-history-case").addClass('tab-selected');
        }
    });
}

function interactionDelete(ciid, accountid, subject){
    $("#afui").popup({
        title: "Delete Interaction",
        message: "Delete this interaction \""+subject+"\"?",
        cancelText: "Cancel",
        cancelCallback: function(){},
        cancelOnly: false,
        doneText: "OK",
        doneCallback: function(){
            var current_user_email = window.localStorage.getItem("current_user:email");
            post_data('delete_interaction', {contactinteractionid: ciid, email: current_user_email}, function(info){
                loadBasicInteractionHistory(accountid);
            });
        }
    });
}
function loadDetailInteraction(ContactReportID, ContactInteractionID)
{
    var row = $("#ih"+ContactInteractionID+" ");
    var data = {
        contactreportid:ContactReportID
    };
    var attn_count = 0;
    //alert(data.contactreportid);

    //remove

    row.find(".attendance-detail-list").remove();

    post_data("get_list_of_detailinteractionhistory_by_contactreportid", data, function(info){
        if(info)
        {
            row.find(".i_detail_contact").text(info[0].ContactName);
            row.find(".i_detail_date").text(info[0].Date.date);
            row.find(".i_detail_venue").text(info[0].Venue);
            row.find(".i_lead_entity").text(info[0].LeadByEntity);
            row.find(".i_area_engagement").text(info[0].AreaOfEngagement);
            row.find(".i_detail_description").text(info[0].Description);

            row.find(".tab-selected").removeClass('tab-selected');
            row.find(".tab-history-details").addClass('tab-selected');
        }
    });
    post_data("get_list_of_attendance_by_contactreportid", data, function(info){
        if(info)
        {
            var attn_count = 0;
            var attnc_count = 0;
            for (var i = 0; i < info.length; i++) {

                var attn = $("#ih"+ContactInteractionID+" .attendance-detail-list-template").clone().removeClass("attendance-detail-list-template").addClass("attendance-detail-list").show();
                if(info[i].AttendanceType==0)
                {
                    $("#ih"+ContactInteractionID+" .attendance-detail.mdec").append(attn).show();
                    attn.find(".attendance-count").append("#"+(++attn_count));
                }
                else
                {
                    $("#ih"+ContactInteractionID+" .attendance-detail.client").append(attn).show();
                    attn.find(".attendance-count").append("#"+(++attnc_count));
                }
                attn.find(".ia_name").text(info[i].AttendanceName);
            };
        }
    });

    post_data("get_list_of_attendance_others_by_contactreportid", data, function(info){
        if(info)
        {
            var attn_count = 0;

            for (var i = 0; i < info.length; i++) {

                var attn = $("#ih"+ContactInteractionID+" .attendance-detail-list-other-template").clone().removeClass("attendance-detail-list-other-template").addClass("attendance-detail-list").show();
                $("#ih"+ContactInteractionID+" .attendance-detail.other").append(attn).show();
                attn.find(".attendance-count").append("#"+(++attn_count));
                attn.find(".ia_name").text(info[i].ContactName);
                attn.find(".ia_designation").text(info[i].ContactDesignationName);
                attn.find(".ia_email").text(info[i].Email);
                attn.find(".ia_mobilephone").text(info[i].MobilePhone);
            }
        }
    });

    post_data("get_list_of_kpi_by_contactreportid", data, function(info){
        if(info)
        {
            for (var i = 0; i < info.length; i++) {

                var attn = $("#ih"+ContactInteractionID+" .kpi-detail-list-template").clone().removeClass("kpi-detail-list-template").addClass("kpi-detail-list").appendTo("#ih"+ContactInteractionID+" .kpi-detail").show();
                attn.find(".kpi-count").append("#"+(i+1));
                attn.find(".i_kpi_criteria").text(info[i].ContactReportKPICriteria);
                attn.find(".i_kpi").text(info[i].KPI);
                attn.find(".i_target").text(info[i].Target);
                attn.find(".i_remarks").text(info[i].Remarks);
            }
        }
    });
}
var current_account_id;
function modalSearchOtherContact(accountid)
{
     current_account_id = accountid;
     $.ui.showModal("#searchContact");
}

function searchMdecContact()
{
    var count = $(".input-contact").length;
    var data = {
        keyword: $("#mdec-staff-input").val(),
        page: Math.floor( count / CONTACT_LIST_PER_PAGE ) + 1,
        rpp: CONTACT_LIST_PER_PAGE
    };

    cordova.plugins.Keyboard.close();
    jQuery(".mdec-search-result .last_row.scrollmoremdecsearch").fadeOut();

    post_data("get_list_of_staff_by_keywordpage", data, function(info){
        if(info)
        {
            $(".mdec-search-result .last_row.scrollmoremdecsearch").remove();

            for(var i=0;i<info.length;i++)
            {
                $(".mdec-search-result").append("<li class='input-contact' data-contact='"
                    +info[i].UserID+"'><a href='javascript:;'><h3>"+info[i].FullName+"</h3><i>"+info[i].Email+"</i></a></li>");
            }
            //recursive
            if(info.length<CONTACT_LIST_PER_PAGE)
            {
                $(".mdec-search-result").append('<li class="last_row "><p>End of list</p></li>');
            }
            else
            {
                $(".mdec-search-result").append('<li class="last_row scrollmoremdecsearch"><a onclick="searchMdecContact()" class="button load-more-button block">Load more...</a></li>');
            }
        }
        else
        {
            // Update zero result.
            $(".mdec-search-result").append("<li class='input-contact'><i>No staff found</i></li>");
        }
    }, function(){
        jQuery(".mdec-search-result .last_row.scrollmoremdecsearch").fadeIn();
    });
}

function loadContactMdec(what)
{
     //current_account_id = accountid;
     $(".mdec-search-result").empty();
     $("#form-mdec-search")[0].reset();
     //$.ui.showModal("#searchContactMdec");
}
function modalAttachment(accountid)
{
     current_account_id = accountid;
     $.ui.showModal("#addAttachment");
     $("#smallImage").removeAttr("src").hide();
     $("#upload-result").empty().hide();
     $("#attachment-accountid").val(accountid);
}
function modalAddNewContact(accountid)
{
     current_account_id = accountid;
     var data = {};
     $.ui.showModal("#modalNewContact");
}

function modalAddNewContactBasic(accountid)
{
     current_account_id = accountid;
     $(".adc-account-id").val(accountid);
     var data = {};
     $.ui.showModal("#modalNewContactBasic");
}

function submitNewContactBasic()
{

}

function loadedOtherContact(what)
{
    var validator = jQuery("#form-add-other-contact" ).validate({
        submitHandler: function(form) {
            submitNewOtherContact();
            return false;
        },
        messages : {
            name: {
                required: "Name is required"
            },
            position: {
                required: "Designation is required"
            }
        }
    });
}

function submitNewOtherContact()
{
    var current_user_email = window.localStorage.getItem("current_user:email");
    var data = {
        email:current_user_email,
        contactname:$(".ano-name").val(),
        designationcid:$(".ano-position").val(),
        contactemail:$(".ano-email").val(),
        contactphone:$(".ano-phone").val()
    }

    $("#form-add-other-contact")[0].reset();

    var index = attendance_other_data.length;
    $.ui.hideModal();
    jQuery("<li class='ids-contact-list other'><i class='fa fa-user'></i> "+data.contactname+"<div class='delete-list'><i class='fa fa-times'></i></div></li>").attr("data-index", index).appendTo(".list-attend-other:visible");
    jQuery(".list-attend-other").transition({opacity:1});

    attendance_other_data.push(data);
}


var listLoaded = false;

function loadedCompanyList(what) {

    companyDetailLoaded = false;
    alreadyScrolled=false;

    $.ui.backButtonText='Kembali';
    //$.ui.hideModal();
                //$.touchLayer(document.getElementsById("afui"));

    $(".backButton").attr('id', 'backButton');

    var hash = location.hash.replace(/^.*?#/, '');
    var pairs = hash.split('/');
    var current_user = window.localStorage.getItem("imon-username");
    var agency = window.localStorage.getItem("imon-agency");
    var userlevel = window.localStorage.getItem("imon-level");
    var kategori = pairs[1];

    if(kategori)
        kategori=KATEGORI_PROJEK[kategori];
    else
        kategori = '';

    //app.log(staffemail);

    //$.ui.disableNativeScrolling();

    // if(!firstTimeLoaded)
    // {
    //     loadConstant(current_user_email);
    // }

    $(".kategori-projek").html(kategori?kategori:"SEMUA");
    if(!listLoaded)
    {
        //reset company_data
        company_data = {};
        jQuery(".company_list").remove();
        $.ui.hideMask();
        mask_queue = [];

        //document.getElementById('form-company-list').reset();
        $("#select_company_filter").parent().show();

        var daerah=$("#select_company_filter").val();
        var data = {
            kategori: kategori,
            daerah: $(".daerah_select").val(),
            agensi:agency,
            keyword: $('#search-project-list').val(),
            status: $('#select_company_filter').val(),
            userlevel: userlevel
        };


        post_data('SEARCH_PROJEK', data, function(info){
            if(!info)
            {
                printEndResult();
                return;
            }
            populateProjectList(info);

            if( !listLoaded )
            {
                listLoaded = true;
            }
        }, function() {
            $("#companylist .list_cont").append('<li class="last_row scrollmore company_list"><a onclick="scrollMoreClick(\'get_list_of_companies_by_clusterkeywordpage\')" class="button load-more-button block" style="">Retry</a></li>');

        });

    }

}

function trimDate(date) {
    return date.trim().replace(/T/g, ' ').substr(0, 19);
}

function getCurrentDate()
{
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd='0'+dd
    }

    if(mm<10) {
        mm='0'+mm
    }

    today = dd+'-'+mm+'-'+yyyy;
    app.log(today);

    return today;
}

function getAddDate(numberOfDaysToAdd)
{
    var someDate = new Date();
    someDate.setDate(someDate.getDate() + numberOfDaysToAdd);

    //Formatting to dd/mm/yyyy :

    var dd = someDate.getDate();
    var mm = someDate.getMonth() + 1;
    var y = someDate.getFullYear();

    return  someFormattedDate = y + '-'+ ('0' + mm).slice(-2) + '-'+ ('0' + dd).slice(-2) ;
}

function loadedAddProjekKemajuan(what)
{
    var hash = location.hash.replace(/^.*?#/, '');
    var pairs = hash.split('/');
    var project_id = pairs[1];
    var userid = window.localStorage.getItem("imon-userid");


    $('.ai-id_project').val(project_id);
    $('.ai-user_id').val(userid);
    // $('.ai-user_id').val(project_id);

    $('.hide-onsebenar').hide();
    jQuery("#form-save-projek-kemajuan" )[0].reset();

    $(".add-attachment").attr("onclick", "modalAttachment('"+project_id+"');");
    $('.save-projek-kemajuan').css("color", "white").attr('onclick', "jQuery('#form-save-projek-kemajuan').submit()");

    var validator_save_projek_kemajuan = jQuery("#form-save-projek-kemajuan" ).validate({
        submitHandler: function(form) {
            //form.submit();
            var data = jQuery(form).serializeJSON();
            data['tkh_lawatan'] = getCurrentDate();
            var api_string;
            CAN_CLOSE_MASK = false;

            $('.save-projek-kemajuan').css("color", "#A62121").attr("onclick", "");;
            api_string  = "INSERT_PROJEK_KEMAJUAN";
            app.log("Submitting the form: "+" api: "+api_string+" data:"+JSON.stringify(data));

            post_data( api_string, data,
                function(info) {
                    app.log(JSON.stringify(info));
                    if(info&&info.ID_KEMAJUAN)
                    {
                        //Save attachment
                        uploadAttachment(info.ID_KEMAJUAN);
                        //current_account_id = accountidx;
                    }
                    else
                    {
                        CAN_CLOSE_MASK = true;
                        $.ui.hideMask();
                        window.plugins.toast.showShortBottom('Error saving user info.');
                    }
                }, function(){
                    $('.save-projek-kemajuan').css("color", "white").attr('onclick', "jQuery('#form-save-projek-kemajuan').submit()");
                }
            );
            return false;
        },
        rules: {
            peratus_jadual: {
                required: true,
                range: [0, 100]
            },
            peratus_sebenar: {
                required: true,
                range: [0, 100]
            }
        }
    });
    validator_save_projek_kemajuan.resetForm();
}

function saveLatitudeLongitude(projek_id)
{
    if(!marker)
    {
        return;
    }
    var data = {
        latitud: marker.position.lat(),
        longitud: marker.position.lng(),
        id_project: projek_id
    }

    post_data( "UPDATE_PROJEK_LATLONG", data, function(info) {
        app.log(JSON.stringify(info));
        if(info&&info.STATUS =="OK")
        {
            $.ui.goBack();
            companyDetailLoaded = false;
            loadedCompanyDetail();
        }
    });
}

function loadedUpdateProjekKemajuan()
{
    var hash = location.hash.replace(/^.*?#/, '');
    var pairs = hash.split('/');
    var id_kemajuan = pairs[2];
    var index = pairs[1];
    var userid = window.localStorage.getItem("imon-userid");

    jQuery("#form-update-projek-kemajuan" )[0].reset();

    $('.up-id_kemajuan').val(id_kemajuan);
    $('.up-user_id').val(userid);
    $('.up-peratus_jadual').val($('#ih'+id_kemajuan+' .i_venue').text());
    $('.up-peratus_sebenar').val($('#ih'+id_kemajuan+' .i_startdate').text());
    $('.up-catatan').val($('#ih'+id_kemajuan+' .i_desc').text());
    $('.kemajuan_index').val(index);
    $('.up-id_projek').val(kemajuan_data[id_kemajuan].ID_PROJEK);

    if(kemajuan_data[id_kemajuan].ST_CODE=="SS")
        $('.hide-onsebenar').show();
    else
        $('.hide-onsebenar').hide();

    $(".attached-list").empty().hide();

    if(kemajuan_data[id_kemajuan].GAMBAR_LIST && kemajuan_data[id_kemajuan].GAMBAR_LIST.length)
    {
        var info = kemajuan_data[id_kemajuan].GAMBAR_LIST;
        for(var i=0;info&&i<info.length;i++)
        {
            var attachmentsub = $("<li><a class='linken' style='margin-right:40px'><i class='fa fa-paperclip'></i> "
                +info[i].KETERANGAN_GAMBAR+"</a><div class='delete-attachlist'><a><i class='fa fa-times'></i></a></div></li>")
                .attr('data-docId', info[i].ID_GAMBAR);

            $("#updateProjekKemajuan .attached-list").append(attachmentsub);
        }
        if(info&&info.length>0)
            $("#updateProjekKemajuan .attached-list").show();
    }

    $("#updateProjekKemajuan .add-attachment").attr("onclick", "modalAttachment('"+id_kemajuan+"');");
    $('.update-projek-kemajuan').css("color", "white").attr('onclick', "jQuery('#form-update-projek-kemajuan').submit()");

    var validator_update_projek_kemajuan = jQuery("#form-update-projek-kemajuan" ).validate({
        submitHandler: function(form) {
            //form.submit();
            var data = jQuery(form).serializeJSON();
            data['tkh_lawatan'] = getCurrentDate();
            if($('.kemajuan_index').val()=="0")
                data['latest_kemajuan'] = 1;
            var api_string;
            var id_kemajuan2 = $('.up-id_kemajuan').val();
            CAN_CLOSE_MASK = false;

            $('.update-projek-kemajuan').css("color", "#A62121").attr("onclick", "");;
            api_string  = "UPDATE_PROJEK_KEMAJUAN";
            app.log("Submitting the form: "+" api: "+api_string+" data:"+JSON.stringify(data));

            post_data( api_string, data,
                function(info) {
                    app.log(JSON.stringify(info));
                    if(info&&info.STATUS =="OK")
                    {
                        app.log("deleting attachment...");
                        deleteAttachment();

                        //Save attachment
                        uploadAttachment(id_kemajuan2);
                        //current_account_id = accountidx;
                    }
                    else
                    {
                        CAN_CLOSE_MASK = true;
                        $.ui.hideMask();
                        window.plugins.toast.showShortBottom('Error saving user info.');
                    }
                }, function(){
                    $('.update-projek-kemajuan').css("color", "white").attr('onclick', "jQuery('#form-update-projek-kemajuan').submit()");
                }
            );
            return false;
        },
        rules: {
            peratus_jadual: {
                required: true,
                range: [0, 100]
            },
            peratus_sebenar: {
                required: true,
                range: [0, 100]
            }
        }
    });
    validator_update_projek_kemajuan.resetForm();
}
function loadedUpdateKemajuanKomen(what)
{
    var hash = location.hash.replace(/^.*?#/, '');
    var pairs = hash.split('/');
    var id_kemajuan = pairs[1];
    var userid = window.localStorage.getItem("imon-userid");

    $("#form-update-kemajuan-komen" )[0].reset();
    $('.kk-user_id').val(userid);
    $('.kk-peratus_jadual').text(kemajuan_data[id_kemajuan].PERATUS_SEBENAR);
    $('.kk-peratus_sebenar').text(kemajuan_data[id_kemajuan].PERATUS_JADUAL);
    $('.kk-catatan').text(kemajuan_data[id_kemajuan].CATATAN);
    $('.kk-id_kemajuan').val(id_kemajuan);

    var validator_update_kemajuan_komen = jQuery("#form-update-kemajuan-komen" ).validate({
        submitHandler: function(form) {
            //form.submit();
            var data = jQuery(form).serializeJSON();
            data['tkh_lawatan'] = getCurrentDate();
            var api_string;
            CAN_CLOSE_MASK = false;

            api_string  = "UPDATE_PROJEK_KEMAJUAN_KOMEN";
            app.log("Submitting the form: "+" api: "+api_string+" data:"+JSON.stringify(data));

            post_data( api_string, data,
                function(info) {
                    app.log(JSON.stringify(info));
                    if(info&&info.STATUS =="OK")
                    {
                        app.log("Update komen...");
                        $.ui.goBack();
                        companyDetailLoaded = false;
                        loadedCompanyDetail();

                    }
                    else
                    {
                        CAN_CLOSE_MASK = true;
                        $.ui.hideMask();
                        window.plugins.toast.showShortBottom('Error saving user info.');
                    }
                }, function(){
                }
            );
            return false;
        }
    });
    validator_update_kemajuan_komen.resetForm();
}

function loadedUpdateIsuKomen(what)
{
    var hash = location.hash.replace(/^.*?#/, '');
    var pairs = hash.split('/');
    var id_isu = pairs[1];
    var userid = window.localStorage.getItem("imon-userid");

    jQuery("#form-update-isu-komen" )[0].reset();

    $('.ik-user_id').val(userid);
    $('.selesai_pada').val(isu_data[id_isu].TKH_SELESAI);
    $('.i_isu').text(isu_data[id_isu].ISU);
    $('.i_tindakan').text(isu_data[id_isu].TINDAKAN);
    $('.i_j_selesai').text(isu_data[id_isu].TKH_JANGKA_SELESAI);
    $('.i_sumber_isu').text(isu_data[id_isu].SUMBER_ISU);
    $('.i_kemaskini').text(isu_data[id_isu].NAMA_KEMASKINI);
    $('.ik-id_isu').val(id_isu);

    var validator_update_isu_komen = jQuery("#form-update-isu-komen" ).validate({
        submitHandler: function(form) {
            //form.submit();
            var data = jQuery(form).serializeJSON();
            var api_string = "UPDATE_PROJEK_ISU_KOMEN";
            app.log("Submitting the form: "+" api: "+api_string+" data:"+JSON.stringify(data));

            post_data( api_string, data,
                function(info) {
                    app.log(JSON.stringify(info));
                    if(info&&info.STATUS =="OK")
                    {
                        app.log("Update komen...");
                        $.ui.goBack();
                        companyDetailLoaded = false;
                        loadedCompanyDetail();

                    }
                    else
                    {
                        CAN_CLOSE_MASK = true;
                        $.ui.hideMask();
                        window.plugins.toast.showShortBottom('Error saving user info.');
                    }
                }, function(){
                }
            );
            return false;
        }
    });
    validator_update_isu_komen.resetForm();
}

function loadedAddProjekIsu(what)
{
    var hash = location.hash.replace(/^.*?#/, '');
    var pairs = hash.split('/');
    var userid = window.localStorage.getItem("imon-userid");
    var id_projek = pairs[1];

    $(".au-id_project").val(id_projek);
    $(".au-user_id").val(userid);
    jQuery("#form-save-projek-isu" )[0].reset();

    var validator_save_projek_isu = jQuery("#form-save-projek-isu" ).validate({
        submitHandler: function(form) {
            //form.submit();
            var data = jQuery(form).serializeJSON();
            data['tkh_lawatan'] = getCurrentDate();
            var api_string;
            CAN_CLOSE_MASK = false;

            api_string  = "INSERT_PROJEK_ISU";
            app.log("Submitting the form: "+" api: "+api_string+" data:"+JSON.stringify(data));

            post_data( api_string, data,
                function(info) {
                    app.log(JSON.stringify(info));
                    if(info&&info.STATUS =="OK")
                    {
                        $.ui.goBack();
                        companyDetailLoaded = false;
                        loadedCompanyDetail();
                    }
                    else
                    {
                        CAN_CLOSE_MASK = true;
                        $.ui.hideMask();
                        window.plugins.toast.showShortBottom('Ralat semasa simpanan');
                    }
                }, function(){
                }
                );
            return false;
        }
    });
    validator_save_projek_isu.resetForm();
}

function loadedUpdateProjekIsu(what)
{
    var hash = location.hash.replace(/^.*?#/, '');
    var pairs = hash.split('/');
    var userid = window.localStorage.getItem("imon-userid");
    var id_isu = pairs[1];
    jQuery("#form-update-projek-isu" )[0].reset();

    $(".upi-id_isu").val(id_isu);
    $(".upi-user_id").val(userid);
    $(".upi-isu").val(isu_data[id_isu].ISU);
    $(".upi-tindakan").val(isu_data[id_isu].TINDAKAN);
    $(".upi-jangkaan_selesai").val(isu_data[id_isu].TKH_JANGKA_SELESAI);
    $(".upi-tkh_selesai").val(isu_data[id_isu].TKH_SELESAI);
    $("#upi-sumber_isu").val(isu_data[id_isu].SUMBER_ISU);


    var validator_update_projek_isu = jQuery("#form-update-projek-isu" ).validate({
        submitHandler: function(form) {
            //form.submit();
            var data = jQuery(form).serializeJSON();
            data['tkh_lawatan'] = getCurrentDate();
            var api_string;
            CAN_CLOSE_MASK = false;

            api_string  = "UPDATE_PROJEK_ISU";
            app.log("Submitting the form: "+" api: "+api_string+" data:"+JSON.stringify(data));

            post_data( api_string, data,
                function(info) {
                    app.log(JSON.stringify(info));
                    if(info&&info.STATUS =="OK")
                    {
                        $.ui.goBack();
                        companyDetailLoaded = false;
                        loadedCompanyDetail();
                    }
                    else
                    {
                        CAN_CLOSE_MASK = true;
                        $.ui.hideMask();
                        window.plugins.toast.showShortBottom('Ralat semasa simpanan');
                    }
                }, function(){
                }
                );
            return false;
        }
    });
    validator_update_projek_isu.resetForm();
}

function loadedCompanyAddress(what)
{
    var hash = location.hash.replace(/^.*?#/, '');
    var pairs = hash.split('/');
    var accountid = pairs[1];

    var data = {accountid:accountid};
    $(".address-generated").remove();

    var accountname = company_data[accountid].AccountName;

    $("#cta-address-link").attr("onclick", "getCurrentLocation('"+escape(accountname)+"');").append('<h3 style="font-size:16px">'+accountname+'</h3>');

    post_data('get_list_of_companyaddress_by_accountid', data,
        function(info) {
            if(info)
            {

                app.log("address found!");
                for(var i=0;i<info.length;i++)
                {
                    var sub = $(".address-template").clone().removeClass("address-template").addClass("address-generated").show();
                    sub.find(".cta-address1 h3").prepend(info[i].Address1);
                    if(info[i].Master)
                        sub.find(".cta-address1").prepend("<span class='ui label green'>Master</span>");

                    sub.find(".cta-address2").text(info[i].Address2);
                    sub.find(".cta-address3").text(info[i].Address3);
                    sub.find(".cta-address4").text(info[i].Address4);
                    sub.find(".cta-city").text(info[i].City);
                    sub.find(".cta-state").text(info[i].State);
                    sub.find(".cta-regioname").text(info[i].RegionName);
                    sub.find(".cta-postcode").text(info[i].PostCode);

                    $(".company-address-list").append(sub);
                }
            }
    });

}

function loadedAttachment(what)
{
    $("#selectFileBtn, #cameraBtn").show();
    $("#attachment-description").val("");
    $("#smallImage").removeAttr("src");
    $("#upload-result").empty();
}

function loadedAddInteractionDetail(what)
{
    var hash = location.hash.replace(/^.*?#/, '');
    var pairs = hash.split('/');
    var accountid = pairs[1];
    var contactinteractionid = pairs[2];

    if(!accountid || !contactinteractionid)
    {
        app.toast("Missing ID!");
        return;
    }
   $("#interactionDetails ul.list").css({'opacity':0});


    $("#form-interaction-details")[0].reset();
    $(".ids-contact-list").remove();
    $(".ids-accountid").val("").val(accountid);
    $(".ids-contactinteractionid").val("").val(contactinteractionid);

    $(".add-new-contact-detail").attr("onclick", "modalAddNewContact('"+accountid+"');");


    var validator_save_detail_interaction = jQuery("#form-interaction-details" ).validate({
        submitHandler: function(form) {
            //form.submit();
            var current_user_email = window.localStorage.getItem("current_user:email");

            var data = jQuery(form).serializeJSON();
            data['email'] = current_user_email;
            app.log("Submitting the form: "+JSON.stringify(data));
            post_data('save_detail_interaction', data,
                function(info) {
                    app.log(JSON.stringify(info));
                    if(info&&info[0].ContactReportID)
                    {
                        save_attendance(accountid, info[0].ContactReportID);
                        app.toast('Information saved.');
                        //$.ui.goBack();
                        current_account_id = data.accountid;
                        loadBasicInteractionHistory(data.accountid);
                        saveKPI(info[0].ContactReportID, data.accountid);

                        $("#afui").popup({
                            title: "Add Detail",
                            message: "The information succesfully saved.",
                            cancelText: "OK",
                            cancelCallback: function(){
                                $.ui.goBack();
                            },
                            cancelOnly: true
                        });
                    }
                    else
                    {
                        app.toast('Error saving user info.');
                    }
                }
            );
            return false;
        },
        messages: {
            themeofengagement: {
                required: "Theme of Engagement is required"
            },
            areaofengagement: {
                required: "Area of Engagement is required"
            },
            leadbyentity: {
                required: "Lead by Entity is required"
            },
        }
    });
}

function loadedUpdateInteractionDetail(what)
{
    var hash = location.hash.replace(/^.*?#/, '');
    var pairs = hash.split('/');
    var contactreportid = pairs[1];
    var contactinteractionid = pairs[2];

    if(!contactreportid||!contactinteractionid)
    {
        app.toast("Missing ID!");
        return;
    }

    $("#updateInteractionDetails ul.list").css({'opacity':0});
    $("#form-update-interaction-details" ).css({'opacity':0})[0].reset();
    $(".generated-contact").remove();
    $("#updateInteractionDetails .ids-contact-list").remove();
    $(".list-kpi").empty();

    var data = {contactreportid:contactreportid};
    var accountid;

    post_data('get_list_of_detailinteractionhistory_by_contactreportid', data, function(info){
        if(info&&info.length)
        {
            $(".ud-venue").val(info[0].Venue);
            $(".ud-themeofengagement").val(info[0].ThemeOfEngagementCID);
            $(".ud-areaofengagement").val(info[0].AreaOfEngagementCID);
            $(".ud-leadbyentity").val(info[0].LeadByEntityID);
            $(".ud-desc").val(info[0].Description);
            $(".ud-contactinteractionid").val(contactinteractionid);
            $(".ud-contactreportid").val(contactreportid);
            $(".ud-accountid").val(info[0].AccountID);
            $("#updateInteractionDetails .add-new-contact-detail").attr("onclick", "modalAddNewContact('"+info[0].AccountID+"');");
            jQuery("#form-update-interaction-details").transition({'opacity':1});
            accountid = info[0].AccountID;
        }
    });

    post_data("get_list_of_attendance_by_contactreportid", data, function(info){
        if(info&&info.length)
        {
            for(var i=0;i<info.length;i++)
            {
                if(info[i].AttendanceType==0) //staff
                {
                    jQuery("<li class='generated-contact mdec'><i class='fa fa-user'></i> "
                        +info[i].AttendanceName+"<div class='delete-list'><i class='fa fa-times'></i></div></li>")
                        .attr("data-crai", info[i].ContactReportAttendanceID)
                        .attr("data-contact", info[i].AttendanceID)
                        .appendTo("#updateInteractionDetails .list-attend-mdec");
                    jQuery("#updateInteractionDetails .list-attend-mdec").css({opacity:1});
                }
                else
                {
                     jQuery("<li  class='generated-contact client'><i class='fa fa-user'></i> "+info[i].AttendanceName
                        +"<div class='delete-list'><i class='fa fa-times'></i></div></li>")
                        .attr("data-crai", info[i].ContactReportAttendanceID)
                        .attr("data-contact", info[i].AttendanceID)
                        .appendTo("#updateInteractionDetails .list-attend-client");
                    jQuery("#updateInteractionDetails .list-attend-client").css({opacity:1});
                }
            }
        }
    });

    post_data("get_list_of_attendance_others_by_contactreportid", data, function(info){
        if(info&&info.length)
        {
            for(var i=0;i<info.length;i++)
            {
                jQuery("<li class='generated-contact other'><i class='fa fa-user'></i> "
                    +info[i].ContactName+"<div class='delete-list'><i class='fa fa-times'></i></div></li>")
                    .attr("data-crai", info[0].ContactReportAttendanceOthersID)
                    .attr("data-contact", info[0].ContactReportAttendanceOthersID)
                    .appendTo("#updateInteractionDetails .list-attend-other");
                jQuery("#updateInteractionDetails .list-attend-other").css({opacity:1});
            }
        }
    });

    post_data("get_list_of_kpi_by_contactreportid", data, function(info){
        if(info&&info.length)
        {
            for(var i=0;i<info.length;i++)
            {
                jQuery("#updateInteractionDetails .list-kpi").css({opacity:1});
                jQuery("<li class='generated-kpi'><i class='fa fa-file-text'></i> " + info[i].ContactReportKPICriteria
                    + " [ KPI:" + info[i].KPI + " | Act:"
                    + info[i].Target + " \] <div class='delete-kpi'><i class='fa fa-times'></i></div></li>")
                    .attr("data-contactreportkpiid", info[i].ContactReportKPIID)
                    .appendTo(".list-kpi:visible")
                .parent().css('opacity', 1);
            }
        }
    });


    var validator_update_detail_interaction = jQuery("#form-update-interaction-details" ).validate({
        submitHandler: function(form) {
            //form.submit();
            var current_user_email = window.localStorage.getItem("current_user:email");

            var data = jQuery(form).serializeJSON();
            data['email'] = current_user_email;
            app.log("Submitting the form: "+JSON.stringify(data));
            post_data('update_detail_interaction', data,
                function(info) {
                    app.log(JSON.stringify(info));
                    if(info&&info[0].ContactReportID)
                    {
                        saveKPI(info[0].ContactReportID, data.accountid);
                        save_attendance(accountid, info[0].ContactReportID);

                        delete_KPI();
                        delete_attendance();
                        app.toast('Information saved.');
                        //$.ui.goBack();
                        current_account_id = data.accountid;
                        loadBasicInteractionHistory(data.accountid);

                        $("#afui").popup({
                            title: "Update Detail",
                            message: "The information succesfully updated.",
                            cancelText: "OK",
                            cancelCallback: function(){
                                $.ui.goBack();
                            },
                            cancelOnly: true
                        });
                    }
                    else
                    {
                        app.toast('Error saving user info.');
                    }
                }
            );
            return false;
        },
        messages: {
            themeofengagement: {
                required: "Theme of Engagement is required"
            },
            areaofengagement: {
                required: "Area of Engagement is required"
            },
            leadbyentity: {
                required: "Lead by Entity is required"
            },
        }
    });
}
function loadedAddKPI(what)
{
    var validator_save_kpi = jQuery("#form-add-criteria" ).validate({
        submitHandler: function(form) {
            var data = jQuery(form).serializeJSON();
            $.ui.hideModal();
            jQuery("<li class='ids-kpi'><i class='fa fa-file-text'></i> "+jQuery(".kpi-criteria").find(":selected").text()+" [ KPI:"+data.kpi+" | Act:"+data.target+" \] <div class='delete-kpi'><i class='fa fa-times'></i></div></li>")
                .attr("data-kpicriteria", data.kpicriteria)
                .attr("data-kpi", data.kpi)
                .attr("data-target", data.target)
                .attr("data-remarks", data.remarks)
                .appendTo(".list-kpi:visible")
                .parent().css('opacity', 1);
                form.reset();
            return false;
        }
    });
}

function saveKPI(crid, accountid)
{

    var current_user_email = window.localStorage.getItem("current_user:email");
    var kpi_list =  $(".ids-kpi");
    if(kpi_list.length)
    {
        for(var i=0;i<kpi_list.length;i++)
        {
            var data = {
                kpicriteria:kpi_list.eq(i).attr("data-kpicriteria"),
                contactreportid:crid,
                kpi:kpi_list.eq(i).attr("data-kpi"),
                target:kpi_list.eq(i).attr("data-target"),
                remarks:kpi_list.eq(i).attr("data-remarks"),
                email:current_user_email
            };
            post_data('save_kpi', data,
                function(info){
                    if(info)
                    {
                        app.log("kpi saved:"+info[0].ContactReportKPIID);
                        //if last save.
                        if(i==kpi_list.length-1)
                            openHistoryTab(accountid);
                    }
                }
            );
        }
    }
    else
    {
        //openHistoryTab(accountid);
    }
}

function loadedAddCase()
{
    var hash = location.hash.replace(/^.*?#/, '');
    var pairs = hash.split('/');
    var accountid = pairs[1];
    var mscfileid = pairs[2];
    var contactid = pairs[3];
    var ciid = pairs[4];

    if(!accountid)
    {
        app.toast("Missing ID!");
        return;
    }

    if(mscfileid)
    {
        //to risky, changed
        //mscfileid = mscfileid.replace(/\-/g,"/");
        mscfileid = company_data[accountid].MSCFileID;

    }
    $("#form-add-case")[0].reset();

    $(".acs-mscfileid").val("").val(mscfileid);
    $(".acs-contactid").val("").val(contactid);
    $(".acs-accountid").val("").val(accountid);
    $(".acs-ciid").val("").val(ciid);

    if(contactid)
    {
        $(".acs-contact-name").attr('disabled', 'true');
        $(".acs-contactid").removeAttr('disabled');
        $(".hide-on-history").hide();
    }
    else
    {
        $(".acs-contactid").attr('disabled', 'true');
        $(".acs-contact-name").removeAttr('disabled');
        $(".hide-on-history").show();
    }

    $("#acs-respondbydate").val(getAddDate(2));

    // Add contact list

    $(".acs-contact-name .generated").remove();
    var contact_list = company_data[accountid]["contact_list"];
    if(contact_list)
    {
        for(var i=0;i<contact_list.length;i++)
        {
            $(".acs-contact-name").append("<option class='generated' value='"+contact_list[i].ContactID+"'>"+contact_list[i].Name+"</option>");
        }
    }

    var validator_save_add_case = jQuery("#form-add-case" ).validate({
        submitHandler: function(form) {
            //form.submit();
            var current_user_email = window.localStorage.getItem("current_user:email");
            var sre_mode = false;

            var data = jQuery(form).serializeJSON();
            var api_string  = "save_case_sre";

            if(company_data[data.accountid].clustername=="Stakeholder Account")
            {
                data.mscfileid = "";
                sre_mode = true;
            }

            data['email'] = current_user_email;
            app.log("Submitting the form: "+JSON.stringify(data));
            post_data(api_string, data,
                function(info) {
                    app.log(JSON.stringify(info));
                    if(sre_mode)
                    {
                        if(info&&info[0].Status=="1")
                        {
                            app.toast('Information saved.');

                            $("#afui").popup({
                                title: "Add Case",
                                message: "Your case has been escalated to Servicedesk",
                                cancelText: "OK",
                                cancelCallback: function(){$.ui.goBack();},
                                cancelOnly: true
                            });
                            loadBasicInteractionHistory(data.accountid);

                        }
                        else
                        {
                            $.ui.hideMask();
                            app.toast('Error saving user info.');
                        }
                    }
                    else
                    {
                        if(info&&info[0].Status=="1")
                        {
                            app.toast('Information saved.');
                            loadBasicInteractionHistory(data.accountid);

                            $("#afui").popup({
                                title: "Add Case",
                                message: "Your case has been escalated to Servicedesk",
                                cancelText: "OK",
                                cancelCallback: function(){$.ui.goBack();},
                                cancelOnly: true
                            });
                        }
                        else
                        {
                            $.ui.hideMask();
                            app.toast('Error saving user info.');
                        }
                    }
                }
            );
            return false;
        },
        rules: {
            respondbydate : {
                greaterThan2Days : true
            }
        },
        messages : {
            contactid: {
                required : "Contact is required"
            },
            respondbydate : {
                required : "Respond by date is required"
            },
            subject: {
                required : "Subject is required"
            },
            channel: {
                required : "Channel is required"
            },
            priority: {
                required : "Priority is required"
            },
            category: {
                required : "Category is required"
            }
        }
    });
    validator_save_add_case.resetForm();
}
var loadedAmrReport;

function loadAmrContent(accountid, topic)
{
    var data = {
        AccountID:accountid,
        topic:topic
    };
    jQuery(".amr-content").transition({opacity:0}).empty();
    if(topic == "all")
    {
        api = "amr_content_all.php?";
        $(".amr-title").text("Report");
    }
    else
    {
        api = "amr_content.php?";
        $(".amr-title").text(topic);
    }
    post_data_url( AMR_PATH+api, data, function(info){
        if(info)
        {
            $(".amr-content").html(info);
            jQuery(".amr-content").transition({opacity:1});

            if($("#ctl00_MainHolder_RptPrint_ctl09_PH table").length>0)
                $(".tab-amr .ui.segment.content").css("width", $("#ctl00_MainHolder_RptPrint_ctl09_PH table").width()+10);
            else
                $(".tab-amr .ui.segment.content").css("width", "auto");
        }
    }, function(){}, null, null, {dataType:"html"});
}
function filter(element) {
    var value = $(element).val();

    $(".list_cont > div").each(function() {
        if ($(this).text().toLowerCase().search(value.toLowerCase()) > -1) {
            $(this).show();
        }
        else {
            if(!$(this).is("div:first-child"))
                $(this).hide();


        }
    });
}

function unloadedPanel(what) {
    app.log("unloaded " + what.id);
    //hide all mask;
    mask_queue = [];
    // for(var i=0;i<AJAX_LIST.length;i++)
    // {
    //     app.log("Aborting ajax");
    //     AJAX_LIST[i].abort();
    // }
    // AJAX_LIST = [];
    $.ui.hideMask();
}

if (!((window.DocumentTouch && document instanceof DocumentTouch) || 'ontouchstart' in window)) {
    var script = document.createElement("script");
    script.src = "plugins/af.desktopBrowsers.js";
    var tag = $("head").append(script);
    //$.os.desktop=true;
}

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        //var login = app.getParameterByName("login");

        DEVICE_READY = true;

        var username = window.localStorage.getItem("imon-username");
        app.log(username);

        if(!username)
        {
            app.log("no session! kicked back to login");
            $.ui.loadContent("#login", false, false,"flip");
            return false;
        }
        if(cordova&&cordova.getAppVersion)
            cordova.getAppVersion().then(function (version) {
              $('#appversion, #appversion2').text(version);
            });
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        app.log('Received Event: ' + id);
    },
    getParameterByName: function (name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    },
    toast: function(msg)
    {
        window.plugins.toast.showShortBottom(msg);
    },
    log: function(msg)
    {
        if(DEBUG_MODE)
            console.log(msg);
    },
    logout: function() {


        //clear the mask
        mask_queue = [];
        $(".latest-interaction").empty();
        firstTimeLoaded = false;
        companyDetailLoaded = false;
        $('.wrap').css({display:'none', opacity:1});

        DISABLE_MASK = true;

        window.localStorage.clear();
        //reset dashboard
        dashboardLoaded = false;

        loadFront = false;
        $("#user-row .user-icon").css("backgroundImage", "url('images/img_placebo.jpeg')").removeAttr("src");
        $.ui.loadContent("#login",false,false,"up");
    },
    resetContent: function()
    {
        dashboardLoaded = false;
        //$("#user-row .user-icon").css("backgroundImage", "url('images/img_placebo.jpeg')").removeAttr("src");

    },
    login: function(){

        //strip data.
        // TODO: password encryption.


        var data = {
            username:$("#username").val(),
            password: $("#password").val(),
            uuid: device.uuid
        };

        //app.log(JSON.stringify(data));

        post_data("LOGIN_USER", data,
            function(info){

                if(info.login == "OK")
                {
                    app.log(JSON.stringify(info));
                    // Show dashboard

                    app.log("Creating session key! "+info.username);

                    window.localStorage.setItem("imon-username", info.username);
                    window.localStorage.setItem("imon-agency", "");

                    //this.resetContent();
                    dashboardLoaded = false;
                    firstTimeLoaded = false;

                    $("#user-row .user-icon").css("backgroundImage", "url('images/img_placebo.jpeg')").removeAttr("src");
                    $.ui.loadContent("#frontpanel",false,false,"fade");

                }
                else
                {
                    app.log(info.message);
                    $('.error-message').hide().text(info.message);
                    jQuery('.error-message').css({ opacity: 1 }).show().transition({ opacity: 1 });
                }
            }, function(){          //Error

            }, false, false);
    },
    htmlEncode : function(s) {
      return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
    },
    dates: {
        convert:function(d) {
            // Converts the date in d to a date-object. The input can be:
            //   a date object: returned without modification
            //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
            //   a number     : Interpreted as number of milliseconds
            //                  since 1 Jan 1970 (a timestamp)
            //   a string     : Any format supported by the javascript engine, like
            //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
            //  an object     : Interpreted as an object with year, month and date
            //                  attributes.  **NOTE** month is 0-11.
            return (
                d.constructor === Date ? d :
                d.constructor === Array ? new Date(d[0],d[1],d[2]) :
                d.constructor === Number ? new Date(d) :
                d.constructor === String ? new Date(d) :
                typeof d === "object" ? new Date(d.year,d.month,d.date) :
                NaN
            );
        },
        compare:function(a,b) {
            // Compare two dates (could be of any type supported by the convert
            // function above) and returns:
            //  -1 : if a < b
            //   0 : if a = b
            //   1 : if a > b
            // NaN : if a or b is an illegal date
            // NOTE: The code inside isFinite does an assignment (=).
            return (
                isFinite(a=this.convert(a).valueOf()) &&
                isFinite(b=this.convert(b).valueOf()) ?
                (a>b)-(a<b) :
                NaN
            );
        },
        inRange:function(d,start,end) {
            // Checks if date in d is between dates in start and end.
            // Returns a boolean or NaN:
            //    true  : if d is between start and end (inclusive)
            //    false : if d is before start or after end
            //    NaN   : if one or more of the dates is illegal.
            // NOTE: The code inside isFinite does an assignment (=).
           return (
                isFinite(d=this.convert(d).valueOf()) &&
                isFinite(start=this.convert(start).valueOf()) &&
                isFinite(end=this.convert(end).valueOf()) ?
                start <= d && d <= end :
                NaN
            );
        }
    }
};


//disable javascript scroll
//
$(document).ready(function(){
    $.ui.launch();
    //back button fix
    $.ui.backButtonText='Back';
    //$.touchLayer(document.getElementsById("afui"));

    $(".backButton").attr('id', 'backButton');

    //exit on back button.
    document.addEventListener("backbutton", function() {
        //history.go(-1);
        //window.location.href = "mainpage.html";
        app.log(location.hash);
        if(location.hash == "#frontpanel" || !location.hash)
        {
            app.log("exit on last page! show popup");
            if(!dialogExitShowed)
            {
                dialogExitShowed = true;
                $("#afui").popup({
                    title: "Keluar iMonitor",
                    message: "Anda pasti untuk keluar?",
                    cancelText: "Batal",
                    cancelCallback: function () {
                        console.log("cancelled");
                        dialogExitShowed = false;
                    },
                    doneText: "Pasti",
                    doneCallback: function () {
                        navigator.app.exitApp();
                        dialogExitShowed = false;
                    },
                    cancelOnly: false
                });
            }
        }

        //just exit if youre at login page.
        else if(location.hash == "#login")
        {
            app.log("exit!");
            navigator.app.exitApp();
        }
        else if(jQuery("#afui_modal:visible").length>0)
        {
            app.log("back from modal!");
            $.ui.hideModal();
        }
        else
        {
            app.log("back from page!");
            $.ui.goBack();
        }
    });



    $("#form-interaction-search").submit(function(event){
        cordova.plugins.Keyboard.close();
        loadBasicInteractionHistory($(this).find("#si_accountid").val());
        event.preventDefault();
    });

    $("#form-company-list").submit(function(event){
        company_data = {};
        jQuery(".company_list").filter(":visible").remove();
        listLoaded = false;
        loadedCompanyList();
        cordova.plugins.Keyboard.close();
        event.preventDefault();
    });
    $("#carian-projek-front").submit(function(event){
        company_data = {};
        jQuery(".company_list").filter(":visible").remove();
        $('#search-project-list').val(this.searchproject.value);
        listLoaded = false;
        cordova.plugins.Keyboard.close();
        $.ui.loadContent("#companylist",false,false,"up");
        event.preventDefault();
    });

    $("#form-other-search").submit(function(event){
        var data = {
            keyword: $("#other-staff-input").val(),
            page:1,
            rrp: COMP_LIST_PER_PAGE
        };
        cordova.plugins.Keyboard.close();
        post_data("get_list_of_contact_by_keywordpage", data,
          function(info){
            $(".input-contact").remove();
            if(info)
            {
                for(var i=0;i<info.length;i++)
                {
                    $(".other-search-result").append("<li class='input-contact' data-contact='"+info[i].ContactID+"'><h3>"+info[i].Name+"</h3><i>"+info[i].AccountName+"</i></li>");

                }
            }
            else
            {
                // Update zero result.
                $(".other-search-result").append("<li class='input-contact'><i>No staff found</i></li>");
            }
            $('.input-contact').click(function(event){
                $.ui.hideModal();
                if($('.list-attend-client [data-contact="'+$(this).attr("data-contact")+'"]').length==0)
                {
                    jQuery("<li class='ids-contact-list client'><i class='fa fa-user'></i> "+$(this).find("h3").text()+"<div class='delete-list'><i class='fa fa-times'></i></div></li>")
                        .attr("data-contact", $(this).attr("data-contact")).appendTo(".list-attend-client:visible");
                    jQuery(".list-attend-client").transition({opacity:1});
                }
                else
                {
                    $("#afui").popup({
                        title: "Contact existed",
                        message: "You cannot add same contact to attendance list.",
                        cancelText: "OK",
                        cancelCallback: function(){},
                        cancelOnly: true
                    });
                }
            });
        });
        event.preventDefault();
    });

    $('.mdec-search-result').on('click', '.input-contact', function(event){
        $.ui.hideModal();
        //check if current contact exist.
        if($('.list-attend-mdec [data-contact="'+$(this).attr("data-contact")+'"]').length==0)
        {
            jQuery("<li class='ids-contact-list mdec'><i class='fa fa-user'></i> "
                +$(this).find("h3").text()+"<div class='delete-list'><i class='fa fa-times'></i></div></li>")
                .attr("data-contact", $(this).attr("data-contact")).appendTo(".list-attend-mdec:visible");
            jQuery(".list-attend-mdec").transition({opacity:1});
        }
        else
        {
            $("#afui").popup({
                title: "Contact existed",
                message: "You cannot add same contact to attendance list.",
                cancelText: "OK",
                cancelCallback: function(){},
                cancelOnly: true
            });
        }
    });

    // SEARCH MDEC
    $("#form-mdec-search").submit(function(){
        $(".mdec-search-result").empty();
        searchMdecContact();
        event.preventDefault();

    });

    $.ui.lockPageBounce = true;

    $("#selectFileBtn").on("click", function (){
        navigator.camera.getPicture( onSuccessCamera, onFailCamera, { quality: 60,
            destinationType: navigator.camera.DestinationType.FILE_URI,
            sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
            mediaType: navigator.camera.MediaType.PICTURE
        });
    });

    $('input').on('focus', function(e) {
        e.preventDefault(); e.stopPropagation();
        window.scrollTo(0,0); //the second 0 marks the Y scroll pos. Setting this to i.e. 100 will push the screen up by 100px.
    });

    $("#addBasicInteraction, #updateBasicInteraction").on( "click", ".linken", function(event){
        var url = $(this).parent().attr("upload-url");
        var type = $(this).parent().attr("upload-type");
        openFile(url, type);
    });
    $("#addProjekKemajuan").on( "click", ".delete-attachlist a", function(event){
        event.stopPropagation();
        var obj = jQuery(this);
        app.log("popping out popup");
        $("#afui").popup({
            title: "Delete attachment",
            message: "Are you sure you want to remove this attachment?",
            cancelText: "Cancel",
            cancelCallback: function () {
                app.log("lets do nothing.");
            },
            doneText: "OK",
            doneCallback: function () {
                obj.parent().parent().slideUp().remove();
            },
            cancelOnly: false
        });
    });
    $("#updateProjekKemajuan").on( "click", ".delete-attachlist a", function(event){
        event.stopPropagation();
        var obj = jQuery(this);
        app.log("popping out popup");
        $("#afui").popup({
            title: "Delete attachment",
            message: "Are you sure you want to remove this attachment?",
            cancelText: "Cancel",
            cancelCallback: function () {
                app.log("lets do nothing.");
            },
            doneText: "OK",
            doneCallback: function () {
                obj.parent().parent().addClass("delete-attachment").slideUp();
            },
            cancelOnly: false
        });
    });
    $('.tab-button').bind("click", function(){
        var tab = $(this).attr('tab-link');
        $(this).parent().parent().find(".tab-selected").removeClass('tab-selected');
        $(this).parent().parent().find(".button.pressed").removeClass('pressed');
        $(this).addClass('pressed');
        $(this).parent().parent().find("."+tab).addClass('tab-selected');
    });
    $("#smallImage").on('error', function(){
        app.log("load image failed!");
        var loc = $("#smallImage").attr("src");
        if(loc)
            $("#upload-result").html("<p>"+loc+"</p>").show();
        $("#smallImage").hide();
    });
    //$("#startdate, #enddate").change(function(){this.value = this.value.replace(/[TZ]/g, ' ').trim()})

    $('.daerah_select').on('change', function(){
        var agency = window.localStorage.getItem("imon-agency");
        var userlevel = window.localStorage.getItem("imon-level");

        var data= {
            daerah: jQuery(this).find("option:selected").val(),
            agensi:  agency,
            userlevel: userlevel
        }
         post_data('GET_PROJEK_COUNT', data,
            function(info) {
                if(info)
                {

                    $(".total_touch").text(info.PKT);
                    $(".total_cases").text(info.PMR);
                    $(".total_company").text(info.PIA_PIAS);
                    $(".total_cm").text(info.RMLT);
                }
                else
                {
                    $(".total_company").text("0");
                }
            });
    });

    $('#select_company_filter').change(function(){
        listLoaded = false;
        loadedCompanyList();
    });

    $('.change_sebenar').on('change', function(){
        if($(this).val()=="100")
        {
            $('.hide-onsebenar').show();
        }
        else
        {
            $('.hide-onsebenar').hide();
        }
    });
});

// jQuery onload.
jQuery(function() {
    jQuery.validator.addMethod("greaterThan2Days", function(value, element) {
        return this.optional(element) || app.dates.compare(value, getAddDate(2)) >= 0 ;
    }, "Date must be 2 days from today");

    jQuery.validator.addMethod("greaterThanStartDate", function(value, element) {
        return this.optional(element) || app.dates.compare(value, $('#ai-startdate-n').val()) >= 0 ;
    }, "Date must be greater than Start Date");

    jQuery.validator.addMethod("greaterThanStartDateUpdate", function(value, element) {
        return this.optional(element) || app.dates.compare(value, $('#ui-startdate').val()) >= 0 ;
    }, "Date must be greater than Start Date");

    jQuery(".remove-contact").on("click", function(){
        $(this).parent().remove();
    });

    jQuery(".panel").on("click", '.favoriteAccount', function(){
        var current_user_email = window.localStorage.getItem("current_user:email");
        var star = $(this).find("i");
        var data = {
            email: current_user_email,
            accountid: $(this).attr("data-accountid")
        };
        if(star.hasClass("whitestar"))
        {
            data["status"] = 0;
        }
        else
        {
            data["status"] = 1;

        }
        DISABLE_MASK = true;
        post_data("set_notification_setting_fv", data, function(info){
            star.toggleClass("whitestar");
            //getCompanyFavorite(data.accountid);
            if(data["status"]==1)
            window.plugins.toast.showLongBottom('The selected account has been successfully saved for notification.');
        });

    });

    jQuery(".regioncode, .regioncodemobile").on("change", function(){
        var regionval = jQuery(this).find("option:selected" );

        $(this).parent().find('.regionval').val(regionval.attr("regioncode"));
        $(this).parent().find('.ccode').val((regionval.attr("gparentcc")!="null"?regionval.attr("gparentcc"):"")+(regionval.attr("parentcc")!="null"?regionval.attr("parentcc"):"")+""+(regionval.attr("value")!="null"?regionval.attr("value"):""));
    });

    if (!Modernizr.inputtypes.date) {
        jQuery("#dtBox").DateTimePicker({
            dateTimeFormat: "yyyy-MM-dd hh:mm:ss AA",
            dateFormat: "yyyy-MM-dd"
        });
        $("input[type='datetime-local'],input[type='date']").attr("type", "text").attr("readonly", true);

    }


});
var fileAttached;

//This will trigger insuficient permission to opener. thus by default user cannot view current attachment.
function onSuccessAttach(data) {
    fileAttached =  JSON.parse(data);

    if(fileAttached.size === undefined)
    {
        window.resolveLocalFileSystemURL(fileAttached.url, function(fileEntry) {
            fileEntry.file(function(fileObj) {
                console.log("Using non-content type uploader. Size = " + fileObj.size);
                if(fileObj.size > MAX_FILE_ATTACH)
                {
                    alert("File size exceeded 5MB");
                    return;
                }

                $("#smallImage").attr("src", fileAttached.url).css({maxWidth:"100%", maxHeight:"100%;"}).show().addClass("attachment");
                $("#upload-result").empty();
                $("#selectFileBtn").hide();
                $("#cameraBtn").hide();
            });
        });
        return;
    }

    if(fileAttached.size > MAX_FILE_ATTACH)
    {
        alert("File size exceeded 5MB");
        return;
    }

    $("#smallImage").attr("src", fileAttached.url).css({maxWidth:"100%", maxHeight:"100%;"}).show().addClass("attachment");
    $("#upload-result").empty();
    fileAttached["uploadType"] = "attachment";
    $("#selectFileBtn").hide();
    $("#cameraBtn").hide();
}

function capturePhoto() {
    navigator.camera.getPicture(onSuccessCamera, onFailCamera, { quality: 60,
        destinationType: Camera.DestinationType.FILE_URI,
        saveToPhotoAlbum: true });
}
function onSuccessCamera(imageURI) {
    $("#smallImage").attr("src", imageURI).css({maxWidth:"100%", maxHeight:"100%;"}).show();
    fileAttached = {
        url:imageURI,
        uploadType:"camera",
        filename:imageURI.substr(imageURI.lastIndexOf('/')+1),
        size:"0",
        type: "image/jpeg"
    };

    console.log(JSON.stringify(fileAttached));

    app.log("success clipping file");
    $("#cameraBtn").hide();
    $("#selectFileBtn").hide();
}

// Called if something bad happens.
//
function onFailCamera(message) {
    app.log('Failed because: ' + message);
}

//select file
var source =  0;
app.initialize();
