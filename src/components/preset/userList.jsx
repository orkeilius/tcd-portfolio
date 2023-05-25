import { faker } from "@faker-js/faker";
import { useRef, useState } from "react";
import { IoExitOutline } from "react-icons/io5";
import ConfirmPopUp from "src/components/ConfirmPopUp";
import useTranslation from "src/lib/TextString";

function getUserData(portfolioId) {
    // Query file from db with props.postId

    //place holder
    var fileList = [];
    for (let index = 0; index < Math.round(Math.random() * 40); index++) {
        fileList.push({
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            portfolioTitle: faker.company.buzzPhrase()
        });
    }
    return fileList;
}

export default function UserList(props) {
    const text = useTranslation();

    //place holder
    const [isAdmin, setIsAuthor] = useState(true);
    const popUpRef = useRef(null);
    const [userList, setUserList] = useState(getUserData);

    const handleFileDelete = (firstName,lastName) => {
        //call to db

        setUserList((fileList) => {
            return fileList.filter((user) => user.firstName !== firstName || user.lastName !== lastName );
        });
    };

    return (
        <>
            <button
                className="bg-green-300 mb-5"
                onClick={() => setIsAuthor(!isAdmin)}
            >
                dev : is author : {isAdmin ? "true" : "false"}
            </button>
            <ConfirmPopUp ref={popUpRef} />
            <ul className="mx-auto my-1 border rounded-xl border-black border-separate w-[97%] overflow-hidden">
                {userList.map((user) => (
                    <li key={user.firstName + user.lastName} className="w-full flex justify-between border-b border-black last:border-0">
                        <p className="ml-1 font-semibold">
                            {user.firstName +' '+ user.lastName}
                        </p>
                        <a href='/' className="underline text-accent hover:text-accent2">{user.portfolioTitle }</a>
                        {isAdmin ? (
                            <button
                                onClick={() => {
                                    popUpRef.current.popUp(
                                        text["user confirm"].replace(
                                            "{0}",
                                            user.firstName+' '+user.lastName
                                        ),
                                        () => handleFileDelete(user.firstName,user.lastName)
                                    );
                                }}
                                className=" transition-all m-1 bg-red-500 flex justify-center items-center rounded-md hover:scale-125 w-5 h-5"
                            >
                                <IoExitOutline />
                            </button>
                            
                        ) : <div className="h-[28px] "/>}
                    </li>
                ))}
            </ul>
        </>
    );
}
