// ==UserScript==
// @name         ElektrodaBackupsForWritingContent
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Generate and save backups for posts that you are writing on Elektroda
// @author       OpenSHWProjects
// @match        https://www.elektroda.pl/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=elektroda.pl
// @grant        none
// @require      https://raw.githubusercontent.com/eligrey/FileSaver.js/master/src/FileSaver.js
// ==/UserScript==

var cfg_autoBackupInterval = 60 * 1000;

var bDirty;

var msg;
var post;
var bar;
var subject;

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

// Stuff to create the BLOB object   --- ANY TYPE ---
var textFile = null,
//-- Function
makeTextFile = function (text,textType) {
    // textType can be  'text/html'  'text/vcard' 'text/txt'  ...
    var data = new Blob([text], {type: textType });
    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }
    textFile = window.URL.createObjectURL(data);
    return textFile;
  };
function dateToYMDHM(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1; //Month from 0 to 11
    var y = date.getFullYear();
    var hr = date.getHours();
    var mn = date.getMinutes();
    return '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d) + ' ' + (hr<=9 ? '0' + hr : hr) + ':' + (mn<=9 ? '0' + mn : mn) ;
}
function downloadBackup(comment)
{
    var bPrivMsg = window.location.pathname.includes("rtvforum/privmsg.php");
    var urlParams = new URLSearchParams(window.location.search);
    var p = urlParams.get('p')
    console.log("p="+p+",bPrivMsg="+bPrivMsg);
    var txt = msg.value;
   // var f = makeTextFile(txt,"text/txt");
    var fileName ="";
    if(bPrivMsg)
        fileName+="[PRIV] ";
    else
        fileName += "[FORUM] ";
    fileName += subject.value;
    const date = Date.now();
    console.log("date is " + date);
    fileName += " " + dateToYMDHM(new Date(date));
    fileName += "["+comment+"]";
    fileName += ".txt";
    download(fileName,txt);
    bDirty = false;
}
function onMessageEdited()
{
    bDirty = true;

    //msg.value += "qqq";
    // ?mode=reply&p=6369845
    //alert(window.location.search);
    // rtvforum/privmsg.php
    //window.location.pathname

}
function reqSave()
{
      downloadBackup("USR");
}
function mySubmit()
{
   if(bDirty)
   {
      downloadBackup("SND");
      return false;
   }
    return true;
}
function repeater()
{
   if(bDirty)
   {
      downloadBackup("TMR");
   }
   else
   {

   }
}
(function() {
    'use strict';
    msg = document.getElementById("message");
    post = document.getElementById("post");
    subject = document.getElementById("subject");
    bar = document.getElementsByName("addFile")[0].parentElement;
    //post.setAttribute("onSubmit", "mySubmit()");
    post.onsubmit = mySubmit;
    var btn = document.createElement("input");
    btn.setAttribute("type", "button");
    btn.setAttribute("class", "mainoption");
    btn.setAttribute("value", "Pobierz Kopię Zapasową");
    btn.onclick = reqSave;
    //bar.prepend(btn);
    bar.insertBefore(btn, bar.children[1]);
    if (msg.addEventListener) {
        msg.addEventListener('input', onMessageEdited, false);
    } else if (msg.attachEvent) {
        msg.attachEvent('onpropertychange', onMessageEdited);
    }
    setInterval(repeater, cfg_autoBackupInterval);
    // Your code here...
})();
