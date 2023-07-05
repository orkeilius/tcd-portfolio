import { useState, useEffect, useContext } from "react";
import { supabase } from "../lib/supabaseClient";
import { ConfirmPopUpContext } from "../components/ConfirmPopUp";
import useTranslation from "src/lib/TextString";

export default function AdminPanel(props) {
    async function getResults() {
        const { data, error } = await supabase.rpc("fn_searchUser", {
            arg_search: search,
        });
        if (error) console.error(error);
        else setResults(data);
    }
    async function setRole(value, id) {
        const { data, error } = await supabase.rpc("fn_setRole", {
            arg_role: value,
            arg_id: id,
        });
        if (error) console.error(error);
        else getResults();
    }

    const setConfirmPopUp = useContext(ConfirmPopUpContext);
    const text = useTranslation();
    const [results, setResults] = useState([]);
    const [search, setSearch] = useState("");
    useEffect(() => {
        getResults();
    }, [search]);

    return (
        <>
            <input
                type="text"
                className="bg-slate-200 m-1 outline-none focus-visible:border-accent2 rounded-md border-2 w-full mb-8 px-1 py-0.5"
                placeholder={text['user search']}
                value={search}
                onChange={(event) => {
                    setSearch(event.target.value);
                }}
            />
            <table className="w-5/6 text-left mx-auto">
                {results.map((result) => {
                    return (
                        <tr
                            key={result.id}
                            className="w-full border-b"
                        >
                            <th className="font-normal">
                                {result.first_name + " " + result.last_name}
                            </th>
                            <th className="font-normal">{result.email}</th>
                            <th className="text-right py-1.5 font-normal">
                                <select
                                    defaultValue={result.role}
                                    defaultvaluedata={result.role}
                                    onChange={(event) => {
                                        setConfirmPopUp(
                                            text["role confirm"]
                                                .replace(
                                                    "{0}",
                                                    result.first_name +
                                                        " " +
                                                        result.last_name
                                                )
                                                .replace(
                                                    "{1}",
                                                    event.target.options[
                                                        event.target
                                                            .selectedIndex
                                                    ].text
                                                ),
                                            () =>
                                                setRole(
                                                    event.target.value,
                                                    result.id
                                                ),
                                            () => {
                                                console.log(event.target)
                                                event.target.value = result.role
                                            }
                                        );
                                    }}
                                >
                                    <option value="2">student</option>
                                    <option value="1">professor</option>
                                    <option value="0">admin</option>
                                </select>
                            </th>
                        </tr>
                    );
                })}
            </table>
        </>
    );
}
