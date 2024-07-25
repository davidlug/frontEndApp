import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const TeamEdit = () => {
    const { leagueID, divisionID, teamID } = useParams();
    const navigate = useNavigate();

    const [teamName, setTeamName] = useState("");
    const [Players, setPlayers] = useState("");
    const [Division, setDivision] = useState("");
    const [validation, setValidation] = useState(false);

    useEffect(() => {
        fetch(`/league/${leagueID}/Division/${divisionID}/team/${teamID}`)
            .then((res) => res.json())
            .then((resp) => {
                console.log(`/league/${leagueID}/Division/${divisionID}/team/${teamID}`)
                console.log(resp.team);
                setTeamName(resp.team.teamName);
                setPlayers(resp.team.Players);
                setDivision(resp.team.Division);
            })
            .catch((err) => {
                console.log("Error fetching team data:", err);
            });
    }, [leagueID, divisionID, teamID]);

    const handleBack = () => {
        navigate(-1); // Navigate to the previous page
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission
        const teamData = { teamID, teamName, Players, Division };

        fetch(`/league/${leagueID}/Division/${divisionID}/team/${teamID}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(teamData)
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(() => {
                alert('Saved successfully.');
                navigate(-1);
            })
            .catch((err) => {
                console.log("Error saving team data:", err);
            });
    };

    return (
        <div>
            <h1>Edit "{teamName}"</h1>
            <form>
                <div className="col-lg-12">
                    <div className="form-group">
                        <label>Team Name</label>
                        <input
                            required
                            value={teamName}
                            onMouseDown={() => setValidation(true)}
                            onChange={(e) => setTeamName(e.target.value)}
                            className="form-control"
                        />
                        {teamName.length === 0 && validation && <span className="text-danger">Enter the name</span>}
                    </div>

                    <div className="form-group">
                        <label>Number of Players</label>
                        <input
                            required
                            type="number"
                            value={Players}
                            onMouseDown={() => setValidation(true)}
                            onChange={(e) => setPlayers(e.target.value)}
                            className="form-control"
                        />
                        {Players === 0 && validation && <span className="text-danger">Enter the number of Players</span>}
                    </div>

                    <div className="form-group">
                        <label>Division</label>
                        <select
                            value={Division}
                            onChange={(e) => setDivision(e.target.value)}
                            className="form-control"
                        >
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
                        <button className="btn btn-success" type="submit">Save</button>
                        <button className="btn btn-danger" type="button" onClick={handleBack}>Back</button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default TeamEdit;
