// =======================================
// Memory Puppy v0.3
// ChatGPT ZIP -> Supabase CSV
// =======================================


let zipFile = null;


// 选择ZIP

document
.getElementById("zipInput")
.addEventListener("change", function(e){

    zipFile = e.target.files[0];

    if(zipFile){

        document.getElementById("result").innerHTML =
        "🐾 已选择：" + zipFile.name;

    }

});




// 开始整理

document
.getElementById("startBtn")
.addEventListener("click", async function(){


    if(!zipFile){

        alert("🐶 请先选择ZIP文件");

        return;

    }



    const result =
    document.getElementById("result");


    result.innerHTML =
    "🐶 小狗正在读取聊天记录...";



    try{


        // 解压ZIP

        const zip =
        await JSZip.loadAsync(zipFile);



        const file =
        zip.file("conversations.json");



        if(!file){

            throw new Error(
                "ZIP里面没有找到 conversations.json"
            );

        }



        const json =
        await file.async("string");



        const chats =
        JSON.parse(json);




        // CSV表头

        let conversationsCSV =
        "id,title,source_file,file_hash,created_time,updated_time,created_at\n";


        let messagesCSV =
        "id,conversation_id,role,content,message_time,message_hash,created_at\n";


        let memoriesCSV =
        "id,content,category,importance,source_message_id,memory_time,created_at\n";


        let logsCSV =
        "id,file_name,file_hash,status,processed_at,message_count,memory_count\n";





        let messageCount = 0;



        const fileHash =
        simpleHash(zipFile.name);





        for(
            const chat of chats
        ){


            const conversationId =
            crypto.randomUUID();



            const now =
            new Date()
            .toISOString();




            conversationsCSV += csvRow([

                conversationId,

                chat.title || "未命名聊天",

                zipFile.name,

                fileHash,

                formatTime(chat.create_time),

                formatTime(chat.update_time),

                now

            ]);







            if(!chat.mapping)
                continue;





            for(
                const key in chat.mapping
            ){



                const message =
                chat.mapping[key].message;



                if(
                    !message ||
                    !message.content ||
                    !message.content.parts
                ){

                    continue;

                }





                const content =
                message.content.parts
                .join("\n");



                if(!content.trim())
                    continue;





                const messageId =
                crypto.randomUUID();



                messagesCSV += csvRow([

                    messageId,

                    conversationId,

                    message.author?.role || "unknown",

                    content,

                    formatTime(message.create_time),

                    simpleHash(content),

                    now

                ]);



                messageCount++;

            }



        }





        // 日志

        logsCSV += csvRow([

            crypto.randomUUID(),

            zipFile.name,

            fileHash,

            "success",

            new Date()
            .toISOString(),

            messageCount,

            0

        ]);







        // 下载

        downloadCSV(
            "conversations.csv",
            conversationsCSV
        );


        downloadCSV(
            "messages.csv",
            messagesCSV
        );


        downloadCSV(
            "memories.csv",
            memoriesCSV
        );


        downloadCSV(
            "processing_logs.csv",
            logsCSV
        );





        result.innerHTML =

        `
        🐶 整理完成！

        <br><br>

        📦 聊天数量：
        ${chats.length}

        <br>

        💬 消息数量：
        ${messageCount}

        <br><br>

        已生成：

        <br>
        🐾 conversations.csv

        <br>
        🐾 messages.csv

        <br>
        🐾 memories.csv

        <br>
        🐾 processing_logs.csv

        `;



    }
    catch(error){


        console.error(error);


        result.innerHTML =
        "🥺 出错：" + error.message;


    }


});







// ===========================
// 工具函数
// ===========================



function csvRow(array){


    return array
    .map(value=>{

        return '"' +
        String(value ?? "")
        .replaceAll('"','""')
        +
        '"';

    })
    .join(",")
    +
    "\n";

}





function formatTime(time){


    if(!time)
        return "";


    try{

        return new Date(
            time * 1000
        )
        .toISOString();


    }
    catch{

        return "";

    }

}






function simpleHash(str){


    let hash = 0;


    str = String(str);



    for(
        let i = 0;
  
