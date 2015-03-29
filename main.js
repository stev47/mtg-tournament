// begin config

var players = [
];

var matches = [
];

var proposedMatches = [];

// end config

function shuffle (array) {
    for (var i = array.length - 1; i > 0; i--) {
        var idx = Math.floor(Math.random() * (i + 1));
        var tmp = array[idx];
        array[idx] = array[i];
        array[i] = tmp;
    }
    return array;
}
function unique (array) {
    return array.filter(function (val, idx, arr) {
        return arr.indexOf(val) == idx;
    });
}
function sort_players (players) {
    players.sort(function (p0, p1) {
        var a = p0.score;
        var b = p1.score;
        for (var i = 0; i < a.length; i++) {
            if (a[i] == b[i]) continue;
            return (a[i] > b[i])? -1 : 1;
        }
        return 0;
    });
}
function init_players (players) {
    players.forEach(function (player) {
        player.score = [0, 0, 0, 0];
        player.matches = 0;
        player.games = 0;
        player.matchPoints = 0;
        player.gamePoints = 0;
        player.opponents = [];
        player.matchWinPercentage = null;
        player.gameWinPercentage = null;
        player.opponentsMatchWinPercentage = null;
        player.opponentsGameWinPercentage = null;
        player.receivedBye = false;
    });
    //shuffle(players);
}
function find_pairings (players, round) {
    var matches = [];
    var pairedPlayers = [];

    var tries = [];
    var byes = [];
    var isPaired = [];
    players.forEach(function () { isPaired.push(false) });

    // uneven amount of players -> deal one bye
    if (players.length % 2 == 1) {
        for (var i = players.length - 1; i >= 0; i--) {
            if (players[i].receivedBye) continue;

            byes.push(i);
            isPaired[i] = true;
            break;
        }
    }

    var i = 0;
    var j = 1;
    while (!isPaired.every(function (x) { return x == true })) {
        console.log("Trying to pair " + i + " with " + j + ".");
        if (j >= players.length) {
            console.log("Current pairing impossible, redoing …");
            if (tries.length == 0) {
                var i = players.length - 1;
                while (isPaired[i]) i--;
                isPaired[i] = true;
                byes.push(i);
                console.log("Had to assign a bye for player ", i);
                i = 0;
                j = 1;
                continue;
            }
            var tmp = tries.pop();
            i = tmp[0];
            j = tmp[1];
            isPaired[i] = false;
            isPaired[j] = false;
            j++;
            continue;
        };
        // already paired?
        if (isPaired[i]) { i++; j = i + 1; continue; }
        if (isPaired[j]) { j++; continue; }
        // previously paired?
        if (players[i].opponents.indexOf(players[j]) != -1) { j++; continue; }

        tries.push([i, j]);
        isPaired[i] = true;
        isPaired[j] = true;
        console.log("Paired " + i + " with " + j + ".");

        i++;
        j = i + 1;
    }
    var matches1 = tries.map(function (match, idx) {
        return {
            players: [players[match[0]], players[match[1]]],
        }
    });
    var matches2 = byes.map(function (player, idx) {
        return {
            players: [players[player], null],
        }
    });
    matches2.reverse();
    var matches = [].concat(matches1, matches2).map(function (match, idx) {
        return {
            players: match.players,
            round: round,
            seat: idx + 1,
            proposed: true,
            result: [0, 0, 0],
        }
    });

    return matches;
}

function update_scores (players, matches) {
    init_players(players);
    matches.forEach(function (match) {
        var p0 = match.players[0];
        var p1 = match.players[1];

        // handle bye
        if (match.players[1] == null) {
            p0.matches += 1;
            p0.games += 2;
            p0.matchPoints += 3;
            p0.gamePoints += 6;
            p0.receivedBye = true;

            return;
        }

        if (p0.opponents.indexOf(p1) == -1)
            p0.opponents.push(p1);
        if (p1.opponents.indexOf(p0) == -1)
            p1.opponents.push(p0);


        p0.matches += 1;
        p1.matches += 1;

        var numGames = match.result.reduce(function (a, b) { return a + b });
        p0.games += numGames;
        p1.games += numGames;

        p0.gamePoints += match.result[0] * 3 + match.result[1];
        p1.gamePoints += match.result[2] * 3 + match.result[1];

        if (match.result[0] > match.result[2]) {
            p0.matchPoints += 3;
        } else if (match.result[0] < match.result[2]) {
            p1.matchPoints += 3;
        } else {
            p0.matchPoints += 1;
            p1.matchPoints += 1;
        }
    });
    players.forEach(function (player) {
        player.matchWinPercentage = Math.max(0.33, player.matchPoints / (player.matches * 3));
        player.gameWinPercentage = Math.max(0.33, player.gamePoints / (player.games * 3));
    });
    players.forEach(function (player) {
        player.opponentsMatchWinPercentage = 0;
        player.opponentsGameWinPercentage = 0;

        player.opponents.forEach(function (opponent) {
            player.opponentsMatchWinPercentage += opponent.matchWinPercentage;
            player.opponentsGameWinPercentage += opponent.gameWinPercentage;
        });

        if (player.opponents.length != 0) {
            player.opponentsMatchWinPercentage /= player.opponents.length;
            player.opponentsGameWinPercentage /= player.opponents.length;
        } else {
            player.opponentsMatchWinPercentage = 0;
            player.opponentsGameWinPercentage = 0;
        }

        player.score = [
            player.matchPoints,
            player.opponentsMatchWinPercentage,
            player.gamePoints,
            player.opponentsGameWinPercentage,
        ];
    });
}


//init_players(players);

//console.log(matches);
//console.log(players);
//
//update_scores(players, matches);
//sort_players(players);
//
//
//console.log(players);
//console.log(find_pairings(players));
//

