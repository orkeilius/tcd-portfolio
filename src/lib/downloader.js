import { default as translation } from "src/lib/TextString";
import { supabase } from "../lib/supabaseClient";
import jsZip from "jszip"
import React from 'react';
import { toast } from "react-toastify";

let dataURL = []

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
        return
    }

    for (let i = 0; i < data.length; i++) {
        const { data: file_data, error } = await supabase
            .storage
            .from('media')
            .download(`${paragraphId}/${data[i].name}`)
        if (error != null) {
            console.error(error)
        } else {
            folder.file(data[i].name, file_data)
        }
    }

    folder.generateAsync({ type: "blob" })
        .then(function (content) {
            saveFile(content, "files.zip");
        });
}

export async function downloadProject(ProjectId) {
    const text = translation();

    let folder = new jsZip()
    let { data, error } = await supabase
        .from("portfolio")
        .select("id,project(name)")
        .eq("project_id", ProjectId)


    if (error != null) {
        console.error(error)
        return
    }
    if (data.length === 0) {
        toast.error(text["error empty project"])
        return
    }

    for (let i = 0; i < data.length; i++) {
        const portfolio = await getPdfPortfolio(data[i].id)
        folder.file(portfolio.name.replace(/[/\\?%*:|"<>]/g, '-') + '.pdf', portfolio.file)
    }

    folder.generateAsync({ type: "blob" })
        .then(function (content) {
            saveFile(content, data[0].project.name.replace(/[/\\?%*:|"<>]/g, '-'));
        });

}

export async function downloadPortfolio(portfolioId) {
    const doc = await getPdfPortfolio(portfolioId)
    saveFile(doc.file, doc.name.replace(/[/\\?%*:|"<>]/g, '-'))
}



async function getPdfPortfolio(portfolioId) {

    // async load because @react-pdf bundle is 1.4mb 
    const { pdf, Document, Page, Text, StyleSheet } = await import('@react-pdf/renderer');
    const text = translation();

    const pdfStyles = StyleSheet.create({
        page: { display: 'flex', justifyContent: 'space-around', alignItems: 'center' },
        title: { fontSize: 36 },
        section: { padding: 40 },
        subTitle: { fontSize: 24, fontWeight: 'light', marginBottom: 20, borderBottom: 2 },
    });

    let { data: portfolioData, error: portfolioError } = await supabase
        .from("portfolio")
        .select("*,userInfo!portfolio_student_id_fkey(*)")
        .eq("id", portfolioId)
        .single();

    let { data: paragraphData, error: paragraphError } = await supabase
        .from("paragraph")
        .select("*")
        .eq("portfolio", portfolioId)
        .order("position");

    if (portfolioError != null || paragraphError) {
        console.error(portfolioError, paragraphError);
        return;
    }
    for (let i = 0; i < paragraphData.length; i++) {
        paragraphData[i].attachment = await PdfAttachment(paragraphData[i].id)
    }
    const doc = (
        <Document
            title={portfolioData.title}
            author={
                portfolioData.userInfo.first_name +
                " " +
                portfolioData.userInfo.last_name
            }
        >
            <Page size="A4" style={pdfStyles.page}>
                <Text style={pdfStyles.title}>{portfolioData.title}</Text>
                <Text>{text["portfolio author"] +
                    " " +
                    portfolioData.userInfo.first_name +
                    " " +
                    portfolioData.userInfo.last_name}</Text>
            </Page>
            {paragraphData.map((paragraph) => {
                return (
                    <Page key={paragraph.id} size="A4" style={pdfStyles.section} bookmark={paragraph.title} >
                        <Text style={pdfStyles.subTitle} >{paragraph.title}</Text>
                        <Text>{paragraph.text}</Text>
                        {paragraph.attachment}
                    </Page>
                )
            })}
        </Document>
    );
    const file = await pdf(doc).toBlob()
    UnloadDataUrl()
    return { file: file, name: portfolioData.title }
}

async function PdfAttachment(paragraphId) {
    const { Image, StyleSheet,Text } = await import('@react-pdf/renderer');

    const pdfStyles = StyleSheet.create({
        image: { margin: 5, objectFit: 'contain', width: "100%",maxHeight:"80vh" },
        text: {textAlign: 'center',marginBottom: 50,fontSize: 12}
    });

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
        return
    }
    const filesName = data.filter(file => file.metadata.mimetype.startsWith('image'))

    let files = []
    for (let i = 0; i < filesName.length; i++) {
        const { data: file_data, error } = await supabase
            .storage
            .from('media')
            .download(`${paragraphId}/${filesName[i].name}`)
        if (error != null) {
            console.error(error)
        } else {
            const url = window.URL.createObjectURL(file_data)
            dataURL.push(url)
            files.push({ name: filesName[i].name, data: url })
        }
    }
    return (<>
        {files.map((file) => {
            return (
                <>
                    <Image src={file.data} style={pdfStyles.image} />
                    <Text style={pdfStyles.text}>{file.name}</Text>
                </>
            )
        })}
    </>)
}

function UnloadDataUrl() {
    dataURL.forEach(url =>
        window.URL.revokeObjectURL(url)
    )
}

function saveFile(file, name) {
    const url = window.URL.createObjectURL(file);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url
    a.target = "_blank";
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url)
}