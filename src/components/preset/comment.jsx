import { faker } from "@faker-js/faker";
import { useRef, useState } from "react";
import ConfirmPopUp from "src/components/ConfirmPopUp";
import useTranslation from "src/lib/TextString";
import ProfileImage from "../profileImage";

function getCommentData(portfolioId) {
    // Query file from db with props.postId

    //place holder
    return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        text : faker.lorem.paragraph({ min: 1, max: 10 })
    }
    
}

export default function DownloadList(props) {
    
    const text = useTranslation("Download");

    //place holder
    const [isAuthor, setIsAuthor] = useState(true);
    const popUpRef = useRef(null);
    const [commentData, setCommentData] = useState(getCommentData);

    return (
        <>
            <button
                className="bg-green-300 mb-5"
                onClick={() => setIsAuthor(!isAuthor)}
            >
                dev : is author : {isAuthor ? "true" : "false"}
            </button>
            <ConfirmPopUp ref={popUpRef} />
            <div className="mx-auto my-2 border rounded-xl border-black border-separate w-[97%] p-2">
                <div className="flex">
                    <ProfileImage firstName={commentData.firstName} lastName={commentData.lastName}  />
                    <div className="ml-1">
                        <p className="font-light text-xs mt-1">comment from</p>
                        <p className="font-semibold text-lg leading-4">{commentData.firstName + " " + commentData.lastName}</p>
                    </div>
                </div>
                <p>{commentData.text}</p>
            </div>
            
        </>
    );
}
