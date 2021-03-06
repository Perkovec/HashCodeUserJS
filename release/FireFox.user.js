﻿// ==UserScript==
// @name            HashCode Addons 
// @include         http://hashcode.ru/*
// @include         http://*.hashcode.ru/*
// @include         http://bitcode.ru/*
// @include         http://rootcode.ru/*
// @include         http://*.sezn.ru/*
// ==/UserScript==

function __extension__wrapper__(){

var __addons=['__developerMode', '__autocompleteWithLinks', '__syntaxHighlight', '__collapseLongCodeBlock', '__newAnswersAndComments', '__SearchFromGoogle', '__sortBetter', '__autocompleteWithSelection'];
﻿addonsLoader= {
    /** Все аддоны как объекты */
    addons: {},
    /** Произошел ли запуск аддонов */
    started: false,
    interval: null,
    checkStarted: function() {
        if (!this.started) addonsLoader.init();
    },
    storage: null,
    storageOnlyExports: null,
    /** Можно ли отложить сохранение storage, или выполнять немедленно */
    delayedSave: true,
    /** Это сделано из-за того, что при инициализации каждый аддон может изменить настройки и запросить их сохранение. Чтобы много раз не сериализовать одно и тоже при инициализации сохранение откладывается, а в конце инициализации все сразу сохраняется. Во всех остальных случаях предпочтительно сразу сохранять настройки. */
    commitStorage: function() {
        this.delayedSave= false;
        this.saveStorage();
    },
    initStorage: function() {
        try {
            this.storage= JSON.parse( localStorage['__addonsSettings'] );
            if ( typeof(this.storage.enabledAddons)=="undefined" || typeof(this.storage.addonsSettings)=="undefined" ) throws();
        } catch(e) {
            console.log( "Ошибка при загрузке данных\n"+ localStorage['__addonsSettings']);
            this.storage= { enabledAddons:{}, addonsSettings:{} };
            this.saveStorage();
        };
        var addonsSettings= this.storage.addonsSettings;
        for (var i=0; i<__addons.length; i++) {
            if (typeof(addonsSettings[__addons[i].name])=="undefined") {
                addonsSettings[__addons[i].name]= {};
            }
            if (typeof(__addons[i].settings)=="undefined") __addons[i].settings={};
            for (var j in addonsSettings[__addons[i].name]) {
                __addons[i].settings[j]= addonsSettings[__addons[i].name][j]; // переносим сохраненные настройки в аддон
            }
            for (var j in __addons[i].settings) {
                if (typeof(addonsSettings[__addons[i].name][j])=="undefined") {
                    addonsSettings[__addons[i].name][j]= __addons[i].settings[j]; // переносим значения по-умолчанию в сохраненные настройки
                }
            }
        }
    },

    init: function() {
        if (typeof($)=="undefined") return;
        window.clearInterval(this.interval);
        this.started= true;
        for (var i in __addons) {
            this.addons[__addons[i].name]= __addons[i]; // TODO реализовать это в деплое. Читать name и сразу формировать addons, __addons убрать вовсе
            __addons[i].saveSettings= this.saveAddonSettings; // TODO нужно наследование, а не это
            if (typeof(this.addons[__addons[i].name].namesResolver)!="function") this.addons[__addons[i].name].namesResolver= this.namesResolver;
            if (typeof(this.addons[__addons[i].name].drawer)!="function") this.addons[__addons[i].name].drawer= this.defaultDrawer;
        };
        var build= parseInt("29"); // версия вставляется сбощиком
        window.addEventListener("message", this.setSettingsListener, false);
        this.API.addCSS(this.getCssByDomain(location.hostname));

        this.callEventIterator("beforeDraw");

        var img_div = document.createElement('div');
        img_div.className = "img-bl";
        var img = document.createElement('div');
        img.className = "addons-settings-img";
        var img_src = "url(data:image/png;base64,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) no-repeat";
        $(img).css("background", img_src);
        img.onclick = function (e) {
            if (div1.style.display == "block") {
                div1.style.display = "none";
                $(".img-bl-clicked").removeClass("img-bl-clicked").addClass("img-bl");
                $(".addons-settings-img-clicked").removeClass("addons-settings-img-clicked").addClass("addons-settings-img");
            } else {
                window.addonsLoader.clearClicked();
                div1.style.display = "block";
                $(".img-bl").removeClass("img-bl").addClass("img-bl-clicked");
                $(".addons-settings-img").removeClass("addons-settings-img").addClass("addons-settings-img-clicked");
            };
        };
        $("#searchBar div")[0].innerHTML= "<div class='top_nav'>"+$("#searchBar div")[0].innerHTML.replace(/(<input)/i, "</div><input");
		$(img_div).insertAfter($("#searchBar div.top_nav")[0]);
        img_div.appendChild(img);
        var imgRect = img.getBoundingClientRect();

        var div1 = document.createElement("div");
        div1.className = "addons-settings";
        div1.id = "__div_options";
        var htmlDiv = "<DIV class='addons-overflow'>";
        var htmlDiv2 = "";

        for (var i in __addons) {
            htmlDiv += "<DIV class='addons-listitem' onclick='window.addonsLoader.openSettingsPage(\"" + __addons[i].name + "\", this);'><SPAN class='addon-desc-ico'>?</SPAN><DIV class='addon-name'><SPAN>" + __addons[i].title + "</SPAN></DIV>";
            htmlDiv += "<DIV id=\"" + __addons[i].name + "\" class='addon-checkbox'  onclick='event.stopPropagation();window.addonsLoader.toogleAddonEnabled(\"" + __addons[i].name + "\", this);' style='background: \"" + img_src + "\"'></DIV></DIV>";
            htmlDiv2 += "<DIV class='addons-desc-bl' id='__addonspage" + __addons[i].name + "'></DIV>";
        };
        htmlDiv += "</DIV><DIV>" + htmlDiv2 + "</DIV><DIV class='addons-but-save' onclick='window.addonsLoader.migrateStorageToSezn()'>Сохранить</DIV> <DIV class='addons-but-close' onclick='this.parentNode.style.display=\"none\";$(\".img-bl-clicked\").removeClass(\"img-bl-clicked\").addClass(\"img-bl\");$(\".addons-settings-img-clicked\").removeClass(\"addons-settings-img-clicked\").addClass(\"addons-settings-img\");'>Закрыть</DIV>";
        //console.log(htmlDiv);
        div1.style.left = ((imgRect.left + (window.pageXOffset || document.body.scrollLeft) - (document.body.clientLeft || 0)) - 532) + "px";
        $(window).resize(function () {imgRect = img.getBoundingClientRect(); div1.style.left = ((imgRect.left + (window.pageXOffset || document.body.scrollLeft) - (document.body.clientLeft || 0)) - 532) + "px";});
        div1.innerHTML = htmlDiv;
        img_div.appendChild(div1);

        this.callEventIterator("afterDraw");

        for (var i in __addons) {
            $('#' + __addons[i].name + '').css("background", img_src);
            if (this.storage.enabledAddons[__addons[i].name] == "yes") {
                $('#' + __addons[i].name + '').removeClass("addon-checkbox").addClass("addon-checkbox-clicked");
            } else $('#' + __addons[i].name + '').removeClass("addon-checkbox-clicked").addClass("addon-checkbox");
        }
		this.callEventIterator("run");
		
        this.commitStorage();

        this.callEventIterator("afterInit");
    },

    /** Создает уникальные имена для настроек. Так как эта функция будет присвоена объекту-аддону, то this это ссылка на объект-аддон. */
    namesResolver: function(name) {
            return this.name+"_setting_"+name;
    },

    /** Отрисовщик блока настроек по-умолчанию, возвращает HTML блока настроек, получает уже имеющийся HTML. Так как эта функция будет присвоена объекту-аддону, то this это ссылка на объект-аддон. */
    defaultDrawer: function(html) {
        var API= window.addonsLoader.API;
        if (typeof(this.title)!="undefined") html+="<h3>"+this.title+"</h3>";
        if (typeof(this.description)!="undefined") html+="<div class='addons-description'>"+this.description+"</div>";
        if (typeof(this.exports)!="undefined"){
            for (var i=0; i<this.exports.length; i++) {
                var param= this.exports[i];
                var paramId= this.namesResolver(param.name);
                var paramValue= this.settings[param.name];
                if (typeof(param.title)!="undefined") html+="<div><div>"+param.title+"</div><div>";
                if (param.type=='text') {
                    html+="<INPUT type='text' value='"+API.escapeHtml(paramValue)+"' name='"+paramId+"' >";
                } else if (param.type=='checkbox') {
                    html+="<INPUT type='checkbox' name='"+paramId+"' ";
                    if (paramValue!='0' && paramValue!=0) html+="checked ";
                    html+=">";
                } else if (param.type=='radio'){
                    for (var j in param.options) {
                        html+="<LABEL><INPUT type='radio' value='"+escapeHtml(j)+"' name='"+paramId+"' ";
                        if (j==paramValue) html+="checked ";
                        html+=">"+param.options[j]+"</LABEL>";
                    }
                } else if (param.type=='select') {
                    html+="<SELECT name='"+paramId+"' value='"+escapeHtml(paramValue)+"'>";
                    for (var j in param.options) {
                        html+="<OPTION value='"+escapeHtml(j)+"' ";
                        if (j==paramValue) html+= "selected ";
                        html+=">"+param.options[j]+"</OPTION>";
                    };
                    html+="</SELECT>";
                } else if (param.type=='textarea') {
                    html+="<TEXTAREA name='"+paramId+"'>"+escapeHtml(paramValue)+"</TEXTAREA>";
                };
                html+="</div></div>";
            };
        };
        return html;
    },

    /** Показывает страницу настроек аддона. Если страница пуста вызывает отрисовщик, если отрисовщика нет, то назначает отрисовщик по-умолчанию. */
    openSettingsPage: function(addonName, targetItem) {
        $("#prev-selected").removeClass("addons-listitem-clicked").addClass("addons-listitem").removeAttr("id");
        targetItem.className='addons-listitem-clicked';
        targetItem.id='prev-selected';
        $(".addons-desc-bl").css("display", "none");
        if ($("#__addonspage"+addonName).html()=="") {
            $("#__addonspage"+addonName).html(
                this.addons[addonName].drawer("<div onclick='window.addonsLoader.clearClicked();' class='addons-desc-ex'>x</div>") );
        };
        $("#__addonspage"+addonName).css("display", "block");
    },

    /** Сохраняет storage, если нельзя отложить (микрооптимизация) */
    saveStorage: function() {
        if (!this.delayedSave) {
            localStorage['__addonsSettings']= JSON.stringify(this.storage);
        };
    },
    /** включается в аддон как saveSettings */
    saveAddonSettings: function() {
        window.addonsLoader.storage.addonsSettings[this.name]=this.settings;
        window.addonsLoader.saveStorage();
    },
    /** слушает когда придет сообщение установить настройки (используется в iframe для миграции) */
    setSettingsListener: function(message, url){
	    if ( typeof( message.data ) !== "string") return;
        if (message.data.substring(0, 12)=="SetSettings:"){
            var storageOnlyExports= JSON.parse(message.data.substring(12));
            for (var i in storageOnlyExports){
                if (typeof(window.addonsLoader.storage.addonsSettings[i])=='undefined') window.addonsLoader.storage.addonsSettings[i]={};
                for (var j in storageOnlyExports[i]) {
                    window.addonsLoader.storage.addonsSettings[i][j]= storageOnlyExports[i][j];
                };
            };
            window.addonsLoader.commitStorage();
            message.source.postMessage("SettingsSets:"+location.hostname, '*');
        }
    },

    sezn: 'hashcode.ru math.hashcode.ru careers.hashcode.ru russ.hashcode.ru games.sezn.ru turism.sezn.ru foto.sezn.ru hm.sezn.ru meta.hashcode.ru admin.hashcode.ru user.hashcode.ru phys.sezn.ru english.sezn.ru'.split(' '),

    migrateStorageToSezn: function() {
        this.storageOnlyExports={};
        for (var i in this.addons) {
            this.storageOnlyExports[i]= {};
            for (var settingId in this.addons[i].exports) {
                var setting= this.addons[i].exports[settingId];
                var resolvedName= this.addons[i].namesResolver(setting.name);
                var inputs= document.getElementsByName(resolvedName);
                if (inputs.length!=0) {
                    if ( setting.type=="text" || setting.type=="textarea" || setting.type=="select" ) {
                        var value= inputs[0].value;
                    } else if ( setting.type=="checkbox") {
                        var value= inputs[0].checked ? '1':'0';
                    } else if ( setting.type=="radio") {
                        for (var j=0; j<params.length; j++) {
                            if (inputs[j].checked) {
                                var value= params[j].value;
                                break;
                            }
                        }
                    }
                } else {
                    var value= this.addons[i].settings[setting.name];
                }
                this.storageOnlyExports[i][setting.name]= value;
                this.storage.addonsSettings[i][setting.name]=value;
            };
        };
        this.commitStorage();
        var frames={};
        window.addEventListener("message", function(message, url){
            if (message.data.substring(0, 13)=="SettingsSets:"){
                frames[message.data.substring(13)][1]=true;
            }
        });
        $("#__div_options").html("<div class='addons-save-info'><h3>Идет сохранение настроек, это может занять некоторое время</h3><br/>Сохранено <span id='__addons_span_count'>0</span> сайтов из "+this.sezn.length+ "</div>");
        for (var i=0; i<this.sezn.length; i++) {
            if (location.hostname!=this.sezn[i]){
                var frame= document.createElement("iframe");
                frame.width=frame.height='1px';
                frame.onload= function(){
                    var iframe=this;
                    window.setTimeout(function(){
                            iframe.contentWindow.postMessage("SetSettings:"+JSON.stringify(window.addonsLoader.storageOnlyExports), "*");
                        }, 1500, false);
                };
                frame.src='http://'+this.sezn[i]+"/about/";
                frames[this.sezn[i]]=[frame, false];
                document.body.appendChild(frame);
            } else {
                frames[this.sezn[i]]=[null, true];
            }
        };
        var framesChecker= function(){
            var count=0;
            for (var i=0; i<window.addonsLoader.sezn.length; i++) {
                if (frames[window.addonsLoader.sezn[i]][1]) {
                    count++;
                }
            };
            $("#__addons_span_count").html(count);
            if (count==window.addonsLoader.sezn.length) {
                window.clearInterval(intervalFramesCheck);
                location.reload();
            };
        };
        var intervalFramesCheck= window.setInterval(framesChecker, 1000, false);
    },

    clearClicked: function() {
        $(".addons-desc-bl").css("display", "none");
        $("#prev-selected").removeClass("addons-listitem-clicked").addClass("addons-listitem").removeAttr("id");
    },
    toogleAddonEnabled: function(addonName, targetNode){
        this.storage.enabledAddons[addonName]= this.storage.enabledAddons[addonName]=="yes" ? "no":"yes";
        if ( this.storage.enabledAddons[addonName]=="yes" ) {
            $(targetNode).removeClass("addon-checkbox").addClass("addon-checkbox-clicked");
        } else {
            $(targetNode).removeClass("addon-checkbox-clicked").addClass("addon-checkbox");
        }
        this.saveStorage();
    },

    callEventIterator: function(nameEvent) {
        for (var i=0; i<__addons.length; i++) {
		    if (this.storage.enabledAddons[__addons[i].name] == "yes" && typeof(__addons[i][nameEvent])=="function" ) {
				try {
					__addons[i][nameEvent]();
				} catch(e) {
					window.onerror= function (descr, page, line) {
						console.log("Номер строки в функции "+nameEvent+": "+line);
						return true;
					};
					console.log('Ошибка в аддоне "'+__addons[i].title+"\" ("+__addons[i].name+")\n"+e.name+" : "+e.message);
					var fictiveScr= document.createElement('script');
					fictiveScr.textContent= __addons[i][nameEvent].toString().replace(/^.*?\{|\}.*?$/g, '');
					document.head.appendChild(fictiveScr);
				};
			};
        }
    },

    getCssByDomain: function (domain) {
        if (domain=="localhost") domain= "meta.hashcode.ru";
        var css = ".top_nav{float:left;width:680px}.img-bl,.img-bl-clicked{float:left;overflow:hidden;height:16px;width:16px;margin-left:9px;border:2px solid #F5F5F5;cursor:pointer;}.img-bl-clicked{height:18px;border-radius:10px 0px 0px 0px;}.addons-settings-img,.addons-settings-img-clicked{width:16px;height:18px;cursor:pointer;}.addons-settings{display:none;position:absolute;z-index:99;width:546px;height:268px;border-radius:10px 0px 0px 0px }.addons-overflow{overflow-y:auto;height:100%;margin-top:5px;}#__div_options .addons-overflow{height:232px;}.addons-listitem,.addons-listitem-clicked{height:20px;width:500px;margin-top:6px;}.addons-listitem-clicked .addon-name span{color:white}.addon-checkbox,.addon-checkbox:hover{float:right; height:20px;width:20px;cursor:pointer;background-color:transparent} .addon-checkbox-clicked,.addon-checkbox-clicked:hover{float:right;height:20px;width:20px;cursor:pointer;background-color:transparent}.addon-name{float:left;height:20px;width:350px;word-wrap:break-word;background-color:transparent;text-align:left}.addon-name span{cursor:pointer}.addon-desc-ico{float:left;width:13px;margin-right:5px;text-align:center;border-radius:20px;color:#fff;font:bold 12px Arial;cursor:pointer}.addons-desc-bl{width:300px;padding:5px;word-wrap:break-word;position:absolute;top:0;left:548px;border-radius: 0px 10px 10px 0px;text-align:left;}.addons-desc-ex{font-weight: bold;float:right;color:red;cursor:pointer;}.addons-but-save,.addons-but-save:hover{float:left;width:70px;margin-top:10px;text-align:center;color:#333333;cursor:pointer;}.addons-but-save:hover{color:#000;}.addons-but-close,.addons-but-close:hover{float:left;width:60px;margin-left:10px;margin-top:10px;text-align:center;color:#333333;cursor:pointer;}.addons-but-close:hover{color:#000;}.addons-save-info{text-align:center;padding-top:10px;}.addons-save-info h3{padding-bottom:10px}";
        switch (domain) {
            case this.sezn[0]:
                css += ".img-bl-clicked{border:2px solid #AF7817;background-color:#AF7817;}.addons-settings-img-clicked{background-position: 0 -15px !important;}.addons-settings {border:2px solid #AF7817;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #fbac6f;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #fbac6f;background-color:#AF7817} .addon-checkbox {background-position: 0 -45px !important;} .addon-checkbox:hover {background-position: 0 -70px !important;} .addon-checkbox-clicked{background-position: 0 -95px !important;} .addon-checkbox-clicked:hover{background-position: 0 -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #AF7817;}.addons-desc-bl{border:1px solid #AF7817;background-color:white;}.addons-but-save{border:2px solid #AF7817;background-color:#AF7817;}.addons-but-save:hover{border:2px solid #ECE5B6;background-color:#ECE5B6;}.addons-but-close{border:2px solid #AF7817;background-color:#AF7817;}.addons-but-close:hover{border:2px solid #ECE5B6;background-color:#ECE5B6;}.addons-save-info h3{border-bottom: 1px solid #fbac6f;}";
                break
            case this.sezn[1]:
                css += ".img-bl-clicked{border:2px solid #839C12;background-color:#839C12;}.addons-settings-img{background-position: -24px 0 !important;}.addons-settings-img-clicked{background-position: -24px -15px !important;}.addons-settings {border:2px solid #839C12;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #73A873;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #7DE97D;background-color:#839C12} .addon-checkbox {background-position: -24px -45px !important;} .addon-checkbox:hover {background-position: -24px -70px !important;} .addon-checkbox-clicked{background-position: -24px -95px !important;} .addon-checkbox-clicked:hover{background-position: -24px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #839C12;}.addons-desc-bl{border:1px solid #839C12;background-color:white;}.addons-but-save{border:2px solid #839C12;background-color:#839C12;}.addons-but-save:hover{border:2px solid #CFE961;background-color:#CFE961;}.addons-but-close{border:2px solid #839C12;background-color:#839C12;}.addons-but-close:hover{border:2px solid #CFE961;background-color:#CFE961;}.addons-save-info h3{border-bottom: 1px solid #73A873;}";
                break
            case this.sezn[3]:
                css += ".img-bl-clicked{border:2px solid #078775;background-color:#078775;}.addons-settings-img{background-position: -48px 0 !important;}.addons-settings-img-clicked{background-position: -48px -15px !important;}.addons-settings {border:2px solid #078775;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #68A79D;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #68A79D;background-color:#078775} .addon-checkbox {background-position: -48px -45px !important;} .addon-checkbox:hover {background-position: -48px -70px !important;} .addon-checkbox-clicked{background-position: -48px -95px !important;} .addon-checkbox-clicked:hover{background-position: -48px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #078775;}.addons-desc-bl{border:1px solid #839C12;background-color:white;}.addons-but-save{border:2px solid #078775;background-color:#078775;}.addons-but-save:hover{border:2px solid #5BCCBB;background-color:#5BCCBB;}.addons-but-close{border:2px solid #078775;background-color:#078775;}.addons-but-close:hover{border:2px solid #5BCCBB;background-color:#5BCCBB;}.addons-save-info h3{border-bottom: 1px solid #68A79D;}";
                break
            case this.sezn[4]:
                css += ".img-bl-clicked{border:2px solid #7D8C8B;background-color:#7D8C8B;}.addons-settings-img{background-position: -72px 0 !important;}.addons-settings-img-clicked{background-position: -72px -15px !important;}.addons-settings {border:2px solid #7D8C8B;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #929B92;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #929B92;background-color:#7D8C8B} .addon-checkbox {background-position: -72px -45px !important;} .addon-checkbox:hover {background-position: -72px -70px !important;} .addon-checkbox-clicked{background-position: -72px -95px !important;} .addon-checkbox-clicked:hover{background-position: -72px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #7D8C8B;}.addons-desc-bl{border:1px solid #7D8C8B;background-color:white;}.addons-but-save{border:2px solid #7D8C8B;background-color:#7D8C8B;}.addons-but-save:hover{border:2px solid #AABFBD;background-color:#AABFBD;}.addons-but-close{border:2px solid #7D8C8B;background-color:#7D8C8B;}.addons-but-close:hover{border:2px solid #AABFBD;background-color:#AABFBD;}.addons-save-info h3{border-bottom: 1px solid #929B92;}";
                break
            case this.sezn[5]:
                css += ".img-bl-clicked{border:2px solid #037f00;background-color:#037f00;}.addons-settings-img{background-position: -96px 0 !important;}.addons-settings-img-clicked{background-position: -96px -15px !important;}.addons-settings {border:2px solid #037f00;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #167516;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #167516;background-color:#037f00} .addon-checkbox {background-position: -96px -45px !important;} .addon-checkbox:hover {background-position: -96px -70px !important;} .addon-checkbox-clicked{background-position: -96px -95px !important;} .addon-checkbox-clicked:hover{background-position: -96px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #037f00;}.addons-desc-bl{border:1px solid #037f00;background-color:white;}.addons-but-save{border:2px solid #037f00;background-color:#037f00;}.addons-but-save:hover{border:2px solid #4bca5d;background-color:#4bca5d;}.addons-but-close{border:2px solid #037f00;background-color:#037f00;}.addons-but-close:hover{border:2px solid #4bca5d;background-color:#4bca5d;}.addons-save-info h3{border-bottom: 1px solid #167516;}";
                break
            case this.sezn[6]:
                css += ".img-bl-clicked{border:2px solid #751f5b;background-color:#751f5b;}.addons-settings-img{background-position: -120px 0 !important;}.addons-settings-img-clicked{background-position: -120px -15px !important;}.addons-settings {border:2px solid #751f5b;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #72457F;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #72457F;background-color:#751f5b} .addon-checkbox {background-position: -120px -45px !important;} .addon-checkbox:hover {background-position: -120px -70px !important;} .addon-checkbox-clicked{background-position: -120px -95px !important;} .addon-checkbox-clicked:hover{background-position: -120px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #751f5b;}.addons-desc-bl{border:1px solid #751f5b;background-color:white;}.addons-but-save{border:2px solid #751f5b;background-color:#751f5b;}.addons-but-save:hover{border:2px solid #c1b7ad;background-color:#c1b7ad;}.addons-but-close{border:2px solid #751f5b;background-color:#751f5b;}.addons-but-close:hover{border:2px solid #c1b7ad;background-color:#c1b7ad;}.addons-save-info h3{border-bottom: 1px solid #72457F;}";
                break
            case this.sezn[7]:
                css += ".img-bl-clicked{border:2px solid #cf3939;background-color:#cf3939;}.addons-settings-img{background-position: -144px 0 !important;}.addons-settings-img-clicked{background-position: -144px -16px !important;}.addons-settings {border:2px solid #cf3939;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #BD2424;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #BD2424;background-color:#cf3939} .addon-checkbox {background-position: -144px -45px !important;} .addon-checkbox:hover {background-position: -144px -70px !important;} .addon-checkbox-clicked{background-position: -144px -95px !important;} .addon-checkbox-clicked:hover{background-position: -144px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #cf3939;}.addons-desc-bl{border:1px solid #cf3939;background-color:white;}.addons-but-save{border:2px solid #cf3939;background-color:#cf3939;}.addons-but-save:hover{border:2px solid #d3dddf;background-color:#d3dddf;}.addons-but-close{border:2px solid #cf3939;background-color:#cf3939;}.addons-but-close:hover{border:2px solid #d3dddf;background-color:#d3dddf;}.addons-save-info h3{border-bottom: 1px solid #BD2424;}";
                break
            case this.sezn[8]:
                css += ".img-bl-clicked{border:2px solid #5E7BD6;background-color:#5E7BD6;}.addons-settings-img{background-position: -168px 0 !important;}.addons-settings-img-clicked{background-position: -168px -15px !important;}.addons-settings {border:2px solid #5E7BD6;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #3F5CA8;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #3F5CA8;background-color:#5E7BD6} .addon-checkbox {background-position: -168px -45px !important;} .addon-checkbox:hover {background-position: -168px -70px !important;} .addon-checkbox-clicked{background-position: -168px -95px !important;} .addon-checkbox-clicked:hover{background-position: -168px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #5E7BD6;}.addons-desc-bl{border:1px solid #5E7BD6;background-color:white;}.addons-but-save{border:2px solid #5E7BD6;background-color:#5E7BD6;}.addons-but-save:hover{border:2px solid #A4B1DD;background-color:#A4B1DD;}.addons-but-close{border:2px solid #5E7BD6;background-color:#5E7BD6;}.addons-but-close:hover{border:2px solid #A4B1DD;background-color:#A4B1DD;}.addons-save-info h3{border-bottom: 1px solid #3F5CA8;}";
                break
            case this.sezn[9]:
                css += ".img-bl-clicked{border:2px solid #A68221;background-color:#A68221;}.addons-settings-img{background-position: -192px 0 !important;}.addons-settings-img-clicked{background-position: -192px -15px !important;}.addons-settings {border:2px solid #A68221;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #B19E3A;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #B19E3A;background-color:#A68221} .addon-checkbox {background-position: -192px -45px !important;} .addon-checkbox:hover {background-position: -192px -70px !important;} .addon-checkbox-clicked{background-position: -192px -95px !important;} .addon-checkbox-clicked:hover{background-position: -192px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #A68221;}.addons-desc-bl{border:1px solid #A68221;background-color:white;}.addons-but-save{border:2px solid #A68221;background-color:#A68221;}.addons-but-save:hover{border:2px solid #E5D095;background-color:#E5D095;}.addons-but-close{border:2px solid #A68221;background-color:#A68221;}.addons-but-close:hover{border:2px solid #E5D095;background-color:#E5D095;}.addons-save-info h3{border-bottom: 1px solid #B19E3A;}";
                break
            case this.sezn[10]:
                css += ".img-bl-clicked{border:2px solid #839C12;background-color:#839C12;}.addons-settings-img{background-position: -216px 0 !important;}.addons-settings-img-clicked{background-position: -216px -15px !important;}.addons-settings {border:2px solid #839C12;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #4E9E4E;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #4E9E4E;background-color:#839C12} .addon-checkbox {background-position: -216px -45px !important;} .addon-checkbox:hover {background-position: -216px -70px !important;} .addon-checkbox-clicked{background-position: -216px -95px !important;} .addon-checkbox-clicked:hover{background-position: -216px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #839C12;}.addons-desc-bl{border:1px solid #839C12;background-color:white;}.addons-but-save{border:2px solid #839C12;background-color:#839C12;}.addons-but-save:hover{border:2px solid #90c235;background-color:#90c235;}.addons-but-close{border:2px solid #839C12;background-color:#839C12;}.addons-but-close:hover{border:2px solid #90c235;background-color:#90c235;}.addons-save-info h3{border-bottom: 1px solid #4E9E4E;}";
                break
            case this.sezn[11]:
                css += ".img-bl-clicked{border:2px solid #146695;background-color:#146695;}.addons-settings-img{background-position: -240px 0 !important;}.addons-settings-img-clicked{background-position: -240px -15px !important;}.addons-settings {border:2px solid #146695;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #42679E;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #42679E;background-color:#146695} .addon-checkbox {background-position: -240px -45px !important;} .addon-checkbox:hover {background-position: -240px -70px !important;} .addon-checkbox-clicked{background-position: -240px -95px !important;} .addon-checkbox-clicked:hover{background-position: -240px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #146695;}.addons-desc-bl{border:1px solid #146695;background-color:white;}.addons-but-save{border:2px solid #146695;background-color:#146695;}.addons-but-save:hover{border:2px solid #a2e4fe;background-color:#a2e4fe;}.addons-but-close{border:2px solid #146695;background-color:#146695;}.addons-but-close:hover{border:2px solid #a2e4fe;background-color:#a2e4fe;}.addons-save-info h3{border-bottom: 1px solid #42679E;}";
                break
            case this.sezn[12]:
                css += ".img-bl-clicked{border:2px solid #bd0e27;background-color:#bd0e27;}.addons-settings-img{background-position: -264px 0 !important;}.addons-settings-img-clicked{background-position: -264px -15px !important;}.addons-settings {border:2px solid #bd0e27;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #913030;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #913030;background-color:#bd0e27} .addon-checkbox {background-position: -264px -45px !important;} .addon-checkbox:hover {background-position: -264px -70px !important;} .addon-checkbox-clicked{background-position: -264px -95px !important;} .addon-checkbox-clicked:hover{background-position: -264px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #bd0e27;}.addons-desc-bl{border:1px solid #bd0e27;background-color:white;}.addons-but-save{border:2px solid #bd0e27;background-color:#bd0e27;}.addons-but-save:hover{border:2px solid #7c9dd2;background-color:#7c9dd2;}.addons-but-close{border:2px solid #bd0e27;background-color:#bd0e27;}.addons-but-close:hover{border:2px solid #7c9dd2;background-color:#7c9dd2;}.addons-save-info h3{border-bottom: 1px solid #913030;}";
                break
        }
        return css;
    },

    API: {
        escapeHtml: function(text) {
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        },
        addCSS: function(csstext) {
            var head = document.getElementsByTagName('head')[0];
            var newCss = document.createElement('style');
            newCss.type = "text/css";
            newCss.innerHTML = csstext;
            head.appendChild(newCss);
        },
        addStyleSheet: function(url) {
            var head = document.getElementsByTagName('head')[0];
            var link = document.createElement('link');
            link.href = url;
            link.rel = "stylesheet";
            link.type = "text/css";
            head.appendChild(link);
        },
        arrayUnique: function(a) { // оставляет в массиве только уникальные значения
            return a.reduce(function(p, c) {
                if (p.indexOf(c) < 0) p.push(c);
                return p;
            }, []);
        }
    }
}

document.addEventListener( "DOMContentLoaded", addonsLoader.checkStarted, false );
addonsLoader.interval= window.setInterval(addonsLoader.checkStarted, 50);


__addons=[

﻿{
    name: 'developerMode',
    title: 'Режим разработчика',
    description: 'Вы можете сами создавать новые аддоны. Не забывайте, что <b>name</b> должны быть уникальны.<br/>После того, как закончите творить новый аддон, сохраните его в отдельный файл в utf-8+BOM и сделайте pull request в репозиторий.<br/>Если произошла ошибка, то объект ошибки можно найти в консоли.<br/>Можно самому задать путь к CDN для ACE (например выложить на localhost).<BR/>Для задания параметров проверки JSLint используйте комментарии globals и jslint перед кодом аддона. О том, как правильно составить такой комментарий Вы можете прочесть в документации JSLint.',
    settings: {
        scripts: "[]",
        lastOpened: "0",
        fontSize: '14px',
        settings: "{}",
        aceCDN: "http://raw.github.com/ajaxorg/ace-builds/master/src-noconflict/",
        jslintCDN: 'http://raw.github.com/douglascrockford/JSLint/master/'
    },
    exports: [
        {name:'scripts', type:'hidden'},
        {name:'lastOpened', type:'hidden'},
        {name:'settings', type:'hidden'},
        {name:'fontSize', type:"text", title:'Размер шрифта в редакторе'},
        {name:'aceCDN', type:"text", title:'ACE CDN'},
        {name:'jslintCDN', type:"text", title:'JSlint CDN'}
    ],
    run: function() {
        var scripts= JSON.parse(this.settings.scripts);
        var lastOpened= parseInt(this.settings.lastOpened);
        var thisAddon= this;
        var settings= this.settings;
        var css= "div.addons-DM {left: 5px; width: 98%; max-width:100%; max-height:100%;} img.addons-DM-icon {width:16px; height:16px; margin-right:10px} div.addons-DM-new {position:relative; top:30px; left:10px; height:250px}";
        window.addonsLoader.API.addCSS(css);
        
        var saveData= function(scripts, lastOpened, reloadPage){
            // TODO проверять уникальность name
            if (scripts!=null) settings.scripts= JSON.stringify(scripts);
            if (lastOpened!=null) settings.lastOpened= lastOpened.toString();
            thisAddon.saveSettings();
            if (reloadPage) location.reload();
        };
        
        var img= document.createElement("img");
        img.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAEgSURBVFhH7dhBDoIwEIXh6p28j649lK69imuPAlvxJW1iCENnOsMrC/6EAFHCZ2ldcBqG4Zt+Xa4P7Dbt/bzlI33nvKfUMghUILIi6UBkQYpzsGW+SEkgzT0oIyhBNCNJe8StSOocbEHSF4kV2WUVW5BdgEiLNAFxcdksSddpkM0jqEXWvldDuh5x7ebaH7GGdM9BCaHFlSRkyCKZY6y40hIyBIgKqhUnFQZE0TjkAkrzplT7XJN7BCXE53XPR75CHvEcifNxHPOZr7A5CFTZIgtdJFt0AL0dQEtLf/S7AS7h8I+wC6CEQ92BazhEebMgVcOhbiOowaEuQC0O0YEWHKICrThEA7bgEPUd9X8aHOqySLQ4RAdacIgKtOJSSmkCrG2KMcBjtA0AAAAASUVORK5CYII=";
        img.className='cursor-pointer addons-DM-icon'; // из лоадера
        
        var lockScroll = function(event) {
            window.scrollTo(0, 0);
            event ? event.preventDefault() : window.event.returnValue = false;
        };
        img.onclick= function(e) {
            div1.style.display= div1.style.display=="block" ? "none":"block";
            var array = ['DOMMouseScroll', 'mousewheel', 'scroll'];
            if (div1.style.display=="block") {
                for (var i=0; i<array.length; i++) {
                    window.addEventListener(array[i], lockScroll, false);
                }
            } else {
                for (var i=0; i<array.length; i++) {
                    window.removeEventListener(array[i], lockScroll, false);
                }
            }
        };
        $(img).insertBefore($("a")[0]);
        var imgRect= img.getBoundingClientRect();
        
        var div1= document.createElement('div');
        div1.className="addons-settings addons-DM"; // из лоадера
        div1.style.top=(imgRect.top+imgRect.height+5)+"px";
        div1.style.height= "90%";
        
        var html= "<TABLE style='width:100%'><TR><TD width='*'><BUTTON onclick='$(\".addons-DM .addons-DM-new\").css(\"display\", \"block\");$(\"#__EditorArea\").css(\"display\", \"none\");'>Новый...</BUTTON> <SELECT id='__addons_DM_selectScript' style='min-width:70px'>";
        for (var i in scripts) {
            html+="<OPTION value='"+i+"' "+(i==lastOpened ? "selected='selected' >":">")+this.getTextAddonParam(scripts[i], 'title')+"</OPTION>";
        };
        html+="</SELECT> <BUTTON id='__addons_DM_saveScript'>Сохранить</BUTTON> <BUTTON id='__addons_DM_saveAndUpdateScript'>Сохранить и обновить</BUTTON> <BUTTON id='__addons_DM_check'>Проверить</BUTTON></TD><TD><BUTTON id='__addons_DM_deleteScript'>Удалить</BUTTON></TD></TR></TABLE><DIV class='addons-overflow'>";
        // блок с новым скриптом
        html+="<DIV class='addons-settings addons-DM-new addons-overflow'><TABLE><TR><TD valign=top><INPUT type=radio name=addons_DM_new_blank value=blank checked >Чистый</TD><TD>Уникальный <b>name</b><BR/><INPUT type=text value='name' ><BR/>Заголовок <b>title</b><BR/><INPUT type=text value='title' ><BR/>Описание <b>description</b><BR/><INPUT type=text value='description' ></TD></TR><TR><TD><INPUT type=radio name=addons_DM_new_blank value=clone >На основе</TD><TD><SELECT>";
        for (var i in window.addonsLoader.addons) {
            var title= typeof(window.addonsLoader.addons[i].title)=="undefined" ? i:window.addonsLoader.addons[i].title;
            html+="<OPTION value='"+i+"'>"+title+"</OPTION>";
        };
        html+="</SELECT></TD></TR></TABLE><BUTTON id='__addons_DM_createNew' >Создать</BUTTON><BUTTON onclick='$(\".addons-DM .addons-DM-new\").css(\"display\", \"none\");$(\"#__EditorArea\").css(\"display\", \"block\");' >Закрыть</BUTTON></DIV>";
        // блок с редактором кода
        html+="<DIV style='width:100%; height:100%' id='__EditorArea' ></DIV><DIV style='width:100%; height:100%; display:none' id='__JSLintReport' ></DIV>";
        
        div1.innerHTML= html;
        document.body.appendChild(div1);
        
        var script1= document.createElement("script");
        script1.src= settings.aceCDN+'ace.js';
        document.getElementsByTagName('head')[0].appendChild(script1);
        var script2= document.createElement("script");
        script2.src= settings.jslintCDN+'jslint.js';
        document.getElementsByTagName('head')[0].appendChild(script2);
        
        var editor; // глобалим
        var fixSlowLoading= function() {
            if (typeof(ace)=="undefined") return;
            clearInterval(interval);
            document.getElementById('__EditorArea').style.fontSize= settings.fontSize;
            editor= ace.edit("__EditorArea");
            editor.setValue(typeof(scripts[lastOpened])=="undefined"? 'Чтобы создать новый скрипт нажмите "Новый..."':scripts[lastOpened]);
            editor.setTheme("ace/theme/eclipse");
            editor.getSession().setUseWorker(false);
            editor.getSession().setMode("ace/mode/javascript");
            editor.selection.clearSelection();
            $('.ace_content').css({'height':'auto'});
        };
        var interval= window.setInterval(fixSlowLoading, 50);
        
        $("#__addons_DM_createNew").bind('click', function(){
            var $inputs= $(".addons-DM-new input[type='text']");
            var name= $inputs[0].value.replace(/^\s+|\s+$/, '');
            var blankInputs= $(".addons-DM-new input[type='radio']");
            for (var i =0; i<blankInputs.length; i++) if (blankInputs[i].checked) var blank=blankInputs[i].value;
            if (blank=="clone") {
                alert( "К сожалению в настоящее время возможность недоступна. Возьмите исходный код из репозитория.");
                return;
            } else {
                if (name=="") {
                    alert("Имя не задано");
                    return
                };
                var text="{\n    name: '"+name+"',\n    title: '"+$inputs[1].value+"',\n    description: '"+$inputs[2].value+"',\n    run: function() {\n        \n    }\n}";
            };
            scripts.push(text);
            saveData(scripts, lastOpened, true);
        });
        $('#__addons_DM_selectScript').bind("change", function(){
            scripts[lastOpened]= editor.getValue();
            lastOpened= parseInt(this.value);
            saveData(null, lastOpened, false);
            if (typeof(editor)!= "undefined") editor.setValue( scripts[lastOpened] );
        });
        $('#__addons_DM_deleteScript').bind("click", function() {
            var item= parseInt($('#__addons_DM_selectScript')[0].value);
            lastOpened= 0;
            delete window.addonsLoader.storage.addonsSettings[thisAddon.getTextAddonParam(scripts[item], 'name')]
            scripts= scripts.slice(0, item).concat(scripts.slice(item+1));
            saveData(scripts, lastOpened, true);
        });
        $("#__addons_DM_saveScript").bind("click", function() {
            scripts[lastOpened]= editor.getValue();
            saveData(scripts, lastOpened, false);
        });
        $("#__addons_DM_saveAndUpdateScript").bind("click", function() {
            scripts[lastOpened]= editor.getValue();
            saveData(scripts, lastOpened, true);
        });
        $("#__addons_DM_check").bind("click", function() {
            if ($("#__JSLintReport").css('display')=='block') {
                this.innerHTML= 'Проверить';
                $("#__JSLintReport").css({display: 'none'});
                $("#__EditorArea").css({display: 'block'});
            } else {
                this.innerHTML= 'Закрыть JSLint';
                var comms= /^((?:\s+|\/\*{1,2}[\s\S]*?\*\/|\/\/[^\n]*|\/)*){/.exec(editor.getValue());
                comms= comms==null ? "":comms[1];
                console.log(comms+"var addon = "+editor.getValue().substr(comms.length)+";");
                JSLINT(comms+"var addon = "+editor.getValue().substr(comms.length)+";");
                $("#__EditorArea").css({display: 'none'});
                $("#__JSLintReport").css({display: 'block'}).html(JSLINT.error_report(JSLINT.data()));
            };
        });
    },
    
    beforeInit: function(){
        var scripts= JSON.parse(this.settings.scripts);
        var scr= document.createElement('script');
        scr.innerHTML= "\nwindow.__addons.push(\n\n"+scripts.join(',\n\n')+"\n\n);\nif (!window.addonsLoader.started) {window.addonsLoader.initStorage();} else {console.log('Извините. Не успели внедрить режим разработчика.');};\n";
        document.head.appendChild(scr);
    },
    
    getTextAddonParam: function(text, param) {
        return text.replace(new RegExp("^[\\s\\S]*?\\b"+param+"\\b[^:]*?:\\s*(?:'((?:\\\\[\\s\\S]|[^'])+)'|\"((?:\\\\[\\s\\S]|[^\"])+)\")[\\s\\S]*$"), "$1$2"); // TODO переписать хранение аддонов в scripts на ассоциативный массив
    }
},

﻿// @author Yura Ivanov
{
    name: 'autocompleteWithLinks',
    title: 'Список участников',
    description: 'Выводит рядом с полями для ввода ответа и комментариев плашку с никами участников, которые принимали участие в дискуссии текущего вопроса.<BR/>Вставка ника участника в поле ввода в один клик.',
    run: function () {
        var currentLogin= $("#searchBar a")[0].innerHTML.toLowerCase(); // логин самого участника
        if ($("#question-table").length) {
            var users = [];
            var a = "";
            function addUser(name, link, type) {
                var regexClean= new RegExp("(?:^@)|\\s*\u2666+", 'ig');
                name = name.replace(regexClean, '');
                if (users.indexOf(link) < 0 && name.toLowerCase()!=currentLogin && name!="") {
                    users.push(link);
                    return "<li><a href='#' class='user_quote'>@" + name
                            + "</a> - " + type + "</li>";
                } else {
                    return "";
                }
            }
            $("#question-table [itemprop='author'] a").each(function(idx, u) {
                var $u = $(u);
                var link = $u.attr("href");
                var name = $u.text();
                a += addUser(name, link, "топикстартер");
            });
            $("[itemprop='comment'] [itemprop='author'] a").each(
                    function(idx, u) {
                        var $u = $(u);
                        var link = $u.attr("href");
                        var name = $u.text();
                        a += addUser(name, link, "ответил");
                    });
            $("a.userinfo").each(function(idx, u) {
                var $u = $(u);
                var link = $u.attr("href");
                var name = $u.text();
                a += addUser(name, link, "комментировал");
            });
            $("#main-body a[href^='\/users\/']").each(function(idx, u) {
                var $u = $(u);
                var link = $u.attr("href");
                var name = $u.text();
                a += addUser(name, link, "был упомянут");
            });
            var d = $("<div class='users_menu' style=''><ul>" + a
                    + "</ul></div>");
            d.insertBefore($("#editor, .commentBox"));
            $(".user_quote").click(
                    function(e) {
                        e.preventDefault();
                        var myField = $("#editor, .commentBox", $(this)
                                .closest('.users_menu').parent())[0];
                        if (myField.selectionStart
                                || myField.selectionStart == '0') {
                            var startPos = myField.selectionStart;
                            var endPos = myField.selectionEnd;
                            var myValue = (startPos > 0
                                    && myField.value.substring(startPos - 1,
                                            startPos) != ' ' ? ' ' : '')
                                    + $(this).text() + ', ';
                            myField.value = myField.value
                                    .substring(0, startPos)
                                    + myValue
                                    + myField.value.substring(endPos,
                                            myField.value.length);
                            myField.selectionStart= myField.selectionEnd= startPos+ myValue.length;
                        } else {
                            myField.value += myValue;
                            myField.selectionStart= myField.selectionEnd= myField.value.length;
                        }
                        myField.focus();
                    });
        }
    }
},

﻿{
    name: 'syntaxHighlight',
    title: 'Подсветка синтаксиса SyntaxHighlighter\'ом',
    description: 'Автопределение языка подсветки по тэгам вопроса\nПоддержка языков: text/plain, html+js, js, c/c++/objective-c, c#, ruby, python, php, pascal/delphi/freepascal',
    settings: {
        'usePretty' : '1',
        'wrapText'  : '1',
        'noGutter'  : '0',
        'noGutterInComments' : '1'
    },
    exports: [
        {name: "usePretty", type: "checkbox", title: "Использовать стандартную подсветку, если стиль не определен:"},
        {name: "wrapText", type: "checkbox", title: "Переносить текст по словам:"},
        {name: "noGutter", type: "checkbox", title: "Не нумеровать строки:"},
        {name: "noGutterInComments", type: "checkbox", title: "Не нумеровать строки в комментариях:"}
    ],
    beforeInit: function(){
      window.prettyPrintBackup = window.prettyPrint;
      window.prettyPrint = function() {};
      if ( this.settings.wrapText !== '1' ) window.addonsLoader.API.addCSS("code {white-space: nowrap} .wmd-preview pre code {white-space: pre-wrap}");
      window.addonsLoader.API.addStyleSheet("http://cdnjs.cloudflare.com/ajax/libs/SyntaxHighlighter/3.0.83/styles/shCore.min.css");
      window.addonsLoader.API.addStyleSheet("http://cdnjs.cloudflare.com/ajax/libs/SyntaxHighlighter/3.0.83/styles/shThemeDefault.min.css");
      window.addonsLoader.API.addCSS(".syntaxhighlighter {width: 695px !important;overflow-x:auto !important;overflow-y:hidden !important}");
      window.addonsLoader.API.addCSS(".syntaxhighlighter table {border-spacing: 2px;}");
      window.addonsLoader.API.addCSS(".comment-text .syntaxhighlighter {width: 677px !important;overflow-x:auto !important;overflow-y:hidden !important}");
    },
    run: function(){
      var regexURL= new RegExp("^https?://[^/]+/(?:questions|research)/.+$", "i");
      if (!regexURL.test(location.href)) return; // если не вопрос, то не работаем
      // http://alexgorbatchev.com/SyntaxHighlighter/
      // shCore.min.js
      eval(function(e,t,r,i,s,a){if(s=function(e){return(t>e?"":s(parseInt(e/t)))+((e%=t)>35?String.fromCharCode(e+29):e.toString(36))},!"".replace(/^/,String)){for(;r--;)a[s(r)]=i[r]||s(r);i=[function(e){return a[e]}],s=function(){return"\\w+"},r=1}for(;r--;)i[r]&&(e=e.replace(RegExp("\\b"+s(r)+"\\b","g"),i[r]));return e}('K M;I(M)1S 2U("2a\'t 4k M 4K 2g 3l 4G 4H");(6(){6 r(f,e){I(!M.1R(f))1S 3m("3s 15 4R");K a=f.1w;f=M(f.1m,t(f)+(e||""));I(a)f.1w={1m:a.1m,19:a.19?a.19.1a(0):N};H f}6 t(f){H(f.1J?"g":"")+(f.4s?"i":"")+(f.4p?"m":"")+(f.4v?"x":"")+(f.3n?"y":"")}6 B(f,e,a,b){K c=u.L,d,h,g;v=R;5K{O(;c--;){g=u[c];I(a&g.3r&&(!g.2p||g.2p.W(b))){g.2q.12=e;I((h=g.2q.X(f))&&h.P===e){d={3k:g.2b.W(b,h,a),1C:h};1N}}}}5v(i){1S i}5q{v=11}H d}6 p(f,e,a){I(3b.Z.1i)H f.1i(e,a);O(a=a||0;a<f.L;a++)I(f[a]===e)H a;H-1}M=6(f,e){K a=[],b=M.1B,c=0,d,h;I(M.1R(f)){I(e!==1d)1S 3m("2a\'t 5r 5I 5F 5B 5C 15 5E 5p");H r(f)}I(v)1S 2U("2a\'t W 3l M 59 5m 5g 5x 5i");e=e||"";O(d={2N:11,19:[],2K:6(g){H e.1i(g)>-1},3d:6(g){e+=g}};c<f.L;)I(h=B(f,c,b,d)){a.U(h.3k);c+=h.1C[0].L||1}Y I(h=n.X.W(z[b],f.1a(c))){a.U(h[0]);c+=h[0].L}Y{h=f.3a(c);I(h==="[")b=M.2I;Y I(h==="]")b=M.1B;a.U(h);c++}a=15(a.1K(""),n.Q.W(e,w,""));a.1w={1m:f,19:d.2N?d.19:N};H a};M.3v="1.5.0";M.2I=1;M.1B=2;K C=/\\$(?:(\\d\\d?|[$&`\'])|{([$\\w]+)})/g,w=/[^5h]+|([\\s\\S])(?=[\\s\\S]*\\1)/g,A=/^(?:[?*+]|{\\d+(?:,\\d*)?})\\??/,v=11,u=[],n={X:15.Z.X,1A:15.Z.1A,1C:1r.Z.1C,Q:1r.Z.Q,1e:1r.Z.1e},x=n.X.W(/()??/,"")[1]===1d,D=6(){K f=/^/g;n.1A.W(f,"");H!f.12}(),y=6(){K f=/x/g;n.Q.W("x",f,"");H!f.12}(),E=15.Z.3n!==1d,z={};z[M.2I]=/^(?:\\\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[\\29-26-f]{2}|u[\\29-26-f]{4}|c[A-3o-z]|[\\s\\S]))/;z[M.1B]=/^(?:\\\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9]\\d*|x[\\29-26-f]{2}|u[\\29-26-f]{4}|c[A-3o-z]|[\\s\\S])|\\(\\?[:=!]|[?*+]\\?|{\\d+(?:,\\d*)?}\\??)/;M.1h=6(f,e,a,b){u.U({2q:r(f,"g"+(E?"y":"")),2b:e,3r:a||M.1B,2p:b||N})};M.2n=6(f,e){K a=f+"/"+(e||"");H M.2n[a]||(M.2n[a]=M(f,e))};M.3c=6(f){H r(f,"g")};M.5l=6(f){H f.Q(/[-[\\]{}()*+?.,\\\\^$|#\\s]/g,"\\\\$&")};M.5e=6(f,e,a,b){e=r(e,"g"+(b&&E?"y":""));e.12=a=a||0;f=e.X(f);H b?f&&f.P===a?f:N:f};M.3q=6(){M.1h=6(){1S 2U("2a\'t 55 1h 54 3q")}};M.1R=6(f){H 53.Z.1q.W(f)==="[2m 15]"};M.3p=6(f,e,a,b){O(K c=r(e,"g"),d=-1,h;h=c.X(f);){a.W(b,h,++d,f,c);c.12===h.P&&c.12++}I(e.1J)e.12=0};M.57=6(f,e){H 6 a(b,c){K d=e[c].1I?e[c]:{1I:e[c]},h=r(d.1I,"g"),g=[],i;O(i=0;i<b.L;i++)M.3p(b[i],h,6(k){g.U(d.3j?k[d.3j]||"":k[0])});H c===e.L-1||!g.L?g:a(g,c+1)}([f],0)};15.Z.1p=6(f,e){H J.X(e[0])};15.Z.W=6(f,e){H J.X(e)};15.Z.X=6(f){K e=n.X.1p(J,14),a;I(e){I(!x&&e.L>1&&p(e,"")>-1){a=15(J.1m,n.Q.W(t(J),"g",""));n.Q.W(f.1a(e.P),a,6(){O(K c=1;c<14.L-2;c++)I(14[c]===1d)e[c]=1d})}I(J.1w&&J.1w.19)O(K b=1;b<e.L;b++)I(a=J.1w.19[b-1])e[a]=e[b];!D&&J.1J&&!e[0].L&&J.12>e.P&&J.12--}H e};I(!D)15.Z.1A=6(f){(f=n.X.W(J,f))&&J.1J&&!f[0].L&&J.12>f.P&&J.12--;H!!f};1r.Z.1C=6(f){M.1R(f)||(f=15(f));I(f.1J){K e=n.1C.1p(J,14);f.12=0;H e}H f.X(J)};1r.Z.Q=6(f,e){K a=M.1R(f),b,c;I(a&&1j e.58()==="3f"&&e.1i("${")===-1&&y)H n.Q.1p(J,14);I(a){I(f.1w)b=f.1w.19}Y f+="";I(1j e==="6")c=n.Q.W(J,f,6(){I(b){14[0]=1f 1r(14[0]);O(K d=0;d<b.L;d++)I(b[d])14[0][b[d]]=14[d+1]}I(a&&f.1J)f.12=14[14.L-2]+14[0].L;H e.1p(N,14)});Y{c=J+"";c=n.Q.W(c,f,6(){K d=14;H n.Q.W(e,C,6(h,g,i){I(g)5b(g){24"$":H"$";24"&":H d[0];24"`":H d[d.L-1].1a(0,d[d.L-2]);24"\'":H d[d.L-1].1a(d[d.L-2]+d[0].L);5a:i="";g=+g;I(!g)H h;O(;g>d.L-3;){i=1r.Z.1a.W(g,-1)+i;g=1Q.3i(g/10)}H(g?d[g]||"":"$")+i}Y{g=+i;I(g<=d.L-3)H d[g];g=b?p(b,i):-1;H g>-1?d[g+1]:h}})})}I(a&&f.1J)f.12=0;H c};1r.Z.1e=6(f,e){I(!M.1R(f))H n.1e.1p(J,14);K a=J+"",b=[],c=0,d,h;I(e===1d||+e<0)e=5D;Y{e=1Q.3i(+e);I(!e)H[]}O(f=M.3c(f);d=f.X(a);){I(f.12>c){b.U(a.1a(c,d.P));d.L>1&&d.P<a.L&&3b.Z.U.1p(b,d.1a(1));h=d[0].L;c=f.12;I(b.L>=e)1N}f.12===d.P&&f.12++}I(c===a.L){I(!n.1A.W(f,"")||h)b.U("")}Y b.U(a.1a(c));H b.L>e?b.1a(0,e):b};M.1h(/\\(\\?#[^)]*\\)/,6(f){H n.1A.W(A,f.2S.1a(f.P+f[0].L))?"":"(?:)"});M.1h(/\\((?!\\?)/,6(){J.19.U(N);H"("});M.1h(/\\(\\?<([$\\w]+)>/,6(f){J.19.U(f[1]);J.2N=R;H"("});M.1h(/\\\\k<([\\w$]+)>/,6(f){K e=p(J.19,f[1]);H e>-1?"\\\\"+(e+1)+(3R(f.2S.3a(f.P+f[0].L))?"":"(?:)"):f[0]});M.1h(/\\[\\^?]/,6(f){H f[0]==="[]"?"\\\\b\\\\B":"[\\\\s\\\\S]"});M.1h(/^\\(\\?([5A]+)\\)/,6(f){J.3d(f[1]);H""});M.1h(/(?:\\s+|#.*)+/,6(f){H n.1A.W(A,f.2S.1a(f.P+f[0].L))?"":"(?:)"},M.1B,6(){H J.2K("x")});M.1h(/\\./,6(){H"[\\\\s\\\\S]"},M.1B,6(){H J.2K("s")})})();1j 2e!="1d"&&(2e.M=M);K 1v=6(){6 r(a,b){a.1l.1i(b)!=-1||(a.1l+=" "+b)}6 t(a){H a.1i("3e")==0?a:"3e"+a}6 B(a){H e.1Y.2A[t(a)]}6 p(a,b,c){I(a==N)H N;K d=c!=R?a.3G:[a.2G],h={"#":"1c",".":"1l"}[b.1o(0,1)]||"3h",g,i;g=h!="3h"?b.1o(1):b.5u();I((a[h]||"").1i(g)!=-1)H a;O(a=0;d&&a<d.L&&i==N;a++)i=p(d[a],b,c);H i}6 C(a,b){K c={},d;O(d 2g a)c[d]=a[d];O(d 2g b)c[d]=b[d];H c}6 w(a,b,c,d){6 h(g){g=g||1P.5y;I(!g.1F){g.1F=g.52;g.3N=6(){J.5w=11}}c.W(d||1P,g)}a.3g?a.3g("4U"+b,h):a.4y(b,h,11)}6 A(a,b){K c=e.1Y.2j,d=N;I(c==N){c={};O(K h 2g e.1U){K g=e.1U[h];d=g.4x;I(d!=N){g.1V=h.4w();O(g=0;g<d.L;g++)c[d[g]]=h}}e.1Y.2j=c}d=e.1U[c[a]];d==N&&b!=11&&1P.1X(e.13.1x.1X+(e.13.1x.3E+a));H d}6 v(a,b){O(K c=a.1e("\\n"),d=0;d<c.L;d++)c[d]=b(c[d],d);H c.1K("\\n")}6 u(a,b){I(a==N||a.L==0||a=="\\n")H a;a=a.Q(/</g,"&1y;");a=a.Q(/ {2,}/g,6(c){O(K d="",h=0;h<c.L-1;h++)d+=e.13.1W;H d+" "});I(b!=N)a=v(a,6(c){I(c.L==0)H"";K d="";c=c.Q(/^(&2s;| )+/,6(h){d=h;H""});I(c.L==0)H d;H d+\'<17 1g="\'+b+\'">\'+c+"</17>"});H a}6 n(a,b){a.1e("\\n");O(K c="",d=0;d<50;d++)c+="                    ";H a=v(a,6(h){I(h.1i("\\t")==-1)H h;O(K g=0;(g=h.1i("\\t"))!=-1;)h=h.1o(0,g)+c.1o(0,b-g%b)+h.1o(g+1,h.L);H h})}6 x(a){H a.Q(/^\\s+|\\s+$/g,"")}6 D(a,b){I(a.P<b.P)H-1;Y I(a.P>b.P)H 1;Y I(a.L<b.L)H-1;Y I(a.L>b.L)H 1;H 0}6 y(a,b){6 c(k){H k[0]}O(K d=N,h=[],g=b.2D?b.2D:c;(d=b.1I.X(a))!=N;){K i=g(d,b);I(1j i=="3f")i=[1f e.2L(i,d.P,b.23)];h=h.1O(i)}H h}6 E(a){K b=/(.*)((&1G;|&1y;).*)/;H a.Q(e.3A.3M,6(c){K d="",h=N;I(h=b.X(c)){c=h[1];d=h[2]}H\'<a 2h="\'+c+\'">\'+c+"</a>"+d})}6 z(){O(K a=1E.36("1k"),b=[],c=0;c<a.L;c++)a[c].3s=="20"&&b.U(a[c]);H b}6 f(a){a=a.1F;K b=p(a,".20",R);a=p(a,".3O",R);K c=1E.4i("3t");I(!(!a||!b||p(a,"3t"))){B(b.1c);r(b,"1m");O(K d=a.3G,h=[],g=0;g<d.L;g++)h.U(d[g].4z||d[g].4A);h=h.1K("\\r");c.39(1E.4D(h));a.39(c);c.2C();c.4C();w(c,"4u",6(){c.2G.4E(c);b.1l=b.1l.Q("1m","")})}}I(1j 3F!="1d"&&1j M=="1d")M=3F("M").M;K e={2v:{"1g-27":"","2i-1s":1,"2z-1s-2t":11,1M:N,1t:N,"42-45":R,"43-22":4,1u:R,16:R,"3V-17":R,2l:11,"41-40":R,2k:11,"1z-1k":11},13:{1W:"&2s;",2M:R,46:11,44:11,34:"4n",1x:{21:"4o 1m",2P:"?",1X:"1v\\n\\n",3E:"4r\'t 4t 1D O: ",4g:"4m 4B\'t 51 O 1z-1k 4F: ",37:\'<!4T 1z 4S "-//4V//3H 4W 1.0 4Z//4Y" "1Z://2y.3L.3K/4X/3I/3H/3I-4P.4J"><1z 4I="1Z://2y.3L.3K/4L/5L"><3J><4N 1Z-4M="5G-5M" 6K="2O/1z; 6J=6I-8" /><1t>6L 1v</1t></3J><3B 1L="25-6M:6Q,6P,6O,6N-6F;6y-2f:#6x;2f:#6w;25-22:6v;2O-3D:3C;"><T 1L="2O-3D:3C;3w-32:1.6z;"><T 1L="25-22:6A-6E;">1v</T><T 1L="25-22:.6C;3w-6B:6R;"><T>3v 3.0.76 (72 73 3x)</T><T><a 2h="1Z://3u.2w/1v" 1F="38" 1L="2f:#3y">1Z://3u.2w/1v</a></T><T>70 17 6U 71.</T><T>6T 6X-3x 6Y 6D.</T></T><T>6t 61 60 J 1k, 5Z <a 2h="6u://2y.62.2w/63-66/65?64=5X-5W&5P=5O" 1L="2f:#3y">5R</a> 5V <2R/>5U 5T 5S!</T></T></3B></1z>\'}},1Y:{2j:N,2A:{}},1U:{},3A:{6n:/\\/\\*[\\s\\S]*?\\*\\//2c,6m:/\\/\\/.*$/2c,6l:/#.*$/2c,6k:/"([^\\\\"\\n]|\\\\.)*"/g,6o:/\'([^\\\\\'\\n]|\\\\.)*\'/g,6p:1f M(\'"([^\\\\\\\\"]|\\\\\\\\.)*"\',"3z"),6s:1f M("\'([^\\\\\\\\\']|\\\\\\\\.)*\'","3z"),6q:/(&1y;|<)!--[\\s\\S]*?--(&1G;|>)/2c,3M:/\\w+:\\/\\/[\\w-.\\/?%&=:@;]*/g,6a:{18:/(&1y;|<)\\?=?/g,1b:/\\?(&1G;|>)/g},69:{18:/(&1y;|<)%=?/g,1b:/%(&1G;|>)/g},6d:{18:/(&1y;|<)\\s*1k.*?(&1G;|>)/2T,1b:/(&1y;|<)\\/\\s*1k\\s*(&1G;|>)/2T}},16:{1H:6(a){6 b(i,k){H e.16.2o(i,k,e.13.1x[k])}O(K c=\'<T 1g="16">\',d=e.16.2x,h=d.2X,g=0;g<h.L;g++)c+=(d[h[g]].1H||b)(a,h[g]);c+="</T>";H c},2o:6(a,b,c){H\'<2W><a 2h="#" 1g="6e 6h\'+b+" "+b+\'">\'+c+"</a></2W>"},2b:6(a){K b=a.1F,c=b.1l||"";b=B(p(b,".20",R).1c);K d=6(h){H(h=15(h+"6f(\\\\w+)").X(c))?h[1]:N}("6g");b&&d&&e.16.2x[d].2B(b);a.3N()},2x:{2X:["21","2P"],21:{1H:6(a){I(a.V("2l")!=R)H"";K b=a.V("1t");H e.16.2o(a,"21",b?b:e.13.1x.21)},2B:6(a){a=1E.6j(t(a.1c));a.1l=a.1l.Q("47","")}},2P:{2B:6(){K a="68=0";a+=", 18="+(31.30-33)/2+", 32="+(31.2Z-2Y)/2+", 30=33, 2Z=2Y";a=a.Q(/^,/,"");a=1P.6Z("","38",a);a.2C();K b=a.1E;b.6W(e.13.1x.37);b.6V();a.2C()}}}},35:6(a,b){K c;I(b)c=[b];Y{c=1E.36(e.13.34);O(K d=[],h=0;h<c.L;h++)d.U(c[h]);c=d}c=c;d=[];I(e.13.2M)c=c.1O(z());I(c.L===0)H d;O(h=0;h<c.L;h++){O(K g=c[h],i=a,k=c[h].1l,j=3W 0,l={},m=1f M("^\\\\[(?<2V>(.*?))\\\\]$"),s=1f M("(?<27>[\\\\w-]+)\\\\s*:\\\\s*(?<1T>[\\\\w-%#]+|\\\\[.*?\\\\]|\\".*?\\"|\'.*?\')\\\\s*;?","g");(j=s.X(k))!=N;){K o=j.1T.Q(/^[\'"]|[\'"]$/g,"");I(o!=N&&m.1A(o)){o=m.X(o);o=o.2V.L>0?o.2V.1e(/\\s*,\\s*/):[]}l[j.27]=o}g={1F:g,1n:C(i,l)};g.1n.1D!=N&&d.U(g)}H d},1M:6(a,b){K c=J.35(a,b),d=N,h=e.13;I(c.L!==0)O(K g=0;g<c.L;g++){b=c[g];K i=b.1F,k=b.1n,j=k.1D,l;I(j!=N){I(k["1z-1k"]=="R"||e.2v["1z-1k"]==R){d=1f e.4l(j);j="4O"}Y I(d=A(j))d=1f d;Y 6H;l=i.3X;I(h.2M){l=l;K m=x(l),s=11;I(m.1i("<![6G[")==0){m=m.4h(9);s=R}K o=m.L;I(m.1i("]]\\>")==o-3){m=m.4h(0,o-3);s=R}l=s?m:l}I((i.1t||"")!="")k.1t=i.1t;k.1D=j;d.2Q(k);b=d.2F(l);I((i.1c||"")!="")b.1c=i.1c;i.2G.74(b,i)}}},2E:6(a){w(1P,"4k",6(){e.1M(a)})}};e.2E=e.2E;e.1M=e.1M;e.2L=6(a,b,c){J.1T=a;J.P=b;J.L=a.L;J.23=c;J.1V=N};e.2L.Z.1q=6(){H J.1T};e.4l=6(a){6 b(j,l){O(K m=0;m<j.L;m++)j[m].P+=l}K c=A(a),d,h=1f e.1U.5Y,g=J,i="2F 1H 2Q".1e(" ");I(c!=N){d=1f c;O(K k=0;k<i.L;k++)(6(){K j=i[k];g[j]=6(){H h[j].1p(h,14)}})();d.28==N?1P.1X(e.13.1x.1X+(e.13.1x.4g+a)):h.2J.U({1I:d.28.17,2D:6(j){O(K l=j.17,m=[],s=d.2J,o=j.P+j.18.L,F=d.28,q,G=0;G<s.L;G++){q=y(l,s[G]);b(q,o);m=m.1O(q)}I(F.18!=N&&j.18!=N){q=y(j.18,F.18);b(q,j.P);m=m.1O(q)}I(F.1b!=N&&j.1b!=N){q=y(j.1b,F.1b);b(q,j.P+j[0].5Q(j.1b));m=m.1O(q)}O(j=0;j<m.L;j++)m[j].1V=c.1V;H m}})}};e.4j=6(){};e.4j.Z={V:6(a,b){K c=J.1n[a];c=c==N?b:c;K d={"R":R,"11":11}[c];H d==N?c:d},3Y:6(a){H 1E.4i(a)},4c:6(a,b){K c=[];I(a!=N)O(K d=0;d<a.L;d++)I(1j a[d]=="2m")c=c.1O(y(b,a[d]));H J.4e(c.6b(D))},4e:6(a){O(K b=0;b<a.L;b++)I(a[b]!==N)O(K c=a[b],d=c.P+c.L,h=b+1;h<a.L&&a[b]!==N;h++){K g=a[h];I(g!==N)I(g.P>d)1N;Y I(g.P==c.P&&g.L>c.L)a[b]=N;Y I(g.P>=c.P&&g.P<d)a[h]=N}H a},4d:6(a){K b=[],c=2u(J.V("2i-1s"));v(a,6(d,h){b.U(h+c)});H b},3U:6(a){K b=J.V("1M",[]);I(1j b!="2m"&&b.U==N)b=[b];a:{a=a.1q();K c=3W 0;O(c=c=1Q.6c(c||0,0);c<b.L;c++)I(b[c]==a){b=c;1N a}b=-1}H b!=-1},2r:6(a,b,c){a=["1s","6i"+b,"P"+a,"6r"+(b%2==0?1:2).1q()];J.3U(b)&&a.U("67");b==0&&a.U("1N");H\'<T 1g="\'+a.1K(" ")+\'">\'+c+"</T>"},3Q:6(a,b){K c="",d=a.1e("\\n").L,h=2u(J.V("2i-1s")),g=J.V("2z-1s-2t");I(g==R)g=(h+d-1).1q().L;Y I(3R(g)==R)g=0;O(K i=0;i<d;i++){K k=b?b[i]:h+i,j;I(k==0)j=e.13.1W;Y{j=g;O(K l=k.1q();l.L<j;)l="0"+l;j=l}a=j;c+=J.2r(i,k,a)}H c},49:6(a,b){a=x(a);K c=a.1e("\\n");J.V("2z-1s-2t");K d=2u(J.V("2i-1s"));a="";O(K h=J.V("1D"),g=0;g<c.L;g++){K i=c[g],k=/^(&2s;|\\s)+/.X(i),j=N,l=b?b[g]:d+g;I(k!=N){j=k[0].1q();i=i.1o(j.L);j=j.Q(" ",e.13.1W)}i=x(i);I(i.L==0)i=e.13.1W;a+=J.2r(g,l,(j!=N?\'<17 1g="\'+h+\' 5N">\'+j+"</17>":"")+i)}H a},4f:6(a){H a?"<4a>"+a+"</4a>":""},4b:6(a,b){6 c(l){H(l=l?l.1V||g:g)?l+" ":""}O(K d=0,h="",g=J.V("1D",""),i=0;i<b.L;i++){K k=b[i],j;I(!(k===N||k.L===0)){j=c(k);h+=u(a.1o(d,k.P-d),j+"48")+u(k.1T,j+k.23);d=k.P+k.L+(k.75||0)}}h+=u(a.1o(d),c()+"48");H h},1H:6(a){K b="",c=["20"],d;I(J.V("2k")==R)J.1n.16=J.1n.1u=11;1l="20";J.V("2l")==R&&c.U("47");I((1u=J.V("1u"))==11)c.U("6S");c.U(J.V("1g-27"));c.U(J.V("1D"));a=a.Q(/^[ ]*[\\n]+|[\\n]*[ ]*$/g,"").Q(/\\r/g," ");b=J.V("43-22");I(J.V("42-45")==R)a=n(a,b);Y{O(K h="",g=0;g<b;g++)h+=" ";a=a.Q(/\\t/g,h)}a=a;a:{b=a=a;h=/<2R\\s*\\/?>|&1y;2R\\s*\\/?&1G;/2T;I(e.13.46==R)b=b.Q(h,"\\n");I(e.13.44==R)b=b.Q(h,"");b=b.1e("\\n");h=/^\\s*/;g=4Q;O(K i=0;i<b.L&&g>0;i++){K k=b[i];I(x(k).L!=0){k=h.X(k);I(k==N){a=a;1N a}g=1Q.4q(k[0].L,g)}}I(g>0)O(i=0;i<b.L;i++)b[i]=b[i].1o(g);a=b.1K("\\n")}I(1u)d=J.4d(a);b=J.4c(J.2J,a);b=J.4b(a,b);b=J.49(b,d);I(J.V("41-40"))b=E(b);1j 2H!="1d"&&2H.3S&&2H.3S.1C(/5s/)&&c.U("5t");H b=\'<T 1c="\'+t(J.1c)+\'" 1g="\'+c.1K(" ")+\'">\'+(J.V("16")?e.16.1H(J):"")+\'<3Z 5z="0" 5H="0" 5J="0">\'+J.4f(J.V("1t"))+"<3T><3P>"+(1u?\'<2d 1g="1u">\'+J.3Q(a)+"</2d>":"")+\'<2d 1g="17"><T 1g="3O">\'+b+"</T></2d></3P></3T></3Z></T>"},2F:6(a){I(a===N)a="";J.17=a;K b=J.3Y("T");b.3X=J.1H(a);J.V("16")&&w(p(b,".16"),"5c",e.16.2b);J.V("3V-17")&&w(p(b,".17"),"56",f);H b},2Q:6(a){J.1c=""+1Q.5d(1Q.5n()*5k).1q();e.1Y.2A[t(J.1c)]=J;J.1n=C(e.2v,a||{});I(J.V("2k")==R)J.1n.16=J.1n.1u=11},5j:6(a){a=a.Q(/^\\s+|\\s+$/g,"").Q(/\\s+/g,"|");H"\\\\b(?:"+a+")\\\\b"},5f:6(a){J.28={18:{1I:a.18,23:"1k"},1b:{1I:a.1b,23:"1k"},17:1f M("(?<18>"+a.18.1m+")(?<17>.*?)(?<1b>"+a.1b.1m+")","5o")}}};H e}();1j 2e!="1d"&&(2e.1v=1v);',62,441,"||||||function|||||||||||||||||||||||||||||||||||||return|if|this|var|length|XRegExp|null|for|index|replace|true||div|push|getParam|call|exec|else|prototype||false|lastIndex|config|arguments|RegExp|toolbar|code|left|captureNames|slice|right|id|undefined|split|new|class|addToken|indexOf|typeof|script|className|source|params|substr|apply|toString|String|line|title|gutter|SyntaxHighlighter|_xregexp|strings|lt|html|test|OUTSIDE_CLASS|match|brush|document|target|gt|getHtml|regex|global|join|style|highlight|break|concat|window|Math|isRegExp|throw|value|brushes|brushName|space|alert|vars|http|syntaxhighlighter|expandSource|size|css|case|font|Fa|name|htmlScript|dA|can|handler|gm|td|exports|color|in|href|first|discoveredBrushes|light|collapse|object|cache|getButtonHtml|trigger|pattern|getLineHtml|nbsp|numbers|parseInt|defaults|com|items|www|pad|highlighters|execute|focus|func|all|getDiv|parentNode|navigator|INSIDE_CLASS|regexList|hasFlag|Match|useScriptTags|hasNamedCapture|text|help|init|br|input|gi|Error|values|span|list|250|height|width|screen|top|500|tagName|findElements|getElementsByTagName|aboutDialog|_blank|appendChild|charAt|Array|copyAsGlobal|setFlag|highlighter_|string|attachEvent|nodeName|floor|backref|output|the|TypeError|sticky|Za|iterate|freezeTokens|scope|type|textarea|alexgorbatchev|version|margin|2010|005896|gs|regexLib|body|center|align|noBrush|require|childNodes|DTD|xhtml1|head|org|w3|url|preventDefault|container|tr|getLineNumbersHtml|isNaN|userAgent|tbody|isLineHighlighted|quick|void|innerHTML|create|table|links|auto|smart|tab|stripBrs|tabs|bloggerMode|collapsed|plain|getCodeLinesHtml|caption|getMatchesHtml|findMatches|figureOutLineNumbers|removeNestedMatches|getTitleHtml|brushNotHtmlScript|substring|createElement|Highlighter|load|HtmlScript|Brush|pre|expand|multiline|min|Can|ignoreCase|find|blur|extended|toLowerCase|aliases|addEventListener|innerText|textContent|wasn|select|createTextNode|removeChild|option|same|frame|xmlns|dtd|twice|1999|equiv|meta|htmlscript|transitional|1E3|expected|PUBLIC|DOCTYPE|on|W3C|XHTML|TR|EN|Transitional||configured|srcElement|Object|after|run|dblclick|matchChain|valueOf|constructor|default|switch|click|round|execAt|forHtmlScript|token|gimy|functions|getKeywords|1E6|escape|within|random|sgi|another|finally|supply|MSIE|ie|toUpperCase|catch|returnValue|definition|event|border|imsx|constructing|one|Infinity|from|when|Content|cellpadding|flags|cellspacing|try|xhtml|Type|spaces|2930402|hosted_button_id|lastIndexOf|donate|active|development|keep|to|xclick|_s|Xml|please|like|you|paypal|cgi|cmd|webscr|bin|highlighted|scrollbars|aspScriptTags|phpScriptTags|sort|max|scriptScriptTags|toolbar_item|_|command|command_|number|getElementById|doubleQuotedString|singleLinePerlComments|singleLineCComments|multiLineCComments|singleQuotedString|multiLineDoubleQuotedString|xmlComments|alt|multiLineSingleQuotedString|If|https|1em|000|fff|background|5em|xx|bottom|75em|Gorbatchev|large|serif|CDATA|continue|utf|charset|content|About|family|sans|Helvetica|Arial|Geneva|3em|nogutter|Copyright|syntax|close|write|2004|Alex|open|JavaScript|highlighter|July|02|replaceChild|offset|83".split("|"),0,{}));

      var brushPlain = function(){
        // shBrushPlain.min.js
        (function(){function e(){}"undefined"!=typeof require?SyntaxHighlighter=require("shCore").SyntaxHighlighter:null,e.prototype=new SyntaxHighlighter.Highlighter,e.aliases=["text","plain"],SyntaxHighlighter.brushes.Plain=e,"undefined"!=typeof exports?exports.Brush=e:null})();
      }
      var brushJS = function(){
        // shBrushJScript.min.js
        (function(){function e(){var e="break case catch continue default delete do else false  for function if in instanceof new null return super switch this throw true try typeof var while with",t=SyntaxHighlighter.regexLib;this.regexList=[{regex:t.multiLineDoubleQuotedString,css:"string"},{regex:t.multiLineSingleQuotedString,css:"string"},{regex:t.singleLineCComments,css:"comments"},{regex:t.multiLineCComments,css:"comments"},{regex:/\s*#.*/gm,css:"preprocessor"},{regex:RegExp(this.getKeywords(e),"gm"),css:"keyword"}],this.forHtmlScript(t.scriptScriptTags)}"undefined"!=typeof require?SyntaxHighlighter=require("shCore").SyntaxHighlighter:null,e.prototype=new SyntaxHighlighter.Highlighter,e.aliases=["js","jscript","javascript"],SyntaxHighlighter.brushes.JScript=e,"undefined"!=typeof exports?exports.Brush=e:null})();
      }
      var brushCpp = function(){
        // shBrushCpp.min.js
        (function(){function e(){var e="ATOM BOOL BOOLEAN BYTE CHAR COLORREF DWORD DWORDLONG DWORD_PTR DWORD32 DWORD64 FLOAT HACCEL HALF_PTR HANDLE HBITMAP HBRUSH HCOLORSPACE HCONV HCONVLIST HCURSOR HDC HDDEDATA HDESK HDROP HDWP HENHMETAFILE HFILE HFONT HGDIOBJ HGLOBAL HHOOK HICON HINSTANCE HKEY HKL HLOCAL HMENU HMETAFILE HMODULE HMONITOR HPALETTE HPEN HRESULT HRGN HRSRC HSZ HWINSTA HWND INT INT_PTR INT32 INT64 LANGID LCID LCTYPE LGRPID LONG LONGLONG LONG_PTR LONG32 LONG64 LPARAM LPBOOL LPBYTE LPCOLORREF LPCSTR LPCTSTR LPCVOID LPCWSTR LPDWORD LPHANDLE LPINT LPLONG LPSTR LPTSTR LPVOID LPWORD LPWSTR LRESULT PBOOL PBOOLEAN PBYTE PCHAR PCSTR PCTSTR PCWSTR PDWORDLONG PDWORD_PTR PDWORD32 PDWORD64 PFLOAT PHALF_PTR PHANDLE PHKEY PINT PINT_PTR PINT32 PINT64 PLCID PLONG PLONGLONG PLONG_PTR PLONG32 PLONG64 POINTER_32 POINTER_64 PSHORT PSIZE_T PSSIZE_T PSTR PTBYTE PTCHAR PTSTR PUCHAR PUHALF_PTR PUINT PUINT_PTR PUINT32 PUINT64 PULONG PULONGLONG PULONG_PTR PULONG32 PULONG64 PUSHORT PVOID PWCHAR PWORD PWSTR SC_HANDLE SC_LOCK SERVICE_STATUS_HANDLE SHORT SIZE_T SSIZE_T TBYTE TCHAR UCHAR UHALF_PTR UINT UINT_PTR UINT32 UINT64 ULONG ULONGLONG ULONG_PTR ULONG32 ULONG64 USHORT USN VOID WCHAR WORD WPARAM WPARAM WPARAM char bool short int __int32 __int64 __int8 __int16 long float double __wchar_t clock_t _complex _dev_t _diskfree_t div_t ldiv_t _exception _EXCEPTION_POINTERS FILE _finddata_t _finddatai64_t _wfinddata_t _wfinddatai64_t __finddata64_t __wfinddata64_t _FPIEEE_RECORD fpos_t _HEAPINFO _HFILE lconv intptr_t jmp_buf mbstate_t _off_t _onexit_t _PNH ptrdiff_t _purecall_handler sig_atomic_t size_t _stat __stat64 _stati64 terminate_function time_t __time64_t _timeb __timeb64 tm uintptr_t _utimbuf va_list wchar_t wctrans_t wctype_t wint_t signed",t="break case catch class const __finally __exception __try const_cast continue private public protected __declspec default delete deprecated dllexport dllimport do dynamic_cast else enum explicit extern if for friend goto inline mutable naked namespace new noinline noreturn nothrow register reinterpret_cast return selectany sizeof static static_cast struct switch template this thread throw true false try typedef typeid typename union using uuid virtual void volatile whcar_t while",r="assert isalnum isalpha iscntrl isdigit isgraph islower isprintispunct isspace isupper isxdigit tolower toupper errno localeconv setlocale acos asin atan atan2 ceil cos cosh exp fabs floor fmod frexp ldexp log log10 modf pow sin sinh sqrt tan tanh jmp_buf longjmp setjmp raise signal sig_atomic_t va_arg va_end va_start clearerr fclose feof ferror fflush fgetc fgetpos fgets fopen fprintf fputc fputs fread freopen fscanf fseek fsetpos ftell fwrite getc getchar gets perror printf putc putchar puts remove rename rewind scanf setbuf setvbuf sprintf sscanf tmpfile tmpnam ungetc vfprintf vprintf vsprintf abort abs atexit atof atoi atol bsearch calloc div exit free getenv labs ldiv malloc mblen mbstowcs mbtowc qsort rand realloc srand strtod strtol strtoul system wcstombs wctomb memchr memcmp memcpy memmove memset strcat strchr strcmp strcoll strcpy strcspn strerror strlen strncat strncmp strncpy strpbrk strrchr strspn strstr strtok strxfrm asctime clock ctime difftime gmtime localtime mktime strftime time";this.regexList=[{regex:SyntaxHighlighter.regexLib.singleLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.multiLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:/^ *#.*/gm,css:"preprocessor"},{regex:RegExp(this.getKeywords(e),"gm"),css:"color1 bold"},{regex:RegExp(this.getKeywords(r),"gm"),css:"functions bold"},{regex:RegExp(this.getKeywords(t),"gm"),css:"keyword bold"}]}"undefined"!=typeof require?SyntaxHighlighter=require("shCore").SyntaxHighlighter:null,e.prototype=new SyntaxHighlighter.Highlighter,e.aliases=["cpp","c"],SyntaxHighlighter.brushes.Cpp=e,"undefined"!=typeof exports?exports.Brush=e:null})();
      }
      var brushCSharp = function(){
        // shBrushCSharp.min.js
        (function(){function e(){function e(e){var t=0==e[0].indexOf("///")?"color1":"comments";return[new SyntaxHighlighter.Match(e[0],e.index,t)]}var t="abstract as base bool break byte case catch char checked class const continue decimal default delegate do double else enum event explicit extern false finally fixed float for foreach get goto if implicit in int interface internal is lock long namespace new null object operator out override params private protected public readonly ref return sbyte sealed set short sizeof stackalloc static string struct switch this throw true try typeof uint ulong unchecked unsafe ushort using virtual void while";this.regexList=[{regex:SyntaxHighlighter.regexLib.singleLineCComments,func:e},{regex:SyntaxHighlighter.regexLib.multiLineCComments,css:"comments"},{regex:/@"(?:[^"]|"")*"/g,css:"string"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:/^\s*#.*/gm,css:"preprocessor"},{regex:RegExp(this.getKeywords(t),"gm"),css:"keyword"},{regex:/\bpartial(?=\s+(?:class|interface|struct)\b)/g,css:"keyword"},{regex:/\byield(?=\s+(?:return|break)\b)/g,css:"keyword"}],this.forHtmlScript(SyntaxHighlighter.regexLib.aspScriptTags)}"undefined"!=typeof require?SyntaxHighlighter=require("shCore").SyntaxHighlighter:null,e.prototype=new SyntaxHighlighter.Highlighter,e.aliases=["c#","c-sharp","csharp"],SyntaxHighlighter.brushes.CSharp=e,"undefined"!=typeof exports?exports.Brush=e:null})();
      }
      var brushXml = function(){
        // shBrushXml.min.js
        (function(){function e(){function e(e){var t=SyntaxHighlighter.Match,r=e[0],i=new XRegExp("(&lt;|<)[\\s\\/\\?]*(?<name>[:\\w-\\.]+)","xg").exec(r),s=[];if(null!=e.attributes)for(var n,a=new XRegExp("(?<name> [\\w:\\-\\.]+)\\s*=\\s*(?<value> \".*?\"|'.*?'|\\w+)","xg");null!=(n=a.exec(r));)s.push(new t(n.name,e.index+n.index,"color1")),s.push(new t(n.value,e.index+n.index+n[0].indexOf(n.value),"string"));return null!=i&&s.push(new t(i.name,e.index+i[0].indexOf(i.name),"keyword")),s}this.regexList=[{regex:new XRegExp("(\\&lt;|<)\\!\\[[\\w\\s]*?\\[(.|\\s)*?\\]\\](\\&gt;|>)","gm"),css:"color2"},{regex:SyntaxHighlighter.regexLib.xmlComments,css:"comments"},{regex:new XRegExp("(&lt;|<)[\\s\\/\\?]*(\\w+)(?<attributes>.*?)[\\s\\/\\?]*(&gt;|>)","sg"),func:e}]}"undefined"!=typeof require?SyntaxHighlighter=require("shCore").SyntaxHighlighter:null,e.prototype=new SyntaxHighlighter.Highlighter,e.aliases=["xml","xhtml","xslt","html"],SyntaxHighlighter.brushes.Xml=e,"undefined"!=typeof exports?exports.Brush=e:null})();
      }
      var brushCss = function(){
        // shBrushCss.min.js
        (function(){function e(){function e(e){return"\\b([a-z_]|)"+e.replace(/ /g,"(?=:)\\b|\\b([a-z_\\*]|\\*|)")+"(?=:)\\b"}function t(e){return"\\b"+e.replace(/ /g,"(?!-)(?!:)\\b|\\b()")+":\\b"}var r="ascent azimuth background-attachment background-color background-image background-position background-repeat background baseline bbox border-collapse border-color border-spacing border-style border-top border-right border-bottom border-left border-top-color border-right-color border-bottom-color border-left-color border-top-style border-right-style border-bottom-style border-left-style border-top-width border-right-width border-bottom-width border-left-width border-width border bottom cap-height caption-side centerline clear clip color content counter-increment counter-reset cue-after cue-before cue cursor definition-src descent direction display elevation empty-cells float font-size-adjust font-family font-size font-stretch font-style font-variant font-weight font height left letter-spacing line-height list-style-image list-style-position list-style-type list-style margin-top margin-right margin-bottom margin-left margin marker-offset marks mathline max-height max-width min-height min-width orphans outline-color outline-style outline-width outline overflow padding-top padding-right padding-bottom padding-left padding page page-break-after page-break-before page-break-inside pause pause-after pause-before pitch pitch-range play-during position quotes right richness size slope src speak-header speak-numeral speak-punctuation speak speech-rate stemh stemv stress table-layout text-align top text-decoration text-indent text-shadow text-transform unicode-bidi unicode-range units-per-em vertical-align visibility voice-family volume white-space widows width widths word-spacing x-height z-index",i="above absolute all always aqua armenian attr aural auto avoid baseline behind below bidi-override black blink block blue bold bolder both bottom braille capitalize caption center center-left center-right circle close-quote code collapse compact condensed continuous counter counters crop cross crosshair cursive dashed decimal decimal-leading-zero default digits disc dotted double embed embossed e-resize expanded extra-condensed extra-expanded fantasy far-left far-right fast faster fixed format fuchsia gray green groove handheld hebrew help hidden hide high higher icon inline-table inline inset inside invert italic justify landscape large larger left-side left leftwards level lighter lime line-through list-item local loud lower-alpha lowercase lower-greek lower-latin lower-roman lower low ltr marker maroon medium message-box middle mix move narrower navy ne-resize no-close-quote none no-open-quote no-repeat normal nowrap n-resize nw-resize oblique olive once open-quote outset outside overline pointer portrait pre print projection purple red relative repeat repeat-x repeat-y rgb ridge right right-side rightwards rtl run-in screen scroll semi-condensed semi-expanded separate se-resize show silent silver slower slow small small-caps small-caption smaller soft solid speech spell-out square s-resize static status-bar sub super sw-resize table-caption table-cell table-column table-column-group table-footer-group table-header-group table-row table-row-group teal text-bottom text-top thick thin top transparent tty tv ultra-condensed ultra-expanded underline upper-alpha uppercase upper-latin upper-roman url visible wait white wider w-resize x-fast x-high x-large x-loud x-low x-slow x-small x-soft xx-large xx-small yellow",a="[mM]onospace [tT]ahoma [vV]erdana [aA]rial [hH]elvetica [sS]ans-serif [sS]erif [cC]ourier mono sans serif";this.regexList=[{regex:SyntaxHighlighter.regexLib.multiLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:/\#[a-fA-F0-9]{3,6}/g,css:"value"},{regex:/(-?\d+)(\.\d+)?(px|em|pt|\:|\%|)/g,css:"value"},{regex:/!important/g,css:"color3"},{regex:RegExp(e(r),"gm"),css:"keyword"},{regex:RegExp(t(i),"g"),css:"value"},{regex:RegExp(this.getKeywords(a),"g"),css:"color1"}],this.forHtmlScript({left:/(&lt;|<)\s*style.*?(&gt;|>)/gi,right:/(&lt;|<)\/\s*style\s*(&gt;|>)/gi})}"undefined"!=typeof require?SyntaxHighlighter=require("shCore").SyntaxHighlighter:null,e.prototype=new SyntaxHighlighter.Highlighter,e.aliases=["css"],SyntaxHighlighter.brushes.CSS=e,"undefined"!=typeof exports?exports.Brush=e:null})();
      }
      var brushPhp = function(){
        // shBrushPhp.min.js
        (function(){function e(){var e="abs acos acosh addcslashes addslashes array_change_key_case array_chunk array_combine array_count_values array_diff array_diff_assoc array_diff_key array_diff_uassoc array_diff_ukey array_fill array_filter array_flip array_intersect array_intersect_assoc array_intersect_key array_intersect_uassoc array_intersect_ukey array_key_exists array_keys array_map array_merge array_merge_recursive array_multisort array_pad array_pop array_product array_push array_rand array_reduce array_reverse array_search array_shift array_slice array_splice array_sum array_udiff array_udiff_assoc array_udiff_uassoc array_uintersect array_uintersect_assoc array_uintersect_uassoc array_unique array_unshift array_values array_walk array_walk_recursive atan atan2 atanh base64_decode base64_encode base_convert basename bcadd bccomp bcdiv bcmod bcmul bindec bindtextdomain bzclose bzcompress bzdecompress bzerrno bzerror bzerrstr bzflush bzopen bzread bzwrite ceil chdir checkdate checkdnsrr chgrp chmod chop chown chr chroot chunk_split class_exists closedir closelog copy cos cosh count count_chars date decbin dechex decoct deg2rad delete ebcdic2ascii echo empty end ereg ereg_replace eregi eregi_replace error_log error_reporting escapeshellarg escapeshellcmd eval exec exit exp explode extension_loaded feof fflush fgetc fgetcsv fgets fgetss file_exists file_get_contents file_put_contents fileatime filectime filegroup fileinode filemtime fileowner fileperms filesize filetype floatval flock floor flush fmod fnmatch fopen fpassthru fprintf fputcsv fputs fread fscanf fseek fsockopen fstat ftell ftok getallheaders getcwd getdate getenv gethostbyaddr gethostbyname gethostbynamel getimagesize getlastmod getmxrr getmygid getmyinode getmypid getmyuid getopt getprotobyname getprotobynumber getrandmax getrusage getservbyname getservbyport gettext gettimeofday gettype glob gmdate gmmktime ini_alter ini_get ini_get_all ini_restore ini_set interface_exists intval ip2long is_a is_array is_bool is_callable is_dir is_double is_executable is_file is_finite is_float is_infinite is_int is_integer is_link is_long is_nan is_null is_numeric is_object is_readable is_real is_resource is_scalar is_soap_fault is_string is_subclass_of is_uploaded_file is_writable is_writeable mkdir mktime nl2br parse_ini_file parse_str parse_url passthru pathinfo print readlink realpath rewind rewinddir rmdir round str_ireplace str_pad str_repeat str_replace str_rot13 str_shuffle str_split str_word_count strcasecmp strchr strcmp strcoll strcspn strftime strip_tags stripcslashes stripos stripslashes stristr strlen strnatcasecmp strnatcmp strncasecmp strncmp strpbrk strpos strptime strrchr strrev strripos strrpos strspn strstr strtok strtolower strtotime strtoupper strtr strval substr substr_compare",t="abstract and array as break case catch cfunction class clone const continue declare default die do else elseif enddeclare endfor endforeach endif endswitch endwhile extends final for foreach function include include_once global goto if implements interface instanceof namespace new old_function or private protected public return require require_once static switch throw try use var while xor ",r="__FILE__ __LINE__ __METHOD__ __FUNCTION__ __CLASS__";this.regexList=[{regex:SyntaxHighlighter.regexLib.singleLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.multiLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:/\$\w+/g,css:"variable"},{regex:RegExp(this.getKeywords(e),"gmi"),css:"functions"},{regex:RegExp(this.getKeywords(r),"gmi"),css:"constants"},{regex:RegExp(this.getKeywords(t),"gm"),css:"keyword"}],this.forHtmlScript(SyntaxHighlighter.regexLib.phpScriptTags)}"undefined"!=typeof require?SyntaxHighlighter=require("shCore").SyntaxHighlighter:null,e.prototype=new SyntaxHighlighter.Highlighter,e.aliases=["php"],SyntaxHighlighter.brushes.Php=e,"undefined"!=typeof exports?exports.Brush=e:null})();
      }
      var brushJava = function(){
        // shBrushJava.min.js
        (function(){function e(){var e="abstract assert boolean break byte case catch char class const continue default do double else enum extends false final finally float for goto if implements import instanceof int interface long native new null package private protected public return short static strictfp super switch synchronized this throw throws true transient try void volatile while";this.regexList=[{regex:SyntaxHighlighter.regexLib.singleLineCComments,css:"comments"},{regex:/\/\*([^\*][\s\S]*)?\*\//gm,css:"comments"},{regex:/\/\*(?!\*\/)\*[\s\S]*?\*\//gm,css:"preprocessor"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:/\b([\d]+(\.[\d]+)?|0x[a-f0-9]+)\b/gi,css:"value"},{regex:/(?!\@interface\b)\@[\$\w]+\b/g,css:"color1"},{regex:/\@interface\b/g,css:"color2"},{regex:RegExp(this.getKeywords(e),"gm"),css:"keyword"}],this.forHtmlScript({left:/(&lt;|<)%[@!=]?/g,right:/%(&gt;|>)/g})}"undefined"!=typeof require?SyntaxHighlighter=require("shCore").SyntaxHighlighter:null,e.prototype=new SyntaxHighlighter.Highlighter,e.aliases=["java"],SyntaxHighlighter.brushes.Java=e,"undefined"!=typeof exports?exports.Brush=e:null})();
      }
      var brushDelphi = function(){
        // shBrushDelphi.min.js
        (function(){function e(){var e="abs addr and ansichar ansistring array as asm begin boolean byte cardinal case char class comp const constructor currency destructor div do double downto else end except exports extended false file finalization finally for function goto if implementation in inherited int64 initialization integer interface is label library longint longword mod nil not object of on or packed pansichar pansistring pchar pcurrency pdatetime pextended pint64 pointer private procedure program property pshortstring pstring pvariant pwidechar pwidestring protected public published raise real real48 record repeat set shl shortint shortstring shr single smallint string then threadvar to true try type unit until uses val var varirnt while widechar widestring with word write writeln xor";this.regexList=[{regex:/\(\*[\s\S]*?\*\)/gm,css:"comments"},{regex:/{(?!\$)[\s\S]*?}/gm,css:"comments"},{regex:SyntaxHighlighter.regexLib.singleLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:/\{\$[a-zA-Z]+ .+\}/g,css:"color1"},{regex:/\b[\d\.]+\b/g,css:"value"},{regex:/\$[a-zA-Z0-9]+\b/g,css:"value"},{regex:RegExp(this.getKeywords(e),"gmi"),css:"keyword"}]}"undefined"!=typeof require?SyntaxHighlighter=require("shCore").SyntaxHighlighter:null,e.prototype=new SyntaxHighlighter.Highlighter,e.aliases=["delphi","pascal","pas"],SyntaxHighlighter.brushes.Delphi=e,"undefined"!=typeof exports?exports.Brush=e:null})();
      }
      var brushPython = function(){
        // shBrushPython.min.js
        (function(){function e(){var e="and assert break class continue def del elif else except exec finally for from global if import in is lambda not or pass print raise return try yield while",t="__import__ abs all any apply basestring bin bool buffer callable chr classmethod cmp coerce compile complex delattr dict dir divmod enumerate eval execfile file filter float format frozenset getattr globals hasattr hash help hex id input int intern isinstance issubclass iter len list locals long map max min next object oct open ord pow print property range raw_input reduce reload repr reversed round set setattr slice sorted staticmethod str sum super tuple type type unichr unicode vars xrange zip",r="None True False self cls class_";this.regexList=[{regex:SyntaxHighlighter.regexLib.singleLinePerlComments,css:"comments"},{regex:/^\s*@\w+/gm,css:"decorator"},{regex:/(['\"]{3})([^\1])*?\1/gm,css:"comments"},{regex:/"(?!")(?:\.|\\\"|[^\""\n])*"/gm,css:"string"},{regex:/'(?!')(?:\.|(\\\')|[^\''\n])*'/gm,css:"string"},{regex:/\+|\-|\*|\/|\%|=|==/gm,css:"keyword"},{regex:/\b\d+\.?\w*/g,css:"value"},{regex:RegExp(this.getKeywords(t),"gmi"),css:"functions"},{regex:RegExp(this.getKeywords(e),"gm"),css:"keyword"},{regex:RegExp(this.getKeywords(r),"gm"),css:"color1"}],this.forHtmlScript(SyntaxHighlighter.regexLib.aspScriptTags)}"undefined"!=typeof require?SyntaxHighlighter=require("shCore").SyntaxHighlighter:null,e.prototype=new SyntaxHighlighter.Highlighter,e.aliases=["py","python"],SyntaxHighlighter.brushes.Python=e,"undefined"!=typeof exports?exports.Brush=e:null})();
      }
      var brushRuby = function(){
        // shBrushRuby.min.js
        (function(){function e(){var e="alias and BEGIN begin break case class def define_method defined do each else elsif END end ensure false for if in module new next nil not or raise redo rescue retry return self super then throw true undef unless until when while yield",t="Array Bignum Binding Class Continuation Dir Exception FalseClass File::Stat File Fixnum Fload Hash Integer IO MatchData Method Module NilClass Numeric Object Proc Range Regexp String Struct::TMS Symbol ThreadGroup Thread Time TrueClass";this.regexList=[{regex:SyntaxHighlighter.regexLib.singleLinePerlComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:/\b[A-Z0-9_]+\b/g,css:"constants"},{regex:/:[a-z][A-Za-z0-9_]*/g,css:"color2"},{regex:/(\$|@@|@)\w+/g,css:"variable bold"},{regex:RegExp(this.getKeywords(e),"gm"),css:"keyword"},{regex:RegExp(this.getKeywords(t),"gm"),css:"color1"}],this.forHtmlScript(SyntaxHighlighter.regexLib.aspScriptTags)}"undefined"!=typeof require?SyntaxHighlighter=require("shCore").SyntaxHighlighter:null,e.prototype=new SyntaxHighlighter.Highlighter,e.aliases=["ruby","rails","ror","rb"],SyntaxHighlighter.brushes.Ruby=e,"undefined"!=typeof exports?exports.Brush=e:null})();
      }
      var qtags = document.querySelectorAll("#question-tags a");
      var tags = [];
      for(var t=0;t<qtags.length;t++){
        var cnt = qtags[t].textContent.trim();
        if (tags.indexOf(cnt)<0){
          tags.push(cnt);
        }
      }
      var brush = "plain";
      if (tags.indexOf('html')>=0 || tags.indexOf('html5')>=0)
      {
        brush = "js; html-script: true";
        brushJS();
        brushXml();
      } else if (tags.indexOf('php')>=0)
      {
        brush = "php";
        brushPhp();
      } else if (tags.indexOf('js')>=0 || tags.indexOf('javascript')>=0 || tags.indexOf('jquery')>=0 || tags.indexOf('node.js')>=0)
      {
        brush = "js";
        brushJS();
      } else if (tags.indexOf('css')>=0)
      {
        brush = "css";
        brushCss();
      } else if (tags.indexOf('c++')>=0 || tags.indexOf('c')>=0 || tags.indexOf('objective-c')>=0 || tags.indexOf('qt')>=0 || tags.indexOf('xcode')>=0)
      {
        brush = "cpp";
        brushCpp();
      } else if (tags.indexOf('c#')>=0)
      {
        brush = "csharp";
        brushCSharp();
      } else if (tags.indexOf('java')>=0 || tags.indexOf('android')>=0)
      {
        brush = "java";
        brushJava();
      } else if (tags.indexOf('pascal')>=0 || tags.indexOf('delphi')>=0 || tags.indexOf('delphi7')>=0 || tags.indexOf('freepascal')>=0)
      {
        brush = "pas";
        brushDelphi();
      } else if (tags.indexOf('python')>=0)
      {
        brush = "py";
        brushPython();
      } else if (tags.indexOf('ruby')>=0 || tags.indexOf('ruby-on-rails')>=0 || tags.indexOf('rails')>=0)
      {
        brush = "ruby";
        brushRuby();
      } else {
        brushPlain();
      }
      if ( this.settings.noGutter=='1' ) brush+= ' gutter:false';
      var brushes = brush.split(' ');
      var codes = document.querySelectorAll("pre code");
      this.codesLength = codes.length;
      for (var i = 0; i < codes.length; i++) {
          codes[i].innerHTML= codes[i].innerHTML.replace(/<a rel="noindex,nofollow" href="\/users\/[0-9]+\/[^"]+">(@[^<]+)<\/a>/i, "$1");
          if ( brush=='plain' && this.settings.usePretty==1 ) {
              window.prettyPrintBackup();
          } else {
              var cl = "brush:";
              for(var j=0;j<brushes.length;j++){
                      cl+= brushes[j]+";";
              }
              if ( this.settings.noGutterInComments=='1' && codes[i].parentNode.parentNode.className=='comment-text') {
                  cl+= " gutter:false;";
              };
              codes[i].parentNode.className= cl;
              codes[i].parentNode.innerHTML = codes[i].innerHTML+'\n';
          }
      }
      SyntaxHighlighter.defaults['toolbar'] = false;
      SyntaxHighlighter.all();
      this.fixGutterHeight();
      window.prettyPrint = window.prettyPrintBackup;
    },
    
    fixGutterHeight: function() {
        var fixer;
        var context= this;
        var fixer = function() {
            if ( context.settings.wrapText == '1' ) {
                var $code = $('div.syntaxhighlighter td.gutter + td.code');
                if ( $code.length==0  && context.codesLength>0) {
                    window.setTimeout( fixer, 250);
                    return;
                };
                for (var i=0; i<$code.length; i++) {
                    var $lineCode= $($code[i]).find('.line');
                    var $lineGutter= $($code[i].previousSibling).find('.line');
                    var size = $lineCode.length;
                    for (var j=0; j<size; j++) {
                        if ( $lineGutter[j].offsetHeight!==$lineCode[j].offsetHeight ) {
                            $lineGutter[j].style.cssText = "height:"+$lineCode[j].offsetHeight+'px!important';
                        };
                    };
                };
            };
        };
        fixer();
    }
},

﻿{
    name: 'collapseLongCodeBlock',
    title: 'Сворачивание длинного кода',
    description: 'К слишком большим участкам кода добавляется полоса прокрутки.',
    settings: {
        maxheight: "400px",
        yscroll: "0"
    },
    exports: [
        {name: "maxheight", type: "text", title: "Ограничить максимальную высоту значением:"},
        {name: "yscroll", type: "checkbox", title: "Добавить горизонтальную прокрутку"}
    ],
    run: function() {
        window.addonsLoader.API.addCSS(".prettyprint , .syntaxhighlighter {height:auto !important;max-height: "+parseInt(this.settings.maxheight)+"px !important;overflow-y:auto !important}");
        if (this.settings.yscroll=="1"){
            window.addonsLoader.API.addCSS(".prettyprint code {white-space: nowrap}");
        }
    }
},

﻿// @author Yura Ivanov
{
    name: 'newAnswersAndComments',
    title: 'Подсветка новых сообщений',
    description: 'Новые ответы и комментарии выделяются цветом, что делает поиск обновлений в вопросе значительно быстрее.',
    run: function() {
        var regexURL= new RegExp("^https?://[^/]+/(?:questions|research)/.+$", "i");
        if (!regexURL.test(location.href)) return; // если не вопрос, то не работаем
        var $qid= $("a.post-vote.up");
        if ($qid.length==0) return; // невозможно включиться
        var qid = $qid.attr("href").replace('/vote/', '').replace('/up', '');
        var qopened = window.localStorage.getItem('__opened_' + qid);
        var readanswers = JSON.parse(window.localStorage.getItem('__read_answers_' + qid) || "[]");
        var nowanswers = [];
        $(".answer").each(function(i, an) {
            var anid = $(an).attr('id').replace('answer-container-', '');
            nowanswers.push(anid);
            if (readanswers.indexOf(anid) < 0) {
                if (qopened) {
                    $(an).css("border-left", "solid #5B9058 3px");
                }
            }
        });
        var readcomments = JSON.parse(window.localStorage.getItem('__read_comments_' + qid) || "[]");
        var nowcomments = [];
        $(".comment").each(function(i, cm) {
            var cmid = $(cm).attr('id').replace('comment-', '');
            nowcomments.push(cmid);
            if (readcomments.indexOf(cmid) < 0) {
                if (qopened) {
                    $(cm).css("border-left", "solid #5B9058 3px");
                }
            }
        });
        var $nav = $("<div class='boxC'></div>");
        $nav.append("<p>ответы<br>" + "<strong>всего<span style=\"letter-spacing: 0.8ex;\">&nbsp</span>: " + nowanswers.length + "</strong><br>" + "<strong>новых : " + (nowanswers.length - readanswers.length) + "</strong><br></p>" + "<p>комментарии<br>" + "<strong>всего<span style=\"letter-spacing: 0.8ex;\">&nbsp</span>: " + nowcomments.length + "</strong><br>" + "<strong>новых : " + (nowcomments.length - readcomments.length) + "</strong><br></p>");
        $nav.insertAfter(document.getElementById('CARight').children[0]);
        window.localStorage.setItem('__read_answers_' + qid, JSON.stringify(nowanswers));
        window.localStorage.setItem('__read_comments_' + qid, JSON.stringify(nowcomments));
        window.localStorage.setItem('__opened_' + qid, true);
    }
},

﻿{
    name: 'SearchFromGoogle',
    title: 'Поиск от Google',
    description: 'Из строки поиска поиск будет осуществляться при помощи запроса вида <br/><pre>site:hashcode.ru запрос</pre><br/>что дает более релевантные результаты.',
    settings: {
      
    },
    exports: [],
    run: function() {
        $('#searchBar').submit(function () {
            location.href= "http://google.ru/search?q=site%3A"+location.hostname+"%20"+this.q.value;
            return false;
        });
    } 
},

﻿{
    name: 'sortBetter',
    title: 'Улучшенная сортировка',
    description: 'Cортирует списки вопросов<BR/><UL><LI>Те у которых последний автор пользователь - в самый низ</LI><LI>интересные (из тэгов) в начало</LI><LI>сортируем интересные - сначала по количеству ответов, потом, по количеству голосов</LI></UL>',
    run: function() {
        var userlink=$('#searchBar a').first().attr('href');
        $('#listA')
            .prepend(
                $('.short-summary.tagged-interesting')
                .sort(sortQuestions)
            )
            .append($('.short-summary').has('a[href="' +userlink+ '"'));

        function sortQuestions(a,b) {
            var $a=$(a),
            $b=$(b);
            return  (value($a,'status')-value($b,'status')) ||
                    (value($b,'votes')-value($a,'votes'));

            function value($s,Class) {
                return parseInt($s.find('.'+Class+' .item-count').text());
            }
        }
    }
}
,

﻿{
    name: 'autocompleteWithSelection',
    title: 'Автодополнение собаки по пробелу',
    description: 'Дополняет в поле ввода собаку ником участника, отметившегося на странице. Если дополнить можно несколькими вариантами, то пробел перебирает возможные продолжения. Если просто ввести собаку и нажимать пробел, то будут перебираться все ники. Если возможное продолжение только одно, то курсор переносится за него. Чтобы просто ввести собаку нужно нажать собаку и клавиши влево-вправо.',
    run: function() {    
        /** target- поле ввода, text- полное совпадение, matchText- частичное совпадение, например имея на входе "test" и "te" будет выделено "st" te[st] */
        var completeSelection= function( target, text, matchText) {
            target.value=target.value.substring(0, target.adduser+1)+text+target.value.substring(target.selectionEnd);
            target.selectionStart= target.adduser+matchText.length+1;
            target.selectionEnd  = target.adduser+text.length+1;
            // console.log([value, target.adduser, target.selectionStart]);
        };
        
        var currentLogin= $("#searchBar a")[0].innerHTML.toLowerCase(); // логин самого участника
        var regexUsers = new RegExp("<a\\s[^>]*href\\s*=\\s*\"\/users\/\\d(?![^>]*\/(?:reputation|subscriptions)\/)[^>]*>([\\s\\S]*?)<\/a>", 'ig');
        var users = Array();
        var usersLow= Array()
        var regexLoginClear1= new RegExp("(?:^@)|\\s*\u2666+", 'ig');
        var regexLoginClear2= new RegExp("<span[^>]*>([^<]+)<\/span>", "ig");
        // сначала находим все логины, которые есть на странице и оставляем из них только уникальные в нижнем регистре
        while ( (match=regexUsers.exec(document.body.innerHTML)) != null ) {
            var userLogin= match[1].replace(regexLoginClear2, "$1").replace(regexLoginClear1, '');
            var userLoginLow= userLogin.toLowerCase();
            if (currentLogin != userLoginLow) { // свой логин исключаем
                usersLow.push(userLoginLow);
                users[userLoginLow]=userLogin;
            }
        };
        usersLow= window.addonsLoader.API.arrayUnique(usersLow);
        // если курсор ушел влево от собаки или на 30 символов правее, то перестаем отслеживать
        $("textarea").bind("keydown", function(e) {
            if (e.target.adduser>=e.target.selectionEnd || e.target.adduser+30<e.target.selectionStart) e.target.adduser= null;
        });
        $("textarea").bind("keypress", function(e){
                // нажали собаку- начали отслеживать
                if (e.charCode==64) {
                    e.target.adduser=e.target.selectionStart;
                }
                // пробел
                if (e.charCode==32 && e.target.adduser!=null) {
                    short=e.target.value.substring(e.target.adduser+1, e.target.selectionStart).toLowerCase();
                    long= e.target.value.substring(e.target.adduser+1, e.target.selectionEnd);
                    var find= null; // результат поика в массиве
                    nextFindIsResult= (short=="" && long==""); // для прокрутки пробелом, если пробел сразу после собаки, и ничем не дополнено, то дополняем первым значением из массива
                    for (var i in usersLow) {
                        if (usersLow[i]==long.toLowerCase()) {
                            nextFindIsResult=true;
                            continue;
                        }
                        if (nextFindIsResult && usersLow[i].indexOf(short)==0) { 
                            find= users[usersLow[i]];
                            break;
                        }
                    }
                    if (nextFindIsResult && (find==null || find=="")) {
                        for (var i in usersLow) {
                            if (usersLow[i].indexOf(short)==0) {
                                find= users[usersLow[i]];
                                break;
                            }
                        }
                    }
                    //console.log([find, long, short]);
                    if (find) { // если совпадение одно, то добавляем запятую и переносим курсор
                        if (find==long) find+=",";
                        completeSelection(e.target, find, short);
                        if (find==long+",") {
                            e.target.selectionStart=e.target.selectionEnd;
                            return true;
                        }
                        return false;
                    }
                };
                // кнопки отличные от пробела и собаки, пытаемся найти совпадение
                if (e.target.adduser!=null && e.target.adduser<e.target.selectionStart) {
                    var short= (e.target.value.substring(e.target.adduser+1, e.target.selectionStart)+String.fromCharCode(e.charCode)).toLowerCase();
                    //console.log(short);
                    var find= null;
                    for (var i in usersLow) {
                        if (usersLow[i].indexOf(short)==0) {
                            find= users[usersLow[i]];
                            break;
                        }
                    }
                    if (find) {
                        completeSelection(e.target, find, short);
                        return false;
                    }
                }
            }
        ); // $ textarea bind
    }
},

]; // end addons
addonsLoader.initStorage();
addonsLoader.callEventIterator('beforeInit');


};
var script = document.createElement('script');
script.innerHTML = __extension__wrapper__.toString().replace(/^.*?\{|\}.*?$/g, '');
document.getElementsByTagName('head')[0].appendChild(script);
