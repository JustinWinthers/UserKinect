//todo items:
// add issue type image
// decrease global accessors
// testable functions!
// dropdowns more dynamic divs with scrolling

var jiraConnect = window.jiraConnect = (function (document, window, helpers){

    "use strict";

    console.log ('jiraConnect v2.0');


    function factory(elem, selector){

        var e = elem.querySelector(selector);

        for (var method in helpers){

            if (helpers.hasOwnProperty(method)){

                if (e===null){
                    throw('Attempting to set properties for null' +
                        ' element with selector ' + selector);
                }

                e[method] = helpers[method];
            }
        }

        return e;

    }

    // options
    var runningTests = true;
    var project = '{project}'||'';
    var issueType = '{issueType}';
    var component = '{component}';
    var baseURL = '{host}';
    var protocol = 'http';
    var jira_env = '{jira_env}';
    var jiraURL = 'jira.nreca.org/browse/';
    var collapsed = true;
    var canvasWasUpdated = false;
    var canvasShown = false;
    var hideScrollBarsIE = true;
    var mode = '{mode}';
    var jiraUserInfo = {};


    // element list - variables that will contain elements
    var api,
        jiraLinkAppContainer,
        jiraModal,
        jiraTitle,
        jiraCanvas,
        jiraContainer,
        jiraConnectForm,
        jiraConnectProject,
        jiraConnectComponent,
        jiraConnectIssueType,
        jiraConnectMessage,
        jiraConnectExpandButton,
        jiraConnectDrawButton,
        jiraConnectLogo,
        jiraConnectSendButton,
        jiraAdminPanel,
        jiraAdminInput,
        jiraUser,
        jiraUserPassword,
        jiraUserAvatar,
        jiraUserName,
        jiraPaletteCase,
        jiraPaletteOverlay;

    // tools
    var jiraToolBlackPen,
        jiraToolRedPen,
        jiraToolHighLighter,
        jiraToolEraser,
        jiraToolUndo,
        jiraToolRedo;


    // css class list - variables to contain classes that will affect elements
    var messageAlert,
        messageInfo,
        jiraConnectMessageClass,
        jiraConnectMessageClassShow;

    var jiraConnectTemplate;


    window.onresize = resize;

    getTemplate(function (data){

        jiraConnectTemplate = data.replace(/{path}/g, baseURL);

        checkLocalStorage();
        buildDom();    //inject elements into DOM
        setupStyles(); //create dynamic styles objects
        getProjectDetails(project, mode);

        if (hideScrollBarsIE) {
            var body = document.querySelector('body');
            body.style.msOverflowStyle = 'none';
        }

        //for testing only
        //setTimeout(toggleCollapse,100);
        //setTimeout(showCanvas,200);

    });


    function resize(){
        if (!collapsed) {
            setTimeout(determineIfContainerCanScroll,700);
        }
    }


    function removeStyles (styles){

        var _styles = {};

        for (var style in styles) {

            if (styles.hasOwnProperty(style)){
                _styles[style] = null;
            }
        }

        return _styles;
    }

    function showCanvas(e){

        jiraContainer.style.position = 'fixed';

        if (e && canvasShown){
            //then user hit clear to clear the canvas
            newCanvas(true);
            //cPush();
            return;
        } else {
            //present canvas when we hit 'Annotate'
            if (!canvasWasUpdated) newCanvas();
        }

        canvasShown = !canvasShown;

        jiraContainer.toggleClass('collapseToDraw');
        jiraModal.toggleClass('collapseModal');
        jiraContainer.toggleClass('shadow');
        jiraPaletteCase.toggleClass('display');
        jiraPaletteOverlay.toggleClass('display');
        jiraConnectLogo.toggleClass('display-block');
        setTimeout(function(){jiraPaletteOverlay.toggleClass('display-block');},500);
        jiraConnectExpandButton.toggleHTML(canvasShown ? 'Done' : 'Close');
        jiraConnectDrawButton.toggleHTML(canvasShown ? 'Clear' : '&nbsp;Draw');
        jiraConnectDrawButton.toggleClass('draw');
        jiraConnectDrawButton.toggleClass('clear-bgimage');
        jiraAdminPanel.addClass('display-none');

        if (!canvasWasUpdated) jiraCanvas.toggleClass('jiraCanvasShow');

        if (!canvasShown){
            //the the user hit done
            setTimeout(determineIfContainerCanScroll,700);
        }

    }

    function toggleCollapse(){

        if (canvasShown){
            //then user hit done to keep canvas
            showCanvas();
            return;
        }

        collapsed = !collapsed;

        jiraModal.toggleClass('collapse');
        jiraContainer.toggleClass('collapse');
        jiraContainer.toggleClass('shadow');
        jiraConnectLogo.toggleClass('display-block');
        jiraConnectExpandButton.toggleHTML(collapsed ? 'Feedback?' : 'Close');
        jiraAdminPanel.addClass('display-none');


        if (collapsed) {
            //init: reset canvas and clear form
            jiraCanvas.innerHTML='';
            canvasWasUpdated = false;
            jiraConnectForm.clearForm();
            jiraContainer.style.position = 'fixed';
            clearMessages();
        }

        if (!collapsed) setTimeout(determineIfContainerCanScroll,700);

    }

    function determineIfContainerCanScroll(){

        if (canvasShown){
            jiraContainer.style.position = 'absolute';
            return;
        }

        var containerHeightCSS = jiraContainer.offsetHeight;

        if (window.innerHeight < (containerHeightCSS + 30) ) {
            jiraContainer.style.position = 'absolute';
        } else {
            jiraContainer.style.position = 'fixed';
        }

        jiraModal.style.height = document.querySelector('html').scrollHeight + 'px';
        jiraModal.style.width = document.querySelector('html').scrollWidth + 'px';

    }

    function applyStyles(elem, styles){

        if (!styles) return;

        if (styles instanceof Array){

            for (var i = 0; i < styles.length; i++){
                applyStyles(elem, styles[i]);
            }
            return;
        }

        for (var style in styles) {
            if (styles.hasOwnProperty(style)){
                elem.style[style] = styles[style];
            }
        }
    }

    function buildDom(){

        buildAppContainer();
        appendContainer();
        getDomElements();
        setupDomElements();
        checkMode(mode);
    }

    function buildAppContainer(){
        // build the jiraConnect app container
        jiraLinkAppContainer = document.createElement("div");
        jiraLinkAppContainer.id = "jiraConnect";
        jiraLinkAppContainer.innerHTML = jiraConnectTemplate;

        jiraLinkAppContainer.addEventListener('keydown',function(e){
            // keep the user from being able to tab fields if
            // view is collapsed
            if (e.keyCode == 9 && collapsed) e.preventDefault();
        });

    }

    function checkMode(mode){

        if (mode==='limited'){
            jiraConnectProject.addClass('display-none');
            jiraConnectComponent.addClass('display-none');
            jiraConnectIssueType.addClass('display-none');
        } else {
            jiraContainer.addClass('expand');
        }

    }

    function toggleMode(mode){


        if (mode==='full'){
            jiraConnectProject.addClass('display');
            jiraConnectComponent.addClass('display');
            jiraConnectIssueType.addClass('display');
        }

    }

    function unlockAdmin(){

        if (jiraAdminInput.value === 'admin'){
            jiraAdminInput.value = '';
            jiraAdminPanel.addClass('display-none');

            mode = 'full';
            toggleMode(mode);
            jiraContainer.addClass('expand');
            setTimeout(determineIfContainerCanScroll,700);
            getProjectList(function(httpStatus){

                if (httpStatus===200){

                    // select configured project if its in the list or select the first
                    // of the authorized projects returned
                    jiraConnectProject.value = getSelectedProject(jiraConnectProject, project)||jiraConnectProject[0].value;
                    updateProject(jiraConnectProject);
                }
            });
        } else {
            jiraAdminInput.value = '';
            jiraAdminInput.placeholder = 'password incorrect';
        }
    }

    function showAdminPanel(){

        jiraAdminPanel.toggleClass('display-none');
    }


    function appendContainer(){
        // append it to the DOM
        document.body.appendChild(jiraLinkAppContainer);
    }


    function getDomElements(){

        jiraContainer           = factory(jiraLinkAppContainer, '.jiraContainer');
        jiraModal               = factory(jiraLinkAppContainer, '.jiraModal');
        jiraCanvas              = factory(jiraLinkAppContainer, '.jiraCanvas');
        jiraConnectLogo         = factory(jiraLinkAppContainer, '.jiraConnectLogo');
        jiraConnectForm         = factory(jiraLinkAppContainer, '.jiraConnectForm');
        jiraConnectProject      = factory(jiraLinkAppContainer, '.jiraProject');
        jiraConnectComponent    = factory(jiraLinkAppContainer, '.jiraComponent');
        jiraConnectIssueType    = factory(jiraLinkAppContainer, '.jiraIssueType');
        jiraConnectMessage      = factory(jiraLinkAppContainer, '.jiraConnectMessage');
        jiraUserAvatar          = factory(jiraLinkAppContainer, '.jiraContainer .jiraUserAvatar');
        jiraUser                = factory(jiraLinkAppContainer, '.jiraUser');
        jiraUserPassword        = factory(jiraLinkAppContainer, '.jiraUserPassword');
        jiraUserName            = factory(jiraLinkAppContainer, '.jiraUserName');
        jiraTitle               = factory(jiraLinkAppContainer, '.jiraTitle');
        jiraConnectSendButton   = factory(jiraLinkAppContainer, '.jiraConnectSendButton');
        jiraConnectDrawButton   = factory(jiraLinkAppContainer, '.jiraConnectDrawButton');
        jiraPaletteCase         = factory(jiraLinkAppContainer, '.palette-case');
        jiraPaletteOverlay      = factory(jiraLinkAppContainer, '.palette-overlay');
        jiraToolBlackPen        = factory(jiraLinkAppContainer, '.palette.black-pen');
        jiraToolRedPen          = factory(jiraLinkAppContainer, '.palette.red-pen');
        jiraToolHighLighter     = factory(jiraLinkAppContainer, '.palette.highlighter');
        jiraToolEraser          = factory(jiraLinkAppContainer, '.palette.eraser');
        jiraToolUndo            = factory(jiraLinkAppContainer, '.palette.undo');
        jiraToolRedo            = factory(jiraLinkAppContainer, '.palette.redo');
        jiraAdminPanel          = factory(jiraLinkAppContainer, '.jiraAdminPanel');
        jiraConnectExpandButton = factory(jiraLinkAppContainer, '.jiraConnectExpandButton');
        jiraAdminInput          = factory(jiraLinkAppContainer, '.jiraAdminInput');

    }


    function setupDomElements(){

        // build javascript instances of the elements and add methods and attributes
        jiraModal.style.height = document.querySelector('html').scrollHeight + 'px';
        jiraModal.style.width = document.querySelector('html').scrollWidth + 'px';

        jiraConnectLogo.src = baseURL + '/images/logo.png';

        jiraUserAvatar.src = jiraUserInfo.avatarUrl || baseURL + "/avatar.png";


        jiraConnectProject.ignore=true;
        jiraConnectComponent.ignore=true;
        jiraConnectIssueType.ignore=true;
        jiraUserPassword.ignore=true;


        jiraUser.maxLength = 5;
        jiraUser.onkeyup = getUserName;
        jiraUser.onblur = setUserName;
        jiraUser.ignore = true;
        if (jiraUserInfo.key) jiraUser.value = jiraUserInfo.key;
        if (jiraUserInfo.displayName)  jiraUserName.innerHTML=jiraUserInfo.displayName;

        jiraTitle.innerHTML = 'Jira Project: ' + project;

        jiraConnectSendButton.innerHTML = 'Send';
        jiraConnectDrawButton.style.backgroundImage = 'url("' + baseURL + "/images/annotate.png" + '")';

        jiraToolBlackPen.style.backgroundImage = 'url("' + baseURL + "/images/black-pen.png" + '")';
        jiraToolRedPen.style.backgroundImage = 'url("' + baseURL + "/images/red-pen.png" + '")';
        jiraToolHighLighter.style.backgroundImage = 'url("' + baseURL + "/images/highlighter.png" + '")';
        jiraToolEraser.style.backgroundImage = 'url("' + baseURL + "/images/eraser.png" + '")';
        jiraToolUndo.style.backgroundImage = 'url("' + baseURL + "/images/undo.png" + '")';
        jiraToolRedo.style.backgroundImage = 'url("' + baseURL + "/images/redo.png" + '")';

        jiraAdminInput.onkeyup = function(e){
            if (e.keyCode === 13) {
                unlockAdmin();
            }
        };

        jiraUserPassword.onkeyup = function(e){

            if (e.keyCode === 13) {

                if (this.value){
                    getProjectList(function(httpStatus){

                        if (httpStatus===200){

                            // select configured project if its in the list or select the first
                            // of the authorized projects returned
                            jiraConnectProject.value = getSelectedProject(jiraConnectProject, project)||jiraConnectProject[0].value;
                            updateProject(jiraConnectProject);
                        }
                    });
                }

                return false;
            } else {
                if (this.value==='') return false; //todo: this does nothing now but do we want to reset the project details if password is set to empty; mini vs full?
            }
        };
    }

    function getSelectedProject(elem, val){

        // parse enumerable option properties of a select html element to determine if
        // a given value exists

        var match;

        Array.prototype.forEach.call(elem,function(option){
            if (option.value===val) {
                match = option.value;
            }
        });

        return match;

    }

    function setupStyles(){

        var lightGray = '#E3E3E3';
        var gray = '#5C5C5C';

        messageInfo = {
            color:gray
        };

        messageAlert = {
            color:'#cc1f2f'
        };

        jiraConnectMessageClass = {
            display: 'block',
            height:'auto',
            width:'90%',
            boxSizing:'border-box',
            fontSize: '15px',
            fontWeight: '100',
            lineHeight: '22px',
            border: 'none',
            backgroundColor: lightGray,
            color: gray,
            padding: '10px',
            margin: '15px auto',
            transform:'scale(0,0)',
            msTransform:'scale(0,0)',
            mozTransform:'scale(0,0)',
            webkitTransform:'scale(0,0)'
        };

        jiraConnectMessageClassShow = {
            transform:'scale(1,1)',
            msTransform:'scale(1,1)',
            mozTransform:'scale(1,1)',
            webkitTransform:'scale(1,1)'
        };
    }

    function checkLocalStorage() {

        if(typeof(Storage) !== "undefined") {
            if (localStorage.getItem("jiraUserInfo")) jiraUserInfo = JSON.parse(localStorage.jiraUserInfo);
        }

    }

    function setLocalStorage() {

        if(typeof(Storage) !== "undefined") localStorage.setItem("jiraUserInfo", JSON.stringify(jiraUserInfo));


    }

    function clearMessages(){
        jiraConnectMessage.innerHTML = "";
        applyStyles ( jiraConnectMessage, [removeStyles(jiraConnectMessageClassShow), jiraConnectMessageClass]);

    }

    function sendForm(){
        if (validateForm()) createJiraIssue();
    }

    function validateForm(){

        var message = '',
            valid = true;

        if (!jiraConnectForm.username.value) {
            message += '*Please enter a value in the user id field<br>';
            valid = false;
        } else {
            if (jiraConnectForm.username.value.length<4){
                message += '*Your user id must be 4 at least characters<br>';
                valid = false;
            }
        }

        if (!jiraConnectForm.summary.value) {
            message += '*Please enter a value in the summary field<br>';
            valid = false;
        }

        if (!jiraConnectForm.description.value) {
            message += '*Please enter a description of your issue';
            valid = false;
        }

        if (!valid) {
            sendMessage(message, messageAlert);
        }

        return valid;
    }

    function sendMessage(message, notifyStyle){

        applyStyles ( jiraConnectMessage, [jiraConnectMessageClass, notifyStyle, jiraConnectMessageClassShow]);
        jiraConnectMessage.innerHTML = message;

    }

    function setUserName(){

        if (!jiraUser.value) return;

        if (jiraUserInfo.key) jiraConnectForm.username.value = jiraUserInfo.key;

        setLocalStorage();

    }

    function loadAvatar(){
        var img = new Image();
        img.src = jiraUserInfo.avatarUrl;
        img.onload = function(){jiraUserAvatar.src = img.src;};
    }


    function getUserName(){

        console.log (jiraUser.value);

        if (!jiraUser.value) {
            jiraUserName.innerHTML = 'Welcome to JiraConnect&nbsp;&copy;';
            jiraUserAvatar.src = baseURL + "/images/avatar.png";
            return false;
        }

        ajax("GET",baseURL + '/jiraUser?project='+project+
            '&username='+jiraConnectForm.username.value+
            '&env='+jira_env,
            function(err, status, data){
                if (data){
                    jiraUserInfo = JSON.parse(data);
                    jiraUserPassword.value = '';
                    if (jiraUserInfo.avatarUrl) jiraUserInfo.avatarUrl = jiraUserInfo.avatarUrl.replace('testjira','jira');
                    jiraUserName.innerHTML = jiraUserInfo.displayName ? jiraUserInfo.displayName : 'Welcome to JiraConnect&nbsp;&copy;';
                    loadAvatar();
                }
            });

    }


    function getProjectList(callback){

        getProjects(function(data, status){

            if (data && status===200) {
                for (var i=0; i<data.length; i++){
                    jiraConnectProject.innerHTML += '<option value="' + data[i].key +
                        '">' + data[i].name + '  (' + data[i].key + ')</option>';
                }
            }

            if (typeof callback === 'function') {
                callback (status);
            }

        });
    }

    function getProjects(callback){

        ajax("GET",baseURL + '/jiraProjects?env='+jira_env, function(err, status, data){

            if (err) console.log (err);

            if (data){
                data = JSON.parse(data);

                callback(data, status);

            } else {
                callback(null, status);
            }
        });

    }

    function getProjectDetails(project, mode){

        getProject(project, function(data){

            if (!data.key) return;

            if (mode === 'limited') return;

            setProjectName(data);
            getComponents(data);
            getIssueTypes(data);
            getProjectList();


        });
    }

    function getProject(project, callback){

        ajax("GET",baseURL + '/jiraProjects/'+project+'?env='+jira_env, function(err, status, data){

            if (err) console.log (err);

            if (data){
                data = JSON.parse(data);

                callback(data);

            }
        });
    }

    function setProjectName(data){
        jiraConnectProject.innerHTML = '<option value="' + data.key +
            '">' + data.name + '  (' + data.key + ')</option>';
    }

    function getComponents(data){

        if (!data.hasOwnProperty('components')) return;

        if (!data.components.length){
            jiraConnectComponent.addClass('display-none');
            return;
        } else {
            jiraConnectComponent.removeClass('display-none');
        }

        jiraConnectComponent.innerHTML = '';

        jiraConnectComponent.value = data.components[0].name;

        for (var i=0; i<data.components.length; i++){

            var _component = data.components[i].description || data.components[i].name;

            jiraConnectComponent.innerHTML += '<option value="' + data.components[i].name +
                '">' + _component + '</option>';

            if (component===data.components[i].name) jiraConnectComponent.value = component;
        }
    }

    function getIssueTypes(data){

        if (!data.hasOwnProperty('issueTypes')) return;

        if (!data.issueTypes.length) return;

        jiraConnectIssueType.innerHTML = '';

        jiraConnectIssueType.value = data.issueTypes[0].name;

        for (var i=0; i<data.issueTypes.length; i++){

            var _issueType = data.issueTypes[i].name;

            jiraConnectIssueType.innerHTML += '<option value="' + _issueType +
                '">' + _issueType + '</option>';

            if (issueType===_issueType) jiraConnectIssueType.value = issueType;

        }
    }

    function updateProject(elem, _mode){

        if (elem.value==='undefined') return;

        if (!_mode) _mode = mode;

        jiraTitle.innerHTML = 'Jira Project: ' + elem.value;
        getProjectDetails(elem.value, _mode);
    }

    function updateComponent(elem){
        component = elem.value;
    }


    function updateIssueType(elem){
        issueType = elem.value;
    }


    function createJiraIssue(){

        var imageURL = '<img src="' + baseURL + '/images/ajax-loader.gif" />';

        sendMessage("&nbsp;Creating Jira issue..." + imageURL, messageInfo);

        paintCanvas(function (canvas){

            var img  = canvas.toDataURL("image/png");

            var data = {
                project:jiraConnectProject.value||project,
                env:jira_env,
                issueType:issueType,
                component:component,
                image:img,
                username:jiraConnectForm.username.value,
                password:jiraConnectForm.password.value,
                summary:jiraConnectForm.summary.value,
                description:jiraConnectForm.description.value,
                location:window.location.href
            };

            postJiraIssue(data);

        });

    }


    function paintCanvas(callback){

        html2canvas(document.body, {
            allowTaint: true,
            useCORS: true,
            letterRendering: true,
            onrendered: function(canvas) {

                callback(canvas);

            }
        });
    }

    function postJiraIssue(data){

        ajax("POST",baseURL + '/add/jiraIssue', data, function(err, status, data){

                data = JSON.parse(data);

                if (!err){

                    var message = 'Thank you for your feedback!<br>' +
                        "Jira ticket " +
                        "<a target='_blank'" +
                        "href=" + protocol + '://' + jira_env + jiraURL + data.key + ">" + data.key + "</a>" +
                        " has been created.";

                    sendMessage(message, messageInfo);

                }
            }
        );
    }

    function getTemplate(callback){

        if (typeof callback!=='function') return;

        ajax('GET',baseURL + '/tmpl/userKinect.html',function(err, status, data){
            callback(data);
        });

    }

//*    Sample calls using this ajax function
//*     ajax("GET",'/issue/add', function(err, data){ console.log ('return from request', data) });
//*     ajax("GET",'/issue/RSP-503', function(err, data){ console.log ('return from request', data) });

    function ajax(method, url, arg3, arg4){

        var params,
            callback;

        if (arg4 && (typeof arg4 ==='function')) callback = arg4;
        if (typeof arg3 === 'function') callback = arg3;
        if (typeof arg3 === 'object') params = arg3;

        var xmlhttp;
        if (window.XMLHttpRequest)
        {// code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp=new XMLHttpRequest();
        }
        else
        {// code for IE6, IE5
            xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
        }

        xmlhttp.onreadystatechange=function()
        {
            if (xmlhttp.readyState!=4) return;

            if (xmlhttp.status==200)
            {
                callback (null, xmlhttp.status, xmlhttp.responseText);
            } else {
                callback ('Ajax call http error ' + xmlhttp.status, xmlhttp.status, null);
            }
        };

        xmlhttp.open(method, url, true);

        try {
            xmlhttp.setRequestHeader("x-jiraconnect-user", jiraUser.value);
            xmlhttp.setRequestHeader("x-jiraconnect-pwd", jiraUserPassword.value);
        } catch(e){
            // do nothing
        }

        if (params){
            xmlhttp.setRequestHeader("content-type", "application/json");
            //xmlhttp.withCredentials = true;
            xmlhttp.send(JSON.stringify(params));
        } else {
            xmlhttp.setRequestHeader("content-type", "application/json");
            xmlhttp.send();
        }
    }


    //********************************
    // BEGIN CANVAS LOGIC
    //********************************

    var ctx, color = "#000", x, y, _elTool, _tool;
    var cPushArray = [];
    var cStep = -1;

    // function to setup a new canvas for drawing
    function newCanvas(bool){

        //define and resize canvas
        var wHeight = document.querySelector('html').scrollHeight + 'px';
        var wWidth = window.innerWidth;
        var canvas = '<canvas width=' + wWidth + ' height=' + wHeight + ' id="jiraConnectCanvas"></canvas>';

        jiraCanvas.innerHTML = canvas;
        ctx= document.getElementById("jiraConnectCanvas").getContext("2d");
        canvasWasUpdated = (bool === undefined) ? false : bool;

        if (!canvasWasUpdated) {
            cPushArray=[];
            cStep =-1;
            cPush();
        }

        // setup to trigger drawing on mouse or touch
        selectColor(jiraToolBlackPen, 'black-pen');
        drawTouch();
        drawPointer();
        drawMouse();
    }

    function selectColor(el, tool){

        _elTool = el;
        _tool = tool;


        for(var i=0;i<document.getElementsByClassName("palette").length;i++){
            document.getElementsByClassName("palette")[i].style.borderColor = "#979797";
            document.getElementsByClassName("palette")[i].style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
        }
        el.style.borderColor = "#5D94BA";
        el.style.boxShadow = '0 1px 4px #60A0C6';

        color = window.getComputedStyle(el).color;

        setUpCavasDefaults();
        selectTool(tool);
    }

    function setUpCavasDefaults(){

        ctx.globalAlpha = 1;
        ctx.strokeStyle=ctx.fillStyle=color;
        ctx.lineJoin=ctx.lineCap='round';
        ctx.globalCompositeOperation = 'source-over';
        ctx.beginPath();

    }

    function selectTool(tool){

        if (tool==='red-pen'){
            ctx.lineWidth=4.5;
        }

        if (tool==='black-pen'){
            ctx.lineWidth=2.5;
        }

        if (tool==='highlighter'){
            ctx.lineWidth=60;
            ctx.globalAlpha = 0.1;
            ctx.strokeStyle = 'rgba(231, 224, 60, 0.15)';
        }

        if (tool==='eraser'){
            ctx.lineWidth=45;
            ctx.globalCompositeOperation = "destination-out";
            ctx.strokeStyle = "rgba(0,0,0,1)";
        }
    }

    // prototype to	start drawing on touch using canvas moveTo and lineTo
    function drawTouch() {

        var start = function(e) {
            canvasWasUpdated = true;
            ctx.beginPath();
            x = e.changedTouches[0].pageX;
            y = e.changedTouches[0].pageY-44;
            ctx.moveTo(x,y);
        };
        var move = function(e) {
            e.preventDefault();
            x = e.changedTouches[0].pageX;
            y = e.changedTouches[0].pageY-44;
            ctx.lineTo(x,y);
            ctx.stroke();
        };
        document.getElementById("jiraConnectCanvas").addEventListener("touchstart", start, false);
        document.getElementById("jiraConnectCanvas").addEventListener("touchmove", move, false);
    }

    // prototype to	start drawing on pointer(microsoft ie) using canvas moveTo and lineTo
    function drawPointer() {

        var start = function(e) {
            canvasWasUpdated = true;
            e = e.originalEvent;
            ctx.beginPath();
            x = e.pageX;
            y = e.pageY-44;
            ctx.moveTo(x,y);
        };
        var move = function(e) {
            e.preventDefault();
            e = e.originalEvent;
            x = e.pageX;
            y = e.pageY-44;
            ctx.lineTo(x,y);
            ctx.stroke();
        };
        document.getElementById("jiraConnectCanvas").addEventListener("MSPointerDown", start, false);
        document.getElementById("jiraConnectCanvas").addEventListener("MSPointerMove", move, false);
    }
    // prototype to	start drawing on mouse using canvas moveTo and lineTo
    function drawMouse() {

        var clicked = 0;
        var start = function(e) {
            canvasWasUpdated = true;
            clicked = 1;
            ctx.beginPath();
            ctx.moveTo(e.pageX,e.pageY);
        };
        var move = function(e) {
            if(clicked && canvasShown){
                x = e.pageX;
                y = e.pageY;
                ctx.lineTo(e.pageX,e.pageY);
                ctx.stroke();
            }
        };
        var stop = function(e) {
            clicked = 0;
            cPush();
        };
        document.getElementById("jiraConnectCanvas").addEventListener("mousedown", start, false);
        document.getElementById("jiraConnectCanvas").addEventListener("mousemove", move, false);
        document.getElementById("jiraConnectCanvas").addEventListener("mouseup", stop, false);
    }


    function cPush() {

        cStep++;
        cPushArray[cStep] = document.getElementById("jiraConnectCanvas").toDataURL();
        cPushArray.length = cStep + 1;
    }

    function cUndo() {

        if (cStep > 0) {
            var canvasPic = new Image();
            canvasPic.src = cPushArray[cStep-1];
            canvasPic.onload = function () {
                (function(el, tool){
                    newCanvas(true);
                    ctx.drawImage(canvasPic, 0, 0); ctx.save();
                    selectColor(el, tool);
                })(_elTool, _tool);
            };
        }

        //cPushArray.pop();
        if (cStep > 0) cStep--;

    }

    function cRedo() {

        if (cStep < cPushArray.length-1) {
            cStep++;
            var canvasPic = new Image();
            canvasPic.src = cPushArray[cStep];
            newCanvas(true);
            canvasPic.onload = function () { ctx.drawImage(canvasPic, 0, 0); };
        }
    }

    //********************************
    // END CANVAS LOGIC
    //********************************

    api = {
        toggleCollapse:toggleCollapse,
        sendForm:sendForm,
        selectColor:selectColor,
        showCanvas:showCanvas,
        updateProject:updateProject,
        updateComponent:updateComponent,
        updateIssueType:updateIssueType,
        undo:cUndo,
        redo:cRedo,
        unlockAdmin:unlockAdmin,
        showAdminPanel:showAdminPanel
    };

    if (runningTests) api.private = helpers;

    return api;

})(document, window, (function(){

        //helpers

        var api = {

            addClass: function (className){
                this.className = this.className.replace(className,"");
                this.className = this.className.trim() + ' ' + className;
            },

            removeClass: function (className){
                this.className=this.className.replace(className,"");
            },

            toggleClass: function (className){
                if (this.className.indexOf(className)=== -1){
                    this.addClass(className);
                } else {
                    this.removeClass(className);
                }
            },

            toggleHTML: function(html){
                this.innerHTML = html;
            },

            clearForm: function(){
                for (var i=0; i<this.elements.length; i++){
                    if (!this.elements[i].ignore) this.elements[i].value = '';
                }

            }
        };


        return api;

    })());