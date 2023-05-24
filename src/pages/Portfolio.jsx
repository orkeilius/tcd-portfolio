import { useParams } from "react-router-dom";
import { useRef, useState } from "react";
import { faker } from "@faker-js/faker";
import DownloadList from "src/components/preset/downloadList";
import Comment from "src/components/preset/comment";
import useTranslation from "src/lib/TextString";

export default function Portfolio(props) {
    const text = useTranslation();

    function getPortfolioData(portfolioId) {
        // Query file from db with props.postId

        //place holder
        return {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            title: faker.company.buzzPhrase(),
            text: faker.lorem.paragraph({ min: 10, max: 100 }),
        };
    }
    const handleTitleEdit = (event) => {
        setPortfolioData((commentData) => ({
            ...commentData,
            title: event.target.value,
        }));
    };
    const handleTextEdit = (event) => {
        event.target.style.height = "auto";
        event.target.style.height = `${event.target.scrollHeight}px`;
        setPortfolioData((commentData) => ({
            ...commentData,
            text: event.target.value,
        }));
    };

    const { id } = useParams();
    const [isAuthor, setIsAuthor] = useState(true);
    const [portfolioData, setPortfolioData] = useState(getPortfolioData);
    if (isAuthor) {
        setTimeout(() => {
            var textarea = document.getElementById("area");
            textarea.style.height = `${textarea.scrollHeight}px`;
        });
    }
    return (
        <main>
            <button
                className="bg-green-300 mb-5"
                onClick={() => setIsAuthor(!isAuthor)}
            >
                dev : is author : {isAuthor ? "true" : "false"}
            </button>
            <br />
            {isAuthor ? (
                <input
                    placeholder={text["title placeholder"]}
                    className="font-semibold text-3xl border-b border-black p-1 w-full"
                    value={portfolioData.title}
                    onChange={handleTitleEdit}
                />
            ) : (
                <h1 className="font-semibold text-3xl border-b border-black p-1">
                    {portfolioData.title}
                </h1>
            )}
            <p className="font-thin ml-1">
                {
                    text["portfolio author"] +
                    " " +
                    portfolioData.firstName +
                    " " +
                    portfolioData.lastName
                }
            </p>
            {isAuthor ? (
                <textarea
                    id="area"
                    placeholder={text["text placeholder"]}
                    className="resize-none w-full m-1"
                    value={portfolioData.text}
                    onChange={handleTextEdit}
                />
            ) : (
                <p className=" p-1">{portfolioData.text}</p>
            )}
            <DownloadList />
            <Comment />
        </main>
    );
}
