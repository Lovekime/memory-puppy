let zipFile=null;



const chooseBtn =
document.getElementById("chooseBtn");


const zipInput =
document.getElementById("zipInput");


const fileName =
document.getElementById("fileName");


const result =
document.getElementById("result");



chooseBtn.onclick=()=>{

zipInput.click();

};




zipInput.onchange=()=>{


if(zipInput.files.length){


zipFile =
zipInput.files[0];


fileName.innerHTML =

"🐶 收到啦："
+
zipFile.name;


}


};






document
.getElementById("startBtn")
.onclick = async()=>{


if(!zipFile){

result.innerHTML=
"🥺 请先选择ZIP";

return;

}



result.innerHTML=
"🐶 小狗正在拆包...";



try{


const zip =
await JSZip.loadAsync(zipFile);



let target=null;



Object.keys(zip.files)
.forEach(path=>{


if(
path.endsWith(
"conversations.json"
)

){

target=
zip.file(path);

}


});





if(!target){

throw new Error(
"没有找到 conversations.json"
);

}





const text =
await target.async("text");



const chats =
JSON.parse(text);



let messages=0;

let first=null;

let last=null;




chats.forEach(chat=>{


if(chat.mapping){


Object.values(chat.mapping)
.forEach(node=>{


if(node.message){


messages++;


let t =
node.message.create_time;


if(t){


if(!first||t<first)
first=t;


if(!last||t>last)
last=t;


}


}


});


}


});





result.innerHTML=

`
🐶 整理完成！

<br><br>

📦 聊天数量：
${chats.length}

<br>

💬 消息数量：
${messages}

<br><br>

📅 时间：

<br>

${showTime(first)}
～

${showTime(last)}

`;



}catch(e){


result.innerHTML=
"🥺 出错："
+
e.message;


}


};





function showTime(t){


if(!t)
return "-";


return new Date(
t*1000
)
.toLocaleDateString();


}
