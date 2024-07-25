import './schedule.css';
import { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import * as React from 'react'
import './Teams.css';
import lugLogo from './lugLogo.png';
import * as XLSX from 'xlsx';
import Slider from '@mui/material/Slider';
import { useDownloadExcel } from 'react-export-table-to-excel';
import * as FileSaver from 'file-saver';
import XSLX from 'sheetjs-style';
import { Tooltip } from 'bootstrap';
import ExportAsExcel from 'react-export-table-to-excel'
import InputNumber from 'rc-input-number';
import NumberPicker from "react-widgets/NumberPicker";
import WeightNumberLine from './WeightNumberLine';



const TeamsView = () => {
    const { leagueID, divisionID } = useParams();
    const [divisionName, setDivisionName] = useState("");
    const [league, setLeagueName] = useState("");
    const [teams, setTeams] = useState([]);
    const navigate = useNavigate();
    const [timeslots, setTimeSlots] = useState([]);
    const [data, setData] = useState("");
    const [generatedSchedule, setGeneratedSchedule] = useState([]);
    const [value, setValue] = useState(0.1);
    const [selectedWeeks, setSelectedWeeks] = useState([]); // State for selected weeks
    //const [loadSchedule, setLoadSchedule] = useState([]);
    const tableRef = useRef(null);
    const [matrix, setMatrix] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedSchedule, setEditedSchedule] = useState(generatedSchedule);
    const [savedSchedule, setSavedSchedule] = useState([]);
    //var backupSchedule = [];
    const [backupSchedule, setBackupSchedule] = useState([]);
    const [numberOfGames, setNumberOfGames] = useState({});
    const customHeaders = [
        "Number",
        "Date",
        "Time",
        "Home Team",
        "Away Team",
        "Home Division",
        "Away Division",
        "Facility",
        "Rink",
        "Game Type"
    ];
    

    const handleInputChange = (teamId, value) => {
        setNumberOfGames(prevState => ({
            ...prevState,
            [teamId]: value
        }));
        setTeams(prevTeams => prevTeams.map(team =>
            team.id === teamId ? { ...team, numGames: value } : team
          ));
    };

    const handleEditClick = () => {
        if(isEditing)
        {
            saveSchedule();
            window.location.reload();

        }
        else
        {
            console.log("!isEditing");
            console.log(savedSchedule);
           // setGeneratedSchedule([...savedSchedule]);
        }
        setIsEditing(!isEditing);
    };

    const saveSchedule = () => {
        localStorage.setItem('savedSchedule', JSON.stringify(editedSchedule));
        fetch(`/league/${leagueID}/Division/${divisionID}/schedule`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editedSchedule)
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(() => {
                setSavedSchedule(editedSchedule);
                setBackupSchedule(JSON.parse(JSON.stringify(editedSchedule)));

                const teamWeights = {};
                teams.forEach(team => {
                    teamWeights[team.teamName] = team.weight;
                });
                
                // Recalculate games played and weights for each team
                const updatedTeams = teams.map(team => {
                    let gamesPlayedCount = 0;
        
                    editedSchedule.forEach(week => {
                        week.forEach(timeslot => {
                            if (timeslot.match) {
                                const homeTeam = timeslot.match.homeTeam.teamName;
                                const awayTeam = timeslot.match.awayTeam.teamName;
        
                                if (homeTeam === team.teamName || awayTeam === team.teamName) {
                                    gamesPlayedCount++;
                                }
                            }
                        });
                    });
        
                    const totalWeight = teamWeights[team.teamName] || 0;
                    console.log("saveSchedule totalWeight");
                    console.log(totalWeight);

                  
        
                    return { ...team, gamesPlayed: gamesPlayedCount, weight: totalWeight };
                });
        
                setTeams(updatedTeams);
                console.log(updatedTeams);
                
            })
            .catch((err) => {
                console.log("Error saving team data:", err);
            });


        
    }

    const handleCancelClick = () => {
        console.log("Original Schedule");
       // console.log(savedSchedule);
        console.log(backupSchedule)
        setEditedSchedule(JSON.parse(JSON.stringify(backupSchedule)));
        //setEditedSchedule(savedSchedule);
        setIsEditing(false);
    };



    const handleChange = (weekIndex, timeslotIndex, field, value) => {
        const updatedSchedule = [...editedSchedule];
    
        // Check if the field is part of the match object
        if (field === 'homeTeam' || field === 'awayTeam') {
            const match = updatedSchedule[weekIndex][timeslotIndex].match;
    
            if (match) {
                updatedSchedule[weekIndex][timeslotIndex].match = {
                    ...match,
                    [field]: {
                        ...match[field],
                        teamName: value
                    }
                };
            } else {
                updatedSchedule[weekIndex][timeslotIndex].match = {
                    [field]: { teamName: value }
                };
            }
        } else {
            // Update other fields directly on the timeslot
            updatedSchedule[weekIndex][timeslotIndex] = {
                ...updatedSchedule[weekIndex][timeslotIndex],
                [field]: value
            };
        }
        
        console.log("Update Schedule");
        setEditedSchedule(updatedSchedule);
        console.log(editedSchedule);
        console.log(savedSchedule);

    };
    
    
    

    const convertTo24Hour = (time) => {
        const [timePart, modifier] = time.split(' ');
        let [hours, minutes] = timePart.split(':');
    
        hours = parseInt(hours, 10);
    
        if (modifier === 'PM' && hours !== 12) {
            hours += 12;
        }
    
        if (modifier === 'AM' && hours === 12) {
            hours = 0;
        }
    
        return `${hours.toString().padStart(2, '0')}:${minutes}`;
    };
    
    

    const convertTo12Hour = (time) => {
        let [hours, minutes] = time.split(':');
        let modifier = '';
    
        hours = parseInt(hours, 10);
    
        if (hours >= 12) {
            console.log("Modify");
            console.log(modifier);
            modifier = 'PM';
            console.log(modifier)
            if (hours > 12) {
                hours -= 12;
            }
        } else if (hours === 0) {
            hours = 12;
        }
        
    
        return `${hours.toString().padStart(2, '0')}:${minutes} ${modifier}`;
    };
    
    

 const extractTableData = () => {
        const table = tableRef.current;
        const rows = Array.from(table.querySelectorAll('tbody tr')).filter(row => !row.classList.contains('divider'));
        const data = rows.map((row, rowIndex) => {
            const cells = Array.from(row.cells);
            const gameNumber = rowIndex + 1;
            const date = cells[1].innerText || cells[1].textContent;
            const startTime = cells[2].innerText || cells[2].textContent;
            const homeTeam = cells[4].innerText || cells[4].textContent;
            const awayTeam = cells[5].innerText || cells[5].textContent;
            const facility = cells[6].innerText || cells[6].textContent;
            const rink = cells[7].innerText || cells[7].textContent;
            const matchType = "Regular Season"
            console.log("Cells");
            console.log(cells);
            //return cells.map(cell => cell.innerText || cell.textContent);
            return [
                gameNumber,
                date,
                startTime,
                homeTeam,
                awayTeam,
                divisionName,
                divisionName,
                facility,
                rink,
                matchType
            ];
        });
        return data;
    };

    const handleDownload = () => {
        const data = extractTableData();

        // Create a worksheet
        const ws = XLSX.utils.aoa_to_sheet([customHeaders, ...data]);
    
        // Create a workbook and append the worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Schedule");
    
        // Generate Excel file and download
        XLSX.writeFile(wb, `${divisionName} schedule - ${league}.csv`);
    };

   
    const fileType = `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset-UTF-8`;
    const fileExtension = '.xlsx';

    const exportToExcel = async (excelData, fileName) => {
        console.log(excelData);
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(data, fileName + fileExtension);
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const workbook = XLSX.read(event.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(sheet);

            fetch(`/league/${leagueID}/division/${divisionID}/teams`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify(sheetData)
            }).then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    alert("Teams successfully added");
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        };

        reader.readAsBinaryString(file);
    };

    const timeslotFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const workbook = XLSX.read(event.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Read the sheet as a 2D array

            // Assuming the first row contains headers
            const headers = sheetData[0];
            const data = sheetData.slice(1);

            const formattedData = data.map(row => {
                const week = row[headers.indexOf('week')];
                const date = ExcelDateToJSDate(row[headers.indexOf('date')]);
                const startTime = ExcelDateToJSDate(row[headers.indexOf('startTime')]);
                const endTime = ExcelDateToJSDate(row[headers.indexOf('endTime')]);
                const facility = row[headers.indexOf('facility')];
                const rink = row[headers.indexOf('rink')];
                const bonus = row[headers.indexOf('bonus?')]

                const additionalData = headers.slice(7).map((header, index) => {
                    return { [header]: row[headers.indexOf(header)] };
                });

                let weights = 0;
                var i = 0;
                for (let j = 0; j < additionalData.length; j++) {
                    i++
                    let obj = additionalData[j];
                    for (let key in obj) {
                        let value = obj[key]; // Extracting the value
                        console.log("Value: " + value); // Logging the key-value pair for clarity
                        if (value === "Yes") {
                            weights += 1;
                        }
                    }
                }

                //console.log(i);
                weights = weights / i;
                //console.log(weights);

                return {
                    week: week,
                    date: formatDate(date),
                    startTime: formatTime(startTime),
                    endTime: formatTime(endTime),
                    facility: facility,
                    rink: rink,
                    extra: bonus,
                    additionalData: additionalData,
                    weight: weights

                };
            });

            fetch(`/league/${leagueID}/division/${divisionID}/timeslots`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify(formattedData)
            }).then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    alert("Timeslots successfully added");
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Error:', error);
                });

            setData(formattedData);
        };

        reader.readAsBinaryString(file);
    };

    // Helper functions to convert Excel dates to JS dates and format them
    const ExcelDateToJSDate = (serial) => {
        const utc_days = Math.floor(serial - 25569);
        const utc_value = utc_days * 86400;
        const date_info = new Date(utc_value * 1000);

        const fractional_day = serial - Math.floor(serial) + 0.0000001;

        let total_seconds = Math.floor(86400 * fractional_day);

        const seconds = total_seconds % 60;

        total_seconds -= seconds;

        const hours = Math.floor(total_seconds / (60 * 60));
        const minutes = Math.floor(total_seconds / 60) % 60;

        const date = new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);

        // Adjust date to fix the one-day-off issue
        date.setDate(date.getDate() + 1);

        return date;
    };

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };


    const formatTime = (date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes.toString().padStart(2, '0');
        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    };

    const formatBoolean = (value) => {
        return value ? "Yes" : "No";
    }

    useEffect(() => {
        setEditedSchedule(generatedSchedule);

        const teamWeights = {};
        teams.forEach(team => {
            teamWeights[team.teamName] = team.weight;
        });

        const updatedTeams = teams.map(team => {
            let gamesPlayedCount = 0;

            editedSchedule.forEach(week => {
                week.forEach(timeslot => {
                    if (timeslot.match) {
                        const homeTeam = timeslot.match.homeTeam.teamName;
                        const awayTeam = timeslot.match.awayTeam.teamName;

                        if (homeTeam === team.teamName || awayTeam === team.teamName) {
                            gamesPlayedCount++;
                        }
                    }
                });
            });

            // Calculate the weight for each team
            const totalWeight = teamWeights[team.teamName] || 0;

            return { ...team, gamesPlayed: gamesPlayedCount, weight: totalWeight };
        });

        console.log("Updated Teams");
        setTeams(updatedTeams);
        console.log(teams);
    }, [generatedSchedule]);

    useEffect(() => {
        fetch(`/leagues/${leagueID}/divisions/${divisionID}/teams`)
            .then((res) => res.json())
            .then((resp) => {
                console.log(resp.divisionName + " division");
                setDivisionName(resp.divisionName);
                setLeagueName(resp.leagueName);
                setTeams(resp.teams || []);
            })
            .catch((err) => {
                console.log(err.message);
            });
    }, [leagueID, divisionID]);

    useEffect(() => {
        fetch(`/leagues/${leagueID}/divisions/${divisionID}/timeslots`)
            .then((res) => res.json())
            .then((resp) => {
                setTimeSlots(resp.timeslots || []);
                // console.log("timeslotS");
                // console.log(timeslots);
            })
            .catch((err) => {
                console.log(err.message);
            });
    }, [leagueID, divisionID]);

    useEffect(() => {
        fetch(`/league/${leagueID}/division/${divisionID}/schedules`)
            .then((res) => res.json())
            .then((resp) => {
                console.log("Schedules");
                console.log(resp.schedule);
                //setLoadSchedule(resp.schedule || []);
                setGeneratedSchedule(resp.schedule)
                setSavedSchedule(resp.schedule);
               setBackupSchedule(JSON.parse(JSON.stringify(resp.schedule)) || []);
            })
            .catch((err) => {
                console.log(err.message);
            });
    }, [leagueID, divisionID]);

    useEffect(() => {
        console.log("Backup Schedule");
        console.log(backupSchedule);
    }, [backupSchedule]);


    const handleBack = () => {
        navigate(-1);
    };


    useEffect(() => {
        const counts = countMatchups(teams, generatedSchedule);
        const initialMatrix = generateMatrix(teams, counts);
        setMatrix(initialMatrix);
    }, [teams, generatedSchedule]);

    const generateMatrix = (teams, counts) => {
        return teams.map((teamA) => {

            return teams.map((teamB) => {
                if (teamA.teamName === teamB.teamName) {
                    return null;
                } else {
                    return counts[teamA.teamName][teamB.teamName];
                }
            });
        });
    };

    const RemoveTeam = (leagueID, divisionID, teamID, teamName) => {
        if (window.confirm("Do you want to delete " + teamName + "?")) {
            fetch(`/leagues/${leagueID}/divisions/${divisionID}/teams/${teamID}`, {
                method: "DELETE",
            }).then((res) => {
                alert("Team deleted successfully.");
                window.location.reload();
            }).catch((err) => {
                console.log(err.message);
            });
        }
    };

    // console.log("timeslots.length ");
    // console.log(timeslots[0]);

    const initialTeams = teams.map(team => ({
        ...team,
        gamesPlayed: 0,
        weight: 0,
        numGames: numberOfGames[team.id] || 0
    }));
    const fetchLeagues = async () => {
        console.log('Initial numberOfGames:', numberOfGames);
        let allGames = 0;
    
        // Use Object.keys() to get all the keys (team IDs) and iterate over them
        const keys = Object.keys(numberOfGames);
        console.log('Number of teams:', keys.length);
    
        keys.forEach(key => {
            const numGames = numberOfGames[key];
            console.log(`Team ID: ${key}, Number of Games: ${numGames}`);
            allGames += numGames;
        });
    
        let numGames = 0;
    
        for (let p = 0; p < timeslots.length; p++) {
            if (timeslots[p].date !== "NaN-NaN-NaN") {
                numGames++;
            }
        }
        console.log("Timeslots");
        console.log(timeslots);
        console.log("numGames:", numGames);
        console.log("Total games from numberOfGames:", allGames);
    
        if (allGames !== numGames * 2) {
            alert("Incorrect Number of Games!");
            return;
        }
    
        // Calculate and update the number of games played for each team
        const updatedTeams = await Promise.all(teams.map(async (team) => {
            const totalGames = numberOfGames[team.id] || 0;
    
            // Fetch the updated weight from the server
            const response = await fetch(`/league/${leagueID}/division/${divisionID}/team/${team.id}/weight`);
            const data = await response.json();
            const updatedWeight = data.weight;
    
            console.log(`Updated weight for ${team.teamName}: ${updatedWeight}`);
            console.log(`Total games for ${team.teamName}: ${totalGames}`);
    
            // Return the updated team with new values
            return { ...team, numGames: totalGames, weight: updatedWeight };
        }));
    
        // Log the weights of updated teams to verify
        updatedTeams.forEach(team => {
            console.log(`Team: ${team.teamName}, Weight: ${team.weight}, numGames: ${team.numGames}`);
        });
    
        // Update the teams on the server with the new `numGames`
        await fetch(`/league/${leagueID}/Division/${divisionID}/teams`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTeams)
        });
    
        console.log('Teams updated on the server');
    
        // Fetch the new schedule
        console.log(`/league/${leagueID}/division/${divisionID}/schedule?freezeWeeks=${selectedWeeks}`);
        fetch(`/league/${leagueID}/division/${divisionID}/schedule?freezeWeeks=${selectedWeeks}`)
            .then((res) => res.json())
            .then((resp) => {
                console.log('API response:', resp);
                const updatedSchedule = resp.schedule || [];
                setGeneratedSchedule(updatedSchedule);
    
                // Calculate and update the number of games played for each team
                const updatedTeamsWithGamesPlayed = updatedTeams.map(team => {
                    let gamesPlayedCount = 0;
    
                    updatedSchedule.forEach(week => {
                        week.forEach(timeslot => {
                            if (timeslot.match) {
                                const homeTeam = timeslot.match.homeTeam.teamName;
                                const awayTeam = timeslot.match.awayTeam.teamName;
    
                                if (homeTeam === team.teamName || awayTeam === team.teamName) {
                                    gamesPlayedCount++;
                                }
                            }
                        });
                    });
    
                    return { ...team, gamesPlayed: gamesPlayedCount };
                });
    
                // Update the state with the new teams array
                setTeams(updatedTeamsWithGamesPlayed);
                console.log(teams);
                console.log("Updated Teams with games played:", updatedTeamsWithGamesPlayed);
            })
            .catch((error) => {
                console.error('Error fetching schedule:', error);
            });
    };
    
    
    
    
    const toggleWeekSelection = (week) => {
        setSelectedWeeks(prevSelectedWeeks =>
            prevSelectedWeeks.includes(week)
                ? prevSelectedWeeks.filter(w => w !== week)
                : [...prevSelectedWeeks, week]
        );
    };

    const sortedTimeslots = timeslots
        .filter(timeslot => timeslot.date && timeslot.startTime && timeslot.endTime && timeslot.facility && timeslot.rink) // Filter out rows with invalid data
        .sort((a, b) => {
            // First, sort by week
            if (a.week !== b.week) {
                return a.week - b.week;
            }
            // If weeks are the same, sort by start time
            return new Date(`1970-01-01T${a.startTime}:00Z`) - new Date(`1970-01-01T${b.startTime}:00Z`);
        });

    const additionalDataHeaders = timeslots.reduce((headers, timeslot) => {
        //console.log("Timeslot Here");
        // console.log(timeslots);
        if(timeslot.additionalData == undefined)
        {
            console.log("True");
        }

       //console.log(timeslot.additionalData);

       if(timeslot.additionalData != undefined)
       {

       
        if (timeslot.additionalData.length > 1) {
            timeslot.additionalData.forEach(additionalItem => {
                Object.keys(additionalItem).forEach(key => {
                    if (!headers.includes(key)) {
                        headers.push(key);
                    }
                });
            });
        }
        else {
            Object.keys(timeslot.additionalData).forEach(key => {
                if (!headers.includes(key)) {
                    headers.push(key);
                }
            });
        }
    }

        return headers;
    }, []);

    const buttonStyles = (isSelected) => ({
        padding: '10px 20px',
        margin: '5px',
        cursor: 'pointer',
        backgroundColor: isSelected ? 'rgb(228, 130, 18)' : 'black',
        color: 'white',
    });

    const countMatchups = (teams, matchups) => {
        const matchupCounts = {};


        teams.forEach((teamA) => {
            matchupCounts[teamA.teamName] = {};
            teams.forEach((teamB) => {
                if (teamA.teamName !== teamB.teamName) {
                    matchupCounts[teamA.teamName][teamB.teamName] = 0;

                }
            });
        });

        // console.log("Matrix");
        // console.log(matchupCounts);

        if(matchups != undefined)
        {

            
        for (let i = 0; i < matchups.length; i++) {
            // console.log("Matchups");
            // console.log(matchups[i]);
            matchups[i].forEach((scheduleMatch) => {
                const homeTeam = scheduleMatch.match.homeTeam.teamName;
                const awayTeam = scheduleMatch.match.awayTeam.teamName;
                if (homeTeam !== awayTeam) {
                    // console.log("Home Team " + homeTeam);
                    // console.log("Away Team " + awayTeam);
                    matchupCounts[homeTeam][awayTeam]++;
                    matchupCounts[awayTeam][homeTeam]++;
                }
            });
        }
    }


        return matchupCounts;
    };


    return (
        <div style={{ position: 'relative', alignItems: 'center', top: '20%', display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
            <img src={lugLogo} width={250} alt="Lug Logo" />
            <h1 style={{ marginTop: '25px' }}>{divisionName} Teams</h1>
            <table>
                <thead>
                    <tr style={{ backgroundColor: 'rgb(228, 130, 18)' }}>
                        <th>Team Name</th>
                        <th>Number of Players</th>
                        <th>Sub-Division</th>
                        <th>Set Number of Games</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {teams.length > 0 ? (
                        teams.map(team => (
                            <tr style={{ color: team.late === "Yes" ? "green" : "black" }} key={team.id}>
                                <td>{team.teamName}</td>
                                <td>{team.Players}</td>
                                <td>{team.Division}</td>
                                <td><InputNumber default={team.numGames} onChange={(value) => handleInputChange(team.id, value)}/></td>
                                <td>
                                    <a onClick={() => { RemoveTeam(leagueID, divisionID, team.id, team.teamName) }} className="btn btn-danger">Remove</a>
                                    <Link to={`/league/${leagueID}/division/${divisionID}/team/${team.id}`} className="btn btn-dark">Edit Team</Link>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3">No teams available</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div>
                <input type="file" onChange={handleFileUpload} />
            </div>

            <Link to={`/league/${leagueID}/division/${divisionID}/team`} className="btn btn-dark">Add New Team (+)</Link>
            <h1>{divisionName} Time Slots</h1>
            <table>
                <thead>
                    <tr style={{ backgroundColor: 'rgb(228, 130, 18)' }}>
                        <th style={{ border: 'rgb(228, 130, 18)' }}>Week</th>
                        <th style={{ border: 'rgb(228, 130, 18)' }}>Date</th>
                        <th style={{ border: 'rgb(228, 130, 18)' }}>Start Time</th>
                        <th style={{ border: 'rgb(228, 130, 18)' }}>End Time</th>
                        <th style={{ border: 'rgb(228, 130, 18)' }}>Facility</th>
                        <th style={{ border: 'rgb(228, 130, 18)' }}>Rink</th>
                        {additionalDataHeaders.map((header, index) => (
                            <th key={index} style={{ border: 'rgb(228, 130, 18)' }}>{header}</th>
                        ))}
                        <th style={{ border: 'rgb(228, 130, 18)' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedTimeslots.length > 0 ? (
                        sortedTimeslots.map(timeslot => (
                            <tr style={{ color: timeslot.extra === "Yes" ? "green" : "black" }} key={timeslot.id}>
                                <td>{timeslot.week}</td>
                                <td>{timeslot.date}</td>
                                <td>{timeslot.startTime}</td>
                                <td>{timeslot.endTime}</td>
                                <td>{timeslot.facility}</td>
                                <td>{timeslot.rink}</td>
                                {additionalDataHeaders.map((header, index) => (
                                    <td key={index}>
                                        {Array.isArray(timeslot.additionalData)
                                            ? timeslot.additionalData.find(item => Object.keys(item)[0] === header)
                                                ? timeslot.additionalData.find(item => Object.keys(item)[0] === header)[header]
                                                : ''
                                            : timeslot.additionalData[header] || ''}
                                    </td>
                                ))}
                                <td>
                                    <Link to={`/league/${leagueID}/division/${divisionID}/timeslot/${timeslot.id}`} className="btn btn-dark">
                                        Edit Timeslot
                                    </Link>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6 + additionalDataHeaders.length + 1} style={{ border: '1px solid orange' }}>No timeslots available</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <Link to={`/league/${leagueID}/division/${divisionID}/timeslot`} state={timeslots[0]} className="btn btn-dark">Add New Timeslot (+)</Link>
            <div>
                <input type="file" onChange={timeslotFileUpload} />
                
            </div>



            <div>
                <div className="week-buttons">
                    <div>
                        <h2>Lock Weeks:</h2>

                    </div>
                    {generatedSchedule && generatedSchedule.length > 0 ? (
                        generatedSchedule.map((_, weekIndex) => (
                            <button
                                key={weekIndex}
                                onClick={() => toggleWeekSelection(weekIndex + 1)}
                                style={buttonStyles(selectedWeeks.includes(weekIndex + 1))}                        >
                                Week {weekIndex + 1}
                            </button>
                        ))
                    ) : (
                        <div>No schedule available</div>
                    )}
                </div>
            </div>

            <div>
                <button className="btn btn-dark" type="button" onClick={() => fetchLeagues(value)}>Generate Schedule</button>
            </div>
            <div className='schedules'>
            <div>
                <h2>{divisionName} Schedule</h2>
                <button onClick={handleEditClick}>
                    {isEditing ? 'Save' : 'Edit'}
                </button>

                {isEditing && (
                    <button onClick={handleCancelClick}>
                        Cancel
                    </button>
                )}
            
            <table className="scheduleTable" ref={tableRef}>
                <thead>
                    <tr>
                        <th>Week</th>
                        <th>Date</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Home Team</th>
                        <th>Away Team</th>
                        <th>Facility</th>
                        <th>Rink</th>
                    </tr>
                </thead>
                <tbody>
                    {editedSchedule && editedSchedule.length > 0 ? (
                        editedSchedule.map((week, weekIndex) => (
                            <React.Fragment key={`week-${weekIndex}`}>
                                <tr className="divider">
                                    <td colSpan="8">Week {weekIndex + 1}</td>
                                </tr>
                                {week.map((timeslot, timeslotIndex) => (
                                    <tr key={`timeslot-${weekIndex}-${timeslotIndex}`} style={{ color: timeslot.extra === "Yes" ? "green" : "black" }}>
                                        <td>{weekIndex + 1}</td>
                                        <td>
                                            {isEditing ? (
                                                <input
                                                    type="date"
                                                    value={timeslot.date}
                                                    onChange={(e) =>
                                                        handleChange(weekIndex, timeslotIndex, 'date', e.target.value)
                                                    }
                                                />
                                            ) : (
                                                timeslot.date
                                            )}
                                        </td>
                                        <td>
                                            {isEditing ? (
                                                <input
                                                    type="time"
                                                    value={convertTo24Hour(timeslot.startTime)}
                                                    onChange={(e) =>
                                                        handleChange(weekIndex, timeslotIndex, 'startTime', e.target.value)
                                                    }
                                                />
                                            ) : (
                                                convertTo12Hour(timeslot.startTime)
                                            )}
                                        </td>
                                        <td>
                                            {isEditing ? (
                                                <input
                                                    type="time"
                                                    value={convertTo24Hour(timeslot.endTime)}
                                                    onChange={(e) =>
                                                        handleChange(weekIndex, timeslotIndex, 'endTime', e.target.value)
                                                    }
                                                />
                                            ) : (
                                                convertTo12Hour(timeslot.endTime)
                                            )}
                                        </td>
                                        <td>
                                            {isEditing ? (
                                                <select
                                                    value={timeslot.match ? timeslot.match.homeTeam.teamName : 'TBD'}
                                                    onChange={(e) =>
                                                        handleChange(weekIndex, timeslotIndex, 'homeTeam', e.target.value)
                                                    }
                                                >
                                                    {teams.map((team) => (
                                                        <option key={team.id} value={team.teamName}>
                                                            {team.teamName}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                timeslot.match ? timeslot.match.homeTeam.teamName : 'TBD'
                                            )}
                                        </td>
                                        <td>
                                            {isEditing ? (
                                                <select
                                                    value={timeslot.match ? timeslot.match.awayTeam.teamName : 'TBD'}
                                                    onChange={(e) =>
                                                        handleChange(weekIndex, timeslotIndex, 'awayTeam', e.target.value)
                                                    }
                                                >
                                                    {teams.map((team) => (
                                                        <option key={team.id} value={team.teamName}>
                                                            {team.teamName}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                timeslot.match ? timeslot.match.awayTeam.teamName : 'TBD'
                                            )}
                                        </td>
                                        <td>
                                        {isEditing ? (
                                                <input
                                                    value={timeslot.facility}
                                                    onChange={(e) =>
                                                        handleChange(weekIndex, timeslotIndex, 'facility', e.target.value)
                                                    }
                                                />
                                            ) : (
                                                timeslot.facility
                                            )}
                                        </td>
                                        <td>
                                        {isEditing ? (
                                                <input
                                                    value={timeslot.rink}
                                                    onChange={(e) =>
                                                        handleChange(weekIndex, timeslotIndex, 'rink', e.target.value)
                                                    }
                                                />
                                            ) : (
                                                timeslot.rink
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6">No schedule available</td>
                        </tr>
                    )}
                </tbody>
            </table>
                <div>
                    <button className='bg-blue-400 p-2' id='exportButton' onClick={handleDownload}>
                        Export Schedule
                    </button>
                </div>
            </div>



                <div>

                    <h2>Matchups</h2>
                    <table border="1" className="matrix">
                        <thead>
                            <tr>
                                <th></th>
                                {teams.map((team, index) => ( 
                                    <th key={index}>{team.teamName}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {matrix.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td>{teams[rowIndex].teamName}</td>
                                    {row.map((cell, colIndex) => (
                                        <td key={colIndex}>{cell !== null ? cell : 'X'}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div>
                        <h2>Schedule Analysis</h2>
                        <table border="1">
                            <thead>
                                <tr>
                                    <th>Teams</th>
                                    <th>Number of Games Played</th>
                                    <th className="schedule-balance-column">Schedule Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teams.map((team, index) => (
                                    <tr key={index}>
                                        <td>{team.teamName}</td>
                                        <td>{team.numGames}</td>
                                        <div>
                                            
                                            <h10 className='scheduleAnalysisElement'>Good Schedule</h10>
                                            <td className="scheduleAnalysisElement">
                                                <WeightNumberLine value={team.weight} min={0} max={1}/>
                                            </td>
                                            <h10 className='scheduleAnalysisElement'>Bad Schedule</h10>
                                        </div>
                                        

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>



            </div>


            <div>
                <button className="btn btn-danger" type="button" onClick={handleBack}>Back</button>
            </div>
        </div>
    );
}

export default TeamsView;
