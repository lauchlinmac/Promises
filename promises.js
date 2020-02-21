base_url = 'https://statsapi.web.nhl.com';
var liveNum = 0;
async function fetchSchedule() {
  var d = new Date();
  var yy = d.getFullYear();
  var mm = d.getMonth() + 1;
  var dd = d.getDate();
  var fullDate = yy + '-' + mm + '-' + dd;
  var schedule_ext = '/api/v1/schedule?date=';
  const res = await fetch(base_url + schedule_ext + fullDate);
  const data = await res.json();
  return data;
}

function hambFunction() {
  var x = document.getElementById('testing');
  if (x.style.display === 'block') {
    x.style.display = 'none';
  } else {
    x.style.display = 'block';
  }
}
fetchSchedule()
  .then(data => {
    for (x in data.dates[0].games) {
      gameURL = base_url + data.dates[0].games[x].link;
      gameText = document.createTextNode(
        data.dates[0].games[x].teams.away.team.name +
          ' @ ' +
          data.dates[0].games[x].teams.home.team.name
      );
      brk = document.createAttribute('br');
      const dirt = document.getElementById('testing');
      aChild = document.createElement('li');
      aChild.setAttribute('class', 'signature');
      aChild.setAttribute('onClick', 'startUp("' + gameURL + '")');
      aChild.appendChild(gameText);
      aChildBr = document.createElement('br');
      dirt.appendChild(aChild);
      dirt.appendChild(aChildBr);
    }
  })
  .catch(err => console.log(err));

function startUp(twice) {
  var x = document.getElementById('testing');
  if (x.style.display === 'block') {
    x.style.display = 'none';
  } else {
    x.style.display = 'block';
  }
  if (typeof myVar == 'undefined') {
    myVar = setInterval(() => {
      Action(twice);
    }, 5000);
  } else {
    clearInterval(myVar);
    myVar = setInterval(() => {
      Action(twice);
    }, 5000);
  }
}

function Action(twice) {
  fetchGame(twice)
    .then(data => {
      larry = data.gameData.teams.home.venue.name;
      //   const dirts = document.getElementById('target');
      //   descText = document.createTextNode(larry);
      //   aChild = document.createElement('p');
      //   aChild.appendChild(descText);
      //   dirts.insertBefore(aChild, dirts.firstChild);
      document.getElementById('stuff').innerHTML = '';
      var currentNum = 0;
      status = data.gameData.status.abstractGameState;
      homeID = data.gameData.teams.home.id;
      awayID = data.gameData.teams.away.id;
      awayTeam = data.gameData.teams.away.abbreviation;
      homeTeam = data.gameData.teams.home.abbreviation;
      gameTime = new Date(data.gameData.datetime.dateTime);
      realTime = gameTime.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour12: false
      });

      if (status.includes('Preview')) {
        document.getElementById('homeScore').innerHTML =
          '<td><img src="https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/' +
          awayID +
          '.svg"/></td><td>0</td>';
        document.getElementById('awayScore').innerHTML =
          '<td><img src="https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/' +
          homeID +
          '.svg"/></td><td>0</td>';
        document.getElementById('periodStuff').innerHTML =
          '<td>Game Not Yet Started - ' + realTime + '</td>';
      } else {
        var liveNum = data.liveData.plays.currentPlay.about.eventIdx;
        // ISSUE: when different game is selected, currentNum misaligns.
        while (currentNum <= liveNum) {
          event = data.liveData.plays.allPlays[currentNum].result.event;
          periodTime =
            data.liveData.plays.allPlays[currentNum].about.periodTimeRemaining;
          period = data.liveData.plays.allPlays[currentNum].about.ordinalNum;
          desc = data.liveData.plays.allPlays[currentNum].result.description;
          awayScore = data.liveData.plays.allPlays[currentNum].about.goals.away;
          homeScore = data.liveData.plays.allPlays[currentNum].about.goals.home;
          if ('team' in data.liveData.plays.allPlays[currentNum]) {
            teamPlay =
              'https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/' +
              data.liveData.plays.allPlays[currentNum].team.id +
              '.svg';
          } else {
            teamPlay =
              'https://www-league.nhlstatic.com/images/logos/league-dark/133.svg';
          }

          document.getElementById('homeScore').innerHTML =
            '<img src="https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/' +
            awayID +
            '.svg"/>' +
            awayScore;
          document.getElementById('awayScore').innerHTML =
            '<img src="https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/' +
            homeID +
            '.svg"/>' +
            homeScore;
          document.getElementById('periodStuff').innerHTML =
            period + ' Period - ' + periodTime + ' Left';

          var el = document.getElementById('stuff'),
            elChild = document.createElement('div');
          // Should keep track of last play shown and then continue from that number (maybe use current play as difference?)
          // event = json.liveData.plays.currentPlay.result.event;
          if (event.includes('Goal')) {
            goalPlayer =
              data.liveData.plays.allPlays[currentNum].players[0].player
                .fullName;

            elChild.innerHTML =
              '<div id="goal"><h3>' +
              event +
              ' -  ' +
              goalPlayer +
              '</h3><img src="' +
              teamPlay +
              '" style="opacity: 0.5;float:right;height: 50px;">' +
              'Period ' +
              period +
              '- ' +
              periodTime +
              ' Left<br/>' +
              desc +
              '<br/>' +
              '<h3 class="bottom">' +
              homeTeam +
              ': ' +
              homeScore +
              ' - ' +
              awayTeam +
              ' : ' +
              awayScore +
              '</h3></div><br />';
          } else {
            elChild.innerHTML =
              '<h3>' +
              event +
              '</h3><img src="' +
              teamPlay +
              '" style="opacity: 0.5;float:right;height: 50px;">' +
              'Period ' +
              period +
              '- ' +
              periodTime +
              ' Left<br/>' +
              desc +
              '<br/>' +
              '<h3 class="bottom">' +
              homeTeam +
              ': ' +
              homeScore +
              ' - ' +
              awayTeam +
              ' : ' +
              awayScore +
              '</h3><br /></div>';
          }
          el.insertBefore(elChild, el.firstChild);

          currentNum++;
        }
        if (event.includes('Game Official')) {
          clearInterval(myVar);
          document.getElementById('periodStuff').innerHTML =
            '<td>Game Over</td>';
          myVar = setTimeout(reload(), 3000);
        }
      }
    })
    .catch(err => console.log(err));
}
async function fetchGame(twice) {
  const res = await fetch(twice);
  const data = await res.json();
  return data;
}
