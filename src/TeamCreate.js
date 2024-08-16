import {Link, useNavigate, useParams} from 'react-router-dom';
import { useState } from 'react';

const TeamCreate = () => {
    const { leagueID, divisionID } = useParams();

    const [id, idChange] = useState("");
    const [teamName, teamNameChange] = useState("");
    const [Players, PlayersChange] = useState("");
    const [Division, divisionChange] = useState("");
    const [gamesPlayed, gamesPlayedChange] = useState(0);
    const [late, lateChange] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const teamData = { teamName, Players, Division, gamesPlayed, late };
        console.log("Submitted data: " + JSON.stringify(teamData));
        fetch(`http://localhost:8080/league/${leagueID}/division/${divisionID}/team`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(teamData)
        }).then((res) => {
            return res.json();
        }).then((data) => {
            alert("Team saved successfully.");
            console.log("Response Data: " + JSON.stringify(data));
            navigate(-1);
        }).catch((err) => {
            console.log(err.message);
        });
    };

    const handleBack = () => {
        navigate(-1); // Navigate to the previous page
    };

    return (
        <div>
            <div className="row">
                <div className="offset-lg-3 col-lg-6">
                    <form className="container" onSubmit={handleSubmit}>
                        <div className="card" style={{ textAlign: "left" }}>
                            <div className="card-title">
                                <h2>Add Team</h2>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <label>Team Name</label>
                                            <input value={teamName} onChange={e => teamNameChange(e.target.value)} className="form-control" />
                                        </div>
                                    </div>

                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <label>Sub-Division</label>
                                            <select value={Division} onChange={e => divisionChange(e.target.value)} className="form-control">
                                                <option value="">Choose Sub-Division</option>
                                                <option value="Elite">Elite</option>
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                                <option value="W">W</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <label>Number of Players</label>
                                            <input value={Players} onChange={e => PlayersChange(e.target.value)} className="form-control" />
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                                <div className="form-group">
                                                    <label>Late Sign-Up?</label>
                                                    <input
                                                        type="radio"
                                                        name="Extra"
                                                        value="Yes"
                                                        checked={late === "Yes"}
                                                        onChange={() => lateChange("Yes")}
                                                    /> Yes
                                                    <input
                                                        type="radio"
                                                        name="extra"
                                                        value="No"
                                                        checked={late === "No"}
                                                        onChange={() => lateChange("No")}
                                                    /> No
                                                </div>
                                            </div>


                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <button className="btn btn-success" type="submit">Save</button>
                                            <button className="btn btn-danger" type="button" onClick={handleBack}>Back</button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TeamCreate;
