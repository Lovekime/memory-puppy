// ================================
// Memory Puppy v0.2
// ZIP -> 4 CSV
// ================================


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

        alert("请先选择ZIP文件🐶");

        return;

    }


    document.getElementById("result").innerHTML =
    "🐶 小狗正在拆聊天包...";



    try{


        // 解压

        const zip =
        await JSZip.loadAsync(zipFile);



        const file =
        zip.file("conversations.json");



        if(!file){

            throw new Error(
            "没有找到 conversations.json"
            );

        }



        const text =
        await file.async("string");



        const conversations =
        JSON.parse(text);



        let conversationsCSV =
        "id,title,source_file,created_time,updated_time\n";


        let messagesCSV =
        "id,conversation_id,role,content,message_time,message_hash\n";


        let memoriesCSV =
        "id,content,category,importance,memory_time\n";


        let logsCSV =
        "file_name,status,processed_at,message_count,memory_count\n";



        let messageCount = 0;



        // 遍历聊天

        for(
            let i=0;
            i<conversations.length;
            i++
        ){


            const chat =
            conversations[i];



            const conversationId =
            crypto.randomUUID();



            conversationsCSV +=
            `"${conversationId}",`+
            `"${escapeCSV(chat.title || "未命名")}",`+
            `"${zipFile.name}",`+
            `"${date(chat.create_time)}",`+
            `"${date(chat.update_time)}"\n`;



            const mapping =
            chat.mapping;



            for(const key in mapping){


                const msg =
                mapping[key].message;



                if(
                    msg &&
                    msg.content &&
                    msg.content.parts
                ){


                    const messageId =
                    crypto.randomUUID();



                    const content =
                    msg.content.parts.join("\n");



                    messagesCSV +=

                    `"${messageId}",`+
                    `"${conversationId}",`+
                    `"${msg.author?.role || "unknown"}",`+
                    `"${escapeCSV(content)}",`+
                    `"${date(msg.create_time)}",`+
                    `"${hash(content)}"\n`;



                    messageCount++;


                }


            }



        }



        logsCSV +=

        `"${zipFile.name}",`+
        `"success",`+
        `"${new Date().toISOString()}",`+
        `"${messageCount}",0`;





        // 下载四个文件


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




        document.getElementById("result").innerHTML =

        `
        🐶整理完成！<br><br>

        📦聊天数量：
        ${conversations.length}<br>

        💬消息数量：
        ${messageCount}<br><br>

        已生成4个CSV文件✨
        `;



    }
    catch(e){

        console.error(e);

        document.getElementById("result").innerHTML =
        "🥺错误："+e.message;

    }



});





// CSV转义

function escapeCSV(str){

    return String(str)
    .replace(/"/g,'""');

}



// 时间转换

function date(time){

    if(!time)
    return "";

    return new Date(
        time*1000
    )
    .toISOString();

}



// 简单hash

function hash(str){

    let h=0;

    for(
        let i=0;
        i<str.length;
        i++
    ){

        h =
        ((h<<5)-h)+str.charCodeAt(i);

    }

    return h.toString();

}



// 下载CSV

function downloadCSV(
    filename,
    content
){

    const blob =
    new Blob(
        [content],
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

    a.download=filename;

    a.click();



    URL.revokeObjectURL(url);

}
