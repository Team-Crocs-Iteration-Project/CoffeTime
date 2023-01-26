import React, { useState, useEffect } from "react";
import Event from "./Event";
import { nanoid } from "nanoid";

function EventsList(props) {

  let colorCounter = 0;

  const parseInput = (message) => {
    // color counter variable is used for styling
    colorCounter = 0;
    const res = [];
    if (Array.isArray(message)) {
      for (const elem of message) {
        if(!elem.eventTime) elem.eventTime = 'TBD'
        if (colorCounter > 3) colorCounter = 0;
        res.push(<Event host={elem.host} details={elem.details.title} id={elem._id} attendees={elem.details.attendees} colorCounter={colorCounter} eventTime={elem.eventTime } key={nanoid()} />);
        setEvents([...res]);
        // console.log(res)
        colorCounter++;
      }
    }
  }

  const [events, setEvents] = useState([]);

  //useEffect here is for loading events on the first load of the page (dependancy is [])
  useEffect(() => {
    //we emit an event of loadEvents to the server, which will query the DB and send back all events with the same event type of loadEvents
    props.socket.emit('initialLoad', 'testMessage')
    props.socket.on('initialLoad', (message) => {
      // console.log('recieved from server on initial load: ', message)
      parseInput(message);
    })
  }, [])
  
  //useEffect here runs on every reload, it grabs the response from the server each time we add or load the page
  useEffect(() => {
    colorCounter = 0;
    // console.log('2nd useEffect')
    props.socket.on('loadEvents', (message) => {
      parseInput(message);
    })
  })
  
  return (
    <div id='events-list'>
      {events}
    </div>
  );
}

export default EventsList;
