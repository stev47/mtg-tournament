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
    shuffle(players);
}
function find_pairings (players, round) {
    var matches = [];
    var pairedPlayers = [];

    // uneven amount of players -> deal one bye
    if (players.length % 2 == 1) {
        for (var i = players.length - 1; i >= 0; i--) {
            if (players[i].receivedBye) continue;

            matches.push({
                players: [players[i], null],
            });
            pairedPlayers.push(players[i]);
            break;
        }
    }

    for (var i = 0; i < players.length; i++) {
        if (pairedPlayers.indexOf(players[i]) != -1) continue;
        for (var j = i + 1; j < players.length; j++) {
            if (pairedPlayers.indexOf(players[j]) != -1) continue;
            if (players[i].opponents.indexOf(players[j]) != -1) continue;
            if (players[j].opponents.indexOf(players[i]) != -1) continue; // remove

            matches.push({
                players: [players[i], players[j]],
            });
            pairedPlayers.push(players[i], players[j]);
            break;
        }
    }

    matches.forEach(function (match, idx) {
        match.round = round;
        match.seat = idx + 1;
        match.proposed = true;
        match.result = [0, 0, 0];
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

