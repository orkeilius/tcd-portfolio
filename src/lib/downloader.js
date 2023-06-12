import jsZip from "jszip"
import { supabase } from "../lib/supabaseClient";
import { async } from "q";


export async function downloadFileList(paragraphId) {
    let folder = new jsZip()
    const { data, error } = await supabase
        .storage
        .from('media')
        .list(paragraphId, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
        })
    if (error != null) {
        console.error(error)
    }
    console.log(data)
    for (let i = 0; i < data.length; i++) {
        const { data :file_data, error } = await supabase
            .storage
            .from('media')
            .download(`${paragraphId}/${data[i].name}`)
        if (error != null) {
            console.error(error)
        }
        folder.file(data[i].name,file_data)
    }

    folder.generateAsync({type:"blob"})
    .then(function(content) {
        // see FileSaver.js
        saveFile(content,"fileList.zip");
    });
}

function saveFile(file,name) {
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = window.URL.createObjectURL(file);
    a.target = "_blank";
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}