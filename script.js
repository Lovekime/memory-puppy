// 🐶 Memory Puppy
// ZIP 聊天记录解析核心

const zipInput = document.getElementById("zipInput");
const startBtn = document.getElementById("startBtn");
const resultBox = document.getElementById("result");

let conversations = [];
let messages = [];


startBtn.onclick = async () => {

    if (!zipInput.files[0]) {
        alert("🐶 请先选择 ChatGPT ZIP 文件");
        return;
    }


    resultBox.innerHTML = "🐾 小狗正在拆 ZIP...";


    try {

        const zipFile = zipInput.files[0];

        const zip = await JSZip.loadAsync(zipFile);


        resultBox.innerHTML = 
        "🐾 正在寻找 conversations.json...";


        let jsonFile = null;


        for (const fileName of Object.keys(zip.files)) {

            if (fileName.endsWith("conversations.json")) {
                jsonFile = zip.files[fileName];
                break;
            }

        }


        if (!jsonFile) {

            resultBox.innerHTML =
            "🥺 没找到 conversations.json";

            return;
        }


        const text = await jsonFile.async("text");


        conversations = JSON.parse(text);



        messages = [];


        // 解析聊天

        conversations.forEach(chat => {


            const mapping = chat.mapping;


            if (!mapping) return;



            Object.values(mapping).forEach(node => {


                const msg = node.message;


                if (!msg) return;


                const role = msg.author?.role || "";


                let content = "";


                try {

                    content =
                    msg.content.parts.join("\n");

                }

                catch {

                    content = "";

                }



                if(content.trim()) {


                    messages.push({

                        time:
                        new Date(
                        chat.create_time * 1000
                        ),

                        title:
                        chat.title || "未命名聊天",

                        role,

                        content

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
        + error.message;

    }


};





function showResult(){


    if(messages.length===0){

        resultBox.innerHTML=
        "🥺 没解析到消息";

        return;

    }



    const times =
    messages.map(
        m=>m.time
    );


    const minTime =
    new Date(
        Math.min(
        ...times.map(t=>t.getTime())
        )
    );


    const maxTime =
    new Date(
        Math.max(
        ...times.map(t=>t.getTime())
        )
    );



    resultBox.innerHTML = `

    🐶 解析完成！

    <br><br>

    📦 聊天数量：
    ${conversations.length}

    <br>

    💬 消息数量：
    ${messages.length}

    <br>

    📅 时间范围：

    <br>

    ${minTime.toLocaleDateString()}
    ~

    ${maxTime.toLocaleDateString()}

    <br><br>

    <button onclick="exportCSV()">
    🐾 导出 CSV
    </button>

    `;


}





function exportCSV(){


    let csv =
    "时间,聊天标题,角色,内容\n";


    messages.forEach(m=>{


        csv +=
        `"${m.time.toISOString()}","${m.title.replaceAll('"','""')}","${m.role}","${m.content.replaceAll('"','""')}"\n`;


    });



    const blob =
    new Blob(
        [csv],
        {
            type:"text/csv;charset=utf-8;"
        }
    );



    const url =
    URL.createObjectURL(blob);



    const a =
    document.createElement("a");


    a.href=url;

    a.download=
    "memory-puppy-chat.csv";


    a.click();



    URL.revokeObjectURL(url);


}
