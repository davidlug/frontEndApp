import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import TimePicker from 'react-time-picker';

import "react-datepicker/dist/react-datepicker.css";
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';

const TimeSlotCreate = () => {
    const location = useLocation();
    const initialData = location.state || {};
    const { leagueID } = useParams();
    const { divisionID } = useParams();

    const [id, idChange] = useState("");
    const [week, weekChange] = useState(0);
    const [date, dateChange] = useState(new Date());
    const [startTime, startTimeChange] = useState('10:00');
    const [endTime, endTimeChange] = useState('10:00');
    const [facility, facilityChange] = useState("");
    const [rink, rinkChange] = useState("");
    const [extra, extraChange] = useState(false);
    const [additionalData, setAdditionalData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        console.log("Initial data: ", initialData);
        if (initialData && initialData.additionalData) {
            const headersTemp = [];
            for (const x in initialData.additionalData) {
                for (const j in initialData.additionalData[x]) {
                    if (!headersTemp.includes(j)) {
                        headersTemp.push(j);
                    }
                }
            }
            setHeaders(headersTemp);
            // idChange(initialData.id || "");
            // weekChange(initialData.week || 0);
            // dateChange(new Date(initialData.date) || new Date());
            // startTimeChange(initialData.startTime || '10:00 PM');
            // endTimeChange(initialData.endTime || '11:00 PM');
            // facilityChange(initialData.facility || "");
            // rinkChange(initialData.rink || "");
            // setAdditionalData(initialData.additionalData || []);
        }
    }, [initialData]);

    const handleAdditionalDataChange = (key, newValue) => {
        const updatedData = additionalData.map(data => {
            if (Object.keys(data)[0] === key) {
                return { [key]: newValue };
            }
            return data;
        });
        setAdditionalData(updatedData);
    };

   
    const handlesubmit = (e) => {
        e.preventDefault();
        const formattedDate = date.toISOString().split('T')[0];

        const timeslotData = { week, date: formattedDate, startTime, endTime, facility, rink, additionalData, extra };
        console.log("Submitted data: ", timeslotData);
        fetch(`http://localhost:8080/league/${leagueID}/division/${divisionID}/timeslot`, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(timeslotData)
        }).then((res) => {
            return res.json();
        }).then((data) => {
            alert("Timeslot saved successfully.");
            navigate(-1);
            console.log("Response Data: ", data);
        }).catch((err) => {
            console.log(err.message);
        });
    };

    const dateAdjust = (date) => {
        const adjustedDate = new Date(date.setHours(0, 0, 0, 0)); // Reset time to midnight
        console.log(adjustedDate); // Check the value
        dateChange(adjustedDate);
    };
    

    const handleBack = () => {
        navigate(-1); // Navigate to the previous page
    };

    const convertHour = (time) =>{
        const times = time.split(":");
        if(parseInt(times[0], 10) > 12)
            {
                return parseInt((times[0])-12)+":"+times[1]+" PM";
            }
            else
            {
                return times[0]+":"+times[1]+" AM";
            }
    }

    return (
        <div>
            <div className="row">
                <div className="offset-lg-3 col-lg-6">
                    <form className="container" onSubmit={handlesubmit}>
                        <div className="card" style={{ textAlign: "left" }}>
                            <div className="card-title">
                                <h2>Add Timeslot</h2>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <label>Week</label>
                                            <input value={week} onChange={e => weekChange(parseInt(e.target.value))} className="form-control"></input>
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <label>Date</label>
                                            <DatePicker selected={date} onChange={(date) => dateAdjust(date)} dateFormat="yyyy-MM-dd" className="form-control" />
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <label>Start Time</label>
                                            <TimePicker
                                                value={startTime}
                                                onChange={startTimeChange}
                                                className="form-control"
                                                format="hh:mm a"  // Specify format for AM/PM (optional)
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <label>End Time</label>
                                            <TimePicker
                                                value={endTime}
                                                onChange={endTimeChange}
                                                className="form-control"
                                                format="hh:mm a"  // Specify format for AM/PM (optional)
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <label>Facility</label>
                                            <input value={facility} onChange={e => facilityChange(e.target.value)} className="form-control"></input>
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <label>Rink/Field</label>
                                            <input value={rink} onChange={e => rinkChange(e.target.value)} className="form-control"></input>
                                        </div>
                                    </div>

                                    <div className="col-lg-12">
                                                <div className="form-group">
                                                    <label>Extra Timeslot?</label>
                                                    <input
                                                        type="radio"
                                                        name="Extra"
                                                        value="Yes"
                                                        checked={extra === "Yes"}
                                                        onChange={() => extraChange("Yes")}
                                                    /> Yes
                                                    <input
                                                        type="radio"
                                                        name="extra"
                                                        value="No"
                                                        checked={extra === "No"}
                                                        onChange={() => extraChange("No")}
                                                    /> No
                                                </div>
                                            </div>

                                    {headers.map((header, index) => {
                                        const dataEntry = additionalData.find(data => Object.keys(data)[0] === header);
                                        const key = dataEntry ? Object.keys(dataEntry)[0] : header;
                                        const value = dataEntry ? dataEntry[key] : "";

                                        return (
                                            <div className="col-lg-12" key={index}>
                                                <div className="form-group">
                                                    <label>{key}</label>
                                                    <input
                                                        type="radio"
                                                        name={key}
                                                        value="Yes"
                                                        checked={value === "Yes"}
                                                        onChange={() => handleAdditionalDataChange(key, "Yes")}
                                                    /> Yes
                                                    <input
                                                        type="radio"
                                                        name={key}
                                                        value="No"
                                                        checked={value === "No"}
                                                        onChange={() => handleAdditionalDataChange(key, "No")}
                                                    /> No
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="form-group">
                                    <button type="submit" className="btn btn-primary">Submit</button>
                                    <button className="btn btn-success" type="button" onClick={handleBack}>Back</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default TimeSlotCreate;
