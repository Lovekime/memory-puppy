const file =
document.getElementById("zipFile");


const fileName =
document.getElementById("fileName");


const start =
document.getElementById("start");


const status =
document.getElementById("status");



file.onchange = ()=>{


if(file.files.length){


fileName.innerHTML =
"🐾 "+file.files[0].name;


status.innerHTML =
"收到啦！小狗准备好了 🐶";


}


};



start.onclick = ()=>{


if(!file.files.length){

status.innerHTML =
"🥺 先给小狗一个 ZIP 文件吧";

return;

}


status.innerHTML =
"🐶 正在拆开聊天包...";


setTimeout(()=>{


status.innerHTML =
"✨ 下一步：开始解析聊天记录";


},1500);


};
