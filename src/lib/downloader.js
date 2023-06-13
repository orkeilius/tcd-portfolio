import { default as translation } from "src/lib/TextString";
import { pdf, Document, Page, Text, StyleSheet } from '@react-pdf/renderer';
import { supabase } from "../lib/supabaseClient";
import jsZip from "jszip"
import React from 'react';

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
    let { data, error } = await supabase
        .from("portfolio")
        .select("id,project(name)")
        .eq("project_id", ProjectId);

    if (error != null || data.length === 0) {
        return
    }

    let folder = new jsZip()
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

const pdfStyles = StyleSheet.create({
    page: { display: 'flex', justifyContent: 'space-around', alignItems: 'center' },
    title: { fontSize: 36 },
    section: { padding: 40 },
    subTitle: { fontSize: 24, fontWeight: 'light', marginBottom: 20, borderBottom: 2 },
});

async function getPdfPortfolio(portfolioId) {
    const text = translation();

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
                    </Page>
                )
            })}
        </Document>
    );

    return { file: await pdf(doc).toBlob(), name: portfolioData.title }
}

function saveFile(file, name) {
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = window.URL.createObjectURL(file);
    a.target = "_blank";
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}