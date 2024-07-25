import {Link, useNavigate} from 'react-router-dom';
import { useState } from 'react';

const LeagueCreate = () => {

    const[id,idChange]=useState("");
    const[league,leagueChange]=useState("");
    const[divisions,divisionsChange]=useState([]);
    const navigate=useNavigate();



    const handlesubmit=(e)=>{
        e.preventDefault();
        const leagueData = {league,divisions};
        console.log("Submitted data: "+leagueData);
        fetch("/league",{
            method:"POST",
            headers:{"Content-type":"application/json"},
            body:JSON.stringify(leagueData)
        }).then((res)=>{
            return res.json();
        }).then((data)=>{
            alert("League saved successfully.")
            console.log("Response Data: "+data)
            navigate("/")
        }).catch((err)=>{
            console.log(err.message)
        })
        
    }

    return (
        <div>
            <div className="row">
                <div className="offset-lg-3 col-lg-6">
                    <form className="container" onSubmit={handlesubmit}>
                        <div className="card" style={{"textAlign":"left"}}>
                            <div className="card=title">
                                <h2>Add League</h2>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <label>League Name</label>
                                            <input value = {league} onChange={e=>leagueChange(e.target.value)} className="form-control"></input>
                                        </div>
                                    </div>


                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <button className="btn btn-success" type="submit">Save</button>
                                            <Link to="/" className="btn btn-danger">Back</Link>
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default LeagueCreate;