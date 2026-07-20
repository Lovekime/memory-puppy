// 🐶 Memory Puppy
// ZIP 聊天解析核心 v3


const zipInput = document.getElementById("zipInput");
const startBtn = document.getElementById("startBtn");
const resultBox = document.getElementById("result");
const fileNameBox = document.getElementById("fileName");


let conversations = [];
let messages = [];



// 选择 ZIP

zipInput.addEventListener("change",()=>{

    if(zipInput.files.length){

        fileNameBox.innerHTML =
        "🐶 收到啦： " + zipInput.files[0].name;

    }

});





// 开始解析

startBtn.onclick = async ()=>{


    if(!zipInput.files[0]){

        alert("🐶 请先选择 ZIP 文件");

        return;

    }



    resultBox.innerHTML =
    "🐾 小狗正在读取聊天包...";



    try{


        const zip =
        await JSZip.loadAsync(
            zipInput.files[0]
        );



        resultBox.innerHTML =
        "🐾 正在寻找 conversations.json...";



        let jsonFile = null;



        for(
            const name of Object.keys(zip.files)
        ){

            if(
                name.endsWith("conversations.json")
            ){

                jsonFile =
                zip.files[name];

                break;

            }

        }




        if(!jsonFile){

            resultBox.innerHTML =
            "🥺 找不到 conversations.json";

            return;

        }





        const text =
        await jsonFile.async("text");



        conversations =
        JSON.parse(text);



        messages = [];





        // 读取聊天

        conversations.forEach(chat=>{


            if(!chat.mapping)
                return;




            Object.values(chat.mapping)
            .forEach(node=>{


                const msg =
                node.message;



                if(!msg)
                    return;




                const role =
                msg.author?.role
                || "unknown";




                let content = "";




                // 兼容新版格式

                if(
                    msg.content &&
                    msg.content.parts
                ){


                    content =
                    msg.content.parts.map(p=>{


                        if(typeof p==="string"){

                            return p;

                        }



                        if(p.content){

                            return p.content;

                        }



                        return "";

                    })
                    .join("\n");


                }





                if(content.trim()){


                    let time =
                    msg.create_time
                    ||
                    chat.create_time
                    ||
                    Date.now()/1000;




                    messages.push({

                        title:
                        chat.title
                        ||
                        "未命名聊天",



                        role,



                        content,



                        time:
                        new Date(
                            time * 1000
                        )

                    });


                }



            });



        });





        showResult();



    }
    catch(error){


        console.error(error);


        resultBox.innerHTML =
        "🐶 出错啦："
        +
        error.message;


    }



};









function showResult(){



    if(messages.length===0){


        resultBox.innerHTML =
        "🥺 没找到聊天消息";


        return;


    }





    const times =
    messages.map(
        m=>m.time.getTime()
    );



    const minTime =
    new Date(
        Math.min(...times)
    );



    const maxTime =
    new Date(
        Math.max(...times)
    );






    resultBox.innerHTML = `



🐶 整理完成！


<br><br>


📦 聊天数量：

${conversations.length}



<br><br>


💬 消息数量：

${messages.length}



<br><br>


📅 最早：

${formatDate(minTime)}



<br>


📅 最新：

${formatDate(maxTime)}



<br><br>




<button

style="
margin-top:20px;
padding:15px 45px;
border:none;
border-radius:30px;
background:#ff9ed8;
color:white;
font-size:18px;
"

onclick="exportCSV()"

>

🐾 导出 CSV

</button>



`;



}








function formatDate(date){


    return date.toLocaleDateString(
        "zh-CN"
    );


}









function exportCSV(){



    let csv =
    "时间,聊天标题,角色,内容\n";





    messages.forEach(m=>{


        csv +=

        `"${m.time.toISOString()}","${safe(m.title)}","${safe(m.role)}","${safe(m.content)}"\n`;



    });






    const blob =
    new Blob(
        [csv],
        {
            type:
            "text/csv;charset=utf-8;"
        }
    );





    const url =
    URL.createObjectURL(blob);





    const a =
    document.createElement("a");



    a.href=url;



    a.download =
    "memory-puppy-chat.csv";



    document.body.appendChild(a);



    a.click();



    document.body.removeChild(a);



    URL.revokeObjectURL(url);



}









function safe(text){


    return String(text)

    .replaceAll('"','""')

    .replace(/\n/g," ");



}
