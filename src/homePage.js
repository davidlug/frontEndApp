import lugLogo from './lugLogo.png';
import './homepage.css';
import { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';

const HomePage = () => {

    const [leagueData, setLeagueData] = useState(null);
    const navigate = useNavigate();

    const LoadDetail = (id) => {
        navigate("/league/detail" + id);
    }

    const LoadEdit = (id) => {
        navigate(`/league/${id}`);
    }

    useEffect(() => {
        fetch("/leagues").then((res) => {
            return res.json();
        }).then((resp) => {
            setLeagueData(resp);
        }).catch((err) => {
            console.log(err.message);
        });
    }, []);

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
                                <td>{item.divisions ? item.divisions.length : 0}</td>  {/* Display the number of teams */}
                                <td><a onClick={() => { LoadEdit(item.id) }} className="btn btn-success">View League</a></td>
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
