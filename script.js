let selectedZip = null;
let exportData = {
    conversations: [],
    messages: [],
    memories: [],
    logs: []
};


// 选择ZIP
document.getElementById("zipInput").addEventListener("change", function(e){

    selectedZip = e.target.files[0];

    if(selectedZip){

        document.getElementById("result").innerHTML =
        "🐾 已收到聊天包：<br>" 
        + selectedZip.name;

    }

});


// 开始整理
document.getElementById("startBtn").addEventListener("click", async function(){

    if(!selectedZip){

        alert("请先选择聊天ZIP哦 🥺");
        return;

    }


    document.getElementById("result").innerHTML =
    "🐶 小狗正在拆包...";


    try{


        const zip = await JSZip.loadAsync(selectedZip);


        let file = zip.file("conversations.json");


        if(!file){

            // 防止路径不同
            let files = Object.keys(zip.files);

            let target = files.find(
                x=>x.endsWith("conversations.json")
            );


            if(target){

                file = zip.file(target);

            }

        }



        if(!file){

            throw new Error(
                "没有找到 conversations.json"
            );

        }



        const text = await file.async("string");


        const conversations = JSON.parse(text);



        processConversation(conversations);



        document.getElementById("result").innerHTML =

        `
        🐶 解析完成！✨
        <br><br>

        📦 聊天数量：
        ${exportData.conversations.length}

        <br>

        💬 消息数量：
        ${exportData.messages.length}

        <br><br>

        🐾 可以导出CSV啦

        <br><br>

        <button onclick="downloadAll()">
        导出四个CSV
        </button>

        `;



    }catch(err){


        document.getElementById("result").innerHTML =
        "🥺 出错：" + err.message;


        console.error(err);


    }


});





// 解析聊天
function processConversation(data){


    exportData.conversations=[];
    exportData.messages=[];
    exportData.memories=[];
    exportData.logs=[];



    data.forEach(chat=>{


        exportData.conversations.push({

            id:chat.id,

            title:chat.title || "",

            create_time:
            timestamp(chat.create_time),

            update_time:
            timestamp(chat.update_time)

        });



        if(chat.mapping){


            Object.values(chat.mapping)
            .forEach(node=>{


                if(node.message){


                    let msg=node.message;


                    let content="";


                    if(msg.content
                    && msg.content.parts){


                        content =
                        msg.content.parts.join("\n");


                    }



                    exportData.messages.push({

                        conversation_id:
                        chat.id,

                        role:
                        msg.author?.role || "",

                        text:
                        content,

                        time:
                        timestamp(msg.create_time)


                    });


                }


            });


        }



    });



}







function timestamp(t){

    if(!t) return "";

    return new Date(
        t*1000
    ).toISOString();


}






// 下载CSV
function downloadAll(){


    createCSV(
        "conversations.csv",
        exportData.conversations
    );


    createCSV(
        "messages.csv",
        exportData.messages
    );


    createCSV(
        "memories.csv",
        exportData.memories
    );


    createCSV(
        "processing_logs.csv",
        exportData.logs
    );


}







function createCSV(filename,data){


    if(data.length===0){

        data=[{}];

    }


    let headers =
    Object.keys(data[0]);


    let csv =
    headers.join(",")
    + "\n";


    data.forEach(row=>{


        csv += headers.map(h=>{


            let value =
            row[h] ?? "";


            return '"' +
            String(value)
            .replace(/"/g,'""')
            + '"';


        }).join(",")
        + "\n";


    });



    let blob =
    new Blob(
        [csv],
        {
            type:"text/csv;charset=utf-8;"
        }
    );


    let a =
    document.createElement("a");


    a.href =
    URL.createObjectURL(blob);


    a.download =
    filename;


    a.click();


}
