// 🐶 Memory Puppy Core
// ZIP -> JSZip -> conversations.json -> CSV

let chatData = null;
let csvFiles = {};

const zipInput = document.getElementById("zipInput");
const startBtn = document.getElementById("startBtn");
const result = document.getElementById("result");


// 选择ZIP
zipInput.addEventListener("change", () => {

    if(zipInput.files.length > 0){

        result.innerHTML =
        "🐾 小狗收到聊天包啦！<br>等待开始整理...";

    }

});



// 开始解析
startBtn.addEventListener("click", async()=>{


    if(!zipInput.files.length){

        result.innerHTML =
        "🥺 请先选择ZIP文件";

        return;
    }


    result.innerHTML =
    "🐶 小狗正在拆聊天包...";


    try{


        const file = zipInput.files[0];


        const zip = await JSZip.loadAsync(file);



        let conversationsFile = null;



        // 找 conversations.json

        zip.forEach((path)=>{


            if(path.endsWith("conversations.json")){

                conversationsFile = zip.file(path);

            }


        });



        if(!conversationsFile){

            throw new Error(
            "没有找到 conversations.json"
            );

        }



        const text =
        await conversationsFile.async("text");



        chatData = JSON.parse(text);



        analyze(chatData);



    }catch(e){


        result.innerHTML =
        "🥺 出错：" + e.message;


    }


});






function analyze(data){


    let conversations =
    Array.isArray(data)
    ? data
    : [];



    let messageCount = 0;

    let start = null;
    let end = null;



    let conversationsCSV =
    [
    "id,title,create_time,update_time"
    ];



    let messagesCSV =
    [
    "conversation_id,role,message,time"
    ];



    let memoriesCSV =
    [
    "type,content"
    ];



    let logsCSV =
    [
    "time,status,message"
    ];



    conversations.forEach(chat=>{


        conversationsCSV.push(
        [
        chat.id,
        clean(chat.title),
        chat.create_time,
        chat.update_time
        ].join(",")
        );



        let mapping =
        chat.mapping || {};



        Object.values(mapping)
        .forEach(node=>{


            let msg =
            node.message;


            if(msg && msg.content){


                messageCount++;


                let role =
                msg.author?.role || "unknown";


                let content =
                msg.content.parts
                ?.join(" ")
                || "";



                let time =
                msg.create_time || "";



                messagesCSV.push(
                [
                chat.id,
                role,
                clean(content),
                time
                ].join(",")
                );



                if(time){

                    if(!start || time < start)
                    start=time;


                    if(!end || time > end)
                    end=time;

                }


            }


        });


    });




    csvFiles={

        "conversations.csv":
        conversationsCSV.join("\n"),


        "messages.csv":
        messagesCSV.join("\n"),


        "memories.csv":
        memoriesCSV.join("\n"),


        "processing_logs.csv":
        logsCSV.join("\n")

    };



    result.innerHTML =
    `
    🐶 解析完成！<br><br>

    📦 聊天数量：
    ${conversations.length}<br>

    💬 消息数量：
    ${messageCount}<br>

    📅 时间范围：<br>
    ${formatTime(start)}
    ～ 
    ${formatTime(end)}
    <br><br>

    🐾 小狗已经整理好四个表啦！
    <br>
    <button onclick="downloadAll()">
    导出四个CSV
    </button>

    `;



}





function downloadAll(){


    Object.keys(csvFiles)
    .forEach(name=>{


        let blob =
        new Blob(
        [csvFiles[name]],
        {
        type:"text/csv;charset=utf-8"
        });


        let url =
        URL.createObjectURL(blob);


        let a =
        document.createElement("a");


        a.href=url;

        a.download=name;

        a.click();


    });


}





function clean(str){


    if(!str)
    return "";


    return String(str)
    .replace(/,/g,"，")
    .replace(/\n/g," ");

}



function formatTime(t){


    if(!t)
    return "-";


    return new Date(
    t*1000
    )
    .toLocaleDateString();


}
