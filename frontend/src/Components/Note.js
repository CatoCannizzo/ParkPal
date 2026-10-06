import "../Styles/App.css";
import { useState, useEffect } from "react";
import axios from "axios";
//import { authHeader } from "../Helpers/authHeader.js";
import { authenticationService } from '../Helpers/authentication.service.js';

export default function Note(props) {
    const [isEdit, setIsEdit] = useState(false)
    const [note, setNote] = useState("")
    const [err, setErr] = useState("")

    const token = authenticationService.currentUserValue?.token;
    const jwtHeader = token ? "Bearer " + token : "";

    useEffect(() => {
        if (!props.park || !jwtHeader) return;
        axios({
            method: "post",
            url: "/auth_getnote",
            data: {
                pid: props.park
            },
            headers: {
                "Authorization": jwtHeader
            }
        })
            .then(function (response) {
                setNote(response.data["note"] || "")
            })
            .catch(function (err) {
                setErr(err.response?.data?.["msg"] || "Error loading note")
                if (err.response?.status === 401) {
                    authenticationService.logout()
                }
            })
    }, [props.park, jwtHeader])

    const handleSubmit = (e) => {
        e.preventDefault();
        axios({
            method: "post",
            url: "/auth_editnote",
            data: {
                note: note,
                pid: props.park
            },
            headers: {
                "Authorization": jwtHeader
            }
        })
            .then(function (response) {
                setIsEdit(false)
            })
            .catch(function (err) {
                setErr(err.response?.data?.["msg"] || "Error saving note")
            })
    }

    return (
        <div>
        {isEdit ? (
        <form onSubmit={handleSubmit} style={{display: "flex", alignItems: "flex-start", flexDirection: "column"}}>
            <textarea
                value={note}
                rows="2"
                onChange={(e) => setNote(e.target.value)}
                type="textbox"
                id="note"
                name="note"></textarea>
            <div style={{color:"#ff96fb"}}>{err}</div>
            <input className="notesButton" type="submit" value="Save"></input>
        </form>
        ) : (
            <div style={{display: "flex", alignItems: "flex-start", flexDirection: "column"}}>
                <div style={{whiteSpace: "pre-line", textAlign: "left"}}>{note}</div>
                <button className="notesButton" onClick={(e) => setIsEdit(true)}>Edit Notes</button>
            </div>
        )}
        </div>
    )
}