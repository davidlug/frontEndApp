import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import './Divisions.css';

const DivisionCreate = () => {
    const { id } = useParams(); // Get the league ID from the URL
    const [divisionName, divisionNameChange] = useState("");
    const [teams, teamChange] = useState([]);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const divisionData = { divisionName, teams };
        console.log("Submitted data: ", divisionData);
        fetch(`/leagues/${id}/division`, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(divisionData)
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Unknown error occurred');
            }
            return data;
        })
        .then((data) => {
            alert("Division saved successfully.");
            console.log("Response Data: ", data);
            navigate(-1);
        })
        .catch((err) => {
            console.error(err.message);
            alert("Error: " + err.message);
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
                                <h2>Choose Division</h2>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <label>Division Name</label>
                                            <input
                                                value={divisionName}
                                                onChange={e => divisionNameChange(e.target.value)}
                                                className="form-control"
                                            />
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

export default DivisionCreate;
