// ===============================
// Memory Puppy
// Supabase + ZIP Parser
// ===============================


// 你的 Supabase 地址
const SUPABASE_URL = 
"https://wgkajqfixhrqvpxcncgp.supabase.co";


// 把这里换成你的 publishable key
const SUPABASE_KEY =
"sb_publishable_2DvJBREf4uQgijcK1SsVCw_wO64lct9";


// 创建 Supabase 客户端
const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);



let zipFile = null;


// ===============================
// 选择ZIP
// ===============================

document
.getElementById("zipInput")
.addEventListener("change", function(e){

    zipFile = e.target.files[0];

    if(zipFile){

        document.getElementById("result").innerHTML =
        "🐾 已选择：" + zipFile.name;

    }

});



// ===============================
// 开始整理
// ===============================

document
.getElementById("startBtn")
.addEventListener("click", async function(){


    if(!zipFile){

        alert("请先选择ZIP文件🐶");

        return;

    }



    document.getElementById("result").innerHTML =
    "🐾 小狗正在解析聊天包...";



    try{


        // 解压ZIP

        const zip =
        await JSZip.loadAsync(zipFile);



        // 找 conversations.json

        const file =
        zip.file("conversations.json");



        if(!file){

            throw new Error(
            "没有找到 conversations.json"
            );

        }



        const json =
        await file.async("string");



        const conversations =
        JSON.parse(json);



        let messageCount = 0;


        let conversationCount =
        conversations.length;



        // ===============================
        // 写入 conversations
        // ===============================


        for(const chat of conversations){


            const {data:conversation,error}
            =
            await supabaseClient
            .from("conversations")
            .insert({

                title:
                chat.title || "未命名聊天",

                source_file:
                zipFile.name,

                created_time:
                new Date().toISOString()

            })
            .select()
            .single();



            if(error)
            throw error;



            const messages =
            chat.mapping;



            for(const key in messages){


                const msg =
                messages[key].message;



                if(
                    msg &&
                    msg.content &&
                    msg.content.parts
                ){


                    const content =
                    msg.content.parts.join("\n");



                    const {error:msgError}
                    =
                    await supabaseClient
                    .from("messages")
                    .insert({

                        conversation_id:
                        conversation.id,

                        role:
                        msg.author?.role || "unknown",

                        content:
                        content,

                        message_time:
                        msg.create_time
                        ?
                        new Date(
                        msg.create_time*1000
                        )
                        :
                        null

                    });



                    if(msgError)
                    throw msgError;



                    messageCount++;


                }


            }


        }




        // 写日志

        await supabaseClient
        .from("processing_logs")
        .insert({

            file_name:
            zipFile.name,

            status:
            "success",

            message_count:
            messageCount,

            memory_count:
            0

        });





        document.getElementById("result").innerHTML =

        `
        🐶解析完成！<br><br>

        📦聊天数量：
        ${conversationCount}<br>

        💬消息数量：
        ${messageCount}<br><br>

        已保存到 Supabase ✨
        `;



    }
    catch(err){


        console.error(err);


        document.getElementById("result").innerHTML =

        "🥺失败："+err.message;


    }



});
