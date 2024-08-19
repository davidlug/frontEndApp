import lugLogo from './lugLogo.png';
import './homepage.css';
import { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';

const HomePage = () => {

    const [leagueData, setLeagueData] = useState(null);
    const navigate = useNavigate();

    const LoadEdit = (id) => {
        navigate(`/league/${id}`);
    }

    useEffect(() => {
        fetch("http://99.79.47.21:8080/leagues").then((res) => {
            return res.json();
        }).then((resp) => {
            setLeagueData(resp);
        }).catch((err) => {
            console.log(err.message);
        });
    }, []);

    const RemoveLeague = (leagueID, leagueName) => {
        if (window.confirm("Do you want to delete " + leagueName + "?")) {
            fetch(`http://99.79.47.21:8080/league/${leagueID}`, {
                method: "DELETE",
            }).then((res) => {
                alert("Division deleted successfully.");
                window.location.reload();
            }).catch((err) => {
                console.log(err.message);
            });
        }
    };

    return (

        <div style={{ position: 'relative', alignItems: 'center', top: '20%', display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
            <img src={lugLogo} width={250} />
            <h1 style={{ marginTop: '25px' }}>Choose League</h1>
            <table>
                <tr>
                    <th>League</th>
                    <th>Number of Divisions</th>
                </tr>
                <tbody>
                    {leagueData && leagueData.leagues ? (
                        leagueData.leagues.map(item => (
                            <tr key={item.id}>
                                <td>{item.league}</td>
                                <td>{item.divisions ? item.divisions.length : 0}</td> 
                                <td><a onClick={() => { LoadEdit(item.id) }} className="btn btn-success">View League</a>
                                <a onClick={() => { RemoveLeague(item.id, item.league) }} className="btn btn-danger">Delete</a>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="2">No league data available</td>
                        </tr>
                    )}
                </tbody>

            </table>
            <div>
                <Link to="league/create" className="btn btn-success">Add New League (+)</Link>
            </div>
        </div>
    );
}

export default HomePage;
