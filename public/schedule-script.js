function showSchedule(html, day) {
  var ws = document.querySelector("#daySchedule")
  ws.innerHTML = html;
  var ds = document.querySelector("#day")
  ds.innerHTML = day + ":";
  //ws.style.display = "block";
}

function showPopup() {
  document.querySelector('#popup').style.display="block";
  document.querySelector('#layer').style.display="block";
};
function hidePopup() {
  document.querySelector('#popup').style.display="none";
  document.querySelector('#layer').style.display="none";
};

function generateInputMtgInfoFormHtml(uid) {
  const dayofweekArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  //input mtg info form
  var html = `<form id="input-mtg-info", action="/schedule/update/?uid=${uid}&username=${username}", method="post">
    Mtg name: <input type="text", id="mtg-name", name="mtgname"><br>
    Description: <input type="text", id="mtg-description", name="description"><br>
    Day of week: `;

  //dayofweek
  html += '<input type = "radio", name = "dayofweek", value = "' + dayofweekArray[0] + '", id="mtg-day", checked="checked"> ' + dayofweekArray[0] + ' ';

  for (i = 1; i < 7; i++) {
    html += '<input type = "radio", name = "dayofweek", value = "' + dayofweekArray[i] + '", id="mtg-day"> ' + dayofweekArray[i] + ' ';
  }

  //start time
  html += `<br>
    <div style = "display:inline-flex">
    Start time:&nbsp;
      <select name="starthour", size=5>`
  html += '<option value="0", selected>0</option>'
  for (i = 1; i < 24; i++) {
    let hour = i.toString();
    html += '<option value="' + i + '">' + hour + '</option>'
  }
  html += `</select>
    <select name="startminute", size=5>`
  html += '<option value="0", selected>0</option>'
  for (i = 1; i < 60; i++) {
    let minute = i.toString();
    html += '<option value="' + i + '">' + minute + '</option>'
  }

  //end time
  html += `</select></div><br>
    <div style = "display:inline-flex">
    End time:&nbsp;&nbsp;&nbsp;
      <select name="endhour", size=5>`
  html += '<option value="0", selected>0</option>'
  for (i = 1; i < 24; i++) {
    let hour = i.toString();
    html += '<option value="' + i + '">' + hour + '</option>'
  }
  html += `</select>
    <select name="endminute", size=5>`
  html += '<option value="0", selected>0</option>'
  for (i = 1; i < 60; i++) {
    let minute = i.toString();
    html += '<option value="' + i + '">' + minute + '</option>'
  }
  html += `</select></div><br>
    Mtg ID: <input type="text", id="mtg-id", name="mtgid"><br>
    <button type="submit">Submit</button>
    </form>`

  return html;
}

function generateDeleteMtgInfoFormHtml(uid) {
  var html = `<form id="delete-mtg-info", action="/schedule/update/?uid=${uid}&username=${username}", method="post">
    Mtg name: <input type="text", id="mtg-name", name="mtgname"><br>
    <button type="submit">Submit</button>
    </form>`
  return html
}

