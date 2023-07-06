import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { default as translation } from "src/lib/TextString";
import { supabase } from "../lib/supabaseClient";
import jsZip from "jszip";
import React from "react";
import { pdf, Document, Page, Text, StyleSheet,Image } from "@react-pdf/renderer"
let dataURL = [];

function UnloadDataUrl() {
    dataURL.forEach((url) => window.URL.revokeObjectURL(url));
}

function saveFile(file, name) {
    const url = window.URL.createObjectURL(file);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.target = "_blank";
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

export default function Download(props) {
    const text = translation();

    async function downloadFileList(paragraphId) {
        setStatus(status => { return { ...status, 2: { name: `${text['downloading']}...`, percent: 0 } } }) 
        let folder = new jsZip();
        const { data, error } = await supabase.storage
            .from("media")
            .list(paragraphId, {
                limit: 100,
                offset: 0,
                sortBy: { column: "name", order: "asc" },
            });
        if (error != null) {
            console.error(error);
            return;
        }

        for (let i = 0; i < data.length; i++) {
            setStatus(status => { return { ...status, 2: { name: `${text['downloading']} : ${data[i].name}...`, percent: i / data.length * 100 } } }) 
            const { data: file_data, error } = await supabase.storage
                .from("media")
                .download(`${paragraphId}/${data[i].name}`);
            if (error != null) {
                console.error(error);
            } else {
                folder.file(data[i].name, file_data);
            }
        }

        folder.generateAsync({ type: "blob" }).then(function (content) {
            saveFile(content, "files.zip");
        });
        setStatus(status => {return { ...status, 2: null }})
    }

    async function downloadProject(ProjectId) {

        setStatus(status => {return  {...status, 0: { name: text['download project'], percent: 0 }}})
        let folder = new jsZip();
        let { data, error } = await supabase
            .from("portfolio")
            .select("id,project(name)")
            .eq("project_id", ProjectId);

        if (error != null) {
            console.error(error);
            return;
        }
        else if (data.length === 0) {
            setError(text["error empty project"]);
            return;
        }
        else {
            setStatus(status => {return  {...status, 0: { name: text['downloading project'], percent:0 }}})   
            
            for (let i = 0; i < data.length; i++) {
                const portfolio = await getPdfPortfolio(data[i].id);
                folder.file(
                    portfolio.name.replace(/[/\\?%*:|"<>]/g, "-") + ".pdf",
                    portfolio.file
                );
                setStatus(status => {return  {...status, 0: { name: text['downloading project'], percent: 10 + ((i+1)/data.length * 90) }}})
            }
            
            folder.generateAsync({ type: "blob" }).then(function (content) {
                saveFile(
                    content,
                    data[0].project.name.replace(/[/\\?%*:|"<>]/g, "-")
                );
            });
            setStatus(status => {return { ...status, 0: null }})
        }
    }

    async function downloadPortfolio(portfolioId) {
        const doc = await getPdfPortfolio(portfolioId);
        saveFile(doc.file, doc.name.replace(/[/\\?%*:|"<>]/g, "-"));
    }

    async function getPdfPortfolio(portfolioId) {

        setStatus(status => {return  {...status, 1: { name: text['downloading portfolio'], percent: 0 }}})

        const pdfStyles = StyleSheet.create({
            page: {
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
            },
            title: { fontSize: 36 },
            section: { padding: 40 },
            subTitle: {
                fontSize: 24,
                fontWeight: "light",
                marginBottom: 20,
                borderBottom: 2,
            },
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
        setStatus(status => {return  {...status, 1: { name: `${text['downloading portfolio'] } : ${portfolioData.title}...`, percent: 50 }}})
        for (let i = 0; i < paragraphData.length; i++) {
            paragraphData[i].attachment = await PdfAttachment(
                paragraphData[i].id
            );
        }
        setStatus(status => {return  {...status, 1: { name: `${text['downloading portfolio'] } : ${portfolioData.title}...`, percent: 100 }}})
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
                    <Text>
                        {text["portfolio author"] +
                            " " +
                            portfolioData.userInfo.first_name +
                            " " +
                            portfolioData.userInfo.last_name}
                    </Text>
                </Page>
                {paragraphData.map((paragraph) => {
                    return (
                        <Page
                            key={paragraph.id}
                            size="A4"
                            style={pdfStyles.section}
                            bookmark={paragraph.title}
                        >
                            <Text style={pdfStyles.subTitle}>
                                {paragraph.title}
                            </Text>
                            <Text>{paragraph.text}</Text>
                            {paragraph.attachment}
                        </Page>
                    );
                })}
            </Document>
        );
        const file = await pdf(doc).toBlob();
        UnloadDataUrl();
        setStatus(status => {return { ...status, 1: null }})
        return { file: file, name: portfolioData.title };
    }

    async function PdfAttachment(paragraphId) {
        const pdfStyles = StyleSheet.create({
            image: {
                margin: 5,
                objectFit: "contain",
                width: "100%",
                maxHeight: "80vh",
            },
            text: { textAlign: "center", marginBottom: 50, fontSize: 12 },
        });

        const { data, error } = await supabase.storage
            .from("media")
            .list(paragraphId, {
                limit: 100,
                offset: 0,
                sortBy: { column: "name", order: "asc" },
            });
        if (error != null) {
            console.error(error);
            return;
        }
        const filesName = data.filter((file) =>
            file.metadata.mimetype.startsWith("image")
        );

        let files = [];
        for (let i = 0; i < filesName.length; i++) {
            setStatus(status => { return { ...status, 2: { name: `${text['downloading']} : ${filesName[i].name}...`, percent: i / filesName.length * 100 } } }) 
            
            const { data: file_data, error } = await supabase.storage
                .from("media")
                .download(`${paragraphId}/${filesName[i].name}`);
            if (error != null) {
                console.error(error);
            } else {
                const url = window.URL.createObjectURL(file_data);
                dataURL.push(url);
                files.push({ name: filesName[i].name, data: url });
            }
        }
        setStatus(status => {return { ...status, 2: null }}) 
        return (
            <>
                {files.map((file) => {
                    return (
                        <div key={file.name}>
                            <Image src={file.data} style={pdfStyles.image} />
                            <Text style={pdfStyles.text}>{file.name}</Text>
                        </div>
                    );
                })}
            </>
        );
    }

    const { type, id } = useParams();
    const [error, setError] = useState(null);
    
    const [status, setStatus] = useState({});
    const runOnce = useRef(false) 
    const Download = async () => {
        if (runOnce.current) {
            return
        }
        runOnce.current = true
        switch (type) {
            case "fileList":
                await downloadFileList(id);
                break;

            case "portfolio":
                await downloadPortfolio(id);
                break;

            case "project":
                await downloadProject(id);
                break;

            default:
                setError("invalid link");
                return;
        }
        setStatus(status => { return { ...status, 0: { name: text['download complete'], percent: 100 } } })  
    };
    useEffect(() => { Download() }, [type,id]);
    return (
        <>
            {error != null ? <h3 className="text-red-700 text-3xl text-center ">{error}</h3> :
            
            Object.keys(status).map((key) => { 
                const elem = status[key]
                if (elem === null){return null}
                return (
                    <div key={key}>
                        <h2 className="text-center text-3xl">{elem.name}</h2>
                        <div className="w-full bg-slate-300 h-1 my-8 rounded-full overflow-hidden">
                            <div
                                className="bg-accent h-full transition-all duration-1000"
                                style={{ width: elem.percent + "%" }}
                                />
                        </div>
                    </div>
                );
            })}
        </>
    )
}
