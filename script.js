// =====================================
// Memory Puppy v0.3
// ZIP -> Supabase 四表 CSV
// =====================================


let zipFile = null;



document
.getElementById("zipInput")
.addEventListener("change", e => {

    zipFile = e.target.files[0];

    if(zipFile){

        document.getElementById("result").innerHTML =
        "🐾 已选择：" + zipFile.name;

    }

});




document
.getElementById("startBtn")
.addEventListener("click", async()=>{


    if(!zipFile){

        alert("🐶 请先选择 ZIP");

        return;

    }



    document.getElementById("result").innerHTML =
    "🐾 小狗正在拆包...";



    try{


        const zip =
        await JSZip.loadAsync(zipFile);



        const jsonFile =
        zip.file("conversations.json");



        if(!jsonFile){

            throw new Error(
                "找不到 conversations.json"
            );

        }



        const text =
        await jsonFile.async("text");



        const chats =
        JSON.parse(text);





        // =============================
        // 四张表 CSV
        // =============================


        let conversationsCSV =
`id,title,source_file,file_hash,created_time,updated_time,created_at
`;



        let messagesCSV =
`id,conversation_id,role,content,message_time,message_hash,created_at
`;



        let memoriesCSV =
`id,content,category,importance,status,version,source_message_id,memory_time,created_at
`;



        let logsCSV =
`id,file_name,file_hash,status,processed_at,message_count,memory_count
`;




        let messageCount = 0;

        let memoryCount = 0;



        const fileHash =
        simpleHash(zipFile.name);





        for(const chat of chats){



            const conversationId =
            crypto.randomUUID();



            const now =
            new Date().toISOString();



            conversationsCSV +=
            csvRow([

                conversationId,

                chat.title || "未命名聊天",

                zipFile.name,

                fileHash,

                unixTime(chat.create_time),

                unixTime(chat.update_time),

                now

            ]);






            if(!chat.mapping)
                continue;




            for(
                const key in chat.mapping
            ){



                const msg =
                chat.mapping[key].message;



                if(
                    !msg ||
                    !msg.content ||
                    !msg.content.parts
                )
                continue;




                const content =
                msg.content.parts.join("\n");



                if(!content.trim())
                continue;




                const messageId =
                crypto.randomUUID();



                const messageHash =
                simpleHash(content);




                messagesCSV +=
                csvRow([

                    messageId,

                    conversationId,

                    msg.author?.role || "unknown",

                    content,

                    unixTime(msg.create_time),

                    messageHash,

                    now

                ]);



                messageCount++;




                // 目前先留空
                // 后面接AI记忆提取

            }


        }





        // processing_logs


        logsCSV +=
        csvRow([

            crypto.randomUUID(),

            zipFile.name,

            fileHash,

            "success",

            new Date().toISOString(),

            messageCount,

            memoryCount

        ]);





        download(
            "conversations.csv",
            conversationsCSV
        );


        download(
            "messages.csv",
            messagesCSV
        );


        download(
            "memories.csv",
            memoriesCSV
        );


        download(
            "processing_logs.csv",
            logsCSV
        );





        document.getElementById("result").innerHTML =

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
    catch(err){

        console.error(err);

        document.getElementById("result").innerHTML =
        "🥺 出错："+err.message;

    }


});





// =============================
// 工具
// =============================


function csvRow(arr){

    return arr
    .map(x=>

        `"${String(x ?? "")
        .replaceAll('"','""')}"`

    )
    .join(",")
    + "\n";

}





function unixTime(t){

    if(!t)
    return "";

    return new Date(
        t*1000
    ).toISOString();

}





function simpleHash(str){

    let hash=0;

    for(
        let i=0;
        i<str.length;
        i++
    ){

        hash =
        ((hash<<5)-hash)
        +
        str.charCodeAt(i);

    }

    return String(hash);

}





function download(
    name,
    content
){

    const blob =
    new Blob(
        [content],
        
