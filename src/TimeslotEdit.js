import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import TimePicker from 'react-time-picker';
import { Link, useNavigate, useParams } from "react-router-dom";
import 'react-datepicker/dist/react-datepicker.css';
import { format, parseISO } from 'date-fns';

const TimeslotEdit = () => {
    const { leagueID, divisionID, timeslotID } = useParams();
    const navigate = useNavigate();

    const [week, weekChange] = useState(0);
    const [date, dateChange] = useState(new Date());
    const [startTime, startTimeChange] = useState('10:00');
    const [endTime, endTimeChange] = useState('10:00');
    const [facility, facilityChange] = useState("");
    const [rink, rinkChange] = useState("");
    const [premium, premiumChange] = useState(false);
    const [lateGame, lateGameChange] = useState(false);
    const [validation, setValidation] = useState(false);

    useEffect(() => {
        fetch(`/league/${leagueID}/Division/${divisionID}/timeslot/${timeslotID}`)
            .then((res) => res.json())
            .then((resp) => {
                weekChange(resp.timeslot.week);
                dateChange(parseISO(resp.timeslot.date));
                startTimeChange(resp.timeslot.startTime);
                endTimeChange(resp.timeslot.endTime);
                facilityChange(resp.timeslot.facility);
                rinkChange(resp.timeslot.rink);
                premiumChange(resp.timeslot.premium);
                lateGameChange(resp.timeslot.lateGame);
                console.log("Extra");
                console.log(resp.timeslot.additionalData);
            })
            .catch((err) => {
                console.log("Error fetching timeslot data:", err);
            });
    }, [leagueID, divisionID, timeslotID]);

    const handleBack = () => {
        navigate(-1); // Navigate to the previous page
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission

        // Format date to 'yyyy-MM-dd' string without time zone conversion
        const formattedDate = format(date, 'yyyy-MM-dd');

        const teamData = { 
            timeslotID, 
            week, 
            date: formattedDate, 
            startTime, 
            endTime, 
            facility, 
            rink, 
            premium, 
            lateGame 
        };

        fetch(`/league/${leagueID}/Division/${divisionID}/timeslot/${timeslotID}`, {
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
            <h1>Edit Timeslot</h1>
            <form onSubmit={handleSubmit}>
                <div className="col-lg-12">
                    <div className="form-group">
                        <label>Week</label>
                        <input
                            required
                            value={week}
                            onMouseDown={() => setValidation(true)}
                            onChange={(e) => weekChange(e.target.value)}
                            className="form-control"
                        />
                        {week === 0 && validation && <span className="text-danger">Enter the week</span>}
                    </div>

                    <div className="form-group">
                        <label>Date</label>
                        <DatePicker
                            selected={date}
                            onChange={(date) => dateChange(date)}
                            dateFormat="yyyy-MM-dd"
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label>Start Time</label>
                        <TimePicker value={startTime} onChange={startTimeChange} className="form-control" />
                    </div>

                    <div className="form-group">
                        <label>End Time</label>
                        <TimePicker value={endTime} onChange={endTimeChange} className="form-control" />
                    </div>

                    <div className="form-group">
                        <label>Facility</label>
                        <input
                            required
                            value={facility}
                            onMouseDown={() => setValidation(true)}
                            onChange={(e) => facilityChange(e.target.value)}
                            className="form-control"
                        />
                        {facility.length === 0 && validation && <span className="text-danger">Enter the facility</span>}
                    </div>

                    <div className="form-group">
                        <label>Rink</label>
                        <input
                            required
                            value={rink}
                            onMouseDown={() => setValidation(true)}
                            onChange={(e) => rinkChange(e.target.value)}
                            className="form-control"
                        />
                        {rink.length === 0 && validation && <span className="text-danger">Enter the rink</span>}
                    </div>

                    <div className="form-group">
                        <label>Premium?</label>
                        <div>
                            <input type="radio" name="premium" value={true} checked={premium === true} onChange={() => premiumChange(true)} /> Yes
                            <input type="radio" name="premium" value={false} checked={premium === false} onChange={() => premiumChange(false)} /> No
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Late Game?</label>
                        <div>
                            <input type="radio" name="lateGame" value={true} checked={lateGame === true} onChange={() => lateGameChange(true)} /> Yes
                            <input type="radio" name="lateGame" value={false} checked={lateGame === false} onChange={() => lateGameChange(false)} /> No
                        </div>
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
}

export default TimeslotEdit;
