import React, { useEffect } from 'react';

//containers for individual events
function Event(props) {
  let eventTime = props.eventTime.slice(0, 2);
  let eventCopy = props.eventTime;

  if (Number(eventTime) > 12) {
    let replaceStr = (Number(eventTime) - 12).toString();
    eventCopy = replaceStr + eventCopy.slice(2);
    eventCopy += ' PM';
  } else {
    eventCopy += ' AM';
  }

  const colors = ['#E4C988', '#C27664', '#B05A7A', '#84D2C5'];
  const styleObj = {
    fontSize: ' 52px',
    fontWeight: 500,
    textDecoration: 'underline',
    textDecorationColor: colors[props.colorCounter],
    textDecorationThickness: '9px',
    textUnderlinePosition: 'auto',
  };

  function attendees(attendees) {
    let andBlock = <h4 className="host-label">and</h4>;
    let attendeeList = [];
    if (attendees.length == 0) {
      return null;
    } else {
      for (let i = 0; i <= attendees.length - 2; i++) {
        attendeeList.push(<h5 className="host-name">{', ' + attendees[i]}</h5>);
      }
      attendeeList.push(<h4 className="host-label">, and</h4>);
      attendeeList.push(
        <h5 className="host-name">{attendees[attendees.length - 1]}</h5>
      );
    }
    return attendeeList;
  }
  const joinEvent = (e) => {
    //stop page from refreshing and losing connection to socket
    e.preventDefault();
    console.log(e.target.id);
    Event.find({_id:e.target.id}).then((data) => {
      detail.attendees.push
    // props.socket.emit('joinEvent', 'george');
  });

  return (
    <div className="event">
      <h3
        className="event-name"
        style={styleObj}
      >{`${props.details} @${eventCopy}`}</h3>
      <div className="host-info">
        <h4 className="host-label">with</h4>
        <h5 className="host-name">{props.host}</h5>
        {attendees(props.attendees)}
      </div>
      <button id={props.id} onClick={joinEvent}>Join</button>
    </div>
  );
}

export default Event;
